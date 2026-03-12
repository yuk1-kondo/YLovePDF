"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ActionButton";
import { FileDrop } from "@/components/FileDrop";
import { PageSelector } from "@/components/PageSelector";
import { PdfPreview } from "@/components/PdfPreview";
import { ToolLayout } from "@/components/ToolLayout";
import { rotatePdf } from "@/lib/pdf/rotate";
import { downloadBlob } from "@/utils/download";

export default function RotatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processRotate = async () => {
    if (!file) {
      setError("Select one PDF file.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const out = await rotatePdf(file, selectedPages, angle);
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rotate failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Rotate PDF"
      description="Rotate selected pages by 90, 180, or 270 degrees."
    >
      <FileDrop
        label="Drop one PDF file"
        accept={["application/pdf"]}
        multiple={false}
        onFiles={(incoming) => {
          setFile(incoming[0] ?? null);
          setResult(null);
          setSelectedPages([]);
        }}
      />

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <label htmlFor="angle" className="mb-2 block text-sm font-semibold text-slate-700">
          Rotation angle
        </label>
        <select
          id="angle"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          value={angle}
          onChange={(e) => setAngle(Number(e.target.value) as 90 | 180 | 270)}
        >
          <option value={90}>90 deg</option>
          <option value={180}>180 deg</option>
          <option value={270}>270 deg</option>
        </select>
        <p className="mt-2 text-xs text-slate-500">No page selection means all pages.</p>
      </div>

      <PdfPreview file={file} selectedPages={selectedPages} onPageCount={setPageCount} />
      <PageSelector pageCount={pageCount} selectedPages={selectedPages} onChange={setSelectedPages} />

      <div className="flex flex-wrap gap-3">
        <ActionButton label="Rotate PDF" loading={loading} onClick={processRotate} />
        <ActionButton
          label="Download rotated.pdf"
          disabled={!result}
          onClick={() => result && downloadBlob(result, "rotated.pdf")}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </ToolLayout>
  );
}
