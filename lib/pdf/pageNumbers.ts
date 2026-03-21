"use client";

import { runWorkerTask } from "@/lib/pdf/workerClient";

export type PageNumberPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export async function addPageNumbers(
  file: File,
  position: PageNumberPosition,
  startNumber: number,
  fontSize: number,
): Promise<Blob> {
  const out = await runWorkerTask("pageNumbers", {
    file: await file.arrayBuffer(),
    position,
    startNumber,
    fontSize,
  });
  return new Blob([out], { type: "application/pdf" });
}
