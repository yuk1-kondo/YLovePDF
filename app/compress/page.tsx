"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ActionButton";
import { FileDrop } from "@/components/FileDrop";
import { useLanguage } from "@/components/LanguageProvider";
import { PdfPreview } from "@/components/PdfPreview";
import { ToolLayout } from "@/components/ToolLayout";
import { compressPdf } from "@/lib/pdf/compress";
import { downloadBlob } from "@/utils/download";

export default function CompressPage() {
  const { lang } = useLanguage();
  const isJa = lang === "ja";
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processCompress = async () => {
    if (!file) {
      setError(isJa ? "PDF\u30921\u3064\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002" : "Select one PDF file.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const out = await compressPdf(file);
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : isJa ? "\u5727\u7e2e\u306b\u5931\u6557\u3057\u307e\u3057\u305f" : "Compression failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title={isJa ? "PDF\u5727\u7e2e" : "Compress PDF"}
      description={
        isJa
          ? "\u8efd\u91cf\u306a\u6700\u9069\u5316\u3068\u30e1\u30bf\u30c7\u30fc\u30bf\u6574\u7406\u3067\u30b5\u30a4\u30ba\u3092\u6291\u3048\u307e\u3059\u3002"
          : "Apply lightweight optimization and metadata cleanup to reduce size."
      }
    >
      <FileDrop
        label={isJa ? "PDF\u30d5\u30a1\u30a4\u30eb\u30921\u3064\u30c9\u30ed\u30c3\u30d7" : "Drop one PDF file"}
        accept={["application/pdf"]}
        multiple={false}
        onFiles={(incoming) => {
          setFile(incoming[0] ?? null);
          setResult(null);
        }}
      />

      <PdfPreview file={file} />

      <div className="flex flex-wrap gap-3">
        <ActionButton label={isJa ? "PDF\u3092\u5727\u7e2e" : "Compress PDF"} loading={loading} onClick={processCompress} />
        <ActionButton
          label={isJa ? "compressed.pdf \u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9" : "Download compressed.pdf"}
          disabled={!result}
          onClick={() => result && downloadBlob(result, "compressed.pdf")}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </ToolLayout>
  );
}
