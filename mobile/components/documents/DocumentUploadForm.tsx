import { Camera, FileText, Image as ImageIcon } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useDocumentActions } from "../../hooks/use-documents";
import { documentUploadBlocker } from "../../lib/document-validation";
import { FileSelectionError, pickFile, type FileSource } from "../../lib/files";
import { assetDocumentTypes, documentTypeLabels } from "../../lib/labels";
import { spacing } from "../../lib/theme";
import type { AssetDocumentSummary, DocumentType } from "../../lib/types";
import { useToast } from "../../providers/toast-provider";
import { Button } from "../ui/Button";
import { Chips } from "../ui/Chips";
import { InlineMessage } from "../ui/ScreenStates";
import { SelectField, type SelectOption } from "../ui/SelectField";
import { Sheet } from "../ui/Sheet";
import { Text } from "../ui/Text";

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Upload to this asset. When omitted, the user picks one from assetOptions. */
  productId?: string;
  assetOptions?: SelectOption[];
  /** The asset's current documents, used to explain per-asset limits. */
  existingDocuments?: AssetDocumentSummary[];
  initialType?: DocumentType;
};

/** A sheet for adding a receipt, invoice, warranty card, or photo to an asset. */
export function DocumentUploadForm({
  visible,
  onClose,
  productId,
  assetOptions = [],
  existingDocuments,
  initialType = "INVOICE",
}: Props) {
  const toast = useToast();
  const { upload } = useDocumentActions();
  const [assetId, setAssetId] = useState(productId ?? "");
  const [type, setType] = useState<DocumentType>(initialType);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setAssetId(productId ?? "");
      setType(initialType);
      setError(null);
    }
  }, [initialType, productId, visible]);

  const blocker = useMemo(
    () => (existingDocuments ? documentUploadBlocker(type, existingDocuments) : null),
    [existingDocuments, type],
  );

  async function choose(source: FileSource) {
    if (!assetId) {
      setError("Choose the asset this document belongs to.");
      return;
    }
    setError(null);
    try {
      const file = await pickFile(source, { imagesOnly: type === "PRODUCT_IMAGE" });
      if (!file) return;
      await upload.mutateAsync({ productId: assetId, type, file });
      toast.success(`${documentTypeLabels[type]} uploaded.`);
      onClose();
    } catch (cause) {
      setError(
        cause instanceof FileSelectionError || cause instanceof Error
          ? cause.message
          : "Could not upload the file.",
      );
    }
  }

  const busy = upload.isPending;
  return (
    <Sheet visible={visible} onClose={busy ? () => undefined : onClose} title="Add a document">
      <View style={styles.body}>
        {!productId ? (
          <SelectField
            label="Asset"
            placeholder="Choose an asset"
            value={assetId}
            options={assetOptions}
            searchable
            emptyMessage="Add an asset first."
            onChange={setAssetId}
          />
        ) : null}
        <Text variant="label">Document type</Text>
        <Chips
          options={assetDocumentTypes.map((value) => ({ value, label: documentTypeLabels[value] }))}
          value={type}
          onChange={setType}
        />
        <InlineMessage message={error ?? blocker} />
        <View style={styles.sources}>
          <Button
            title="Camera"
            icon={Camera}
            variant="secondary"
            style={styles.source}
            disabled={busy || Boolean(blocker)}
            onPress={() => void choose("camera")}
          />
          <Button
            title="Photos"
            icon={ImageIcon}
            variant="secondary"
            style={styles.source}
            disabled={busy || Boolean(blocker)}
            onPress={() => void choose("library")}
          />
        </View>
        {type !== "PRODUCT_IMAGE" ? (
          <Button
            title="Browse files (PDF or image)"
            icon={FileText}
            variant="outline"
            fullWidth
            disabled={busy || Boolean(blocker)}
            onPress={() => void choose("files")}
          />
        ) : null}
        {busy ? (
          <Button title="Uploading…" loading fullWidth onPress={() => undefined} />
        ) : (
          <Text variant="caption" align="center">
            PDF, JPG, PNG, or WebP up to 4 MB.
          </Text>
        )}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.md, paddingBottom: spacing.sm },
  sources: { flexDirection: "row", gap: spacing.sm },
  source: { flex: 1 },
});
