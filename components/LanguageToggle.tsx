"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/30 p-1 backdrop-blur">
      <button
        type="button"
        aria-label="Switch language to English"
        onClick={() => setLang("en")}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
          lang === "en" ? "bg-white text-black" : "text-white/80 hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        aria-label="Switch language to Japanese"
        onClick={() => setLang("ja")}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
          lang === "ja" ? "bg-white text-black" : "text-white/80 hover:text-white"
        }`}
      >
        JA
      </button>
    </div>
  );
}
