"use client";

import { runWorkerTask } from "@/lib/pdf/workerClient";

export async function imageToPdf(files: File[]): Promise<Blob> {
  const images = await Promise.all(
    files.map(async (file) => ({
      name: file.name,
      type: file.type,
      data: await file.arrayBuffer(),
    })),
  );

  const out = await runWorkerTask("imageToPdf", { images });
  return new Blob([out], { type: "application/pdf" });
}
