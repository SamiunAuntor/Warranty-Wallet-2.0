import { Pencil, Plus, Tags, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AdminGate } from "../../components/AdminGate";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Segmented } from "../../components/ui/Chips";
import { SearchBar } from "../../components/ui/Display";
import { IconButton } from "../../components/ui/IconButton";
import { EmptyState, ErrorState, InlineMessage, LoadingState } from "../../components/ui/ScreenStates";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { Sheet } from "../../components/ui/Sheet";
import { Text } from "../../components/ui/Text";
import { TextField } from "../../components/ui/TextField";
import {
  useAdminCatalog,
  useCatalogActions,
  type CatalogItem,
  type CatalogKind,
} from "../../hooks/use-admin-catalog";
import { useDebouncedValue } from "../../hooks/use-debounced-value";
import { errorMessage } from "../../lib/api";
import { confirm } from "../../lib/confirm";
import { colors, spacing } from "../../lib/theme";
import { useToast } from "../../providers/toast-provider";

export default function AdminCatalogScreen() {
  return (
    <AdminGate>
      <Catalog />
    </AdminGate>
  );
}

type Editing = { item?: CatalogItem } | null;

function Catalog() {
  const toast = useToast();
  const [kind, setKind] = useState<CatalogKind>("category");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Editing>(null);
  const debounced = useDebouncedValue(search.trim());
  const catalog = useAdminCatalog(kind, debounced);
  const actions = useCatalogActions(kind);
  const noun = kind === "category" ? "category" : "brand";

  async function remove(item: CatalogItem) {
    const ok = await confirm({
      title: `Delete ${item.name}?`,
      message: item._count?.products
        ? `${item._count.products} assets use this ${noun}. Consider turning it off instead.`
        : undefined,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    actions.remove.mutate(item.id, {
      onSuccess: () => toast.success(`${item.name} deleted.`),
      onError: (error) => toast.error(error, `Could not delete the ${noun}.`),
    });
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <ScreenHeader
        title="Catalog"
        fallbackHref="/(app)/admin"
        actions={<IconButton icon={Plus} label={`Add ${noun}`} tone="primary" onPress={() => setEditing({})} />}
      />
      <FlatList
        data={catalog.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={catalog.isRefetching}
            onRefresh={() => void catalog.refetch()}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Segmented<CatalogKind>
              options={[
                { value: "category", label: "Categories" },
                { value: "brand", label: "Brands" },
              ]}
              value={kind}
              onChange={setKind}
            />
            <SearchBar value={search} onChangeText={setSearch} placeholder={`Search ${noun === "category" ? "categories" : "brands"}`} />
          </View>
        }
        ListEmptyComponent={
          catalog.isPending ? (
            <LoadingState />
          ) : catalog.isError ? (
            <ErrorState error={catalog.error} onRetry={() => void catalog.refetch()} />
          ) : (
            <EmptyState
              icon={Tags}
              title={`No ${noun === "category" ? "categories" : "brands"} yet`}
              actionLabel={`Add ${noun}`}
              onAction={() => setEditing({})}
            />
          )
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text variant="subheading">{item.name}</Text>
                <Text variant="caption" numberOfLines={2}>
                  {item.description || "No description"}
                  {item._count ? ` · ${item._count.products} assets` : ""}
                </Text>
              </View>
              <Switch
                accessibilityLabel={`${item.name} active`}
                value={item.isActive}
                trackColor={{ true: colors.primary, false: colors.borderStrong }}
                thumbColor={colors.white}
                onValueChange={(isActive) =>
                  actions.setActive.mutate(
                    { id: item.id, isActive },
                    { onError: (error) => toast.error(error, `Could not update the ${noun}.`) },
                  )
                }
              />
            </View>
            <View style={styles.actions}>
              <Button title="Edit" icon={Pencil} size="sm" variant="outline" style={styles.flex} onPress={() => setEditing({ item })} />
              <Button title="Delete" icon={Trash2} size="sm" variant="dangerOutline" style={styles.flex} onPress={() => void remove(item)} />
            </View>
          </Card>
        )}
      />
      <CatalogEditor kind={kind} editing={editing} onClose={() => setEditing(null)} />
    </SafeAreaView>
  );
}

function CatalogEditor({
  kind,
  editing,
  onClose,
}: {
  kind: CatalogKind;
  editing: Editing;
  onClose: () => void;
}) {
  const toast = useToast();
  const { save } = useCatalogActions(kind);
  const item = editing?.item;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [openedFor, setOpenedFor] = useState<Editing>(null);

  // Reset the fields each time the sheet opens for a different item.
  if (editing !== openedFor) {
    setOpenedFor(editing);
    setName(item?.name ?? "");
    setDescription(item?.description ?? "");
    setWebsiteUrl(item && "websiteUrl" in item ? (item.websiteUrl ?? "") : "");
    setError(null);
  }

  async function submit() {
    if (name.trim().length < 2) {
      setError("Enter a name of at least 2 characters.");
      return;
    }
    if (websiteUrl.trim() && !/^https?:\/\//i.test(websiteUrl.trim())) {
      setError("Website must start with http:// or https://");
      return;
    }
    try {
      await save.mutateAsync({
        id: item?.id,
        input: {
          name: name.trim(),
          description: description.trim() || null,
          ...(kind === "brand" ? { websiteUrl: websiteUrl.trim() || null } : {}),
        },
      });
      toast.success(item ? "Saved." : "Added.");
      onClose();
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }

  const noun = kind === "category" ? "category" : "brand";
  return (
    <Sheet visible={editing !== null} onClose={onClose} title={item ? `Edit ${noun}` : `New ${noun}`}>
      <View style={styles.editor}>
        <InlineMessage message={error} />
        <TextField label="Name" value={name} onChangeText={setName} />
        <TextField label="Description" optional multiline value={description} onChangeText={setDescription} />
        {kind === "brand" ? (
          <TextField
            label="Website"
            optional
            autoCapitalize="none"
            keyboardType="url"
            placeholder="https://"
            value={websiteUrl}
            onChangeText={setWebsiteUrl}
          />
        ) : null}
        <Button title={item ? "Save changes" : `Add ${noun}`} loading={save.isPending} fullWidth onPress={() => void submit()} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.canvas, flex: 1 },
  content: { flexGrow: 1, padding: spacing.md, paddingBottom: spacing.xl },
  header: { gap: spacing.md, marginBottom: spacing.md },
  separator: { height: spacing.sm },
  row: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  editor: { gap: spacing.md, paddingBottom: spacing.sm },
});
