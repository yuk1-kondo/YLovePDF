"use client";

import { useLanguage } from "@/components/LanguageProvider";

type ActionButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function ActionButton({
  label,
  onClick,
  disabled = false,
  loading = false,
}: ActionButtonProps) {
  const { lang } = useLanguage();
  const loadingText = lang === "ja" ? "\u51e6\u7406\u4e2d..." : "Processing...";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled || loading}
      className="rounded-xl border border-cyan-300/30 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-100 shadow-lg shadow-cyan-900/20 transition hover:-translate-y-0.5 hover:border-cyan-200/50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-600 disabled:bg-slate-700"
    >
      {loading ? loadingText : label}
    </button>
  );
}
