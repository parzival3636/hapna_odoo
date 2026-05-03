import Link from "next/link";
import { ArrowUpRight, Zap } from "lucide-react";

export function CTABanner() {
  return (
    <section className="py-32 font-body bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="bg-slate-50 rounded-[3rem] p-16 lg:p-24 text-center text-slate-900 relative overflow-hidden shadow-card-hover border border-slate-200">
          {/* Neural pattern background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] border border-brand-primary/10 rounded-full -mr-32 -mt-32 bg-brand-primary/5" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] border border-brand-primary/10 rounded-full -ml-20 -mb-20 bg-brand-primary/5" />
          </div>

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-pill text-[10px] font-black tracking-[0.2em] uppercase mb-10 border border-slate-200 shadow-sm">
              <Zap className="w-3 h-3 fill-brand-primary text-brand-primary" />
              Scale your operation
            </span>
            
            <h2 className="text-4xl lg:text-6xl font-heading font-black mb-8 tracking-tight leading-[1.1]">
              Ready to automate your <br />
              <span className="text-brand-primary font-black italic">Scheduling DNA?</span>
            </h2>
            
            <p className="text-lg mb-12 text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
              Join 500+ enterprises that have engineered their workflow with Hapna. 
              Deploy your first autonomous agent in less than 5 minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/signup"
                className="bg-brand-soft text-brand-primary text-[10px] font-black uppercase tracking-widest px-12 py-5 rounded-[1.5rem] hover:bg-brand-primary hover:text-white hover:shadow-2xl hover:shadow-brand-primary/40 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                Start Free Deployment <ArrowUpRight className="w-4 h-4" />
              </Link>
              <button className="bg-white text-slate-600 text-[10px] font-black uppercase tracking-widest px-12 py-5 rounded-[1.5rem] border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95 shadow-sm">
                Request Architecture Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
