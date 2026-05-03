import Image from "next/image";
import { Sparkles, MessageSquare, AlertCircle, ArrowRight, Zap } from "lucide-react";

export function Hero() {
  return (
    <header className="relative pt-48 pb-32 overflow-hidden font-body bg-white">
      {/* Background visual anchors */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-[120px] -mr-96 -mt-96 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-secondary/5 rounded-full blur-[100px] -ml-72 -mb-72 pointer-events-none" />
      
      {/* Grid texture */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-24 items-center relative z-10">
        {/* Left: Copy */}
        <div className="animate-in fade-in slide-in-from-left-12 duration-1000">
          <span className="inline-flex items-center gap-3 px-5 py-2 bg-brand-soft text-brand-primary rounded-pill text-[10px] font-black tracking-[0.2em] uppercase mb-10 border border-brand-primary/10">
            <Zap className="w-4 h-4 fill-brand-primary" />
            Lattice Protocol v4.0
          </span>

          <h1 className="text-6xl lg:text-8xl font-heading font-black text-slate-900 mb-10 leading-[0.95] tracking-tighter">
            Autonomous<br />
            <span className="text-brand-primary">Scheduling</span><br />
            Orchestration.
          </h1>

          <p className="text-xl lg:text-2xl text-slate-500 mb-14 max-w-xl leading-relaxed font-medium">
            The world&apos;s first neural scheduling engine. Let AI orchestrate your
            entire operation while you scale with sub-second precision.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-5 mb-16 p-2.5 bg-white border border-slate-100 rounded-[2.5rem] shadow-card focus-within:border-brand-primary/30 transition-all max-w-xl group/cta">
            <input
              type="email"
              placeholder="Enter your professional email"
              className="flex-grow px-8 py-5 rounded-[1.75rem] outline-none transition-all text-slate-900 placeholder:text-slate-400 font-bold bg-slate-50 group-focus-within/cta:bg-white"
            />
            <button className="bg-slate-50 border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest px-12 py-5 rounded-[1.75rem] hover:bg-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all whitespace-nowrap active:scale-95 flex items-center gap-4">
              Initialize Deployment <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-8">
            <div className="flex -space-x-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-14 h-14 rounded-[1.25rem] border-4 border-white overflow-hidden shadow-card group/avatar hover:-translate-y-1 transition-all">
                  <Image
                    src={`https://i.pravatar.cc/150?u=${i + 20}`}
                    alt="User"
                    width={56}
                    height={56}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              ))}
            </div>
            <div className="h-10 w-px bg-slate-100" />
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">
                Security Validated
              </p>
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
                500+ Enterprise Nodes
              </p>
            </div>
          </div>
        </div>

        {/* Right: Dashboard mockup */}
        <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-200">
          {/* Main dashboard container */}
          <div className="bg-white rounded-[4rem] shadow-card-hover border border-slate-100 p-4 lg:p-6 relative z-10 group/mockup">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent rounded-[4rem] opacity-0 group-hover/mockup:opacity-100 transition-opacity duration-1000" />
            
            <div className="bg-slate-50 rounded-[3rem] overflow-hidden relative shadow-2xl border border-slate-200">
              <div className="h-12 bg-white/80 backdrop-blur-sm border-b border-slate-100 flex items-center px-8 gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="ml-4 h-5 w-40 bg-slate-100 rounded-full" />
              </div>
              <div className="p-2">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJJ92NevtGFRVFtWeJ8H-Xp7TVBT3Gv9mINpVZwJpru10GEmFR0PO6_pODK1GEYZmgLe0GvApFRxoVjdrkxQoHYN4L0timAQPKNKwUFfojVioyiZcmVJVRFBT2wgT-P5FwdGLbBZgETan6qkRIyTy-k2w2p7v7cKcwMTspQyoS9v-JOEmCb4ZWnsjEVZXnGtAGTQhKUsA3KScyRo8UBNtgBXv1yhaSnKWCCK03_6tRMwAZDOvVfKqoYhzdF5ox47OXyVlLOB4vWg"
                  alt="Hapna Engine"
                  width={800}
                  height={600}
                  className="w-full h-auto rounded-[2rem] shadow-sm brightness-95 contrast-110"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Floating Card: AI Bot */}
          <div className="absolute -left-16 top-1/4 bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-card-hover border border-white/50 max-w-[320px] hover:-translate-y-3 transition-all duration-700 z-20 group">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-14 h-14 bg-brand-soft rounded-2xl flex items-center justify-center text-brand-primary shadow-xl shadow-slate-200 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-[0.25em] uppercase text-brand-primary">Neural Mesh</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Response</p>
                </div>
              </div>
            </div>
            <p className="text-base font-bold text-slate-800 leading-relaxed">
              &ldquo;Scheduling anomaly resolved. Re-routing all high-priority nodes to the next available block.&rdquo;
            </p>
          </div>

          {/* Floating Card: Risk Analysis */}
          <div className="absolute -right-12 bottom-1/4 bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-card-hover border border-white/50 max-w-[280px] hover:-translate-y-3 transition-all duration-700 z-20 group">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Risk Matrix</span>
              </div>
              <span className="text-red-600 font-black text-[9px] uppercase tracking-widest bg-red-50 px-3 py-1.5 rounded-full border border-red-100">Critical</span>
            </div>
            <h4 className="text-xl font-heading font-black text-slate-900 mb-3 tracking-tight">Churn Alert</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">
              Predictive engine flags 85% probability of session abandonment.
            </p>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 w-[85%] rounded-full group-hover:w-full transition-all duration-1000" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
