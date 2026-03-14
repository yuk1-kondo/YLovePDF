"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ActionButton";
import { FileDrop } from "@/components/FileDrop";
import { useLanguage } from "@/components/LanguageProvider";
import { PdfPreview } from "@/components/PdfPreview";
import { ToolLayout } from "@/components/ToolLayout";
import { mergePdf } from "@/lib/pdf/merge";
import { downloadBlob } from "@/utils/download";

export default function MergePage() {
  const { lang } = useLanguage();
  const isJa = lang === "ja";
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processMerge = async () => {
    if (files.length < 2) {
      setError(isJa ? "PDF\u30922\u3064\u4ee5\u4e0a\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002" : "Select at least 2 PDF files.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const merged = await mergePdf(files);
      setResult(merged);
    } catch (e) {
      setError(e instanceof Error ? e.message : isJa ? "\u7d50\u5408\u306b\u5931\u6557\u3057\u307e\u3057\u305f" : "Merge failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title={isJa ? "PDF\u7d50\u5408" : "Merge PDF"}
      description={
        isJa
          ? "\u8907\u6570\u306ePDF\u3092\u30d6\u30e9\u30a6\u30b6\u5185\u3067\u4e00\u3064\u306b\u307e\u3068\u3081\u307e\u3059\u3002"
          : "Combine multiple PDFs into one document entirely in your browser."
      }
    >
      <FileDrop
        label={isJa ? "\u7d50\u5408\u3059\u308bPDF\u3092\u30c9\u30ed\u30c3\u30d7" : "Drop PDF files to merge"}
        accept={["application/pdf"]}
        onFiles={(incoming) => {
          setFiles(incoming);
          setResult(null);
        }}
      />

      <div className="glass rounded-2xl p-4">
        <p className="text-sm font-semibold text-slate-800">{isJa ? "\u30d5\u30a1\u30a4\u30eb\u9806" : "File order"}</p>
        <ol className="ui-muted mt-2 list-decimal space-y-1 pl-5 text-sm">
          {files.map((file) => (
            <li key={file.name}>{file.name}</li>
          ))}
        </ol>
      </div>

      <PdfPreview file={files[0] ?? null} />

      <div className="flex flex-wrap items-center gap-3">
        <ActionButton label={isJa ? "PDF\u3092\u7d50\u5408" : "Merge PDFs"} loading={loading} onClick={processMerge} />
        <ActionButton
          label={isJa ? "merged.pdf \u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9" : "Download merged.pdf"}
          disabled={!result}
          onClick={() => result && downloadBlob(result, "merged.pdf")}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </ToolLayout>
  );
}
