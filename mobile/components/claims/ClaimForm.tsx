import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  createEmptyClaimDraft,
  type ClaimDraft,
  validateClaimDraft,
} from "../../lib/claim-validation";
import type { CreateClaimInput } from "../../lib/claims-api";
import { colors, spacing } from "../../lib/theme";

type ClaimFormProps = {
  onCreated: (input: CreateClaimInput) => Promise<void> | void;
};

export function ClaimForm({ onCreated }: ClaimFormProps) {
  const [draft, setDraft] = useState<ClaimDraft>(createEmptyClaimDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateDraft(field: keyof ClaimDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function submit() {
    const result = validateClaimDraft(draft);

    if (!result.valid) {
      setError(result.message);
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onCreated(result.value);
      setDraft(createEmptyClaimDraft());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create claim.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>New claim</Text>
      <Text style={styles.helper}>Use the asset ID from the asset details.</Text>
      <TextInput
        onChangeText={(value) => updateDraft("productId", value)}
        placeholder="Asset ID"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={draft.productId}
      />
      <TextInput
        onChangeText={(value) => updateDraft("title", value)}
        placeholder="Claim title"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={draft.title}
      />
      <TextInput
        multiline
        onChangeText={(value) => updateDraft("issueDescription", value)}
        placeholder="Describe the issue"
        placeholderTextColor={colors.muted}
        style={[styles.input, styles.multiline]}
        value={draft.issueDescription}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable disabled={saving} onPress={() => void submit()} style={styles.save}>
        <Text style={styles.saveText}>{saving ? "Saving..." : "Submit claim"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  formTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "700",
  },
  helper: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  input: {
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.ink,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
  },
  save: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 10,
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  saveText: {
    color: colors.surface,
    fontWeight: "700",
  },
});
