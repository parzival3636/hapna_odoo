import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Get user role for redirect
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        const role = profile?.role || "customer";
        const dashboardMap: Record<string, string> = {
          admin: "/admin",
          organiser: "/dashboard",
          customer: "/services",
        };

        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";

        if (isLocalEnv) {
          return NextResponse.redirect(
            new URL(dashboardMap[role] || next, origin)
          );
        } else if (forwardedHost) {
          return NextResponse.redirect(
            new URL(dashboardMap[role] || next, `https://${forwardedHost}`)
          );
        } else {
          return NextResponse.redirect(
            new URL(dashboardMap[role] || next, origin)
          );
        }
      }
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=auth_callback_error", origin)
  );
}
