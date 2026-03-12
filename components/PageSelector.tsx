"use client";

type PageSelectorProps = {
  pageCount: number;
  selectedPages: number[];
  onChange: (pages: number[]) => void;
};

export function PageSelector({ pageCount, selectedPages, onChange }: PageSelectorProps) {
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
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="mb-3 text-sm font-semibold text-slate-700">Select pages (empty = all)</p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => {
          const active = selectedPages.includes(page);
          return (
            <button
              key={page}
              type="button"
              aria-label={`Toggle page ${page}`}
              onClick={() => toggle(page)}
              className={`rounded-lg border px-2 py-1 text-xs font-medium ${
                active
                  ? "border-[#0f172a] bg-[#0f172a] text-white"
                  : "border-slate-300 bg-white text-slate-700"
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
