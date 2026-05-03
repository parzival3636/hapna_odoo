"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/app/actions/auth";
import { LogOut, ChevronRight, LayoutGrid, ClipboardCheck, Calendar, BarChart3, Settings } from "lucide-react";

export default function OrganiserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Services", href: "/dashboard/services", icon: LayoutGrid, color: "text-brand-primary" },
    { name: "Bookings", href: "/dashboard/bookings", icon: ClipboardCheck, color: "text-brand-primary" },
    { name: "Calendar", href: "/dashboard/calendar", icon: Calendar, color: "text-brand-primary" },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3, color: "text-brand-primary" },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, color: "text-brand-primary" },
  ];

  async function handleSignOut() {
    await logoutUser();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-body">
      {/* Sidebar - Dark & Contained */}
      <aside className="w-72 bg-[#0F172A] m-5 rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden border border-white/5 relative">
        {/* Subtle Decorative Gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-secondary opacity-50" />
        
        <div className="p-10">
          <Link href="/" className="flex items-center gap-4 mb-16 group">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white font-heading font-black text-xl group-hover:rotate-12 transition-all shadow-lg shadow-brand-primary/20">H</div>
            <div className="flex flex-col">
              <h1 className="text-xl font-heading font-black tracking-tight text-white leading-none">Hapna</h1>
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 mt-1">Organiser Hub</span>
            </div>
          </Link>
          
          <nav className="space-y-3">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-brand-primary" : "text-slate-600 group-hover:text-slate-400"}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-white" : ""}`}>
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(91,78,232,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto p-10 pt-0">
          <div className="h-px bg-slate-800/50 w-full mb-10" />
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Sign Out Node
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
