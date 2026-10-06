import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  broadcastNotification,
  getAdminStats,
  getProductGrowth,
  getRevenue,
  type GrowthPoint,
  type RevenuePoint,
} from "../lib/admin-api";
import { useAuth } from "../providers/auth-provider";
import { keys } from "./query-keys";

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function useAdminEnabled() {
  const { status, isAdmin } = useAuth();
  return status === "signedIn" && isAdmin;
}

/** The API groups by exact timestamp, so totals are bucketed by month here. */
function byMonth<T extends { createdAt: string }>(points: T[] | undefined, read: (point: T) => number) {
  const totals = new Array<number>(12).fill(0);
  for (const point of points ?? []) {
    const month = new Date(point.createdAt).getMonth();
    if (month >= 0) totals[month] += read(point);
  }
  return totals.map((value, index) => ({ label: MONTHS[index], value }));
}

export function useAdminOverview(year: number) {
  const enabled = useAdminEnabled();
  const stats = useQuery({ queryKey: keys.admin("stats"), queryFn: getAdminStats, enabled });
  const revenue = useQuery({
    queryKey: keys.admin("revenue", year),
    queryFn: () => getRevenue(year),
    enabled,
  });
  const growth = useQuery({
    queryKey: keys.admin("growth", year),
    queryFn: () => getProductGrowth(year),
    enabled,
  });

  const revenueByMonth = useMemo(
    () => byMonth<RevenuePoint>(revenue.data, (point) => Number(point._sum?.amount ?? 0)),
    [revenue.data],
  );
  const growthByMonth = useMemo(
    () => byMonth<GrowthPoint>(growth.data, (point) => point._count?.id ?? 0),
    [growth.data],
  );

  return { stats, revenue, growth, revenueByMonth, growthByMonth };
}

export function useBroadcast() {
  return useMutation({ mutationFn: broadcastNotification });
}
