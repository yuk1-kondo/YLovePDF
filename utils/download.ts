import { saveAs } from "file-saver";

export function downloadBlob(blob: Blob, fileName: string): void {
  saveAs(blob, fileName);
}

export function downloadObjectUrl(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
