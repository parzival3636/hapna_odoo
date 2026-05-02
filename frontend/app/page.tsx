import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ROLE_DASHBOARDS: Record<string, string> = {
  admin: "/admin",
  organiser: "/dashboard/services",
  customer: "/services",
};

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const role = cookieStore.get("user_role")?.value || "customer";

  if (!token) {
    redirect("/login");
  }

  redirect(ROLE_DASHBOARDS[role] || "/services");
}
