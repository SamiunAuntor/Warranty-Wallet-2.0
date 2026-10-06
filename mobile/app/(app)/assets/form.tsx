import { router, useLocalSearchParams } from "expo-router";
import { ScanLine, Sparkles } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AssetForm } from "../../../components/assets/AssetForm";
import { FileSourceSheet } from "../../../components/documents/FileSourceSheet";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { SwitchRow } from "../../../components/ui/Rows";
import { Screen } from "../../../components/ui/Screen";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { ErrorState, InlineMessage, LoadingState } from "../../../components/ui/ScreenStates";
import { Text } from "../../../components/ui/Text";
import { useAsset, useBrands, useCategories, useSaveAsset } from "../../../hooks/use-assets";
import { useDocumentActions } from "../../../hooks/use-documents";
import { useInvoiceScan } from "../../../hooks/use-invoice-scan";
import { errorMessage } from "../../../lib/api";
import {
  applyExtraction,
  assetToDraft,
  createEmptyAssetDraft,
  toAssetUpdate,
  validateAssetDraft,
  type AssetDraft,
} from "../../../lib/asset-validation";
import { colors, radius, spacing } from "../../../lib/theme";
import type { NativeFile } from "../../../lib/types";
import { useToast } from "../../../providers/toast-provider";

const isPlanLimit = (message: string) => /upgrade your plan/i.test(message);

/** Create an asset, or edit one when opened with ?id=. ?scan=1 starts with an invoice scan. */
export default function AssetFormScreen() {
  const params = useLocalSearchParams<{ id?: string; scan?: string }>();
  const editing = Boolean(params.id);
  const toast = useToast();
  const asset = useAsset(params.id);
  const categories = useCategories();
  const brands = useBrands();
  const save = useSaveAsset(params.id);
  const { upload } = useDocumentActions();
  const scan = useInvoiceScan(categories.data ?? [], brands.data ?? []);

  const [draft, setDraft] = useState<AssetDraft>(createEmptyAssetDraft);
  const [validation, setValidation] = useState<{ field?: keyof AssetDraft; message: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [scannedFile, setScannedFile] = useState<NativeFile | null>(null);
  const [attachInvoice, setAttachInvoice] = useState(true);
  const initialized = useRef(false);

  // Fill the form once the asset being edited has loaded.
  useEffect(() => {
    if (editing && asset.data && !initialized.current) {
      initialized.current = true;
      setDraft(assetToDraft(asset.data));
    }
  }, [asset.data, editing]);

  // Opening from "Scan invoice" goes straight to choosing a file.
  useEffect(() => {
    if (params.scan === "1" && !editing) setScanOpen(true);
  }, [editing, params.scan]);

  async function runScan(file: NativeFile) {
    try {
      const result = await scan.mutateAsync(file);
      setDraft((current) =>
        applyExtraction(current, result.data, { categoryId: result.categoryId, brandId: result.brandId }),
      );
      setScannedFile(file);
      toast.success("Invoice details filled in. Check them before saving.");
    } catch (error) {
      toast.error(error, "Could not read that invoice.");
    }
  }

  async function submit() {
    const result = validateAssetDraft(draft);
    if (!result.valid) {
      setValidation({ field: result.field, message: result.message });
      toast.error(result.message);
      return;
    }
    setValidation(null);
    setSubmitError(null);
    try {
      const saved = await save.mutateAsync(editing ? toAssetUpdate(result.value) : result.value);
      if (!editing && scannedFile && attachInvoice) {
        await upload
          .mutateAsync({ productId: saved.id, type: "INVOICE", file: scannedFile })
          .catch(() => toast.info("Asset saved, but the invoice could not be attached."));
      }
      toast.success(editing ? "Asset updated." : "Asset added.");
      if (editing) router.back();
      else router.replace(`/(app)/assets/${saved.id}`);
    } catch (error) {
      setSubmitError(errorMessage(error, "Could not save the asset."));
    }
  }

  const header = (
    <ScreenHeader title={editing ? "Edit asset" : "Add asset"} fallbackHref="/(app)/assets" />
  );

  if (editing && asset.isPending) return <Screen header={header}><LoadingState /></Screen>;
  if (editing && asset.isError) {
    return (
      <Screen header={header}>
        <ErrorState error={asset.error} onRetry={() => void asset.refetch()} />
      </Screen>
    );
  }

  return (
    <Screen
      header={header}
      footer={
        <Button
          title={editing ? "Save changes" : "Save asset"}
          loading={save.isPending || upload.isPending}
          fullWidth
          onPress={() => void submit()}
        />
      }
    >
      {!editing ? (
        <Card style={styles.scan}>
          <View style={styles.scanHeader}>
            <View style={styles.scanIcon}>
              <Sparkles size={20} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text variant="subheading">Fill in from an invoice</Text>
              <Text variant="caption">
                Scan a receipt or invoice and we&apos;ll extract the product, price, date, and warranty.
              </Text>
            </View>
          </View>
          <Button
            title={scannedFile ? "Scan a different invoice" : "Scan invoice"}
            icon={ScanLine}
            variant="secondary"
            loading={scan.isPending}
            onPress={() => setScanOpen(true)}
          />
          {scannedFile ? (
            <SwitchRow
              title="Attach this invoice to the asset"
              subtitle={scannedFile.name}
              value={attachInvoice}
              onValueChange={setAttachInvoice}
            />
          ) : null}
        </Card>
      ) : null}

      {submitError ? (
        <View style={styles.errorBlock}>
          <InlineMessage message={submitError} />
          {isPlanLimit(submitError) ? (
            <Button title="View plans" variant="outline" size="sm" onPress={() => router.push("/(app)/billing")} />
          ) : null}
        </View>
      ) : null}

      {categories.isError ? (
        <InlineMessage message="Categories could not be loaded. Pull to refresh or try again later." />
      ) : null}

      <AssetForm
        draft={draft}
        onChange={setDraft}
        categories={categories.data ?? []}
        brands={brands.data ?? []}
        errorField={validation?.field}
        error={validation?.message}
      />

      <FileSourceSheet
        visible={scanOpen}
        title="Scan an invoice"
        onClose={() => setScanOpen(false)}
        onPicked={(file) => void runScan(file)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  scan: { backgroundColor: colors.primaryTint, borderColor: colors.primaryBorder, gap: spacing.md },
  scanHeader: { flexDirection: "row", gap: spacing.md },
  scanIcon: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  errorBlock: { gap: spacing.sm },
});
