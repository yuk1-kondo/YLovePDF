"use client";

import JSZip from "jszip";
import { runWorkerTask } from "@/lib/pdf/workerClient";

export type PdfImageResult = {
  name: string;
  blob: Blob;
};

export type ImageFormat = "png" | "jpg";

export type ImageSizePreset = "original" | "hd" | "fullhd" | "2k" | "4k";

const IMAGE_SIZE_PRESET_LONG_EDGE: Record<Exclude<ImageSizePreset, "original">, number> = {
  hd: 1280,
  fullhd: 1920,
  "2k": 2560,
  "4k": 3840,
};

const IMAGE_SIZE_PRESET_LABEL: Record<ImageSizePreset, string> = {
  original: "auto",
  hd: "1280px",
  fullhd: "1920px",
  "2k": "2560px",
  "4k": "3840px",
};

function mimeFor(format: ImageFormat): string {
  return format === "jpg" ? "image/jpeg" : "image/png";
}

function extFor(format: ImageFormat): string {
  return format === "jpg" ? "jpg" : "png";
}

function getTargetLongEdge(size: ImageSizePreset): number | undefined {
  if (size === "original") {
    return undefined;
  }
  return IMAGE_SIZE_PRESET_LONG_EDGE[size];
}

function appendSizeSuffix(fileName: string, size: ImageSizePreset): string {
  const suffix = IMAGE_SIZE_PRESET_LABEL[size];
  const dotIndex = fileName.lastIndexOf(".");

  if (dotIndex === -1) {
    return `${fileName}-${suffix}`;
  }

  return `${fileName.slice(0, dotIndex)}-${suffix}${fileName.slice(dotIndex)}`;
}

function shouldFallbackToMainThread(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("offscreencanvas") ||
    message.includes("failed to construct 'worker'") ||
    message.includes("module script")
  );
}

async function fallbackPdfToImages(
  file: File,
  format: ImageFormat,
  quality: number,
  size: ImageSizePreset,
): Promise<PdfImageResult[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const bytes = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const output: PdfImageResult[] = [];
  const targetLongEdge = getTargetLongEdge(size);

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const baseViewport = page.getViewport({ scale: 1 });
    const baseLongEdge = Math.max(baseViewport.width, baseViewport.height);
    const scale = targetLongEdge && baseLongEdge > 0 ? targetLongEdge / baseLongEdge : 1.5;
    const viewport = page.getViewport({ scale });
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
      name: appendSizeSuffix(`page-${i}.${extFor(format)}`, size),
      blob,
    });
  }

  return output;
}

export async function pdfToImages(
  file: File,
  options?: { format?: ImageFormat; quality?: number; size?: ImageSizePreset },
): Promise<PdfImageResult[]> {
  const format = options?.format ?? "png";
  const quality = options?.quality ?? 0.9;
  const size = options?.size ?? "fullhd";
  const targetLongEdge = getTargetLongEdge(size);

  try {
    const output = await runWorkerTask("pdfToImage", {
      file: await file.arrayBuffer(),
      scale: 1.5,
      targetLongEdge,
      format,
      quality,
    });

    return output.map((item) => ({
      name: appendSizeSuffix(item.name, size),
      blob: new Blob([item.data], { type: mimeFor(format) }),
    }));
  } catch (error) {
    if (!shouldFallbackToMainThread(error)) {
      throw error;
    }
    return fallbackPdfToImages(file, format, quality, size);
  }
}

export async function zipImages(images: PdfImageResult[]): Promise<Blob> {
  const zip = new JSZip();
  images.forEach((item) => zip.file(item.name, item.blob));
  return zip.generateAsync({ type: "blob" });
}
