"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ActionButton";
import { FileDrop } from "@/components/FileDrop";
import { useLanguage } from "@/components/LanguageProvider";
import { PdfPreview } from "@/components/PdfPreview";
import { ToolLayout } from "@/components/ToolLayout";
import {
  pdfToImages,
  zipImages,
  type ImageFormat,
  type ImageSizePreset,
  type PdfImageResult,
} from "@/lib/pdf/pdfToImage";
import { downloadBlob } from "@/utils/download";

const IMAGE_SIZE_OPTIONS: Array<{ value: ImageSizePreset; labelEn: string; labelJa: string }> = [
  { value: "original", labelEn: "Original (Auto)", labelJa: "\u5143\u30b5\u30a4\u30ba (\u81ea\u52d5)" },
  { value: "hd", labelEn: "HD (1280px)", labelJa: "HD (1280px)" },
  { value: "fullhd", labelEn: "Full HD (1920px)", labelJa: "\u30d5\u30ebHD (1920px)" },
  { value: "2k", labelEn: "2K (2560px)", labelJa: "2K (2560px)" },
  { value: "4k", labelEn: "4K (3840px)", labelJa: "4K (3840px)" },
];

export default function PdfToImagePage() {
  const { lang } = useLanguage();
  const isJa = lang === "ja";
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<PdfImageResult[]>([]);
  const [format, setFormat] = useState<ImageFormat>("jpg");
  const [size, setSize] = useState<ImageSizePreset>("fullhd");
  const [quality, setQuality] = useState(0.9);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processConvert = async () => {
    if (!file) {
      setError(isJa ? "PDF\u30921\u3064\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002" : "Select one PDF file.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const out = await pdfToImages(file, { format, quality, size });
      setImages(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : isJa ? "\u5909\u63db\u306b\u5931\u6557\u3057\u307e\u3057\u305f" : "Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadAll = async () => {
    const zip = await zipImages(images);
    downloadBlob(zip, "pdf-images.zip");
  };

  return (
    <ToolLayout
      title={isJa ? "PDF\u2192\u753b\u50cf" : "PDF to Image"}
      description={
        isJa
          ? "PDF\u306e\u5404\u30da\u30fc\u30b8\u3092PNG/JPG\u3067\u51fa\u529b\u3057\u3001\u500b\u5225\u307e\u305f\u306fZIP\u3067\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3067\u304d\u307e\u3059\u3002"
          : "Render PDF pages into PNG/JPG images and download individually or as ZIP."
      }
    >
      <FileDrop
        label={isJa ? "PDF\u30d5\u30a1\u30a4\u30eb\u30921\u3064\u30c9\u30ed\u30c3\u30d7" : "Drop one PDF file"}
        accept={["application/pdf"]}
        multiple={false}
        onFiles={(incoming) => {
          setFile(incoming[0] ?? null);
          setImages([]);
        }}
      />

      <PdfPreview file={file} />

      <div className="glass rounded-2xl p-4">
        <p className="text-sm font-semibold text-slate-800">{isJa ? "\u51fa\u529b\u8a2d\u5b9a" : "Output settings"}</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label htmlFor="image-format" className="text-sm text-slate-700">
            {isJa ? "\u5f62\u5f0f" : "Format"}
          </label>
          <select
            id="image-format"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800"
            value={format}
            onChange={(e) => setFormat(e.target.value as ImageFormat)}
          >
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
          </select>

          <label htmlFor="image-size" className="text-sm text-slate-700">
            {isJa ? "\u753b\u50cf\u30b5\u30a4\u30ba" : "Image size"}
          </label>
          <select
            id="image-size"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800"
            value={size}
            onChange={(e) => setSize(e.target.value as ImageSizePreset)}
          >
            {IMAGE_SIZE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {isJa ? option.labelJa : option.labelEn}
              </option>
            ))}
          </select>

          {format === "jpg" && (
            <label htmlFor="jpg-quality" className="flex items-center gap-2 text-sm text-slate-700">
              {isJa ? "JPG\u54c1\u8cea" : "JPG quality"}
              <input
                id="jpg-quality"
                type="range"
                min={0.4}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
              />
              <span>{Math.round(quality * 100)}%</span>
            </label>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <p className="text-sm font-semibold text-slate-800">{isJa ? "\u51fa\u529b\u753b\u50cf" : "Output images"}</p>
        <div className="mt-2 max-h-44 space-y-2 overflow-auto">
          {images.map((img) => (
            <button
              key={img.name}
              type="button"
              className="block text-sm text-red-600 underline"
              onClick={() => downloadBlob(img.blob, img.name)}
            >
              {img.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <ActionButton
          label={isJa ? `${format.toUpperCase()} \u306b\u5909\u63db` : `Convert to ${format.toUpperCase()}`}
          loading={loading}
          onClick={processConvert}
        />
        <ActionButton
          label={isJa ? "\u3059\u3079\u3066\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9 (ZIP)" : "Download all (ZIP)"}
          disabled={images.length === 0}
          onClick={downloadAll}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </ToolLayout>
  );
}
