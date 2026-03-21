"use client";

import { runWorkerTask } from "@/lib/pdf/workerClient";

export type WatermarkOptions = {
  text: string;
  fontSize: number;
  opacity: number;
  rotation: number;
  color: { r: number; g: number; b: number };
};

export async function addWatermark(file: File, options: WatermarkOptions): Promise<Blob> {
  const out = await runWorkerTask("watermark", {
    file: await file.arrayBuffer(),
    ...options,
  });
  return new Blob([out], { type: "application/pdf" });
}
