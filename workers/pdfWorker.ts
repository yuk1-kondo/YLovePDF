import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

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
        targetLongEdge?: number;
        format?: "png" | "jpg";
        quality?: number;
      };
    }
  | { id: string; type: "imageToPdf"; payload: { images: ImageInput[] } }
  | {
      id: string;
      type: "watermark";
      payload: {
        file: ArrayBuffer;
        text: string;
        fontSize: number;
        opacity: number;
        rotation: number;
        color: { r: number; g: number; b: number };
      };
    }
  | {
      id: string;
      type: "pageNumbers";
      payload: {
        file: ArrayBuffer;
        position: string;
        startNumber: number;
        fontSize: number;
      };
    }
  | {
      id: string;
      type: "extract";
      payload: { file: ArrayBuffer; pages: number[] };
    }
  | {
      id: string;
      type: "editMetadata";
      payload: {
        file: ArrayBuffer;
        title: string;
        author: string;
        subject: string;
        keywords: string;
      };
    }
  | {
      id: string;
      type: "readMetadata";
      payload: { file: ArrayBuffer };
    };

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

async function addWatermark(
  file: ArrayBuffer,
  text: string,
  fontSize: number,
  opacity: number,
  rotation: number,
  color: { r: number; g: number; b: number },
): Promise<ArrayBuffer> {
  const doc = await PDFDocument.load(file);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const rad = (rotation * Math.PI) / 180;

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const x = width / 2 - (textWidth / 2) * Math.cos(rad);
    const y = height / 2 - (textWidth / 2) * Math.sin(rad);

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(color.r / 255, color.g / 255, color.b / 255),
      opacity,
      rotate: degrees(rotation),
    });
  }

  return toArrayBuffer(await doc.save());
}

async function addPageNumbers(
  file: ArrayBuffer,
  position: string,
  startNumber: number,
  fontSize: number,
): Promise<ArrayBuffer> {
  const doc = await PDFDocument.load(file);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const margin = 40;

  doc.getPages().forEach((page, index) => {
    const { width, height } = page.getSize();
    const text = String(startNumber + index);
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    const [vertical, horizontal] = position.split("-");

    let x: number;
    if (horizontal === "left") x = margin;
    else if (horizontal === "right") x = width - margin - textWidth;
    else x = (width - textWidth) / 2;

    const y = vertical === "top" ? height - margin : margin;

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  });

  return toArrayBuffer(await doc.save());
}

async function extractPages(
  file: ArrayBuffer,
  pages: number[],
): Promise<ArrayBuffer> {
  const src = await PDFDocument.load(file);
  const output = await PDFDocument.create();
  const indices = pages
    .map((p) => p - 1)
    .filter((i) => i >= 0 && i < src.getPageCount());

  const copiedPages = await output.copyPages(src, indices);
  copiedPages.forEach((page) => output.addPage(page));

  return toArrayBuffer(await output.save());
}

async function editPdfMetadata(
  file: ArrayBuffer,
  title: string,
  author: string,
  subject: string,
  keywords: string,
): Promise<ArrayBuffer> {
  const doc = await PDFDocument.load(file);
  doc.setTitle(title);
  doc.setAuthor(author);
  doc.setSubject(subject);
  doc.setKeywords(
    keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
  );

  return toArrayBuffer(await doc.save());
}

async function readPdfMetadata(
  file: ArrayBuffer,
): Promise<{
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
}> {
  const doc = await PDFDocument.load(file, { updateMetadata: false });
  return {
    title: doc.getTitle() ?? "",
    author: doc.getAuthor() ?? "",
    subject: doc.getSubject() ?? "",
    keywords: doc.getKeywords() ?? "",
    creator: doc.getCreator() ?? "",
    producer: doc.getProducer() ?? "",
  };
}

async function pdfToImage(
  file: ArrayBuffer,
  scale = 1.5,
  targetLongEdge?: number,
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
    const baseViewport = page.getViewport({ scale: 1 });
    const baseLongEdge = Math.max(baseViewport.width, baseViewport.height);
    const effectiveScale = targetLongEdge && baseLongEdge > 0 ? targetLongEdge / baseLongEdge : scale;
    const viewport = page.getViewport({ scale: effectiveScale });
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
      result = await pdfToImage(
        payload.file,
        payload.scale,
        payload.targetLongEdge,
        payload.format,
        payload.quality,
      );
    } else if (type === "imageToPdf") {
      result = await imageToPdf(payload.images);
    } else if (type === "watermark") {
      result = await addWatermark(
        payload.file,
        payload.text,
        payload.fontSize,
        payload.opacity,
        payload.rotation,
        payload.color,
      );
    } else if (type === "pageNumbers") {
      result = await addPageNumbers(
        payload.file,
        payload.position,
        payload.startNumber,
        payload.fontSize,
      );
    } else if (type === "extract") {
      result = await extractPages(payload.file, payload.pages);
    } else if (type === "editMetadata") {
      result = await editPdfMetadata(
        payload.file,
        payload.title,
        payload.author,
        payload.subject,
        payload.keywords,
      );
    } else if (type === "readMetadata") {
      result = await readPdfMetadata(payload.file);
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
