import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const ROLE_DASHBOARDS: Record<string, string> = {
  admin: "/admin",
  organiser: "/dashboard",
  customer: "/services",
};

const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

async function getUserRole(
  supabase: Awaited<ReturnType<typeof updateSession>>["supabase"],
  userId: string
): Promise<string> {
  // Try JWT claim first (if JWT hook is configured)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const jwtRole = user?.app_metadata?.role;
  if (jwtRole) return jwtRole;

  // Fallback: query user_profiles table
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", userId)
    .single();

  return profile?.role || "customer";
}

export async function middleware(request: NextRequest) {
  const { supabase, user, supabaseResponse } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Auth pages: redirect authenticated users to their dashboard
  if (AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    if (user) {
      const role = await getUserRole(supabase, user.id);
      const dest = ROLE_DASHBOARDS[role] || "/services";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return supabaseResponse;
  }

  // Verify OTP, auth callback, and landing page: allow without auth
  if (
    pathname.startsWith("/verify-otp") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/landing")
  ) {
    return supabaseResponse;
  }

  // Protected routes: require auth
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = await getUserRole(supabase, user.id);

  // Admin routes
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(
      new URL("/login?error=unauthorized", request.url)
    );
  }

  // Organiser routes
  if (pathname.startsWith("/dashboard") && role !== "organiser") {
    return NextResponse.redirect(
      new URL("/login?error=unauthorized", request.url)
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
