"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ActionButton";
import { FileDrop } from "@/components/FileDrop";
import { useLanguage } from "@/components/LanguageProvider";
import { PdfPreview } from "@/components/PdfPreview";
import { ToolLayout } from "@/components/ToolLayout";
import { addPageNumbers, type PageNumberPosition } from "@/lib/pdf/pageNumbers";
import { downloadBlob } from "@/utils/download";

const POSITIONS: { value: PageNumberPosition; labelEn: string; labelJa: string }[] = [
  { value: "bottom-center", labelEn: "Bottom Center", labelJa: "下部 中央" },
  { value: "bottom-left", labelEn: "Bottom Left", labelJa: "下部 左" },
  { value: "bottom-right", labelEn: "Bottom Right", labelJa: "下部 右" },
  { value: "top-center", labelEn: "Top Center", labelJa: "上部 中央" },
  { value: "top-left", labelEn: "Top Left", labelJa: "上部 左" },
  { value: "top-right", labelEn: "Top Right", labelJa: "上部 右" },
];

export default function PageNumbersPage() {
  const { lang } = useLanguage();
  const isJa = lang === "ja";
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<PageNumberPosition>("bottom-center");
  const [startNumber, setStartNumber] = useState(1);
  const [fontSize, setFontSize] = useState(12);
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPageNumbers = async () => {
    if (!file) {
      setError(isJa ? "PDFを1つ選択してください。" : "Select one PDF file.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const out = await addPageNumbers(file, position, startNumber, fontSize);
      setResult(out);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : isJa ? "ページ番号の追加に失敗しました" : "Adding page numbers failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title={isJa ? "ページ番号追加" : "Add Page Numbers"}
      description={
        isJa
          ? "PDFの各ページにページ番号を挿入します。"
          : "Insert page numbers on every page of your PDF."
      }
    >
      <FileDrop
        label={isJa ? "PDFファイルを1つドロップ" : "Drop one PDF file"}
        accept={["application/pdf"]}
        multiple={false}
        onFiles={(incoming) => {
          setFile(incoming[0] ?? null);
          setResult(null);
        }}
      />

      <div className="glass grid gap-4 rounded-2xl p-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pn-pos" className="mb-1 block text-sm font-semibold text-slate-800">
            {isJa ? "位置" : "Position"}
          </label>
          <select
            id="pn-pos"
            value={position}
            onChange={(e) => setPosition(e.target.value as PageNumberPosition)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800"
          >
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {isJa ? p.labelJa : p.labelEn}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pn-start" className="mb-1 block text-sm font-semibold text-slate-800">
            {isJa ? "開始番号" : "Start number"}
          </label>
          <input
            id="pn-start"
            type="number"
            min={0}
            value={startNumber}
            onChange={(e) => setStartNumber(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="pn-size" className="mb-1 block text-sm font-semibold text-slate-800">
            {isJa ? `フォントサイズ: ${fontSize}` : `Font size: ${fontSize}`}
          </label>
          <input
            id="pn-size"
            type="range"
            min={8}
            max={36}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <PdfPreview file={file} />

      <div className="flex flex-wrap gap-3">
        <ActionButton
          label={isJa ? "ページ番号を追加" : "Add Page Numbers"}
          loading={loading}
          onClick={processPageNumbers}
        />
        <ActionButton
          label={isJa ? "numbered.pdf をダウンロード" : "Download numbered.pdf"}
          disabled={!result}
          onClick={() => result && downloadBlob(result, "numbered.pdf")}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </ToolLayout>
  );
}
