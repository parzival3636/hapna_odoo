import { ReactNode } from "react";
import Link from "next/link";
import { getUserRole } from "@/lib/utils/get-role";
import { CustomerNavbar } from "@/app/components/customer/CustomerNavbar";
import { AiAssistantWidget } from "@/app/components/customer/AiAssistantWidget";

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await getUserRole();
  const userInitial = user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || (user ? "C" : null);

  return (
    <div className="bg-[#f8f9ff] text-slate-900 flex flex-col min-h-screen">
      {/* Shared Navbar */}
      <CustomerNavbar userInitial={userInitial} />

      <main className="flex-grow pt-4 pb-20 px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
        {children}
      </main>

      {/* AI Assistant Floating Widget */}
      <AiAssistantWidget />

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />

      <footer className="w-full py-8 bg-white border-t border-slate-100 text-xs tracking-wide uppercase mt-auto hidden md:block">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <span className="font-bold text-slate-900">© 2026 Hapna</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400 normal-case italic">Effortless Precision.</span>
          </div>
          <div className="flex gap-8 items-center">
            <a className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer" href="#">Help</a>
            <a className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer" href="#">Privacy</a>
            <a className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer" href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Mobile bottom nav extracted as a client component inline */
function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 w-full z-50 md:hidden bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 w-full px-4">
        <Link className="flex flex-col items-center justify-center text-indigo-600 active:scale-95 transition-transform" href="/services">
          <span className="material-symbols-outlined">search</span>
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Explore</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-slate-400 active:scale-95 transition-transform" href="/profile">
          <span className="material-symbols-outlined">event_note</span>
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Bookings</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-slate-400 active:scale-95 transition-transform" href="/profile">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
