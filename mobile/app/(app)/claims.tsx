import { router } from "expo-router";
import { ShieldCheck } from "lucide-react-native";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ClaimCard } from "../../components/claims/ClaimCard";
import { TabScreen } from "../../components/navigation/TabBar";
import { ActionButton } from "../../components/ui/ActionButton";
import { Chips } from "../../components/ui/Chips";
import { SearchBar } from "../../components/ui/Display";
import { PagedList } from "../../components/ui/PagedList";
import { EmptyState } from "../../components/ui/ScreenStates";
import { PageTitle } from "../../components/ui/ScreenHeader";
import { useClaimList } from "../../hooks/use-claims";
import { useDebouncedValue } from "../../hooks/use-debounced-value";
import { claimStatuses, claimStatusLabels } from "../../lib/labels";
import { spacing } from "../../lib/theme";
import type { ClaimStatus } from "../../lib/types";

type Filter = "ALL" | ClaimStatus;

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "ALL", label: "All" },
  ...claimStatuses.map((status) => ({ value: status, label: claimStatusLabels[status].label })),
];

export default function ClaimsScreen() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const query = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: filter === "ALL" ? undefined : filter,
    }),
    [debouncedSearch, filter],
  );
  const claims = useClaimList(query);
  const filtered = Boolean(debouncedSearch) || filter !== "ALL";

  return (
    <TabScreen>
      <View style={styles.flex}>
        <PagedList
          query={claims}
          bottomInset={72}
          keyExtractor={(claim) => claim.id}
          renderItem={(claim) => (
            <ClaimCard claim={claim} onPress={() => router.push(`/(app)/claims/${claim.id}`)} />
          )}
          header={
            <View style={styles.header}>
              <PageTitle
                overline="Warranty support"
                title="Claims"
                subtitle={
                  claims.isPending
                    ? "Loading your claims…"
                    : `${claims.total} ${claims.total === 1 ? "claim" : "claims"}`
                }
              />
              <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Search claims or assets"
              />
              <Chips options={FILTERS} value={filter} onChange={setFilter} scrollable />
            </View>
          }
          empty={
            filtered ? (
              <EmptyState
                icon={ShieldCheck}
                title="No matching claims"
                message="Try a different search or status."
              />
            ) : (
              <EmptyState
                icon={ShieldCheck}
                title="No claims yet"
                message="When a product needs repair or replacement, file a claim and keep every update and document together."
                actionLabel="File a claim"
                onAction={() => router.push("/(app)/claims/form")}
              />
            )
          }
        />
        <ActionButton label="New claim" onPress={() => router.push("/(app)/claims/form")} />
      </View>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { gap: spacing.md },
});
