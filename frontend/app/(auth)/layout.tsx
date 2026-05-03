import Link from "next/link";
import { Sparkles, Globe, Zap, Lock, Quote } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex font-body bg-white">
      {/* Left Panel — Brand Anchor */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden m-4 rounded-[2.5rem]">
        {/* Subtle geometric anchor */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] border border-white/5 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] border border-white/5 rounded-full -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          {/* Top: Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-brand-primary/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="text-white text-xl font-heading font-black tracking-tight">Hapna</span>
          </Link>

          {/* Center: System Character */}
          <div className="max-w-md">
            <h2 className="text-5xl font-heading font-black text-white mb-10 leading-[1.1] tracking-tight">
              One engine.<br />
              <span className="text-brand-primary">Infinite Reach.</span>
            </h2>
            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-primary/20 group-hover:border-brand-primary/50 transition-all">
                  <Globe className="w-6 h-6 text-white/80" />
                </div>
                <div>
                  <p className="text-white font-bold text-base mb-1">Omnichannel Intent</p>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">Capture bookings via Voice AI, SMS, or Web. Zero friction.</p>
                </div>
              </div>
              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-primary/20 group-hover:border-brand-primary/50 transition-all">
                  <Sparkles className="w-6 h-6 text-white/80" />
                </div>
                <div>
                  <p className="text-white font-bold text-base mb-1">Engage by Intelligence</p>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">ML-driven risk scoring flags potential no-shows in real-time.</p>
                </div>
              </div>
              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-primary/20 group-hover:border-brand-primary/50 transition-all">
                  <Lock className="w-6 h-6 text-white/80" />
                </div>
                <div>
                  <p className="text-white font-bold text-base mb-1">Atomic Slot Locking</p>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">Enterprise-grade reliability. Guaranteed zero double-bookings.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Minimal Proof */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <Quote className="w-8 h-8 text-brand-primary mb-4 opacity-50" />
            <p className="text-white/90 text-sm font-medium leading-relaxed italic mb-6">
              &ldquo;Hapna redefined our operational flow. It&apos;s the scheduling system we&apos;ve always wanted but could never find.&rdquo;
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-black">
                MT
              </div>
              <div>
                <p className="text-white text-sm font-bold">Marcus Thorne</p>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Director of Ops, ScaleUp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Interactive Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 py-16 relative">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-4 duration-700">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-12">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className="text-slate-900 text-xl font-heading font-black tracking-tight">Hapna</span>
            </Link>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 lg:p-12 shadow-card">
            {children}
          </div>

          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-12">
            Professional Scheduling Engine &copy; 2024
          </p>
        </div>
      </div>
    </div>
  );
}
