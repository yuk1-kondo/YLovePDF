"use client";

import { useMemo } from "react";
import { useDropzone } from "react-dropzone";
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
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
          isDragActive
            ? "border-[#0f172a] bg-slate-100"
            : "border-slate-300 bg-white hover:border-slate-500"
        }`}
      >
        <input {...getInputProps()} aria-label={label} />
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <p className="mt-2 text-xs text-slate-500">
          Drag and drop files here, or click to choose files (max {formatBytes(MAX_FILE_SIZE)}).
        </p>
        <button
          type="button"
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          onClick={(event) => {
            event.stopPropagation();
            open();
          }}
        >
          Select files
        </button>
      </div>

      {fileRejections.length > 0 && (
        <ul className="mt-3 space-y-2 text-xs text-red-600" aria-live="polite">
          {fileRejections.map((rejection) => (
            <li key={rejection.file.name}>
              {rejection.file.name}: invalid type or exceeds {formatBytes(MAX_FILE_SIZE)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
