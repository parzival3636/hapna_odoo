"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  userInitial: string | null;
}

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/profile", label: "My Bookings", matchPaths: ["/profile", "/booking"] },
];

export function CustomerNavbar({ userInitial }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (link: typeof NAV_LINKS[0]) => {
    if (link.matchPaths) {
      return link.matchPaths.some((p) => pathname.startsWith(p));
    }
    return pathname.startsWith(link.href);
  };

  return (
    <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm text-sm antialiased">
      <nav className="max-w-screen-2xl mx-auto px-6 md:px-12 flex justify-between items-center h-16">
        {/* Brand */}
        <Link href="/services" className="text-2xl font-bold tracking-tight text-indigo-600">
          Hapna
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-all duration-200 active:scale-95 pb-1 ${
                  active
                    ? "text-indigo-600 font-semibold border-b-2 border-indigo-600"
                    : "text-slate-600 hover:text-indigo-500 border-b-2 border-transparent"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {userInitial ? (
            <>
              <button className="text-slate-500 hover:text-indigo-600 p-2 rounded-full transition-colors hidden md:flex">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <Link href="/profile" className="focus:outline-none">
                <div className={`w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md active:scale-95 transition-transform duration-150 ${
                  pathname.startsWith("/profile") ? "ring-2 ring-indigo-300 ring-offset-2" : ""
                }`}>
                  {userInitial}
                </div>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-slate-600 font-medium hover:text-indigo-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all active:scale-95 shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
