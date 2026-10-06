import { router, useLocalSearchParams } from "expo-router";
import {
  FileText,
  ImagePlus,
  MoreVertical,
  Package,
  Pencil,
  Trash2,
  X,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { openDocument } from "../../../components/documents/DocumentCard";
import { FileSourceSheet } from "../../../components/documents/FileSourceSheet";
import { ClaimBadge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card, Section } from "../../../components/ui/Card";
import { IconButton } from "../../../components/ui/IconButton";
import { InfoGrid, InfoRow } from "../../../components/ui/Rows";
import { Screen } from "../../../components/ui/Screen";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { ErrorState, LoadingState } from "../../../components/ui/ScreenStates";
import { SelectField } from "../../../components/ui/SelectField";
import { ActionSheet } from "../../../components/ui/Sheet";
import { Text } from "../../../components/ui/Text";
import { TextField } from "../../../components/ui/TextField";
import { useClaimActions } from "../../../hooks/use-claim-details";
import { useClaim } from "../../../hooks/use-claims";
import { useFormatters } from "../../../hooks/use-preferences";
import { confirm } from "../../../lib/confirm";
import { claimStatuses, claimStatusLabels, evidenceTypeLabels } from "../../../lib/labels";
import { colors, radius, spacing } from "../../../lib/theme";
import type { ClaimStatus } from "../../../lib/types";
import { useToast } from "../../../providers/toast-provider";

export default function ClaimDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const toast = useToast();
  const format = useFormatters();
  const claim = useClaim(id);
  const actions = useClaimActions(claim.data);
  const [menuOpen, setMenuOpen] = useState(false);
  const [picker, setPicker] = useState<"document" | "photo" | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  const header = (
    <ScreenHeader
      title={claim.data ? `Claim #${claim.data.claimNumber}` : "Claim"}
      fallbackHref="/(app)/claims"
      actions={
        claim.data ? (
          <>
            <IconButton
              icon={Pencil}
              label="Edit claim"
              onPress={() => router.push(`/(app)/claims/form?id=${id}`)}
            />
            <IconButton icon={MoreVertical} label="More actions" onPress={() => setMenuOpen(true)} />
          </>
        ) : null
      }
    />
  );

  if (claim.isPending) return <Screen header={header}><LoadingState /></Screen>;
  if (claim.isError || !claim.data) {
    return (
      <Screen header={header}>
        <ErrorState error={claim.error} onRetry={() => void claim.refetch()} />
      </Screen>
    );
  }

  const item = claim.data;

  async function changeStatus(status: ClaimStatus) {
    if (status === item.status) return;
    try {
      await actions.setStatus.mutateAsync(status);
      toast.success(`Claim marked ${claimStatusLabels[status].label.toLowerCase()}.`);
    } catch (error) {
      toast.error(error, "Could not update the status.");
    }
  }

  async function addEvent() {
    const title = eventTitle.trim();
    if (title.length < 2) {
      toast.error("Give the update a short title.");
      return;
    }
    try {
      await actions.addEvent.mutateAsync({
        title,
        description: eventDescription.trim() || undefined,
      });
      setEventTitle("");
      setEventDescription("");
      toast.success("Update added to the timeline.");
    } catch (error) {
      toast.error(error, "Could not add the update.");
    }
  }

  async function detach(documentId: string, name: string) {
    const ok = await confirm({
      title: "Remove this evidence?",
      message: `${name} stays on the asset but is no longer attached to this claim.`,
      confirmLabel: "Remove",
      destructive: true,
    });
    if (!ok) return;
    try {
      await actions.detach.mutateAsync(documentId);
      toast.success("Evidence removed.");
    } catch (error) {
      toast.error(error, "Could not remove the evidence.");
    }
  }

  async function remove() {
    const ok = await confirm({
      title: "Delete this claim?",
      message: "Its timeline is removed. Attached files stay on the asset.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    try {
      await actions.remove.mutateAsync();
      toast.success("Claim deleted.");
      router.back();
    } catch (error) {
      toast.error(error, "Could not delete the claim.");
    }
  }

  return (
    <Screen header={header} refreshing={claim.isRefetching} onRefresh={() => void claim.refetch()}>
      <Card>
        <ClaimBadge status={item.status} />
        <Text variant="heading">{item.title}</Text>
        <Pressable
          onPress={() => router.push(`/(app)/assets/${item.productId}`)}
          style={styles.assetLink}
        >
          <Package size={16} color={colors.primary} />
          <Text variant="label" color={colors.primary} numberOfLines={1}>
            {item.product.name} · {item.product.brand}
          </Text>
        </Pressable>
        <SelectField
          label="Status"
          value={item.status}
          options={claimStatuses.map((status) => ({
            value: status,
            label: claimStatusLabels[status].label,
          }))}
          disabled={actions.setStatus.isPending}
          onChange={(value) => void changeStatus(value as ClaimStatus)}
        />
      </Card>

      <Section title="Details">
        <Card>
          <InfoRow label="Issue" value={item.issueDescription} />
          {item.submittedCondition ? (
            <InfoRow label="Product condition" value={item.submittedCondition} />
          ) : null}
          <InfoGrid>
            <InfoRow label="Service center" value={item.serviceCenter || "Not provided"} />
            <InfoRow label="Reference" value={item.providerReference || "Not provided"} />
            <InfoRow label="Filed" value={format.date(item.filedAt ?? item.createdAt)} />
            <InfoRow
              label={item.resolvedAt ? "Resolved" : "Last update"}
              value={format.date(item.resolvedAt ?? item.updatedAt)}
            />
          </InfoGrid>
          {item.resolution ? <InfoRow label="Resolution" value={item.resolution} /> : null}
        </Card>
      </Section>

      <Section title={`Evidence (${item.documents?.length ?? 0})`}>
        <Card>
          {item.documents?.length ? (
            item.documents.map((evidence) => (
              <View key={evidence.documentId} style={styles.evidence}>
                <Pressable
                  style={styles.evidenceBody}
                  onPress={() => void openDocument(evidence.document)}
                >
                  <FileText size={18} color={colors.primary} />
                  <View style={styles.flex}>
                    <Text variant="bodySmall" color={colors.heading} weight="medium" numberOfLines={1}>
                      {evidence.document.fileName}
                    </Text>
                    <Text variant="caption">
                      {evidenceTypeLabels[evidence.evidenceType] ?? evidence.evidenceType} ·{" "}
                      {format.date(evidence.attachedAt)}
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  accessibilityLabel={`Remove ${evidence.document.fileName}`}
                  hitSlop={10}
                  onPress={() => void detach(evidence.documentId, evidence.document.fileName)}
                >
                  <X size={18} color={colors.muted} />
                </Pressable>
              </View>
            ))
          ) : (
            <Text variant="bodySmall" color={colors.muted}>
              Attach receipts, photos of the damage, or messages from the service center.
            </Text>
          )}
          <View style={styles.row}>
            <Button
              title="Document"
              icon={FileText}
              variant="secondary"
              size="sm"
              style={styles.flex}
              loading={actions.uploadEvidence.isPending && picker === null}
              onPress={() => setPicker("document")}
            />
            <Button
              title="Photo"
              icon={ImagePlus}
              variant="secondary"
              size="sm"
              style={styles.flex}
              onPress={() => setPicker("photo")}
            />
          </View>
        </Card>
      </Section>

      <Section title="Timeline">
        <Card>
          <TextField
            placeholder="Add an update, e.g. Technician visited"
            value={eventTitle}
            onChangeText={setEventTitle}
          />
          {eventTitle.trim() ? (
            <>
              <TextField
                multiline
                placeholder="Details (optional)"
                value={eventDescription}
                onChangeText={setEventDescription}
              />
              <Button
                title="Add update"
                size="sm"
                loading={actions.addEvent.isPending}
                onPress={() => void addEvent()}
              />
            </>
          ) : null}
          <View style={styles.timeline}>
            {item.timeline?.map((event, index) => (
              <View key={event.id} style={styles.event}>
                <View style={styles.rail}>
                  <View style={[styles.dot, index === 0 && styles.dotActive]} />
                  {index < (item.timeline?.length ?? 0) - 1 ? <View style={styles.line} /> : null}
                </View>
                <View style={styles.eventBody}>
                  <Text variant="bodySmall" color={colors.heading} weight="semibold">
                    {event.title}
                  </Text>
                  {event.description ? <Text variant="bodySmall">{event.description}</Text> : null}
                  <Text variant="caption">{format.dateTime(event.createdAt)}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </Section>

      <ActionSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={item.title}
        actions={[
          {
            label: "Edit claim",
            icon: Pencil,
            onPress: () => router.push(`/(app)/claims/form?id=${id}`),
          },
          {
            label: "View asset",
            icon: Package,
            onPress: () => router.push(`/(app)/assets/${item.productId}`),
          },
          { label: "Delete claim", icon: Trash2, destructive: true, onPress: () => void remove() },
        ]}
      />

      <FileSourceSheet
        visible={picker !== null}
        imagesOnly={picker === "photo"}
        title={picker === "photo" ? "Add a condition photo" : "Add a document"}
        onClose={() => setPicker(null)}
        onPicked={(file) => {
          const condition = picker === "photo";
          actions.uploadEvidence
            .mutateAsync({ file, condition })
            .then(() => toast.success("Evidence attached."))
            .catch((error: unknown) => toast.error(error, "Could not attach the file."));
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: "row", gap: spacing.sm },
  assetLink: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
  evidence: {
    alignItems: "center",
    backgroundColor: colors.primaryTint,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  evidenceBody: { alignItems: "center", flex: 1, flexDirection: "row", gap: spacing.sm },
  timeline: { marginTop: spacing.xs },
  event: { flexDirection: "row", gap: spacing.sm },
  rail: { alignItems: "center", width: 14 },
  dot: {
    backgroundColor: colors.primaryBorder,
    borderRadius: 6,
    height: 12,
    marginTop: 4,
    width: 12,
  },
  dotActive: { backgroundColor: colors.primary },
  line: { backgroundColor: colors.primaryBorder, flex: 1, marginVertical: 2, width: 2 },
  eventBody: { flex: 1, gap: 2, paddingBottom: spacing.md },
});
