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
      className="rounded-xl border border-red-600 bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300"
    >
      {loading ? loadingText : label}
    </button>
  );
}
