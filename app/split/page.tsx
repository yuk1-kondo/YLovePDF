"use client";

import { useState } from "react";
import JSZip from "jszip";
import { ActionButton } from "@/components/ActionButton";
import { FileDrop } from "@/components/FileDrop";
import { PdfPreview } from "@/components/PdfPreview";
import { ToolLayout } from "@/components/ToolLayout";
import { splitPdf, type SplitResult } from "@/lib/pdf/split";
import { downloadBlob } from "@/utils/download";

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<SplitResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processSplit = async () => {
    if (!file) {
      setError("Select one PDF file.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const parts = await splitPdf(file);
      setResults(parts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Split failed");
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
    <ToolLayout title="Split PDF" description="Split one PDF into one-file-per-page outputs.">
      <FileDrop
        label="Drop one PDF file"
        accept={["application/pdf"]}
        multiple={false}
        onFiles={(incoming) => {
          setFile(incoming[0] ?? null);
          setResults([]);
        }}
      />

      <PdfPreview file={file} />

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold text-slate-700">Output files</p>
        <div className="mt-2 max-h-44 space-y-2 overflow-auto">
          {results.map((r) => (
            <button
              key={r.name}
              type="button"
              className="block text-sm text-slate-700 underline"
              onClick={() => downloadBlob(r.blob, r.name)}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <ActionButton label="Split PDF" loading={loading} onClick={processSplit} />
        <ActionButton label="Download all (ZIP)" disabled={results.length === 0} onClick={downloadAll} />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </ToolLayout>
  );
}
