"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/app/actions/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: "📊" },
    { name: "Organizations", href: "/admin/organizations", icon: "🏢" },
    { name: "Users & Roles", href: "/admin/users", icon: "👥" },
    { name: "Services", href: "/admin/services", icon: "⚙️" },
  ];

  async function handleSignOut() {
    await logoutUser();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,15,0.8)] p-6 flex flex-col">
        <h1 className="text-xl font-bold mb-8">Admin Panel</h1>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-[#7c3aed] text-white"
                    : "text-[#94a3b8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] rounded-xl transition-colors"
        >
          <span>🚪</span>
          Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
