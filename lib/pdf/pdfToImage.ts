"use client";

import JSZip from "jszip";
import { runWorkerTask } from "@/lib/pdf/workerClient";

export type PdfImageResult = {
  name: string;
  blob: Blob;
};

export type ImageFormat = "png" | "jpg";

function mimeFor(format: ImageFormat): string {
  return format === "jpg" ? "image/jpeg" : "image/png";
}

function extFor(format: ImageFormat): string {
  return format === "jpg" ? "jpg" : "png";
}

async function fallbackPdfToImages(
  file: File,
  format: ImageFormat,
  quality: number,
): Promise<PdfImageResult[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const bytes = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const output: PdfImageResult[] = [];

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas context could not be created");
    }

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const renderParams = {
      canvasContext: context,
      canvas,
      viewport,
    } as unknown as Parameters<typeof page.render>[0];

    await page.render(renderParams).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error("Image export failed"));
            return;
          }
          resolve(result);
        },
        mimeFor(format),
        format === "jpg" ? quality : undefined,
      );
    });

    output.push({
      name: `page-${i}.${extFor(format)}`,
      blob,
    });
  }

  return output;
}

export async function pdfToImages(
  file: File,
  options?: { format?: ImageFormat; quality?: number },
): Promise<PdfImageResult[]> {
  const format = options?.format ?? "png";
  const quality = options?.quality ?? 0.9;

  try {
    const output = await runWorkerTask("pdfToImage", {
      file: await file.arrayBuffer(),
      scale: 1.5,
      format,
      quality,
    });

    return output.map((item) => ({
      name: item.name,
      blob: new Blob([item.data], { type: mimeFor(format) }),
    }));
  } catch {
    return fallbackPdfToImages(file, format, quality);
  }
}

export async function zipImages(images: PdfImageResult[]): Promise<Blob> {
  const zip = new JSZip();
  images.forEach((item) => zip.file(item.name, item.blob));
  return zip.generateAsync({ type: "blob" });
}
