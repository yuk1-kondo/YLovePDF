import Link from "next/link";

const tools = [
  {
    href: "/merge",
    name: "Merge PDF",
    description: "Combine multiple PDFs into one file.",
  },
  {
    href: "/split",
    name: "Split PDF",
    description: "Extract each page into separate PDFs.",
  },
  {
    href: "/rotate",
    name: "Rotate PDF",
    description: "Rotate selected pages by fixed angles.",
  },
  {
    href: "/pdf-to-image",
    name: "PDF to Image",
    description: "Convert each page to PNG images.",
  },
  {
    href: "/image-to-pdf",
    name: "Image to PDF",
    description: "Create a PDF from JPG and PNG files.",
  },
  {
    href: "/compress",
    name: "Compress PDF",
    description: "Apply lightweight optimization locally.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col gap-4">
        <h1 className="text-5xl font-bold tracking-tight text-slate-950">PDF Tools</h1>
        <p className="max-w-2xl text-sm text-slate-700">
          Privacy-first PDF toolkit that runs completely in your browser. Files stay local and
          never leave your device.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <p className="text-lg font-semibold text-slate-900">{tool.name}</p>
            <p className="mt-2 text-sm text-slate-600">{tool.description}</p>
            <p className="mt-5 text-sm font-medium text-slate-900 group-hover:underline">
              Open tool
            </p>
          </Link>
        ))}
      </section>

      <footer className="mt-8 rounded-xl bg-white/70 p-4 text-xs text-slate-600 ring-1 ring-slate-200">
        No uploads, no tracking, no server processing.
      </footer>
    </main>
  );
}
