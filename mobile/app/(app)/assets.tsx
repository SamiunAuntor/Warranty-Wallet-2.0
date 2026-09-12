import { useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AssetCard } from "../../components/assets/AssetCard";
import { AssetForm } from "../../components/assets/AssetForm";
import { useAssets } from "../../hooks/use-assets";
import { colors, spacing } from "../../lib/theme";

export default function AssetsScreen() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { addAsset, assets, categories, error, loading } = useAssets(search);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>INVENTORY</Text>
          <Text style={styles.title}>Your assets</Text>
        </View>
        <Pressable onPress={() => setShowForm((value) => !value)} style={styles.add}>
          <Text style={styles.addText}>{showForm ? "Close" : "+ Add"}</Text>
        </Pressable>
      </View>
      <TextInput
        onChangeText={setSearch}
        placeholder="Search assets"
        placeholderTextColor={colors.muted}
        style={styles.search}
        value={search}
      />
      {showForm ? (
        <AssetForm
          categories={categories}
          onCreated={async (input) => {
            await addAsset(input);
            setShowForm(false);
          }}
        />
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator color={colors.brand} style={styles.loader} />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={assets}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No assets found. Add your first purchase to get started.
            </Text>
          }
          renderItem={({ item }) => (
            <AssetCard
              asset={item}
              onPress={() => router.push(`/(app)/assets/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.canvas,
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "800",
    marginTop: spacing.xs,
  },
  add: {
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addText: {
    color: colors.surface,
    fontWeight: "700",
  },
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  loader: {
    marginTop: spacing.xl,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  empty: {
    color: colors.muted,
    padding: spacing.xl,
    textAlign: "center",
  },
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
  },
});
