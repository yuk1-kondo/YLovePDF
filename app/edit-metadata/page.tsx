"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ActionButton";
import { FileDrop } from "@/components/FileDrop";
import { useLanguage } from "@/components/LanguageProvider";
import { ToolLayout } from "@/components/ToolLayout";
import { editPdfMetadata, readPdfMetadata } from "@/lib/pdf/editMetadata";
import { downloadBlob } from "@/utils/download";

export default function EditMetadataPage() {
  const { lang } = useLanguage();
  const isJa = lang === "ja";
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
  const [metaLoaded, setMetaLoaded] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (incoming: File[]) => {
    const f = incoming[0] ?? null;
    setFile(f);
    setResult(null);
    setMetaLoaded(false);

    if (!f) return;

    try {
      const meta = await readPdfMetadata(f);
      setTitle(meta.title);
      setAuthor(meta.author);
      setSubject(meta.subject);
      setKeywords(meta.keywords);
      setMetaLoaded(true);
    } catch {
      setTitle("");
      setAuthor("");
      setSubject("");
      setKeywords("");
      setMetaLoaded(true);
    }
  };

  const processEdit = async () => {
    if (!file) {
      setError(isJa ? "PDFを1つ選択してください。" : "Select one PDF file.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const out = await editPdfMetadata(file, { title, author, subject, keywords });
      setResult(out);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : isJa ? "メタデータの編集に失敗しました" : "Metadata edit failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title={isJa ? "メタデータ編集" : "Edit Metadata"}
      description={
        isJa
          ? "PDFのタイトル・作成者・件名・キーワードを編集します。"
          : "Edit the title, author, subject, and keywords of your PDF."
      }
    >
      <FileDrop
        label={isJa ? "PDFファイルを1つドロップ" : "Drop one PDF file"}
        accept={["application/pdf"]}
        multiple={false}
        onFiles={handleFiles}
      />

      {metaLoaded && (
        <div className="glass grid gap-4 rounded-2xl p-4 sm:grid-cols-2">
          <div>
            <label htmlFor="meta-title" className="mb-1 block text-sm font-semibold text-slate-800">
              {isJa ? "タイトル" : "Title"}
            </label>
            <input
              id="meta-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800"
            />
          </div>

          <div>
            <label htmlFor="meta-author" className="mb-1 block text-sm font-semibold text-slate-800">
              {isJa ? "作成者" : "Author"}
            </label>
            <input
              id="meta-author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800"
            />
          </div>

          <div>
            <label htmlFor="meta-subject" className="mb-1 block text-sm font-semibold text-slate-800">
              {isJa ? "件名" : "Subject"}
            </label>
            <input
              id="meta-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800"
            />
          </div>

          <div>
            <label htmlFor="meta-keywords" className="mb-1 block text-sm font-semibold text-slate-800">
              {isJa ? "キーワード（カンマ区切り）" : "Keywords (comma-separated)"}
            </label>
            <input
              id="meta-keywords"
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={isJa ? "例: レポート, 2024, 社内" : "e.g. report, 2024, internal"}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800"
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <ActionButton
          label={isJa ? "メタデータを保存" : "Save Metadata"}
          loading={loading}
          onClick={processEdit}
        />
        <ActionButton
          label={isJa ? "edited.pdf をダウンロード" : "Download edited.pdf"}
          disabled={!result}
          onClick={() => result && downloadBlob(result, "edited.pdf")}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </ToolLayout>
  );
}
