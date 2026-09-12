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
import { ClaimCard } from "../../components/claims/ClaimCard";
import { ClaimForm } from "../../components/claims/ClaimForm";
import { useClaims } from "../../hooks/use-claims";
import type { ClaimStatus } from "../../lib/claims-api";
import { colors, spacing } from "../../lib/theme";

export default function ClaimsScreen() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { addClaim, changeStatus, claims, error, loading } = useClaims(search);

  function handleStatusChange(claim: (typeof claims)[number], status: ClaimStatus) {
    void changeStatus(claim, status);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>WARRANTY SUPPORT</Text>
          <Text style={styles.title}>Claims</Text>
        </View>
        <Pressable onPress={() => setShowForm((value) => !value)} style={styles.add}>
          <Text style={styles.addText}>{showForm ? "Close" : "+ New"}</Text>
        </Pressable>
      </View>
      <TextInput
        onChangeText={setSearch}
        placeholder="Search claims"
        placeholderTextColor={colors.muted}
        style={styles.search}
        value={search}
      />
      {showForm ? (
        <ClaimForm
          onCreated={async (input) => {
            await addClaim(input);
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
          data={claims}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.empty}>No claims found.</Text>}
          renderItem={({ item }) => (
            <ClaimCard
              claim={item}
              onPress={() => router.push(`/(app)/claims/${item.id}`)}
              onStatusChange={(status) => handleStatusChange(item, status)}
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
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  loader: {
    marginTop: spacing.xl,
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
