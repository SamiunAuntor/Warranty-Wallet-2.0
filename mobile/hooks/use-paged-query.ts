import { keepPreviousData, useInfiniteQuery, type QueryKey } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Paginated } from "../lib/types";

/** Infinite scrolling over the API's page/limit pagination. */
export function usePagedQuery<T>(
  queryKey: QueryKey,
  fetchPage: (page: number) => Promise<Paginated<T>>,
  options: { enabled?: boolean } = {},
) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
    enabled: options.enabled ?? true,
    // Keep showing the current results while a new search or filter loads.
    placeholderData: keepPreviousData,
  });

  const items = useMemo(() => query.data?.pages.flatMap((page) => page.data) ?? [], [query.data]);

  return {
    ...query,
    items,
    total: query.data?.pages[0]?.meta.total ?? 0,
    /** True only for pull-to-refresh, not while loading the next page. */
    isRefreshing: query.isRefetching && !query.isFetchingNextPage && !query.isPlaceholderData,
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
    },
  };
}

export type PagedQuery<T> = ReturnType<typeof usePagedQuery<T>>;
