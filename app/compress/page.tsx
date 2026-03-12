"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ActionButton";
import { FileDrop } from "@/components/FileDrop";
import { PdfPreview } from "@/components/PdfPreview";
import { ToolLayout } from "@/components/ToolLayout";
import { compressPdf } from "@/lib/pdf/compress";
import { downloadBlob } from "@/utils/download";

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processCompress = async () => {
    if (!file) {
      setError("Select one PDF file.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const out = await compressPdf(file);
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compression failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Compress PDF"
      description="Apply lightweight optimization and metadata cleanup to reduce size."
    >
      <FileDrop
        label="Drop one PDF file"
        accept={["application/pdf"]}
        multiple={false}
        onFiles={(incoming) => {
          setFile(incoming[0] ?? null);
          setResult(null);
        }}
      />

      <PdfPreview file={file} />

      <div className="flex flex-wrap gap-3">
        <ActionButton label="Compress PDF" loading={loading} onClick={processCompress} />
        <ActionButton
          label="Download compressed.pdf"
          disabled={!result}
          onClick={() => result && downloadBlob(result, "compressed.pdf")}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </ToolLayout>
  );
}
