import { beforeEach, describe, expect, it, vi } from "vitest";
import { pdfToImages } from "./pdfToImage";
import { runWorkerTask } from "@/lib/pdf/workerClient";

vi.mock("@/lib/pdf/workerClient", () => ({
  runWorkerTask: vi.fn(),
}));

const getDocumentMock = vi.fn();

vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({
  GlobalWorkerOptions: { workerSrc: "" },
  getDocument: getDocumentMock,
}));

describe("pdfToImages", () => {
  const makePdfFile = (): File =>
    ({
      name: "sample.pdf",
      type: "application/pdf",
      arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer),
    }) as unknown as File;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({} as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => {
      callback(new Blob(["img"], { type: "image/png" }));
    });

    getDocumentMock.mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: async () => ({
          getViewport: () => ({ width: 120, height: 80 }),
          render: () => ({ promise: Promise.resolve() }),
        }),
      }),
    });
  });

  it("falls back only for worker/canvas capability errors", async () => {
    vi.mocked(runWorkerTask).mockRejectedValue(new Error("OffscreenCanvas is not available in this browser"));
    const file = makePdfFile();

    const result = await pdfToImages(file, { format: "png", size: "hd" });

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("page-1-1280px.png");
    expect(getDocumentMock).toHaveBeenCalledTimes(1);
  });

  it("adds selected size suffix to worker output names", async () => {
    vi.mocked(runWorkerTask).mockResolvedValue([
      {
        name: "page-1.jpg",
        data: new Uint8Array([1, 2, 3]).buffer,
      },
    ]);

    const file = makePdfFile();
    const result = await pdfToImages(file, { format: "jpg", size: "4k" });

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("page-1-3840px.jpg");
  });

  it("rethrows non-capability worker errors", async () => {
    vi.mocked(runWorkerTask).mockRejectedValue(new Error("Malformed PDF data"));
    const file = makePdfFile();

    await expect(pdfToImages(file, { format: "png" })).rejects.toThrow("Malformed PDF data");
    expect(getDocumentMock).not.toHaveBeenCalled();
  });
});
