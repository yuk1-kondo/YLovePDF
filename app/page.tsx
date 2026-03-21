"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

const tools = [
  {
    href: "/merge",
    nameEn: "Merge PDF",
    nameJa: "PDF\u7d50\u5408",
    descriptionEn: "Combine multiple PDFs into one file.",
    descriptionJa: "\u8907\u6570\u306ePDF\u30921\u3064\u306b\u307e\u3068\u3081\u307e\u3059\u3002",
  },
  {
    href: "/split",
    nameEn: "Split PDF",
    nameJa: "PDF\u5206\u5272",
    descriptionEn: "Extract each page into separate PDFs.",
    descriptionJa: "\u5404\u30da\u30fc\u30b8\u3092\u500b\u5225\u306ePDF\u306b\u5206\u5272\u3057\u307e\u3059\u3002",
  },
  {
    href: "/rotate",
    nameEn: "Rotate PDF",
    nameJa: "PDF\u56de\u8ee2",
    descriptionEn: "Rotate selected pages by fixed angles.",
    descriptionJa: "\u9078\u629e\u30da\u30fc\u30b8\u3092\u6307\u5b9a\u89d2\u5ea6\u3067\u56de\u8ee2\u3057\u307e\u3059\u3002",
  },
  {
    href: "/pdf-to-image",
    nameEn: "PDF to Image",
    nameJa: "PDF\u2192\u753b\u50cf",
    descriptionEn: "Convert each page to PNG/JPG images.",
    descriptionJa: "\u5404\u30da\u30fc\u30b8\u3092PNG/JPG\u753b\u50cf\u306b\u5909\u63db\u3057\u307e\u3059\u3002",
  },
  {
    href: "/image-to-pdf",
    nameEn: "Image to PDF",
    nameJa: "\u753b\u50cf\u2192PDF",
    descriptionEn: "Create a PDF from JPG and PNG files.",
    descriptionJa: "JPG/PNG\u304b\u3089PDF\u3092\u4f5c\u6210\u3057\u307e\u3059\u3002",
  },
  {
    href: "/compress",
    nameEn: "Compress PDF",
    nameJa: "PDF\u5727\u7e2e",
    descriptionEn: "Apply lightweight optimization locally.",
    descriptionJa: "\u30d6\u30e9\u30a6\u30b6\u5185\u3067\u8efd\u91cf\u5727\u7e2e\u3057\u307e\u3059\u3002",
  },
  {
    href: "/watermark",
    nameEn: "Add Watermark",
    nameJa: "透かし追加",
    descriptionEn: "Add text watermarks to every page.",
    descriptionJa: "全ページにテキスト透かしを追加します。",
  },
  {
    href: "/page-numbers",
    nameEn: "Page Numbers",
    nameJa: "ページ番号",
    descriptionEn: "Insert page numbers on each page.",
    descriptionJa: "各ページにページ番号を挿入します。",
  },
  {
    href: "/extract",
    nameEn: "Extract Pages",
    nameJa: "ページ抽出",
    descriptionEn: "Pick specific pages into a new PDF.",
    descriptionJa: "特定のページだけを抽出します。",
  },
  {
    href: "/edit-metadata",
    nameEn: "Edit Metadata",
    nameJa: "メタデータ編集",
    descriptionEn: "Edit title, author, and other PDF properties.",
    descriptionJa: "タイトル・作成者などのPDF属性を編集します。",
  },
];

export default function Home() {
  const { lang } = useLanguage();
  const isJa = lang === "ja";

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col gap-4">
        <p className="ui-muted text-xs tracking-[0.2em]">YLOVEPDF // LOCAL FIRST</p>
        <h1 className="neon-text text-5xl font-bold tracking-tight text-slate-800">
          {isJa ? "PDF\u30c4\u30fc\u30eb" : "PDF Tools"}
        </h1>
        <p className="ui-muted max-w-2xl text-sm">
          {isJa
            ? "\u3059\u3079\u3066\u306e\u51e6\u7406\u306f\u30d6\u30e9\u30a6\u30b6\u5185\u3067\u5b8c\u7d50\u3002\u30d5\u30a1\u30a4\u30eb\u306f\u30b5\u30fc\u30d0\u3078\u9001\u4fe1\u3055\u308c\u307e\u305b\u3093\u3002"
            : "Privacy-first PDF toolkit that runs completely in your browser. Files stay local and never leave your device."}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="glass group rounded-2xl p-6 transition hover:-translate-y-1 hover:border-red-200"
          >
            <p className="text-lg font-semibold text-slate-800">{isJa ? tool.nameJa : tool.nameEn}</p>
            <p className="ui-muted mt-2 text-sm">{isJa ? tool.descriptionJa : tool.descriptionEn}</p>
            <p className="mt-5 text-sm font-medium text-red-600 group-hover:underline">
              {isJa ? "\u30c4\u30fc\u30eb\u3092\u958b\u304f" : "Open tool"}
            </p>
          </Link>
        ))}
      </section>

      <footer className="glass mt-8 rounded-xl p-4 text-xs ui-muted">
        {isJa
          ? "\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9\u306a\u3057 / \u30c8\u30e9\u30c3\u30ad\u30f3\u30b0\u306a\u3057 / \u30b5\u30fc\u30d0\u51e6\u7406\u306a\u3057"
          : "No uploads, no tracking, no server processing."}
      </footer>
    </main>
  );
}
