"use client";

import { useState } from "react";
import JSZip from "jszip";
import { ActionButton } from "@/components/ActionButton";
import { FileDrop } from "@/components/FileDrop";
import { useLanguage } from "@/components/LanguageProvider";
import { PdfPreview } from "@/components/PdfPreview";
import { ToolLayout } from "@/components/ToolLayout";
import { splitPdf, type SplitResult } from "@/lib/pdf/split";
import { downloadBlob } from "@/utils/download";

export default function SplitPage() {
  const { lang } = useLanguage();
  const isJa = lang === "ja";
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<SplitResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processSplit = async () => {
    if (!file) {
      setError(isJa ? "PDF\u30921\u3064\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002" : "Select one PDF file.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const parts = await splitPdf(file);
      setResults(parts);
    } catch (e) {
      setError(e instanceof Error ? e.message : isJa ? "\u5206\u5272\u306b\u5931\u6557\u3057\u307e\u3057\u305f" : "Split failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    results.forEach((r) => zip.file(r.name, r.blob));
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, "split-pages.zip");
  };

  return (
    <ToolLayout
      title={isJa ? "PDF\u5206\u5272" : "Split PDF"}
      description={
        isJa
          ? "1\u3064\u306ePDF\u3092\u30da\u30fc\u30b8\u5358\u4f4d\u306e\u30d5\u30a1\u30a4\u30eb\u306b\u5206\u5272\u3057\u307e\u3059\u3002"
          : "Split one PDF into one-file-per-page outputs."
      }
    >
      <FileDrop
        label={isJa ? "PDF\u30d5\u30a1\u30a4\u30eb\u30921\u3064\u30c9\u30ed\u30c3\u30d7" : "Drop one PDF file"}
        accept={["application/pdf"]}
        multiple={false}
        onFiles={(incoming) => {
          setFile(incoming[0] ?? null);
          setResults([]);
        }}
      />

      <PdfPreview file={file} />

      <div className="glass rounded-2xl p-4">
        <p className="text-sm font-semibold text-slate-100">{isJa ? "\u51fa\u529b\u30d5\u30a1\u30a4\u30eb" : "Output files"}</p>
        <div className="mt-2 max-h-44 space-y-2 overflow-auto">
          {results.map((r) => (
            <button
              key={r.name}
              type="button"
              className="block text-sm text-cyan-200 underline"
              onClick={() => downloadBlob(r.blob, r.name)}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <ActionButton label={isJa ? "PDF\u3092\u5206\u5272" : "Split PDF"} loading={loading} onClick={processSplit} />
        <ActionButton
          label={isJa ? "\u3059\u3079\u3066\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9 (ZIP)" : "Download all (ZIP)"}
          disabled={results.length === 0}
          onClick={downloadAll}
        />
        {error && <p className="text-sm text-rose-300">{error}</p>}
      </div>
    </ToolLayout>
  );
}
