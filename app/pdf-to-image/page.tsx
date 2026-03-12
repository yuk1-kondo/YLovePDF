"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ActionButton";
import { FileDrop } from "@/components/FileDrop";
import { PdfPreview } from "@/components/PdfPreview";
import { ToolLayout } from "@/components/ToolLayout";
import { pdfToImages, zipImages, type ImageFormat, type PdfImageResult } from "@/lib/pdf/pdfToImage";
import { downloadBlob } from "@/utils/download";

export default function PdfToImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<PdfImageResult[]>([]);
  const [format, setFormat] = useState<ImageFormat>("jpg");
  const [quality, setQuality] = useState(0.9);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processConvert = async () => {
    if (!file) {
      setError("Select one PDF file.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const out = await pdfToImages(file, { format, quality });
      setImages(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
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
      title="PDF to Image"
      description="Render PDF pages into PNG images and download individually or as ZIP."
    >
      <FileDrop
        label="Drop one PDF file"
        accept={["application/pdf"]}
        multiple={false}
        onFiles={(incoming) => {
          setFile(incoming[0] ?? null);
          setImages([]);
        }}
      />

      <PdfPreview file={file} />

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold text-slate-700">Output settings</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label htmlFor="image-format" className="text-sm text-slate-700">
            Format
          </label>
          <select
            id="image-format"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            value={format}
            onChange={(e) => setFormat(e.target.value as ImageFormat)}
          >
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
          </select>

          {format === "jpg" && (
            <label htmlFor="jpg-quality" className="flex items-center gap-2 text-sm text-slate-700">
              JPG quality
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

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold text-slate-700">Output images</p>
        <div className="mt-2 max-h-44 space-y-2 overflow-auto">
          {images.map((img) => (
            <button
              key={img.name}
              type="button"
              className="block text-sm text-slate-700 underline"
              onClick={() => downloadBlob(img.blob, img.name)}
            >
              {img.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <ActionButton
          label={`Convert to ${format.toUpperCase()}`}
          loading={loading}
          onClick={processConvert}
        />
        <ActionButton label="Download all (ZIP)" disabled={images.length === 0} onClick={downloadAll} />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </ToolLayout>
  );
}
