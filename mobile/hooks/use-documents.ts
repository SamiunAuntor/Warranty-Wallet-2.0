import { useMutation } from "@tanstack/react-query";
import {
  deleteDocument,
  getDocuments,
  replaceDocument,
  uploadDocument,
  type DocumentQuery,
} from "../lib/documents-api";
import type { DocumentType, NativeFile } from "../lib/types";
import { keys, useInvalidate, useSignedIn } from "./query-keys";
import { usePagedQuery } from "./use-paged-query";

export function useDocumentList(query: DocumentQuery) {
  return usePagedQuery(keys.documents(query), (page) => getDocuments({ ...query, page }), {
    enabled: useSignedIn(),
  });
}

export function useDocumentActions() {
  const invalidate = useInvalidate();
  const refresh = () => invalidate.documents();

  const upload = useMutation({
    mutationFn: ({ productId, type, file }: { productId: string; type: DocumentType; file: NativeFile }) =>
      uploadDocument(productId, type, file),
    onSuccess: refresh,
  });

  const replace = useMutation({
    mutationFn: ({ id, file }: { id: string; file: NativeFile }) => replaceDocument(id, file),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: refresh,
  });

  return { upload, replace, remove };
}
