import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { getPreferences, updatePreferences } from "../lib/auth-api";
import { formatDate, formatDateTime, formatMoney } from "../lib/format";
import type { Currency, UserPreferences } from "../lib/types";
import { keys, useSignedIn } from "./query-keys";

export const usePreferences = () =>
  useQuery({ queryKey: keys.preferences, queryFn: getPreferences, enabled: useSignedIn() });

export function useSavePreferences() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Omit<UserPreferences, "id" | "userId">>) => updatePreferences(input),
    onSuccess: (saved) => client.setQueryData(keys.preferences, saved),
  });
}

/** Formatters that follow the user's currency and date-format preferences. */
export function useFormatters() {
  const { data } = usePreferences();
  const currency = data?.currency ?? "USD";
  const dateFormat = data?.dateFormat ?? "MMM_D_YYYY";
  return useMemo(
    () => ({
      currency,
      /** Pass a currency code to show an amount in its own currency, such as a payment. */
      money: (value: string | number | null | undefined, code?: string) =>
        formatMoney(value, (code?.toUpperCase() as Currency | undefined) ?? currency),
      date: (value: string | Date | null | undefined) => formatDate(value, dateFormat),
      dateTime: (value: string | Date | null | undefined) => formatDateTime(value, dateFormat),
    }),
    [currency, dateFormat],
  );
}
