"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronRight } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-slate-100 bg-white/70 backdrop-blur-2xl font-body">
      <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
        {/* Left: Logo + Links */}
        <div className="flex items-center gap-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center group-hover:rotate-12 transition-all shadow-sm">
              <span className="text-brand-primary font-heading font-black text-xl leading-none">H</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-heading font-black tracking-tight text-slate-900 leading-none">Hapna</span>
              <span className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-400 mt-1">Lattice Network</span>
            </div>
          </Link>
          <div className="hidden lg:flex gap-10 items-center">
            {["Features", "Workflow", "Omnichannel", "Scalability"].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-all relative group/nav"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary group-hover/nav:w-full transition-all duration-300" />
              </a>
            ))}
          </div>
        </div>

        {/* Right: Auth */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/login"
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-all px-4 py-2"
          >
            Terminal Login
          </Link>
          <Link
            href="/signup"
            className="bg-slate-50 border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest px-10 py-4 rounded-[1.25rem] hover:bg-slate-100 transition-all active:scale-95 flex items-center gap-2 shadow-sm"
          >
            Deploy Now <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-8 py-10 space-y-8 animate-in slide-in-from-top-4 duration-300">
          {["Features", "Workflow", "Omnichannel", "Scalability"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="block text-xs font-black uppercase tracking-widest text-slate-900">{item}</a>
          ))}
          <div className="h-px bg-slate-100" />
          <Link href="/login" className="block text-xs font-black uppercase tracking-widest text-slate-900">Terminal Login</Link>
          <Link
            href="/signup"
            className="block w-full text-center bg-brand-soft text-brand-primary text-[10px] font-black uppercase tracking-widest px-8 py-5 rounded-2xl shadow-sm"
          >
            Deploy Now
          </Link>
        </div>
      )}
    </nav>
  );
}
