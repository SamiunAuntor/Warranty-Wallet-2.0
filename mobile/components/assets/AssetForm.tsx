import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { AssetInput, Category } from "../../lib/assets-api";
import {
  createEmptyAssetDraft,
  type AssetDraft,
  validateAssetDraft,
} from "../../lib/asset-validation";
import { colors, spacing } from "../../lib/theme";

type AssetFormProps = {
  categories: Category[];
  onCreated: (input: AssetInput) => Promise<void> | void;
};

export function AssetForm({ categories, onCreated }: AssetFormProps) {
  const [draft, setDraft] = useState<AssetDraft>(createEmptyAssetDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateDraft(field: keyof AssetDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function submit() {
    const result = validateAssetDraft(draft);

    if (!result.valid) {
      setError(result.message);
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onCreated(result.value);
      setDraft(createEmptyAssetDraft());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create asset.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Add an asset</Text>
      <TextInput
        onChangeText={(value) => updateDraft("name", value)}
        placeholder="Product name"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={draft.name}
      />
      <TextInput
        onChangeText={(value) => updateDraft("brand", value)}
        placeholder="Brand"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={draft.brand}
      />
      <TextInput
        keyboardType="decimal-pad"
        onChangeText={(value) => updateDraft("purchasePrice", value)}
        placeholder="Purchase price"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={draft.purchasePrice}
      />
      <TextInput
        onChangeText={(value) => updateDraft("purchaseDate", value)}
        placeholder="Purchase date (YYYY-MM-DD)"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={draft.purchaseDate}
      />
      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryRow}>
        {categories.map((category) => {
          const selected = draft.categoryId === category.id;

          return (
            <Pressable
              key={category.id}
              onPress={() => updateDraft("categoryId", category.id)}
              style={[styles.category, selected && styles.categorySelected]}
            >
              <Text style={selected ? styles.categoryTextSelected : styles.categoryText}>
                {category.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable disabled={saving} onPress={() => void submit()} style={styles.save}>
        <Text style={styles.saveText}>{saving ? "Saving..." : "Save asset"}</Text>
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
  input: {
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.ink,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    marginTop: spacing.md,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  category: {
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categorySelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  categoryText: {
    color: colors.muted,
    fontSize: 12,
  },
  categoryTextSelected: {
    color: colors.surface,
    fontSize: 12,
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
