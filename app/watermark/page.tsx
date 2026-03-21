"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ActionButton";
import { FileDrop } from "@/components/FileDrop";
import { useLanguage } from "@/components/LanguageProvider";
import { PdfPreview } from "@/components/PdfPreview";
import { ToolLayout } from "@/components/ToolLayout";
import { addWatermark } from "@/lib/pdf/watermark";
import { downloadBlob } from "@/utils/download";

const COLOR_PRESETS = [
  { label: "Gray", labelJa: "グレー", value: { r: 150, g: 150, b: 150 } },
  { label: "Red", labelJa: "赤", value: { r: 220, g: 50, b: 50 } },
  { label: "Blue", labelJa: "青", value: { r: 50, g: 80, b: 220 } },
  { label: "Black", labelJa: "黒", value: { r: 0, g: 0, b: 0 } },
];

export default function WatermarkPage() {
  const { lang } = useLanguage();
  const isJa = lang === "ja";
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(60);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(-45);
  const [colorIndex, setColorIndex] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processWatermark = async () => {
    if (!file) {
      setError(isJa ? "PDFを1つ選択してください。" : "Select one PDF file.");
      return;
    }
    if (!text.trim()) {
      setError(isJa ? "透かし文字を入力してください。" : "Enter watermark text.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const out = await addWatermark(file, {
        text,
        fontSize,
        opacity,
        rotation,
        color: COLOR_PRESETS[colorIndex]!.value,
      });
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : isJa ? "透かしの追加に失敗しました" : "Watermark failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title={isJa ? "透かし追加" : "Add Watermark"}
      description={
        isJa
          ? "PDFの全ページにテキスト透かしを追加します。"
          : "Add a text watermark to every page of your PDF."
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
          <label htmlFor="wm-text" className="mb-1 block text-sm font-semibold text-slate-800">
            {isJa ? "透かし文字" : "Watermark text"}
          </label>
          <input
            id="wm-text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800"
            placeholder={isJa ? "例: CONFIDENTIAL" : "e.g. CONFIDENTIAL"}
          />
        </div>

        <div>
          <label htmlFor="wm-color" className="mb-1 block text-sm font-semibold text-slate-800">
            {isJa ? "色" : "Color"}
          </label>
          <select
            id="wm-color"
            value={colorIndex}
            onChange={(e) => setColorIndex(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800"
          >
            {COLOR_PRESETS.map((preset, i) => (
              <option key={preset.label} value={i}>
                {isJa ? preset.labelJa : preset.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="wm-size" className="mb-1 block text-sm font-semibold text-slate-800">
            {isJa ? `フォントサイズ: ${fontSize}` : `Font size: ${fontSize}`}
          </label>
          <input
            id="wm-size"
            type="range"
            min={12}
            max={120}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="wm-opacity" className="mb-1 block text-sm font-semibold text-slate-800">
            {isJa ? `不透明度: ${Math.round(opacity * 100)}%` : `Opacity: ${Math.round(opacity * 100)}%`}
          </label>
          <input
            id="wm-opacity"
            type="range"
            min={5}
            max={100}
            value={Math.round(opacity * 100)}
            onChange={(e) => setOpacity(Number(e.target.value) / 100)}
            className="w-full"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="wm-rotation" className="mb-1 block text-sm font-semibold text-slate-800">
            {isJa ? `回転: ${rotation}°` : `Rotation: ${rotation}°`}
          </label>
          <input
            id="wm-rotation"
            type="range"
            min={-180}
            max={180}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <PdfPreview file={file} />

      <div className="flex flex-wrap gap-3">
        <ActionButton
          label={isJa ? "透かしを追加" : "Add Watermark"}
          loading={loading}
          onClick={processWatermark}
        />
        <ActionButton
          label={isJa ? "watermarked.pdf をダウンロード" : "Download watermarked.pdf"}
          disabled={!result}
          onClick={() => result && downloadBlob(result, "watermarked.pdf")}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </ToolLayout>
  );
}
