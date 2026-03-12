"use client";

import { runWorkerTask } from "@/lib/pdf/workerClient";

export async function compressPdf(file: File): Promise<Blob> {
  const out = await runWorkerTask("compress", { file: await file.arrayBuffer() });
  return new Blob([out], { type: "application/pdf" });
}
