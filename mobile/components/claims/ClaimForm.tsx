import { FileText, ImagePlus, Paperclip, X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { PendingEvidence } from "../../hooks/use-claims";
import type { ClaimDraft } from "../../lib/claim-validation";
import { claimStatuses, claimStatusLabels } from "../../lib/labels";
import { colors, radius, spacing } from "../../lib/theme";
import type { ClaimStatus } from "../../lib/types";
import { FileSourceSheet } from "../documents/FileSourceSheet";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { SelectField, type SelectOption } from "../ui/SelectField";
import { Text } from "../ui/Text";
import { TextField } from "../ui/TextField";

type Props = {
  draft: ClaimDraft;
  onChange: (draft: ClaimDraft) => void;
  mode: "create" | "edit";
  /** Assets the claim can be filed against. Only used when creating. */
  assetOptions?: SelectOption[];
  assetsLoading?: boolean;
  evidence?: PendingEvidence[];
  onEvidenceChange?: (evidence: PendingEvidence[]) => void;
};

export function ClaimForm({
  draft,
  onChange,
  mode,
  assetOptions = [],
  assetsLoading,
  evidence = [],
  onEvidenceChange,
}: Props) {
  const [picker, setPicker] = useState<PendingEvidence["kind"] | null>(null);
  const set = <K extends keyof ClaimDraft>(field: K, value: ClaimDraft[K]) =>
    onChange({ ...draft, [field]: value });

  return (
    <View style={styles.form}>
      <Card style={styles.section}>
        <Text variant="overline">Claim</Text>
        {mode === "create" ? (
          <SelectField
            label="Asset"
            placeholder="Choose the product with the issue"
            value={draft.productId}
            options={assetOptions}
            loading={assetsLoading}
            searchable
            emptyMessage="Add an asset before filing a claim."
            onChange={(value) => set("productId", value)}
          />
        ) : (
          <SelectField
            label="Status"
            value={draft.status}
            options={claimStatuses.map((status) => ({
              value: status,
              label: claimStatusLabels[status].label,
            }))}
            onChange={(value) => set("status", value as ClaimStatus)}
          />
        )}
        <TextField
          label="Title"
          placeholder="e.g. Screen stopped working"
          value={draft.title}
          onChangeText={(value) => set("title", value)}
        />
        <TextField
          label="What happened?"
          multiline
          placeholder="Describe the problem, when it started, and what you have tried."
          value={draft.issueDescription}
          onChangeText={(value) => set("issueDescription", value)}
        />
        <TextField
          label="Product condition"
          optional
          multiline
          placeholder="Visible damage, missing parts, or other important details"
          value={draft.submittedCondition}
          onChangeText={(value) => set("submittedCondition", value)}
        />
      </Card>

      <Card style={styles.section}>
        <Text variant="overline">Service provider</Text>
        <TextField
          label="Service center"
          optional
          placeholder="Where the claim is filed"
          value={draft.serviceCenter}
          onChangeText={(value) => set("serviceCenter", value)}
        />
        <TextField
          label="Reference number"
          optional
          placeholder="Case or ticket number"
          value={draft.providerReference}
          onChangeText={(value) => set("providerReference", value)}
        />
        {mode === "edit" ? (
          <TextField
            label="Resolution"
            optional
            multiline
            placeholder="The outcome of the claim"
            value={draft.resolution}
            onChangeText={(value) => set("resolution", value)}
          />
        ) : null}
      </Card>

      {mode === "create" && onEvidenceChange ? (
        <Card style={styles.section}>
          <Text variant="overline">Evidence</Text>
          <Text variant="caption">
            Photos and documents are uploaded to the asset and attached to this claim.
          </Text>
          {evidence.map((item, index) => (
            <View key={`${item.file.uri}-${index}`} style={styles.file}>
              <Paperclip size={16} color={colors.primary} />
              <View style={styles.fileText}>
                <Text variant="bodySmall" numberOfLines={1} color={colors.heading}>
                  {item.file.name}
                </Text>
                <Text variant="caption">
                  {item.kind === "CLAIM_CONDITION" ? "Condition photo" : "Supporting document"}
                </Text>
              </View>
              <Pressable
                accessibilityLabel={`Remove ${item.file.name}`}
                hitSlop={10}
                onPress={() => onEvidenceChange(evidence.filter((_, i) => i !== index))}
              >
                <X size={18} color={colors.muted} />
              </Pressable>
            </View>
          ))}
          <View style={styles.row}>
            <Button
              title="Document"
              icon={FileText}
              variant="secondary"
              size="sm"
              style={styles.flex}
              onPress={() => setPicker("CLAIM_EVIDENCE")}
            />
            <Button
              title="Condition photo"
              icon={ImagePlus}
              variant="secondary"
              size="sm"
              style={styles.flex}
              onPress={() => setPicker("CLAIM_CONDITION")}
            />
          </View>
          <FileSourceSheet
            visible={picker !== null}
            imagesOnly={picker === "CLAIM_CONDITION"}
            title={picker === "CLAIM_CONDITION" ? "Add a condition photo" : "Add a document"}
            onClose={() => setPicker(null)}
            onPicked={(file) => {
              if (picker) onEvidenceChange([...evidence, { file, kind: picker }]);
            }}
          />
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  section: { gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.sm },
  flex: { flex: 1 },
  file: {
    alignItems: "center",
    backgroundColor: colors.primaryTint,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  fileText: { flex: 1 },
});
