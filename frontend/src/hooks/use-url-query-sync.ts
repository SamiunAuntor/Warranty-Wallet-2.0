"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const positivePage = (value: string | null) => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export function useUrlQuerySync(values: Record<string, string | number | undefined>) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serializedValues = JSON.stringify(values);
  const currentQuery = searchParams.toString();

  useEffect(() => {
    const next = new URLSearchParams(currentQuery);
    const entries = JSON.parse(serializedValues) as Record<string, string | number | undefined>;
    for (const [key, value] of Object.entries(entries)) {
      if (value === undefined || value === "" || (key === "page" && value === 1)) next.delete(key);
      else next.set(key, String(value));
    }
    const query = next.toString();
    if (query !== currentQuery) router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [currentQuery, pathname, router, serializedValues]);
}
