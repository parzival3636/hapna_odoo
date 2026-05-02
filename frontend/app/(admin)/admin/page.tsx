"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/lib/utils/get-role";

interface UserInfo { email: string; name: string; role: string; }

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { role, user: u } = await getUserRole();
      if (!u) { router.push("/login"); return; }
      setUser({ email: u.email, name: u.name || "Admin", role });
    }
    loadUser();
  }, [router]);

  async function handleSignOut() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
            <p className="text-[#94a3b8]">Manage your platform</p>
          </div>
          <button onClick={handleSignOut} className="px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-[#94a3b8] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all text-sm">
            Sign Out
          </button>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user.name}</h2>
              <p className="text-sm text-[#94a3b8]">{user.email}</p>
            </div>
            <span className="role-badge admin ml-auto">{user.role}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {[
            { label: "Total Users", value: "—", icon: "👥" },
            { label: "Active Bookings", value: "—", icon: "📅" },
            { label: "Services", value: "—", icon: "⚙️" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-5">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-[#64748b]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
