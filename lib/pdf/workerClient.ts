"use client";

type WorkerSuccess<T> = {
  id: string;
  ok: true;
  result: T;
};

type WorkerFailure = {
  id: string;
  ok: false;
  error: string;
};

type WorkerResponse<T> = WorkerSuccess<T> | WorkerFailure;

type TaskMap = {
  merge: { payload: { files: ArrayBuffer[] }; result: ArrayBuffer };
  split: {
    payload: { file: ArrayBuffer };
    result: Array<{ name: string; data: ArrayBuffer }>;
  };
  rotate: {
    payload: { file: ArrayBuffer; pages: number[]; angle: 90 | 180 | 270 };
    result: ArrayBuffer;
  };
  compress: { payload: { file: ArrayBuffer }; result: ArrayBuffer };
  pdfToImage: {
    payload: {
      file: ArrayBuffer;
      scale?: number;
      targetLongEdge?: number;
      format?: "png" | "jpg";
      quality?: number;
    };
    result: Array<{ name: string; data: ArrayBuffer }>;
  };
  imageToPdf: {
    payload: {
      images: Array<{ name: string; type: string; data: ArrayBuffer }>;
    };
    result: ArrayBuffer;
  };
  watermark: {
    payload: {
      file: ArrayBuffer;
      text: string;
      fontSize: number;
      opacity: number;
      rotation: number;
      color: { r: number; g: number; b: number };
    };
    result: ArrayBuffer;
  };
  pageNumbers: {
    payload: {
      file: ArrayBuffer;
      position: string;
      startNumber: number;
      fontSize: number;
    };
    result: ArrayBuffer;
  };
  extract: {
    payload: { file: ArrayBuffer; pages: number[] };
    result: ArrayBuffer;
  };
  editMetadata: {
    payload: {
      file: ArrayBuffer;
      title: string;
      author: string;
      subject: string;
      keywords: string;
    };
    result: ArrayBuffer;
  };
  readMetadata: {
    payload: { file: ArrayBuffer };
    result: {
      title: string;
      author: string;
      subject: string;
      keywords: string;
      creator: string;
      producer: string;
    };
  };
};

let worker: Worker | null = null;
const WORKER_TASK_TIMEOUT_MS = 120_000;

function getWorker(): Worker {
  if (worker) {
    return worker;
  }

  worker = new Worker(new URL("../../workers/pdfWorker.ts", import.meta.url), {
    type: "module",
  });
  return worker;
}

export function runWorkerTask<K extends keyof TaskMap>(
  type: K,
  payload: TaskMap[K]["payload"],
): Promise<TaskMap[K]["result"]> {
  const activeWorker = getWorker();
  const id = crypto.randomUUID();

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Worker task \"${String(type)}\" timed out after ${WORKER_TASK_TIMEOUT_MS}ms`));
    }, WORKER_TASK_TIMEOUT_MS);

    const cleanup = () => {
      clearTimeout(timeoutId);
      activeWorker.removeEventListener("message", handleMessage);
      activeWorker.removeEventListener("error", handleError);
      activeWorker.removeEventListener("messageerror", handleMessageError);
    };

    const handleMessage = (event: MessageEvent<WorkerResponse<TaskMap[K]["result"]>>) => {
      if (event.data.id !== id) {
        return;
      }

      cleanup();

      if (!event.data.ok) {
        reject(new Error(event.data.error));
        return;
      }

      resolve(event.data.result);
    };

    const handleError = (event: ErrorEvent) => {
      cleanup();
      reject(new Error(event.message || `Worker task \"${String(type)}\" failed`));
    };

    const handleMessageError = () => {
      cleanup();
      reject(new Error(`Worker task \"${String(type)}\" received an unreadable response`));
    };

    activeWorker.addEventListener("message", handleMessage);
    activeWorker.addEventListener("error", handleError);
    activeWorker.addEventListener("messageerror", handleMessageError);

    try {
      activeWorker.postMessage({ id, type, payload });
    } catch (error) {
      cleanup();
      reject(error instanceof Error ? error : new Error("Failed to post worker task"));
    }
  });
}
