import { useCallback, useEffect, useState } from "react";
import {
  createAsset,
  deleteAsset,
  getAssets,
  getCategories,
  type Asset,
  type AssetInput,
  type Category,
} from "../lib/assets-api";
import { useAuth } from "../providers/auth-provider";

export function useAssets(search: string) {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const token = await user.getIdToken();
      const [list, catalog] = await Promise.all([getAssets(token, search), getCategories()]);

      setAssets(list.data);
      setCategories(catalog.filter((category) => category.isActive));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load assets.");
    } finally {
      setLoading(false);
    }
  }, [search, user]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void load();
    }, 250);

    return () => clearTimeout(timeout);
  }, [load]);

  const addAsset = useCallback(
    async (input: AssetInput) => {
      if (!user) throw new Error("You must be signed in to add an asset.");

      const asset = await createAsset(await user.getIdToken(), input);
      setAssets((current) => [asset, ...current]);
    },
    [user],
  );

  const removeAsset = useCallback(
    async (asset: Asset) => {
      if (!user) throw new Error("You must be signed in to delete an asset.");

      await deleteAsset(await user.getIdToken(), asset.id);
      setAssets((current) => current.filter((item) => item.id !== asset.id));
    },
    [user],
  );

  return {
    addAsset,
    assets,
    categories,
    error,
    loading,
    removeAsset,
    reload: load,
  };
}
