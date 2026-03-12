"use client";

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
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled || loading}
      className="rounded-xl bg-[#0f172a] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:bg-slate-400"
    >
      {loading ? "Processing..." : label}
    </button>
  );
}
