import { useMutation } from "@tanstack/react-query";
import { deleteAsset, updateAsset } from "../lib/assets-api";
import type { LifecycleStatus } from "../lib/types";
import { useInvalidate } from "./query-keys";

/** Changes made from the asset detail screen. */
export function useAssetActions(id: string) {
  const invalidate = useInvalidate();

  const setLifecycle = useMutation({
    mutationFn: (lifecycleStatus: LifecycleStatus) => updateAsset(id, { lifecycleStatus }),
    onSuccess: () => invalidate.assets(),
  });

  const remove = useMutation({
    mutationFn: () => deleteAsset(id),
    onSuccess: () => Promise.all([invalidate.assets(), invalidate.claims()]),
  });

  return { setLifecycle, remove };
}
