import { describe, it, expect, beforeEach } from "vitest";
import { useDocumentStore } from "@/store/documentStore";
import type { UploadedDocument } from "@/types";

const makeDoc = (overrides: Partial<UploadedDocument> = {}): UploadedDocument => ({
  id: "doc-1",
  name: "PM Awas Yojana",
  originalFilename: "pm-awas.pdf",
  mimeType: "application/pdf",
  sizeBytes: 102400,
  charCount: 8000,
  chunks: [{ index: 0, text: "Eligibility criteria...", charStart: 0, charEnd: 23 }],
  status: "indexed",
  isPreloaded: false,
  language: "en",
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe("documentStore", () => {
  beforeEach(() => {
    useDocumentStore.getState().clearAll();
  });

  it("starts with empty state", () => {
    const { documents, activeDocumentIds } = useDocumentStore.getState();
    expect(documents).toHaveLength(0);
    expect(activeDocumentIds).toHaveLength(0);
  });

  it("adds a document and activates it", () => {
    const doc = makeDoc();
    useDocumentStore.getState().addDocument(doc);

    const { documents, activeDocumentIds } = useDocumentStore.getState();
    expect(documents).toHaveLength(1);
    expect(activeDocumentIds).toContain("doc-1");
  });

  it("updates document status", () => {
    useDocumentStore.getState().addDocument(makeDoc({ status: "uploading" }));
    useDocumentStore.getState().updateDocumentStatus("doc-1", "indexed");

    const doc = useDocumentStore.getState().getDocumentById("doc-1");
    expect(doc?.status).toBe("indexed");
  });

  it("removes a document and deactivates it", () => {
    useDocumentStore.getState().addDocument(makeDoc());
    useDocumentStore.getState().removeDocument("doc-1");

    const { documents, activeDocumentIds } = useDocumentStore.getState();
    expect(documents).toHaveLength(0);
    expect(activeDocumentIds).not.toContain("doc-1");
  });

  it("toggles active document", () => {
    useDocumentStore.getState().addDocument(makeDoc());

    // Deactivate
    useDocumentStore.getState().toggleActiveDocument("doc-1");
    expect(useDocumentStore.getState().activeDocumentIds).not.toContain("doc-1");

    // Reactivate
    useDocumentStore.getState().toggleActiveDocument("doc-1");
    expect(useDocumentStore.getState().activeDocumentIds).toContain("doc-1");
  });

  it("calculates total char count for active docs", () => {
    useDocumentStore.getState().addDocument(makeDoc({ id: "doc-1", charCount: 5000 }));
    useDocumentStore.getState().addDocument(makeDoc({ id: "doc-2", charCount: 3000 }));

    expect(useDocumentStore.getState().getTotalCharCount()).toBe(8000);
  });

  it("stores error message on failed status", () => {
    useDocumentStore.getState().addDocument(makeDoc());
    useDocumentStore
      .getState()
      .updateDocumentStatus("doc-1", "failed", "File too large");

    const doc = useDocumentStore.getState().getDocumentById("doc-1");
    expect(doc?.status).toBe("failed");
    expect(doc?.errorMessage).toBe("File too large");
  });
});
