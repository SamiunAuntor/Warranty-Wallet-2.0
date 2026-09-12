import { useCallback, useEffect, useState } from "react";
import {
  createBrand,
  createCategory,
  deleteBrand,
  deleteCategory,
  getAdminBrands,
  getAdminCategories,
  type CatalogItem,
} from "../lib/admin-api";
import { useAuth } from "../providers/auth-provider";

export function useAdminCatalog() {
  const { user, appUser } = useAuth();
  const [categories, setCategories] = useState<CatalogItem[]>([]);
  const [brands, setBrands] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user || appUser?.role !== "ADMIN") return;

    try {
      const token = await user.getIdToken();
      const [nextCategories, nextBrands] = await Promise.all([
        getAdminCategories(token),
        getAdminBrands(token),
      ]);
      setCategories(nextCategories);
      setBrands(nextBrands);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load catalog.");
    } finally {
      setLoading(false);
    }
  }, [appUser?.role, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const add = useCallback(
    async (kind: "category" | "brand", name: string, description: string) => {
      if (!user || !name.trim()) return;

      try {
        const token = await user.getIdToken();
        const item =
          kind === "category"
            ? await createCategory(token, name.trim(), description.trim())
            : await createBrand(token, name.trim(), description.trim());

        if (kind === "category") setCategories((current) => [item, ...current]);
        else setBrands((current) => [item, ...current]);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not create catalog item.");
      }
    },
    [user],
  );

  const remove = useCallback(
    async (item: CatalogItem, kind: "category" | "brand") => {
      if (!user) return;

      try {
        const token = await user.getIdToken();
        if (kind === "category") {
          await deleteCategory(token, item.id);
          setCategories((current) => current.filter((entry) => entry.id !== item.id));
        } else {
          await deleteBrand(token, item.id);
          setBrands((current) => current.filter((entry) => entry.id !== item.id));
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not delete item.");
      }
    },
    [user],
  );

  return { appUser, add, brands, categories, error, loading, remove };
}
