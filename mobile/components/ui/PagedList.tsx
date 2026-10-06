import type { ReactElement } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import type { PagedQuery } from "../../hooks/use-paged-query";
import { colors, spacing } from "../../lib/theme";
import { ErrorState, LoadingState } from "./ScreenStates";

type Props<T> = {
  query: PagedQuery<T>;
  renderItem: (item: T, index: number) => ReactElement | null;
  keyExtractor: (item: T) => string;
  header?: ReactElement | null;
  empty: ReactElement;
  /** Extra space at the end, for example under a floating action button. */
  bottomInset?: number;
};

/** A FlatList bound to a paged query: pull to refresh, infinite scroll, and states. */
export function PagedList<T>({
  query,
  renderItem,
  keyExtractor,
  header,
  empty,
  bottomInset = 0,
}: Props<T>) {
  const initialError = query.isError && query.items.length === 0;
  return (
    <FlatList
      data={initialError ? [] : query.items}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => renderItem(item, index)}
      ListHeaderComponent={header}
      ListHeaderComponentStyle={styles.header}
      ListEmptyComponent={
        query.isPending ? (
          <LoadingState />
        ) : initialError ? (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        ) : (
          empty
        )
      }
      ListFooterComponent={
        query.isFetchingNextPage ? (
          <View style={styles.footer}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null
      }
      ItemSeparatorComponent={Separator}
      contentContainerStyle={[styles.content, { paddingBottom: spacing.xl + bottomInset }]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onEndReached={query.loadMore}
      onEndReachedThreshold={0.4}
      refreshControl={
        <RefreshControl
          refreshing={query.isRefreshing}
          onRefresh={() => void query.refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: spacing.md, paddingBottom: spacing.xl },
  header: { marginBottom: spacing.md },
  separator: { height: spacing.sm },
  footer: { paddingVertical: spacing.lg },
});
