"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        aria-label="Switch language to English"
        onClick={() => setLang("en")}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
          lang === "en" ? "bg-red-600 text-white" : "text-gray-600 hover:text-gray-900"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        aria-label="Switch language to Japanese"
        onClick={() => setLang("ja")}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
          lang === "ja" ? "bg-red-600 text-white" : "text-gray-600 hover:text-gray-900"
        }`}
      >
        JA
      </button>
    </div>
  );
}
