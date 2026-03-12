"use client";

import { runWorkerTask } from "@/lib/pdf/workerClient";

export type SplitResult = {
  name: string;
  blob: Blob;
};

export async function splitPdf(file: File): Promise<SplitResult[]> {
  const out = await runWorkerTask("split", { file: await file.arrayBuffer() });
  return out.map((item) => ({
    name: item.name,
    blob: new Blob([item.data], { type: "application/pdf" }),
  }));
}
