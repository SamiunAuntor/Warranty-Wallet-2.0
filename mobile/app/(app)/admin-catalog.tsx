import { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { CatalogItem } from "../../lib/admin-api";
import { useAdminCatalog } from "../../hooks/use-admin-catalog";
import { AccessDeniedState, LoadingState } from "../../components/ui/ScreenStates";
import { colors, spacing } from "../../lib/theme";
export default function AdminCatalogScreen() {
  const {
    add: addCatalog,
    appUser,
    brands,
    categories,
    error,
    loading,
    remove: removeCatalog,
  } = useAdminCatalog();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<"category" | "brand">("category");
  async function addItem() {
    if (!name.trim()) return;
    try {
      await addCatalog(kind, name, description);
      setName("");
      setDescription("");
    } catch {
      return;
    }
  }
  function removeItem(item: CatalogItem, itemKind: "category" | "brand") {
    Alert.alert("Delete catalog item?", item.name, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await removeCatalog(item, itemKind);
        },
      },
    ]);
  }
  if (appUser?.role !== "ADMIN")
    return <AccessDeniedState />;
  if (loading)
    return <LoadingState />;
  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={[
        { title: "Categories", items: categories, kind: "category" as const },
        { title: "Brands", items: brands, kind: "brand" as const },
      ]}
      keyExtractor={(item) => item.kind}
      ListHeaderComponent={
        <>
          <Text style={styles.eyebrow}>CATALOG</Text>
          <Text style={styles.title}>Categories and brands</Text>
          <TextInput
            onChangeText={setName}
            placeholder={`${kind} name`}
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={name}
          />
          <TextInput
            onChangeText={setDescription}
            placeholder="Description"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={description}
          />
          <View style={styles.switch}>
            <Pressable
              onPress={() => setKind("category")}
              style={[styles.choice, kind === "category" && styles.selected]}
            >
              <Text style={kind === "category" ? styles.selectedText : styles.choiceText}>
                Category
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setKind("brand")}
              style={[styles.choice, kind === "brand" && styles.selected]}
            >
              <Text style={kind === "brand" ? styles.selectedText : styles.choiceText}>Brand</Text>
            </Pressable>
          </View>
          <Pressable onPress={() => void addItem()} style={styles.save}>
            <Text style={styles.saveText}>Add {kind}</Text>
          </Pressable>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
          {item.items.map((entry) => (
            <View key={entry.id} style={styles.row}>
              <View style={styles.copy}>
                <Text style={styles.name}>{entry.name}</Text>
                <Text style={styles.muted}>{entry.description || "No description"}</Text>
              </View>
              <Pressable onPress={() => removeItem(entry, item.kind)}>
                <Text style={styles.delete}>Delete</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    />
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.canvas,
    gap: spacing.md,
    padding: spacing.lg,
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "800",
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.ink,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  switch: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  choice: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.sm,
  },
  selected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  choiceText: {
    color: colors.muted,
    fontSize: 12,
  },
  selectedText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "700",
  },
  save: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 10,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  saveText: {
    color: colors.surface,
    fontWeight: "700",
  },
  error: {
    color: colors.danger,
  },
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  row: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    paddingVertical: spacing.sm,
  },
  copy: {
    flex: 1,
  },
  name: {
    color: colors.ink,
    fontWeight: "700",
  },
  muted: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  delete: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "700",
  },
});
