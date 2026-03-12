"use client";

import { runWorkerTask } from "@/lib/pdf/workerClient";

export async function rotatePdf(
  file: File,
  pages: number[],
  angle: 90 | 180 | 270,
): Promise<Blob> {
  const out = await runWorkerTask("rotate", {
    file: await file.arrayBuffer(),
    pages,
    angle,
  });

  return new Blob([out], { type: "application/pdf" });
}
