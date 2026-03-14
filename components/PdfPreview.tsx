"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type PdfPreviewProps = {
  file: File | null;
  selectedPages?: number[];
  onPageCount?: (count: number) => void;
};

type PreviewViewport = { width: number; height: number };

type PreviewPageLike = {
  getViewport: (params: { scale: number }) => PreviewViewport;
  render: (params: {
    canvasContext: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    viewport: PreviewViewport;
  }) => { promise: Promise<unknown> };
};

type PreviewDocLike = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PreviewPageLike>;
};

export function PdfPreview({ file, selectedPages = [], onPageCount }: PdfPreviewProps) {
  const { lang } = useLanguage();
  const [pageCount, setPageCount] = useState(0);
  const pdfRef = useRef<unknown>(null);
  const renderedRef = useRef<Set<number>>(new Set());
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const previewRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const shouldHighlight = useMemo(() => new Set(selectedPages), [selectedPages]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (typeof window === "undefined") {
        return;
      }

      if (!file) {
        setPageCount(0);
        pdfRef.current = null;
        renderedRef.current = new Set();
        canvasRefs.current = new Map();
        previewRefs.current = new Map();
        onPageCount?.(0);
        return;
      }

      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      if (cancelled) {
        return;
      }

      pdfRef.current = pdf;
      const previewDoc = pdf as unknown as PreviewDocLike;
      setPageCount(previewDoc.numPages);
      onPageCount?.(previewDoc.numPages);
      renderedRef.current = new Set();
      canvasRefs.current = new Map();
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [file, onPageCount]);

  useEffect(() => {
    if (!file || pageCount === 0 || !pdfRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const pageNum = Number((entry.target as HTMLElement).dataset.page);
          if (Number.isNaN(pageNum) || renderedRef.current.has(pageNum)) {
            return;
          }

          const canvas = canvasRefs.current.get(pageNum);
          if (!canvas) {
            return;
          }

          const renderPage = async () => {
            const doc = pdfRef.current as PreviewDocLike | null;
            if (!doc) {
              return;
            }

            const page = await doc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 0.45 });
            const context = canvas.getContext("2d");
            if (!context) {
              return;
            }

            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);
            const renderParams: Parameters<PreviewPageLike["render"]>[0] = {
              canvasContext: context,
              canvas,
              viewport,
            };

            await page.render(renderParams).promise;
            renderedRef.current.add(pageNum);
          };

          void renderPage();
        });
      },
      { rootMargin: "120px" },
    );

    const timer = window.setTimeout(() => {
      previewRefs.current.forEach((node) => {
        observer.observe(node);
      });
    }, 0);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [file, pageCount]);

  if (!file) {
    return (
      <div className="glass rounded-2xl p-6 text-sm ui-muted">
        {lang === "ja"
          ? "PDF\u3092\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9\u3059\u308b\u3068\u30d7\u30ec\u30d3\u30e5\u30fc\u3092\u8868\u793a\u3067\u304d\u307e\u3059\u3002"
          : "Upload a PDF to see page previews."}
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">
          {lang === "ja" ? "\u30d7\u30ec\u30d3\u30e5\u30fc" : "Preview"}
        </p>
        <p className="text-xs ui-muted">
          {lang === "ja" ? `${pageCount} \u30da\u30fc\u30b8` : `${pageCount} pages`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => {
          const selected = shouldHighlight.size === 0 || shouldHighlight.has(page);
          return (
            <div
              key={page}
              data-page={page}
              data-preview-page={page}
              ref={(node) => {
                if (node) {
                  previewRefs.current.set(page, node);
                }
              }}
              className={`rounded-lg border p-2 ${
                selected ? "border-gray-300" : "border-gray-200 opacity-55"
              }`}
            >
              <canvas
                ref={(node) => {
                  if (node) {
                    canvasRefs.current.set(page, node);
                  }
                }}
                className="mx-auto h-auto w-full rounded"
                aria-label={lang === "ja" ? `PDF \u30da\u30fc\u30b8 ${page}` : `PDF page ${page}`}
              />
              <p className="mt-2 text-center text-xs ui-muted">
                {lang === "ja" ? `\u30da\u30fc\u30b8 ${page}` : `Page ${page}`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
