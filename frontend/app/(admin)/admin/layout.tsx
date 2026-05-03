"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/app/actions/auth";
import { LogOut, ChevronRight, LayoutDashboard, Building2, Users, Briefcase } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, color: "text-teal-500" },
    { name: "Organizations", href: "/admin/organizations", icon: Building2, color: "text-indigo-500" },
    { name: "Users & Roles", href: "/admin/users", icon: Users, color: "text-amber-500" },
    { name: "Services", href: "/admin/services", icon: Briefcase, color: "text-coral-500" },
  ];

  async function handleSignOut() {
    await logoutUser();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-body">
      {/* Sidebar - Light & Contained */}
      <aside className="w-64 bg-white m-4 rounded-[2rem] flex flex-col shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-200">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-3 mb-10 group">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-heading font-black text-lg group-hover:scale-110 transition-transform">H</div>
            <h1 className="text-xl font-heading font-bold tracking-tight text-slate-900">Admin Hub</h1>
          </Link>
          
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${item.color} ${isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`} />
                  <span className={`text-sm font-medium ${isActive ? "font-bold" : ""}`}>
                    {item.name}
                  </span>
                  {isActive && (
                    <ChevronRight className="ml-auto w-4 h-4 text-slate-500" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-500 hover:text-red-600 transition-colors group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
