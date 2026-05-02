import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get role and redirect to dashboard
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

  redirect(dashboardMap[role] || "/services");
}
