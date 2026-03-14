"use client";

import { useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { useLanguage } from "@/components/LanguageProvider";
import { MAX_FILE_SIZE, formatBytes } from "@/utils/fileHelpers";

type FileDropProps = {
  onFiles: (files: File[]) => void;
  accept: string[];
  multiple?: boolean;
  label: string;
};

export function FileDrop({
  onFiles,
  accept,
  multiple = true,
  label,
}: FileDropProps) {
  const { lang } = useLanguage();

  const acceptConfig = useMemo(
    () =>
      accept.reduce<Record<string, string[]>>((acc, type) => {
        acc[type] = [];
        return acc;
      }, {}),
    [accept],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections, open } = useDropzone({
    multiple,
    accept: acceptConfig,
    maxSize: MAX_FILE_SIZE,
    noClick: true,
    noKeyboard: true,
    onDropAccepted: onFiles,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        aria-label={`${label} drop area`}
        className={`glass rounded-2xl border-2 border-dashed p-8 text-center transition ${
          isDragActive
            ? "border-red-400 bg-red-50"
            : "border-gray-300 hover:border-red-300"
        }`}
      >
        <input {...getInputProps()} aria-label={label} />
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="ui-muted mt-2 text-xs">
          {lang === "ja"
            ? `\u3053\u3053\u306b\u30d5\u30a1\u30a4\u30eb\u3092\u30c9\u30e9\u30c3\u30b0\u3059\u308b\u304b\u3001\u30af\u30ea\u30c3\u30af\u3057\u3066\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002\u6700\u5927 ${formatBytes(MAX_FILE_SIZE)}`
            : `Drag and drop files here, or click to choose files (max ${formatBytes(MAX_FILE_SIZE)}).`}
        </p>
        <button
          type="button"
          className="mt-4 rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-xs font-semibold text-white"
          onClick={(event) => {
            event.stopPropagation();
            open();
          }}
        >
          {lang === "ja" ? "\u30d5\u30a1\u30a4\u30eb\u3092\u9078\u629e" : "Select files"}
        </button>
      </div>

      {fileRejections.length > 0 && (
        <ul className="mt-3 space-y-2 text-xs text-red-700" aria-live="polite">
          {fileRejections.map((rejection) => (
            <li key={rejection.file.name}>
              {lang === "ja"
                ? `${rejection.file.name}: \u5f62\u5f0f\u304c\u7121\u52b9\u307e\u305f\u306f\u5bb9\u91cf\u8d85\u904e (${formatBytes(MAX_FILE_SIZE)})`
                : `${rejection.file.name}: invalid type or exceeds ${formatBytes(MAX_FILE_SIZE)}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
