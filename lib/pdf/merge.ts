"use client";

import { runWorkerTask } from "@/lib/pdf/workerClient";

export async function mergePdf(files: File[]): Promise<Blob> {
  const buffers = await Promise.all(files.map((f) => f.arrayBuffer()));
  const out = await runWorkerTask("merge", { files: buffers });
  return new Blob([out], { type: "application/pdf" });
}
