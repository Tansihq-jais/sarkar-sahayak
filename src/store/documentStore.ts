import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { UploadedDocument, DocStatus } from "@/types";

interface DocumentState {
  // State
  documents: UploadedDocument[];
  activeDocumentIds: string[];

  // Actions
  addDocument: (doc: UploadedDocument) => void;
  updateDocumentStatus: (
    id: string,
    status: DocStatus,
    errorMessage?: string
  ) => void;
  removeDocument: (id: string) => void;
  setActiveDocuments: (ids: string[]) => void;
  toggleActiveDocument: (id: string) => void;
  clearAll: () => void;

  // Selectors
  getActiveDocuments: () => UploadedDocument[];
  getDocumentById: (id: string) => UploadedDocument | undefined;
  getTotalCharCount: () => number;
}

export const useDocumentStore = create<DocumentState>()(
  devtools(
    (set, get) => ({
      documents: [],
      activeDocumentIds: [],

      addDocument: (doc) =>
        set(
          (state) => ({
            documents: [...state.documents, doc],
            activeDocumentIds: [...state.activeDocumentIds, doc.id],
          }),
          false,
          "addDocument"
        ),

      updateDocumentStatus: (id, status, errorMessage) =>
        set(
          (state) => ({
            documents: state.documents.map((doc) =>
              doc.id === id ? { ...doc, status, errorMessage } : doc
            ),
          }),
          false,
          "updateDocumentStatus"
        ),

      removeDocument: (id) =>
        set(
          (state) => ({
            documents: state.documents.filter((doc) => doc.id !== id),
            activeDocumentIds: state.activeDocumentIds.filter(
              (aid) => aid !== id
            ),
          }),
          false,
          "removeDocument"
        ),

      setActiveDocuments: (ids) =>
        set({ activeDocumentIds: ids }, false, "setActiveDocuments"),

      toggleActiveDocument: (id) =>
        set(
          (state) => ({
            activeDocumentIds: state.activeDocumentIds.includes(id)
              ? state.activeDocumentIds.filter((aid) => aid !== id)
              : [...state.activeDocumentIds, id],
          }),
          false,
          "toggleActiveDocument"
        ),

      clearAll: () =>
        set({ documents: [], activeDocumentIds: [] }, false, "clearAll"),

      getActiveDocuments: () => {
        const { documents, activeDocumentIds } = get();
        return documents.filter((doc) => activeDocumentIds.includes(doc.id));
      },

      getDocumentById: (id) => get().documents.find((doc) => doc.id === id),

      getTotalCharCount: () =>
        get()
          .getActiveDocuments()
          .reduce((sum, doc) => sum + doc.charCount, 0),
    }),
    { name: "DocumentStore" }
  )
);
