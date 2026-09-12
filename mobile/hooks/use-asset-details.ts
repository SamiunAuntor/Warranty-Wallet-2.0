import { useCallback, useEffect, useState } from "react";
import {
  deleteAsset,
  getAsset,
  getCategories,
  updateAsset,
  type Asset,
  type Category,
} from "../lib/assets-api";
import { useAuth } from "../providers/auth-provider";

export function useAssetDetails(id: string | undefined) {
  const { user } = useAuth();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user || !id) return;

    try {
      const token = await user.getIdToken();
      const [nextAsset, catalog] = await Promise.all([getAsset(token, id), getCategories()]);
      setAsset(nextAsset);
      setCategories(catalog);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load asset.");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (input: Parameters<typeof updateAsset>[2]) => {
      if (!user || !asset) return;

      setSaving(true);

      try {
        setAsset(await updateAsset(await user.getIdToken(), asset.id, input));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not update asset.");
      } finally {
        setSaving(false);
      }
    },
    [asset, user],
  );

  const remove = useCallback(async () => {
    if (!user || !asset) return;

    await deleteAsset(await user.getIdToken(), asset.id);
  }, [asset, user]);

  return { asset, categories, error, loading, remove, save, saving };
}
