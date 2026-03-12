"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ActionButton";
import { FileDrop } from "@/components/FileDrop";
import { PdfPreview } from "@/components/PdfPreview";
import { ToolLayout } from "@/components/ToolLayout";
import { mergePdf } from "@/lib/pdf/merge";
import { downloadBlob } from "@/utils/download";

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processMerge = async () => {
    if (files.length < 2) {
      setError("Select at least 2 PDF files.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const merged = await mergePdf(files);
      setResult(merged);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Merge failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDFs into one document entirely in your browser."
    >
      <FileDrop
        label="Drop PDF files to merge"
        accept={["application/pdf"]}
        onFiles={(incoming) => {
          setFiles(incoming);
          setResult(null);
        }}
      />

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold text-slate-700">File order</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
          {files.map((file) => (
            <li key={file.name}>{file.name}</li>
          ))}
        </ol>
      </div>

      <PdfPreview file={files[0] ?? null} />

      <div className="flex flex-wrap items-center gap-3">
        <ActionButton label="Merge PDFs" loading={loading} onClick={processMerge} />
        <ActionButton
          label="Download merged.pdf"
          disabled={!result}
          onClick={() => result && downloadBlob(result, "merged.pdf")}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </ToolLayout>
  );
}
