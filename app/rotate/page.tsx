"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ActionButton";
import { FileDrop } from "@/components/FileDrop";
import { useLanguage } from "@/components/LanguageProvider";
import { PageSelector } from "@/components/PageSelector";
import { PdfPreview } from "@/components/PdfPreview";
import { ToolLayout } from "@/components/ToolLayout";
import { rotatePdf } from "@/lib/pdf/rotate";
import { downloadBlob } from "@/utils/download";

export default function RotatePage() {
  const { lang } = useLanguage();
  const isJa = lang === "ja";
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processRotate = async () => {
    if (!file) {
      setError(isJa ? "PDF\u30921\u3064\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002" : "Select one PDF file.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const out = await rotatePdf(file, selectedPages, angle);
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : isJa ? "\u56de\u8ee2\u306b\u5931\u6557\u3057\u307e\u3057\u305f" : "Rotate failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title={isJa ? "PDF\u56de\u8ee2" : "Rotate PDF"}
      description={
        isJa
          ? "\u9078\u629e\u30da\u30fc\u30b8\u309290\u00b0 / 180\u00b0 / 270\u00b0\u3067\u56de\u8ee2\u3057\u307e\u3059\u3002"
          : "Rotate selected pages by 90, 180, or 270 degrees."
      }
    >
      <FileDrop
        label={isJa ? "PDF\u30d5\u30a1\u30a4\u30eb\u30921\u3064\u30c9\u30ed\u30c3\u30d7" : "Drop one PDF file"}
        accept={["application/pdf"]}
        multiple={false}
        onFiles={(incoming) => {
          setFile(incoming[0] ?? null);
          setResult(null);
          setSelectedPages([]);
        }}
      />

      <div className="glass rounded-2xl p-4">
        <label htmlFor="angle" className="mb-2 block text-sm font-semibold text-slate-100">
          {isJa ? "\u56de\u8ee2\u89d2\u5ea6" : "Rotation angle"}
        </label>
        <select
          id="angle"
          className="rounded-lg border border-white/20 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
          value={angle}
          onChange={(e) => setAngle(Number(e.target.value) as 90 | 180 | 270)}
        >
          <option value={90}>90 deg</option>
          <option value={180}>180 deg</option>
          <option value={270}>270 deg</option>
        </select>
        <p className="ui-muted mt-2 text-xs">
          {isJa ? "\u30da\u30fc\u30b8\u672a\u9078\u629e\u306e\u5834\u5408\u306f\u5168\u30da\u30fc\u30b8\u304c\u5bfe\u8c61\u3067\u3059\u3002" : "No page selection means all pages."}
        </p>
      </div>

      <PdfPreview file={file} selectedPages={selectedPages} onPageCount={setPageCount} />
      <PageSelector pageCount={pageCount} selectedPages={selectedPages} onChange={setSelectedPages} />

      <div className="flex flex-wrap gap-3">
        <ActionButton label={isJa ? "PDF\u3092\u56de\u8ee2" : "Rotate PDF"} loading={loading} onClick={processRotate} />
        <ActionButton
          label={isJa ? "rotated.pdf \u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9" : "Download rotated.pdf"}
          disabled={!result}
          onClick={() => result && downloadBlob(result, "rotated.pdf")}
        />
        {error && <p className="text-sm text-rose-300">{error}</p>}
      </div>
    </ToolLayout>
  );
}
