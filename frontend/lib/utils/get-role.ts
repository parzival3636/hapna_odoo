import Cookies from "js-cookie";

/**
 * Get the current user's role from the cookie.
 * This replaces the old Supabase-based role lookup.
 */
export function getUserRoleFromCookie(): string {
  return Cookies.get("user_role") || "customer";
}

export const ROLE_DASHBOARDS: Record<string, string> = {
  admin: "/admin",
  organiser: "/dashboard/services",
  customer: "/services",
};
