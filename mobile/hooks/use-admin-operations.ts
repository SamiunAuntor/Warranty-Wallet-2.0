import { useMutation } from "@tanstack/react-query";
import {
  deleteAdminAsset,
  deleteAdminUser,
  getAdminAssets,
  getAdminClaims,
  getAdminPayments,
  getAdminUsers,
  setUserBlocked,
  updateAdminClaimStatus,
} from "../lib/admin-api";
import type { ClaimStatus, PaymentStatus, UserStatus } from "../lib/types";
import { useAuth } from "../providers/auth-provider";
import { keys, useInvalidate } from "./query-keys";
import { usePagedQuery } from "./use-paged-query";

function useAdminEnabled() {
  const { status, isAdmin } = useAuth();
  return status === "signedIn" && isAdmin;
}

export function useAdminUsers(search: string, status?: UserStatus) {
  return usePagedQuery(
    keys.admin("users", search, status),
    (page) => getAdminUsers({ page, search, status }),
    { enabled: useAdminEnabled() },
  );
}

export function useAdminAssets(search: string) {
  return usePagedQuery(
    keys.admin("assets", search),
    (page) => getAdminAssets({ page, search }),
    { enabled: useAdminEnabled() },
  );
}

export function useAdminClaims(search: string, status?: ClaimStatus) {
  return usePagedQuery(
    keys.admin("claims", search, status),
    (page) => getAdminClaims({ page, search, status }),
    { enabled: useAdminEnabled() },
  );
}

export function useAdminPayments(search: string, status?: PaymentStatus) {
  return usePagedQuery(
    keys.admin("payments", search, status),
    (page) => getAdminPayments({ page, search, status }),
    { enabled: useAdminEnabled() },
  );
}

export function useAdminActions() {
  const invalidate = useInvalidate();
  const refresh = () => invalidate.admin();
  return {
    setBlocked: useMutation({
      mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) => setUserBlocked(id, blocked),
      onSuccess: refresh,
    }),
    deleteUser: useMutation({ mutationFn: deleteAdminUser, onSuccess: refresh }),
    deleteAsset: useMutation({ mutationFn: deleteAdminAsset, onSuccess: refresh }),
    setClaimStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: ClaimStatus }) =>
        updateAdminClaimStatus(id, status),
      onSuccess: refresh,
    }),
  };
}
