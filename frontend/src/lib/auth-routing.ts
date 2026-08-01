import type { AppUser } from "@/lib/auth-api";

export function getAuthenticatedHome(user: Pick<AppUser, "role">) {
  return user.role === "ADMIN" ? "/admin" : "/dashboard";
}
