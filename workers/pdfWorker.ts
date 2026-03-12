import { PDFDocument, degrees } from "pdf-lib";

type ImageInput = {
  name: string;
  type: string;
  data: ArrayBuffer;
};

type WorkerRequest =
  | { id: string; type: "merge"; payload: { files: ArrayBuffer[] } }
  | { id: string; type: "split"; payload: { file: ArrayBuffer } }
  | {
      id: string;
      type: "rotate";
      payload: { file: ArrayBuffer; pages: number[]; angle: 90 | 180 | 270 };
    }
  | { id: string; type: "compress"; payload: { file: ArrayBuffer } }
  | {
      id: string;
      type: "pdfToImage";
      payload: {
        file: ArrayBuffer;
        scale?: number;
        format?: "png" | "jpg";
        quality?: number;
      };
    }
  | { id: string; type: "imageToPdf"; payload: { images: ImageInput[] } };

type WorkerResponse =
  | { id: string; ok: true; result: unknown }
  | { id: string; ok: false; error: string };

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return new Uint8Array(bytes).buffer;
}

function isJpeg(type: string): boolean {
  return type === "image/jpeg" || type === "image/jpg";
}

async function mergePdfs(files: ArrayBuffer[]): Promise<ArrayBuffer> {
  const output = await PDFDocument.create();

  for (const file of files) {
    const src = await PDFDocument.load(file);
    const pages = await output.copyPages(src, src.getPageIndices());
    pages.forEach((page) => output.addPage(page));
  }

  return toArrayBuffer(await output.save());
}

async function splitPdf(file: ArrayBuffer): Promise<Array<{ name: string; data: ArrayBuffer }>> {
  const src = await PDFDocument.load(file);
  const parts: Array<{ name: string; data: ArrayBuffer }> = [];

  for (let i = 0; i < src.getPageCount(); i += 1) {
    const out = await PDFDocument.create();
    const [page] = await out.copyPages(src, [i]);
    out.addPage(page);
    const bytes = await out.save();
    parts.push({
      name: `page-${i + 1}.pdf`,
      data: toArrayBuffer(bytes),
    });
  }

  return parts;
}

async function rotatePdf(
  file: ArrayBuffer,
  pages: number[],
  angle: 90 | 180 | 270,
): Promise<ArrayBuffer> {
  const src = await PDFDocument.load(file);
  const shouldRotateAll = pages.length === 0;

  src.getPages().forEach((page, index) => {
    const pageNumber = index + 1;
    if (shouldRotateAll || pages.includes(pageNumber)) {
      page.setRotation(degrees(angle));
    }
  });

  return toArrayBuffer(await src.save());
}

async function compressPdf(file: ArrayBuffer): Promise<ArrayBuffer> {
  const src = await PDFDocument.load(file, { updateMetadata: false });

  src.setTitle("");
  src.setSubject("");
  src.setKeywords([]);
  src.setProducer("YLovePDF");
  src.setCreator("YLovePDF");

  return toArrayBuffer(await src.save({ useObjectStreams: true, addDefaultPage: false }));
}

async function imageToPdf(images: ImageInput[]): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();

  for (const img of images) {
    const embedded = isJpeg(img.type)
      ? await doc.embedJpg(img.data)
      : await doc.embedPng(img.data);

    const { width, height } = embedded.scale(1);
    const page = doc.addPage([width, height]);
    page.drawImage(embedded, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  return toArrayBuffer(await doc.save());
}

async function pdfToImage(
  file: ArrayBuffer,
  scale = 1.5,
  format: "png" | "jpg" = "png",
  quality = 0.9,
): Promise<Array<{ name: string; data: ArrayBuffer }>> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const params = {
    data: new Uint8Array(file),
    disableWorker: true,
  } as unknown as Parameters<typeof pdfjs.getDocument>[0];

  const doc = await pdfjs.getDocument(params).promise;
  const images: Array<{ name: string; data: ArrayBuffer }> = [];
  const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
  const extension = format === "jpg" ? "jpg" : "png";

  if (typeof OffscreenCanvas === "undefined") {
    throw new Error("OffscreenCanvas is not available in this browser");
  }

  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = new OffscreenCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("OffscreenCanvas context is not available");
    }

    const renderParams = {
      canvas,
      canvasContext: context,
      viewport,
    } as unknown as Parameters<typeof page.render>[0];

    await page.render(renderParams).promise;

    const blob = await canvas.convertToBlob({
      type: mimeType,
      quality: format === "jpg" ? quality : undefined,
    });
    images.push({
      name: `page-${i}.${extension}`,
      data: await blob.arrayBuffer(),
    });
  }

  return images;
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { id, type, payload } = event.data;

  try {
    let result: unknown;

    if (type === "merge") {
      result = await mergePdfs(payload.files);
    } else if (type === "split") {
      result = await splitPdf(payload.file);
    } else if (type === "rotate") {
      result = await rotatePdf(payload.file, payload.pages, payload.angle);
    } else if (type === "compress") {
      result = await compressPdf(payload.file);
    } else if (type === "pdfToImage") {
      result = await pdfToImage(payload.file, payload.scale, payload.format, payload.quality);
    } else {
      result = await imageToPdf(payload.images);
    }

    const response: WorkerResponse = { id, ok: true, result };
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      id,
      ok: false,
      error: error instanceof Error ? error.message : "Unknown worker error",
    };
    self.postMessage(response);
  }
};
