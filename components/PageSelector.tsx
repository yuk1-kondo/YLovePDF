"use client";

import { useLanguage } from "@/components/LanguageProvider";

type PageSelectorProps = {
  pageCount: number;
  selectedPages: number[];
  onChange: (pages: number[]) => void;
};

export function PageSelector({ pageCount, selectedPages, onChange }: PageSelectorProps) {
  const { lang } = useLanguage();

  if (pageCount === 0) {
    return null;
  }

  const toggle = (page: number) => {
    if (selectedPages.includes(page)) {
      onChange(selectedPages.filter((p) => p !== page));
      return;
    }
    onChange([...selectedPages, page].sort((a, b) => a - b));
  };

  return (
    <div className="glass rounded-2xl p-4">
      <p className="mb-3 text-sm font-semibold text-slate-100">
        {lang === "ja"
          ? "\u30da\u30fc\u30b8\u9078\u629e\uff08\u672a\u9078\u629e\u3067\u5168\u30da\u30fc\u30b8\uff09"
          : "Select pages (empty = all)"}
      </p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => {
          const active = selectedPages.includes(page);
          return (
            <button
              key={page}
              type="button"
              aria-label={lang === "ja" ? `\u30da\u30fc\u30b8 ${page} \u3092\u5207\u66ff` : `Toggle page ${page}`}
              onClick={() => toggle(page)}
              className={`rounded-lg border px-2 py-1 text-xs font-medium ${
                active
                  ? "border-cyan-300/70 bg-cyan-400/20 text-cyan-100"
                  : "border-white/20 bg-slate-900/40 text-slate-300"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>
    </div>
  );
}
