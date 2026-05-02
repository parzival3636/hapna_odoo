import { createClient as createSupabaseClient } from "@/lib/supabase/client";

/**
 * Get the user's role. Tries multiple sources in order:
 * 1. JWT app_metadata.role (fastest, set by JWT hook)
 * 2. user_profiles table (authoritative source)
 * 3. user_metadata.role (set during signup, fallback)
 * 4. Default: 'customer'
 */
export async function getUserRole(supabase?: ReturnType<typeof createSupabaseClient>): Promise<{
  role: string;
  user: { id: string; email: string; name: string } | null;
}> {
  const client = supabase || createSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { role: "customer", user: null };
  }

  const userInfo = {
    id: user.id,
    email: user.email || "",
    name: (user.user_metadata?.full_name as string) || "",
  };

  // 1. Try JWT claim (from custom access token hook)
  const jwtRole = user.app_metadata?.role as string | undefined;
  if (jwtRole && ["customer", "organiser", "admin"].includes(jwtRole)) {
    return { role: jwtRole, user: userInfo };
  }

  // 2. Try user_profiles table
  const { data: profile, error } = await client
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!error && profile?.role) {
    return { role: profile.role, user: userInfo };
  }

  // 3. Fallback to user_metadata (set during signup)
  const metaRole = user.user_metadata?.role as string | undefined;
  if (metaRole && ["customer", "organiser", "admin"].includes(metaRole)) {
    return { role: metaRole, user: userInfo };
  }

  // 4. Default
  return { role: "customer", user: userInfo };
}

export const ROLE_DASHBOARDS: Record<string, string> = {
  admin: "/admin",
  organiser: "/dashboard",
  customer: "/services",
};
