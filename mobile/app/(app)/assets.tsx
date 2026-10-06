import { router, useLocalSearchParams } from "expo-router";
import { Package } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AssetCard } from "../../components/assets/AssetCard";
import { TabScreen } from "../../components/navigation/TabBar";
import { ActionButton } from "../../components/ui/ActionButton";
import { Chips } from "../../components/ui/Chips";
import { SearchBar } from "../../components/ui/Display";
import { PagedList } from "../../components/ui/PagedList";
import { EmptyState } from "../../components/ui/ScreenStates";
import { PageTitle } from "../../components/ui/ScreenHeader";
import { useAssetList } from "../../hooks/use-assets";
import { useDebouncedValue } from "../../hooks/use-debounced-value";
import type { AssetQuery } from "../../lib/assets-api";
import { spacing } from "../../lib/theme";
import type { WarrantyStatus } from "../../lib/types";

type Filter = "ALL" | WarrantyStatus | "ARCHIVED";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "EXPIRING_SOON", label: "Expiring soon" },
  { value: "EXPIRED", label: "Expired" },
  { value: "NO_WARRANTY", label: "No warranty" },
  { value: "ARCHIVED", label: "Archived" },
];

const isFilter = (value: unknown): value is Filter =>
  FILTERS.some((filter) => filter.value === value);

export default function AssetsScreen() {
  const params = useLocalSearchParams<{ status?: string }>();
  const [filter, setFilter] = useState<Filter>(isFilter(params.status) ? params.status : "ALL");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());

  // Home links here with a status, for example "expiring soon".
  useEffect(() => {
    if (isFilter(params.status)) setFilter(params.status);
  }, [params.status]);

  const query = useMemo<AssetQuery>(() => {
    const next: AssetQuery = { search: debouncedSearch || undefined };
    if (filter === "ARCHIVED") next.lifecycleStatus = "ARCHIVED";
    else if (filter !== "ALL") next.warrantyStatus = filter;
    return next;
  }, [debouncedSearch, filter]);

  const assets = useAssetList(query);
  const filtered = Boolean(debouncedSearch) || filter !== "ALL";

  return (
    <TabScreen>
      <View style={styles.flex}>
        <PagedList
          query={assets}
          bottomInset={72}
          keyExtractor={(asset) => asset.id}
          renderItem={(asset) => (
            <AssetCard asset={asset} onPress={() => router.push(`/(app)/assets/${asset.id}`)} />
          )}
          header={
            <View style={styles.header}>
              <PageTitle
                overline="Inventory"
                title="Assets"
                subtitle={
                  assets.isPending
                    ? "Loading your purchases…"
                    : `${assets.total} ${assets.total === 1 ? "asset" : "assets"}${filtered ? " found" : " tracked"}`
                }
              />
              <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Search by name or brand"
              />
              <Chips options={FILTERS} value={filter} onChange={setFilter} scrollable />
            </View>
          }
          empty={
            filtered ? (
              <EmptyState
                icon={Package}
                title="No matching assets"
                message="Try a different search or filter."
              />
            ) : (
              <EmptyState
                icon={Package}
                title="No assets yet"
                message="Add a purchase to start tracking its warranty, receipts, and claims."
                actionLabel="Add your first asset"
                onAction={() => router.push("/(app)/assets/form")}
              />
            )
          }
        />
        <ActionButton label="Add asset" onPress={() => router.push("/(app)/assets/form")} />
      </View>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { gap: spacing.md },
});
