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
};

let worker: Worker | null = null;

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
    const handleMessage = (event: MessageEvent<WorkerResponse<TaskMap[K]["result"]>>) => {
      if (event.data.id !== id) {
        return;
      }

      activeWorker.removeEventListener("message", handleMessage);

      if (!event.data.ok) {
        reject(new Error(event.data.error));
        return;
      }

      resolve(event.data.result);
    };

    activeWorker.addEventListener("message", handleMessage);
    activeWorker.postMessage({ id, type, payload });
  });
}
