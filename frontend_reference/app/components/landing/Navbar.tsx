"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Left: Logo + Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
            Hapna
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-[#3525cd] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-[#3525cd] transition-colors">
              How it works
            </a>
            <a href="#channels" className="text-sm font-semibold text-slate-600 hover:text-[#3525cd] transition-colors">
              Channels
            </a>
            <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-[#3525cd] transition-colors">
              Pricing
            </a>
          </div>
        </div>

        {/* Right: Auth */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-600 px-4 py-2 hover:bg-slate-50 rounded-full transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-[#4F46E5] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-3 animate-in slide-in-from-top">
          <a href="#features" className="block text-sm font-medium text-slate-600 py-2">Features</a>
          <a href="#how-it-works" className="block text-sm font-medium text-slate-600 py-2">How it works</a>
          <a href="#channels" className="block text-sm font-medium text-slate-600 py-2">Channels</a>
          <a href="#pricing" className="block text-sm font-medium text-slate-600 py-2">Pricing</a>
          <hr className="border-slate-100" />
          <Link href="/login" className="block text-sm font-medium text-slate-600 py-2">Sign In</Link>
          <Link
            href="/signup"
            className="block w-full text-center bg-[#4F46E5] text-white text-sm font-semibold px-6 py-2.5 rounded-full"
          >
            Get Started Free
          </Link>
        </div>
      )}
    </nav>
  );
}
