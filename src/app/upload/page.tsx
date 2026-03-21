"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "@/components/ui/Toast";
import { useDocumentStore } from "@/store/documentStore";
import { parseDocument } from "@/lib/documentParser";
import { formatFileSize } from "@/lib/utils";
import { SCHEMES } from "@/data/schemes";
import type { UploadedDocument } from "@/types";

const STATUS_LABELS: Record<UploadedDocument["status"], { label: string; color: string; icon: string }> = {
  uploading: { label: "Uploading…", color: "text-scheme-yellow", icon: "⏳" },
  parsing:   { label: "Parsing…",   color: "text-scheme-teal",   icon: "🔍" },
  indexed:   { label: "Indexed ✓",  color: "text-scheme-green",  icon: "✅" },
  failed:    { label: "Failed",     color: "text-scheme-red",    icon: "❌" },
};

function UploadedDocRow({ doc }: { doc: UploadedDocument }) {
  const remove = useDocumentStore((s) => s.removeDocument);
  const status = STATUS_LABELS[doc.status];

  return (
    <div className="flex items-center gap-3 rounded-xl border border-sand bg-white px-4 py-3">
      <span className="text-xl shrink-0">📄</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink truncate">{doc.name}</p>
        <p className="text-xs text-muted">
          {formatFileSize(doc.sizeBytes)}
          {doc.charCount > 0 && ` · ${doc.charCount.toLocaleString()} chars · ${doc.chunks.length} chunks`}
        </p>
        {doc.errorMessage && (
          <p className="text-xs text-scheme-red mt-0.5">{doc.errorMessage}</p>
        )}
      </div>
      <span className={`text-xs font-semibold shrink-0 ${status.color}`}>
        {status.icon} {status.label}
      </span>
      <button
        onClick={() => remove(doc.id)}
        className="shrink-0 text-light hover:text-scheme-red transition-colors text-sm"
        aria-label="Remove document"
      >✕</button>
    </div>
  );
}

function PreloadedSchemeItem({ scheme }: { scheme: (typeof SCHEMES)[0] }) {
  const { documents, addDocument } = useDocumentStore();
  const alreadyAdded = documents.some((d) => d.id === `preloaded-${scheme.id}`);

  const add = () => {
    if (alreadyAdded) return;
    const doc: UploadedDocument = {
      id: `preloaded-${scheme.id}`,
      name: scheme.name,
      originalFilename: `${scheme.slug}.txt`,
      mimeType: "text/plain",
      sizeBytes: scheme.description.length + (scheme.eligibilitySummary?.length ?? 0),
      charCount: scheme.description.length + (scheme.eligibilitySummary?.length ?? 0),
      chunks: [{ index: 0, text: `${scheme.name}\n\n${scheme.description}\n\nEligibility: ${scheme.eligibilitySummary ?? ""}`, charStart: 0, charEnd: 500 }],
      status: "indexed",
      isPreloaded: true,
      language: "en",
      createdAt: new Date().toISOString(),
    };
    addDocument(doc);
    toast({ type: "success", title: `${scheme.shortName ?? scheme.name} added`, description: "Ready for eligibility chat" });
  };

  return (
    <button
      onClick={add}
      disabled={alreadyAdded}
      className="flex items-center gap-2 rounded-lg border border-sand bg-white px-3 py-2 text-left hover:border-navy hover:bg-navy-50 transition-all disabled:opacity-50 disabled:cursor-default w-full"
    >
      <span className="text-lg shrink-0">{scheme.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-navy truncate">{scheme.shortName ?? scheme.name}</p>
        <p className="text-2xs text-muted capitalize">{scheme.category}</p>
      </div>
      <span className="text-xs shrink-0 font-semibold text-brand-orange">
        {alreadyAdded ? "Added ✓" : "+ Add"}
      </span>
    </button>
  );
}

export default function UploadPage() {
  const [parsing, setParsing] = useState(false);
  const { documents, addDocument, updateDocumentStatus } = useDocumentStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setParsing(true);
    for (const file of acceptedFiles) {
      const { document, error } = await parseDocument(file);
      addDocument(document);
      if (error) {
        toast({ type: "error", title: "Parse failed", description: error });
      } else {
        toast({ type: "success", title: `${document.name} indexed`, description: `${document.chunks.length} chunks ready` });
      }
    }
    setParsing(false);
  }, [addDocument]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
  });

  const indexedDocs = documents.filter((d) => d.status === "indexed");

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy">Upload Policy Documents</h1>
        <p className="mt-2 text-muted">Upload scheme PDFs or use our preloaded library. Documents are parsed in your browser — nothing is sent to a server.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Left: Upload + uploaded list */}
        <div className="lg:col-span-2 space-y-6">

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? "border-brand-orange bg-brand-orange-light"
                : "border-sand-dark bg-white hover:border-navy hover:bg-navy-50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-5xl mb-4">{parsing ? "⏳" : isDragActive ? "📂" : "📤"}</div>
            {parsing ? (
              <div className="flex flex-col items-center gap-3">
                <Spinner size="md" />
                <p className="text-sm font-semibold text-muted">Parsing document…</p>
              </div>
            ) : isDragActive ? (
              <p className="text-base font-semibold text-brand-orange">Drop it here!</p>
            ) : (
              <>
                <p className="text-base font-semibold text-navy">Drag & drop policy documents here</p>
                <p className="mt-1 text-sm text-muted">or click to browse your files</p>
                <p className="mt-3 text-xs text-light">Supports PDF, TXT, DOCX · Max 10MB per file</p>
              </>
            )}
          </div>

          {/* Uploaded documents */}
          {documents.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-navy mb-3">
                Your Documents ({documents.length})
              </h2>
              <div className="space-y-2">
                {documents.map((doc) => <UploadedDocRow key={doc.id} doc={doc} />)}
              </div>
            </div>
          )}

          {/* CTA if docs are ready */}
          {indexedDocs.length > 0 && (
            <div className="rounded-2xl bg-scheme-green-bg border border-scheme-green/20 p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-scheme-green">
                  ✅ {indexedDocs.length} document{indexedDocs.length > 1 ? "s" : ""} ready
                </p>
                <p className="text-sm text-muted mt-0.5">Start your eligibility check now.</p>
              </div>
              <Link
                href="/chat"
                className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-scheme-green px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Chat Now →
              </Link>
            </div>
          )}
        </div>

        {/* Right: Preloaded library */}
        <div>
          <div className="card p-5">
            <h2 className="text-base font-bold text-navy mb-1">📚 Preloaded Library</h2>
            <p className="text-xs text-muted mb-4">Add these built-in schemes instantly — no upload needed.</p>
            <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-none">
              {SCHEMES.map((scheme) => (
                <PreloadedSchemeItem key={scheme.id} scheme={scheme} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </PageLayout>
  );
}
