/**
 * Next.js の engines（>=20.9.0）と揃え、再現ビルド用の .nvmrc（20.x）とは別に
 * 新しい Node LTS/Current でも開発・テストできるようにする。
 */
const [majorStr, minorStr] = process.versions.node.split(".");
const major = Number.parseInt(majorStr ?? "0", 10);
const minor = Number.parseInt(minorStr ?? "0", 10);

const meetsNextMinimum = major > 20 || (major === 20 && minor >= 9);

if (!meetsNextMinimum) {
  console.error("[ylovepdf] Node.js >= 20.9.0 is required (same as Next.js).");
  console.error(`[ylovepdf] Current Node version: ${process.versions.node}`);
  process.exit(1);
}
