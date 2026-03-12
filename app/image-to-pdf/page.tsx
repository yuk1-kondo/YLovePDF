"use client";

import { useEffect, useState } from "react";
import { ActionButton } from "@/components/ActionButton";
import { FileDrop } from "@/components/FileDrop";
import { useLanguage } from "@/components/LanguageProvider";
import { ToolLayout } from "@/components/ToolLayout";
import { imageToPdf } from "@/lib/pdf/imageToPdf";
import { downloadBlob } from "@/utils/download";

export default function ImageToPdfPage() {
  const { lang } = useLanguage();
  const isJa = lang === "ja";
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Array<{ name: string; url: string }>>([]);
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const items = files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
    setPreviews(items);

    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [files]);

  const processConvert = async () => {
    if (files.length === 0) {
      setError(isJa ? "\u753b\u50cf\u30921\u679a\u4ee5\u4e0a\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002" : "Select at least one image.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const out = await imageToPdf(files);
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : isJa ? "\u5909\u63db\u306b\u5931\u6557\u3057\u307e\u3057\u305f" : "Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title={isJa ? "\u753b\u50cf\u2192PDF" : "Image to PDF"}
      description={
        isJa
          ? "PNG\u3068JPG\u753b\u50cf\u3092\u30d6\u30e9\u30a6\u30b6\u5185\u30671\u3064\u306ePDF\u306b\u5909\u63db\u3057\u307e\u3059\u3002"
          : "Convert PNG and JPG images into a single PDF in the browser."
      }
    >
      <FileDrop
        label={isJa ? "PNG/JPG\u3092\u30c9\u30ed\u30c3\u30d7" : "Drop PNG or JPG files"}
        accept={["image/png", "image/jpeg", "image/jpg"]}
        onFiles={(incoming) => {
          setFiles(incoming);
          setResult(null);
        }}
      />

      <div className="glass rounded-2xl p-4">
        <p className="mb-3 text-sm font-semibold text-slate-100">{isJa ? "\u753b\u50cf\u30d7\u30ec\u30d3\u30e5\u30fc" : "Image preview"}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {previews.map((item) => (
            <div key={item.name} className="rounded-lg border border-white/20 bg-slate-900/30 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.name} className="h-28 w-full rounded object-cover" />
              <p className="ui-muted mt-2 truncate text-xs">{item.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <ActionButton label={isJa ? "PDF\u306b\u5909\u63db" : "Convert to PDF"} loading={loading} onClick={processConvert} />
        <ActionButton
          label={isJa ? "images.pdf \u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9" : "Download images.pdf"}
          disabled={!result}
          onClick={() => result && downloadBlob(result, "images.pdf")}
        />
        {error && <p className="text-sm text-rose-300">{error}</p>}
      </div>
    </ToolLayout>
  );
}
