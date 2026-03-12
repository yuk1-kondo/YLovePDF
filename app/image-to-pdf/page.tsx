"use client";

import { useEffect, useState } from "react";
import { ActionButton } from "@/components/ActionButton";
import { FileDrop } from "@/components/FileDrop";
import { ToolLayout } from "@/components/ToolLayout";
import { imageToPdf } from "@/lib/pdf/imageToPdf";
import { downloadBlob } from "@/utils/download";

export default function ImageToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Array<{ name: string; url: string }>>([]);
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const items = files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
    setPreviews(items);

    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [files]);

  const processConvert = async () => {
    if (files.length === 0) {
      setError("Select at least one image.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const out = await imageToPdf(files);
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Image to PDF"
      description="Convert PNG and JPG images into a single PDF in the browser."
    >
      <FileDrop
        label="Drop PNG or JPG files"
        accept={["image/png", "image/jpeg", "image/jpg"]}
        onFiles={(incoming) => {
          setFiles(incoming);
          setResult(null);
        }}
      />

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <p className="mb-3 text-sm font-semibold text-slate-700">Image preview</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {previews.map((item) => (
            <div key={item.name} className="rounded-lg border border-slate-200 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.name} className="h-28 w-full rounded object-cover" />
              <p className="mt-2 truncate text-xs text-slate-600">{item.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <ActionButton label="Convert to PDF" loading={loading} onClick={processConvert} />
        <ActionButton
          label="Download images.pdf"
          disabled={!result}
          onClick={() => result && downloadBlob(result, "images.pdf")}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </ToolLayout>
  );
}
