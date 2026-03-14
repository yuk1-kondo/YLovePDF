import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Listener = (event: { data: unknown }) => void;

class MockWorker {
  private listeners: Record<string, Set<Listener>> = {
    message: new Set(),
    error: new Set(),
    messageerror: new Set(),
  };

  postMessage = vi.fn();

  addEventListener(type: "message" | "error" | "messageerror", listener: Listener) {
    this.listeners[type].add(listener);
  }

  removeEventListener(type: "message" | "error" | "messageerror", listener: Listener) {
    this.listeners[type].delete(listener);
  }

  dispatchMessage(data: unknown) {
    this.listeners.message.forEach((listener) => listener({ data }));
  }
}

describe("runWorkerTask", () => {
  let worker: MockWorker;

  beforeEach(() => {
    vi.resetModules();

    worker = new MockWorker();
    vi.stubGlobal(
      "Worker",
      vi.fn(() => worker),
    );

    vi.spyOn(crypto, "randomUUID").mockReturnValue("task-1");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves task when matching worker response arrives", async () => {
    const { runWorkerTask } = await import("./workerClient");
    const expected = new ArrayBuffer(4);

    const promise = runWorkerTask("compress", { file: new ArrayBuffer(0) });
    worker.dispatchMessage({ id: "task-1", ok: true, result: expected });

    await expect(promise).resolves.toBe(expected);
  });

  it("rejects when task times out", async () => {
    vi.spyOn(globalThis, "setTimeout").mockImplementation((callback) => {
      queueMicrotask(() => {
        if (typeof callback === "function") {
          callback();
        }
      });
      return 1 as unknown as ReturnType<typeof setTimeout>;
    });

    const { runWorkerTask } = await import("./workerClient");

    const promise = runWorkerTask("compress", { file: new ArrayBuffer(0) });

    await expect(promise).rejects.toThrow('Worker task "compress" timed out after 120000ms');
  });
});
