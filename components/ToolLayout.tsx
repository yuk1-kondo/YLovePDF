import type { ReactNode } from "react";
import Link from "next/link";

type ToolLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          {"<- Back to tools"}
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
      </header>
      <section className="grid gap-6">{children}</section>
    </main>
  );
}
