"use client";

import { runWorkerTask } from "@/lib/pdf/workerClient";

export type PdfMetadata = {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
};

export async function readPdfMetadata(file: File): Promise<PdfMetadata> {
  return runWorkerTask("readMetadata", {
    file: await file.arrayBuffer(),
  });
}

export async function editPdfMetadata(
  file: File,
  metadata: Omit<PdfMetadata, "creator" | "producer">,
): Promise<Blob> {
  const out = await runWorkerTask("editMetadata", {
    file: await file.arrayBuffer(),
    ...metadata,
  });
  return new Blob([out], { type: "application/pdf" });
}
