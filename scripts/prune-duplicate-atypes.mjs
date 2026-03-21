/**
 * Finder の複製などで `node_modules/@types/foo 2` のような重複フォルダができると、
 * TypeScript が「型定義パッケージ aria-query 2 が見つからない」等のビルドエラーになる。
 * 空または重複の残骸だけを削除する（通常の @types 名にはマッチしない）。
 */
import fs from "node:fs";
import path from "node:path";

const atypesDir = path.join(process.cwd(), "node_modules", "@types");

if (!fs.existsSync(atypesDir)) {
  process.exit(0);
}

for (const name of fs.readdirSync(atypesDir)) {
  if (!name.endsWith(" 2")) {
    continue;
  }
  const fullPath = path.join(atypesDir, name);
  if (!fs.statSync(fullPath).isDirectory()) {
    continue;
  }
  fs.rmSync(fullPath, { recursive: true, force: true });
  console.warn(`[ylovepdf] Removed stray @types directory: ${name}`);
}
