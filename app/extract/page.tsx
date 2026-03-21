"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ActionButton";
import { FileDrop } from "@/components/FileDrop";
import { useLanguage } from "@/components/LanguageProvider";
import { PageSelector } from "@/components/PageSelector";
import { PdfPreview } from "@/components/PdfPreview";
import { ToolLayout } from "@/components/ToolLayout";
import { extractPages } from "@/lib/pdf/extract";
import { downloadBlob } from "@/utils/download";

function parsePageRange(input: string, maxPage: number): number[] {
  const pages = new Set<number>();
  for (const part of input.split(",")) {
    const trimmed = part.trim();
    const rangeParts = trimmed.split("-").map((s) => Number.parseInt(s.trim(), 10));
    if (rangeParts.length === 2 && !Number.isNaN(rangeParts[0]) && !Number.isNaN(rangeParts[1])) {
      const start = Math.max(1, rangeParts[0]!);
      const end = Math.min(maxPage, rangeParts[1]!);
      for (let i = start; i <= end; i++) pages.add(i);
    } else if (rangeParts.length === 1 && !Number.isNaN(rangeParts[0])) {
      const p = rangeParts[0]!;
      if (p >= 1 && p <= maxPage) pages.add(p);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

export default function ExtractPage() {
  const { lang } = useLanguage();
  const isJa = lang === "ja";
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState("");
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyRange = () => {
    if (pageCount > 0 && rangeInput.trim()) {
      setSelectedPages(parsePageRange(rangeInput, pageCount));
    }
  };

  const processExtract = async () => {
    if (!file) {
      setError(isJa ? "PDFを1つ選択してください。" : "Select one PDF file.");
      return;
    }
    if (selectedPages.length === 0) {
      setError(isJa ? "抽出するページを選択してください。" : "Select pages to extract.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const out = await extractPages(file, selectedPages);
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : isJa ? "抽出に失敗しました" : "Extract failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title={isJa ? "ページ抽出" : "Extract Pages"}
      description={
        isJa
          ? "PDFから特定のページだけを抽出して新しいPDFを作成します。"
          : "Extract specific pages from a PDF into a new document."
      }
    >
      <FileDrop
        label={isJa ? "PDFファイルを1つドロップ" : "Drop one PDF file"}
        accept={["application/pdf"]}
        multiple={false}
        onFiles={(incoming) => {
          setFile(incoming[0] ?? null);
          setResult(null);
          setSelectedPages([]);
          setRangeInput("");
        }}
      />

      <div className="glass rounded-2xl p-4">
        <label htmlFor="range-input" className="mb-1 block text-sm font-semibold text-slate-800">
          {isJa ? "ページ範囲（例: 1-3, 5, 7-9）" : "Page range (e.g. 1-3, 5, 7-9)"}
        </label>
        <div className="flex gap-2">
          <input
            id="range-input"
            type="text"
            value={rangeInput}
            onChange={(e) => setRangeInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyRange()}
            placeholder={isJa ? "例: 1-3, 5, 7-9" : "e.g. 1-3, 5, 7-9"}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800"
          />
          <button
            type="button"
            onClick={applyRange}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-gray-50"
          >
            {isJa ? "適用" : "Apply"}
          </button>
        </div>
        <p className="ui-muted mt-1 text-xs">
          {isJa
            ? "または下のプレビューからページを選択できます。"
            : "Or select pages visually from the preview below."}
        </p>
      </div>

      <PdfPreview file={file} selectedPages={selectedPages} onPageCount={setPageCount} />
      <PageSelector pageCount={pageCount} selectedPages={selectedPages} onChange={setSelectedPages} />

      <div className="flex flex-wrap items-center gap-3">
        <ActionButton
          label={isJa ? "ページを抽出" : "Extract Pages"}
          loading={loading}
          onClick={processExtract}
        />
        <ActionButton
          label={isJa ? "extracted.pdf をダウンロード" : "Download extracted.pdf"}
          disabled={!result}
          onClick={() => result && downloadBlob(result, "extracted.pdf")}
        />
        {selectedPages.length > 0 && (
          <p className="text-sm text-slate-600">
            {isJa
              ? `${selectedPages.length} ページ選択中`
              : `${selectedPages.length} page(s) selected`}
          </p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </ToolLayout>
  );
}
