"use client";

import { runWorkerTask } from "@/lib/pdf/workerClient";

export async function extractPages(file: File, pages: number[]): Promise<Blob> {
  const out = await runWorkerTask("extract", {
    file: await file.arrayBuffer(),
    pages,
  });
  return new Blob([out], { type: "application/pdf" });
}
