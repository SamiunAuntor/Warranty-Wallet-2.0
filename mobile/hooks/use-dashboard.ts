import { useQuery } from "@tanstack/react-query";
import { getDashboard, getWarrantyHeatmap } from "../lib/dashboard-api";
import { keys, useSignedIn } from "./query-keys";

export const useDashboard = () =>
  useQuery({ queryKey: keys.dashboard, queryFn: getDashboard, enabled: useSignedIn() });

export const useWarrantyHeatmap = () =>
  useQuery({ queryKey: keys.heatmap, queryFn: getWarrantyHeatmap, enabled: useSignedIn() });
