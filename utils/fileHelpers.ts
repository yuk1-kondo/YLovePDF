export const MAX_FILE_SIZE = 100 * 1024 * 1024;

export async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

export function validateFileType(file: File, accept: string[]): boolean {
  if (accept.length === 0) {
    return true;
  }

  return accept.some((type) => {
    if (type.endsWith("/*")) {
      return file.type.startsWith(type.replace("/*", "/"));
    }
    return file.type === type;
  });
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const idx = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / 1024 ** idx;
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[idx]}`;
}
