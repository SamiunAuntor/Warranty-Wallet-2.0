import { useCallback, useEffect, useState } from "react";
import {
  deleteDocument,
  getDocuments,
  uploadDocument,
  type DocumentRecord,
  type DocumentType,
  type NativeFile,
} from "../lib/documents-api";
import { useAuth } from "../providers/auth-provider";

export function useDocuments(search: string) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const result = await getDocuments(await user.getIdToken(), search);
      setDocuments(result.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load documents.");
    } finally {
      setLoading(false);
    }
  }, [search, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const addDocument = useCallback(
    async (productId: string, type: DocumentType, file: NativeFile) => {
      if (!user) throw new Error("You must be signed in to upload a document.");

      const [created] = await uploadDocument(
        await user.getIdToken(),
        productId.trim(),
        type,
        file,
      );
      setDocuments((current) => [created, ...current]);
    },
    [user],
  );

  const removeDocument = useCallback(
    async (document: DocumentRecord) => {
      if (!user) throw new Error("You must be signed in to delete a document.");

      await deleteDocument(await user.getIdToken(), document.id);
      setDocuments((current) => current.filter((item) => item.id !== document.id));
    },
    [user],
  );

  return {
    addDocument,
    documents,
    error,
    loading,
    removeDocument,
  };
}
