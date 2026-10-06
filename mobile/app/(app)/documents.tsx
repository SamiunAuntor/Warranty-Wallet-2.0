import { router, useLocalSearchParams } from "expo-router";
import { ExternalLink, FilePlus2, FileText, Package, Trash2 } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DocumentCard, openDocument } from "../../components/documents/DocumentCard";
import { DocumentUploadForm } from "../../components/documents/DocumentUploadForm";
import { Chips } from "../../components/ui/Chips";
import { SearchBar } from "../../components/ui/Display";
import { IconButton } from "../../components/ui/IconButton";
import { PagedList } from "../../components/ui/PagedList";
import { EmptyState } from "../../components/ui/ScreenStates";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { ActionSheet } from "../../components/ui/Sheet";
import { useAssetList } from "../../hooks/use-assets";
import { useDebouncedValue } from "../../hooks/use-debounced-value";
import { useDocumentActions, useDocumentList } from "../../hooks/use-documents";
import { confirm } from "../../lib/confirm";
import { documentTypeLabels } from "../../lib/labels";
import { colors, spacing } from "../../lib/theme";
import type { DocumentRecord, DocumentType } from "../../lib/types";
import { useToast } from "../../providers/toast-provider";

type Filter = "ALL" | DocumentType;

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "ALL", label: "All" },
  ...(["INVOICE", "RECEIPT", "WARRANTY_CARD", "PRODUCT_IMAGE", "CLAIM_EVIDENCE", "OTHER"] as const).map(
    (type) => ({ value: type, label: documentTypeLabels[type] }),
  ),
];

export default function DocumentsScreen() {
  const params = useLocalSearchParams<{ upload?: string }>();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selected, setSelected] = useState<DocumentRecord | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim());
  const query = useMemo(
    () => ({ search: debouncedSearch || undefined, type: filter === "ALL" ? undefined : filter }),
    [debouncedSearch, filter],
  );
  const documents = useDocumentList(query);
  const assets = useAssetList({ limit: 100 });
  const { remove } = useDocumentActions();

  useEffect(() => {
    if (params.upload === "1") setUploadOpen(true);
  }, [params.upload]);

  const assetOptions = useMemo(
    () => assets.items.map((asset) => ({ value: asset.id, label: asset.name, description: asset.brand })),
    [assets.items],
  );

  async function removeDocument(document: DocumentRecord) {
    const ok = await confirm({
      title: "Delete this document?",
      message: document.fileName,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    try {
      await remove.mutateAsync(document.id);
      toast.success("Document deleted.");
    } catch (error) {
      toast.error(error, "Could not delete the document.");
    }
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <ScreenHeader
        title="Documents"
        subtitle={documents.isPending ? undefined : `${documents.total} files`}
        fallbackHref="/(app)/more"
        actions={
          <IconButton icon={FilePlus2} label="Upload a document" tone="primary" onPress={() => setUploadOpen(true)} />
        }
      />
      <PagedList
        query={documents}
        keyExtractor={(document) => document.id}
        renderItem={(document) => (
          <DocumentCard document={document} showAsset onMore={() => setSelected(document)} />
        )}
        header={
          <View style={styles.header}>
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search by file or asset" />
            <Chips options={FILTERS} value={filter} onChange={setFilter} scrollable />
          </View>
        }
        empty={
          <EmptyState
            icon={FileText}
            title={debouncedSearch || filter !== "ALL" ? "No matching documents" : "No documents yet"}
            message="Upload receipts, invoices, and warranty cards so they are ready when you need them."
            actionLabel="Upload a document"
            onAction={() => setUploadOpen(true)}
          />
        }
      />

      <ActionSheet
        visible={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.fileName}
        actions={
          selected
            ? [
                { label: "Open", icon: ExternalLink, onPress: () => void openDocument(selected) },
                {
                  label: "View asset",
                  icon: Package,
                  onPress: () => router.push(`/(app)/assets/${selected.productId}`),
                },
                {
                  label: "Delete",
                  icon: Trash2,
                  destructive: true,
                  onPress: () => void removeDocument(selected),
                },
              ]
            : []
        }
      />

      <DocumentUploadForm
        visible={uploadOpen}
        onClose={() => setUploadOpen(false)}
        assetOptions={assetOptions}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.canvas, flex: 1 },
  header: { gap: spacing.md },
});
