import { router, useLocalSearchParams } from "expo-router";
import {
  Archive,
  ArchiveRestore,
  ExternalLink,
  FilePlus2,
  MoreVertical,
  Pencil,
  RefreshCw,
  ShieldPlus,
  Trash2,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AssetThumbnail } from "../../../components/assets/AssetCard";
import { DocumentCard, openDocument } from "../../../components/documents/DocumentCard";
import { DocumentUploadForm } from "../../../components/documents/DocumentUploadForm";
import { FileSourceSheet } from "../../../components/documents/FileSourceSheet";
import { ClaimBadge, WarrantyBadge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card, Section } from "../../../components/ui/Card";
import { ProgressBar } from "../../../components/ui/Display";
import { IconButton } from "../../../components/ui/IconButton";
import { InfoGrid, InfoRow } from "../../../components/ui/Rows";
import { Screen } from "../../../components/ui/Screen";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { ErrorState, LoadingState } from "../../../components/ui/ScreenStates";
import { ActionSheet } from "../../../components/ui/Sheet";
import { Text } from "../../../components/ui/Text";
import { useAssetActions } from "../../../hooks/use-asset-details";
import { useAsset } from "../../../hooks/use-assets";
import { useDocumentActions } from "../../../hooks/use-documents";
import { useFormatters } from "../../../hooks/use-preferences";
import { confirm } from "../../../lib/confirm";
import { daysUntil, describeDaysUntil } from "../../../lib/format";
import { warrantyTypeLabels } from "../../../lib/labels";
import { colors, spacing } from "../../../lib/theme";
import type { AssetDocumentSummary } from "../../../lib/types";
import { useToast } from "../../../providers/toast-provider";

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const toast = useToast();
  const format = useFormatters();
  const asset = useAsset(id);
  const actions = useAssetActions(id);
  const documents = useDocumentActions();
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [documentMenu, setDocumentMenu] = useState<AssetDocumentSummary | null>(null);
  const [replacing, setReplacing] = useState<AssetDocumentSummary | null>(null);

  const header = (
    <ScreenHeader
      title={asset.data?.name ?? "Asset"}
      fallbackHref="/(app)/assets"
      actions={
        asset.data ? (
          <>
            <IconButton
              icon={Pencil}
              label="Edit asset"
              onPress={() => router.push(`/(app)/assets/form?id=${id}`)}
            />
            <IconButton icon={MoreVertical} label="More actions" onPress={() => setMenuOpen(true)} />
          </>
        ) : null
      }
    />
  );

  if (asset.isPending) return <Screen header={header}><LoadingState /></Screen>;
  if (asset.isError || !asset.data) {
    return (
      <Screen header={header}>
        <ErrorState error={asset.error} onRetry={() => void asset.refetch()} />
      </Screen>
    );
  }

  const item = asset.data;
  const archived = item.lifecycleStatus === "ARCHIVED";
  const assetDocuments = (item.documents ?? []).filter(
    (document) => document.fileType !== "CLAIM_EVIDENCE" && document.fileType !== "CLAIM_CONDITION",
  );
  const claimDocuments = (item.documents ?? []).length - assetDocuments.length;

  // Share of the warranty period already used, for the progress bar.
  let elapsed = 0;
  if (item.hasWarranty && item.expiryDate) {
    const start = new Date(item.purchaseDate).getTime();
    const end = new Date(item.expiryDate).getTime();
    elapsed = end > start ? (Date.now() - start) / (end - start) : 1;
  }
  const daysLeft = item.expiryDate ? daysUntil(item.expiryDate) : null;

  async function toggleArchive() {
    try {
      await actions.setLifecycle.mutateAsync(archived ? "ADDED" : "ARCHIVED");
      toast.success(archived ? "Asset restored." : "Asset archived.");
    } catch (error) {
      toast.error(error, "Could not update the asset.");
    }
  }

  async function remove() {
    const ok = await confirm({
      title: "Delete this asset?",
      message: `${item.name}, its documents, and its claims will be removed. This cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    try {
      await actions.remove.mutateAsync();
      toast.success("Asset deleted.");
      router.back();
    } catch (error) {
      toast.error(error, "Could not delete the asset.");
    }
  }

  async function removeDocument(document: AssetDocumentSummary) {
    const ok = await confirm({
      title: "Delete this document?",
      message: document.fileName,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    try {
      await documents.remove.mutateAsync(document.id);
      toast.success("Document deleted.");
    } catch (error) {
      toast.error(error, "Could not delete the document.");
    }
  }

  return (
    <Screen
      header={header}
      refreshing={asset.isRefetching}
      onRefresh={() => void asset.refetch()}
    >
      <Card>
        <View style={styles.hero}>
          <AssetThumbnail asset={item} size={72} />
          <View style={styles.flex}>
            <Text variant="heading">{item.name}</Text>
            <Text variant="bodySmall" color={colors.muted}>
              {[item.brand, item.model].filter(Boolean).join(" · ")}
            </Text>
            <View style={styles.badges}>
              <WarrantyBadge status={item.warrantyStatus} />
              {archived ? <Text variant="caption">Archived</Text> : null}
            </View>
          </View>
        </View>
        <InfoGrid>
          <InfoRow label="Price" value={format.money(item.purchasePrice)} />
          <InfoRow label="Purchased" value={format.date(item.purchaseDate)} />
          <InfoRow label="Category" value={item.category?.name ?? "—"} />
          <InfoRow label="Serial number" value={item.serialNumber || "—"} />
        </InfoGrid>
      </Card>

      <Section title="Warranty">
        <Card>
          {item.hasWarranty && item.expiryDate ? (
            <>
              <View style={styles.rowBetween}>
                <Text variant="subheading">
                  {item.warrantyType ? warrantyTypeLabels[item.warrantyType] : "Warranty"} ·{" "}
                  {item.warrantyDuration} months
                </Text>
                <Text
                  variant="label"
                  color={daysLeft !== null && daysLeft < 0 ? colors.danger : colors.heading}
                >
                  {describeDaysUntil(item.expiryDate)}
                </Text>
              </View>
              <ProgressBar
                value={elapsed}
                tone={
                  item.warrantyStatus === "EXPIRED"
                    ? "danger"
                    : item.warrantyStatus === "EXPIRING_SOON"
                      ? "warning"
                      : "success"
                }
              />
              <View style={styles.rowBetween}>
                <Text variant="caption">Started {format.date(item.purchaseDate)}</Text>
                <Text variant="caption">Ends {format.date(item.expiryDate)}</Text>
              </View>
            </>
          ) : (
            <View style={styles.emptyWarranty}>
              <Text variant="bodySmall" color={colors.muted}>
                No warranty is recorded for this asset.
              </Text>
              <Button
                title="Add warranty details"
                variant="secondary"
                size="sm"
                onPress={() => router.push(`/(app)/assets/form?id=${id}`)}
              />
            </View>
          )}
        </Card>
      </Section>

      {item.sellerName || item.sellerPhone || item.sellerAddress || item.notes ? (
        <Section title="Seller and notes">
          <Card>
            <InfoGrid>
              {item.sellerName ? <InfoRow label="Seller" value={item.sellerName} /> : null}
              {item.sellerPhone ? <InfoRow label="Phone" value={item.sellerPhone} /> : null}
            </InfoGrid>
            {item.sellerAddress ? <InfoRow label="Address" value={item.sellerAddress} /> : null}
            {item.notes ? <InfoRow label="Notes" value={item.notes} /> : null}
          </Card>
        </Section>
      ) : null}

      <Section
        title={`Documents (${assetDocuments.length})`}
        action={
          <Button title="Add" icon={FilePlus2} size="sm" variant="ghost" onPress={() => setUploadOpen(true)} />
        }
      >
        {assetDocuments.length ? (
          <View style={styles.list}>
            {assetDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onMore={() => setDocumentMenu(document)}
              />
            ))}
          </View>
        ) : (
          <Card>
            <Text variant="bodySmall" color={colors.muted}>
              Keep the invoice, receipt, and warranty card here so they are ready when you need them.
            </Text>
            <Button
              title="Upload a document"
              variant="secondary"
              size="sm"
              icon={FilePlus2}
              onPress={() => setUploadOpen(true)}
            />
          </Card>
        )}
        {claimDocuments ? (
          <Text variant="caption">
            {claimDocuments} claim evidence {claimDocuments === 1 ? "file is" : "files are"} shown on
            the related claims.
          </Text>
        ) : null}
      </Section>

      <Section
        title={`Claims (${item.claims?.length ?? 0})`}
        action={
          <Button
            title="New claim"
            icon={ShieldPlus}
            size="sm"
            variant="ghost"
            onPress={() => router.push(`/(app)/claims/form?productId=${id}`)}
          />
        }
      >
        {item.claims?.length ? (
          <Card padded={false}>
            {item.claims.map((claim, index) => (
              <Pressable
                key={claim.id}
                onPress={() => router.push(`/(app)/claims/${claim.id}`)}
                style={({ pressed }) => [
                  styles.claimRow,
                  index > 0 && styles.divider,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.flex}>
                  <Text variant="subheading" numberOfLines={1}>
                    {claim.title}
                  </Text>
                  <Text variant="caption">
                    #{claim.claimNumber} · {format.date(claim.updatedAt)}
                  </Text>
                </View>
                <ClaimBadge status={claim.status} />
              </Pressable>
            ))}
          </Card>
        ) : (
          <Card>
            <Text variant="bodySmall" color={colors.muted}>
              No claims yet. Start one if this product needs repair or replacement.
            </Text>
          </Card>
        )}
      </Section>

      <ActionSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={item.name}
        actions={[
          {
            label: "Edit details",
            icon: Pencil,
            onPress: () => router.push(`/(app)/assets/form?id=${id}`),
          },
          {
            label: archived ? "Restore asset" : "Archive asset",
            description: archived ? "Show it with your active assets again" : "Hide it from everyday lists",
            icon: archived ? ArchiveRestore : Archive,
            onPress: () => void toggleArchive(),
          },
          { label: "Delete asset", icon: Trash2, destructive: true, onPress: () => void remove() },
        ]}
      />

      <ActionSheet
        visible={documentMenu !== null}
        onClose={() => setDocumentMenu(null)}
        title={documentMenu?.fileName}
        actions={
          documentMenu
            ? [
                { label: "Open", icon: ExternalLink, onPress: () => void openDocument(documentMenu) },
                { label: "Replace file", icon: RefreshCw, onPress: () => setReplacing(documentMenu) },
                {
                  label: "Delete",
                  icon: Trash2,
                  destructive: true,
                  onPress: () => void removeDocument(documentMenu),
                },
              ]
            : []
        }
      />

      <FileSourceSheet
        visible={replacing !== null}
        title="Choose the replacement file"
        imagesOnly={replacing?.fileType === "PRODUCT_IMAGE"}
        onClose={() => setReplacing(null)}
        onPicked={(file) => {
          const target = replacing;
          if (!target) return;
          documents.replace
            .mutateAsync({ id: target.id, file })
            .then(() => toast.success("Document replaced."))
            .catch((error: unknown) => toast.error(error, "Could not replace the document."));
        }}
      />

      <DocumentUploadForm
        visible={uploadOpen}
        onClose={() => setUploadOpen(false)}
        productId={id}
        existingDocuments={item.documents ?? []}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  hero: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.sm },
  badges: { alignItems: "center", flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  rowBetween: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  emptyWarranty: { alignItems: "flex-start", gap: spacing.sm },
  list: { gap: spacing.sm },
  claimRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  divider: { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
  pressed: { backgroundColor: colors.surfaceMuted },
});
