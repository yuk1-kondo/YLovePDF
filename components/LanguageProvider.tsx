"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "ja";

type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    try {
      const saved = window.localStorage.getItem("ylovepdf.lang");
      if (saved === "en" || saved === "ja") {
        return saved;
      }
    } catch {
      // Ignore storage access failures (private mode, policy restrictions, etc.).
    }

    return "en";
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("ylovepdf.lang", lang);
    } catch {
      // Language switching should continue even if persistence is unavailable.
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
