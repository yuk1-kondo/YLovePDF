"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

type ToolLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ToolLayout({ title, description, children }: ToolLayoutProps) {
  const { lang } = useLanguage();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <Link href="/" className="ui-muted text-sm font-medium hover:text-red-600">
          {lang === "ja" ? "< \u30c4\u30fc\u30eb\u4e00\u89a7\u3078\u623b\u308b" : "< Back to tools"}
        </Link>
        <h1 className="neon-text mt-4 text-3xl font-semibold tracking-tight text-slate-800">{title}</h1>
        <p className="ui-muted mt-2 max-w-2xl text-sm">{description}</p>
      </header>
      <section className="grid gap-6">{children}</section>
    </main>
  );
}
