import Link from "next/link";
import { Globe, X, Mail, Cpu } from "lucide-react";

const footerLinks = {
  Infrastructure: ["Core Engine", "Orchestration", "Atomic API", "Enterprise"],
  Ecosystem: ["Documentation", "SDKs", "Status Hub", "Security"],
  Organization: ["Privacy", "Terms", "Ethical AI", "Contact"],
};

export function Footer() {
  return (
    <footer className="bg-slate-50 text-slate-600 py-24 border-t border-slate-200 font-body">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-16">
        {/* Brand Anchor */}
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-3 mb-8 group">
            <div className="w-8 h-8 rounded-lg bg-brand-soft flex items-center justify-center shadow-sm">
              <span className="text-brand-primary font-heading font-black text-lg">H</span>
            </div>
            <span className="text-xl font-heading font-bold tracking-tight text-slate-900">Hapna</span>
          </Link>
          <p className="text-sm font-medium leading-relaxed mb-8 max-w-xs">
            Architecting the future of omnichannel scheduling through autonomous AI orchestration.
          </p>
          <div className="flex gap-5">
            <a href="#" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 transition-all group shadow-sm" aria-label="Global">
              <Globe className="w-4 h-4 text-slate-500 group-hover:text-slate-900 transition-colors" />
            </a>
            <a href="#" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 transition-all group shadow-sm" aria-label="X">
              <X className="w-4 h-4 text-slate-500 group-hover:text-slate-900 transition-colors" />
            </a>
            <a href="#" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 transition-all group shadow-sm" aria-label="Mail">
              <Mail className="w-4 h-4 text-slate-500 group-hover:text-slate-900 transition-colors" />
            </a>
          </div>
        </div>

        {/* Link Columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h5 className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] mb-8">{title}</h5>
            <ul className="space-y-4">
              {links.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-sm font-bold hover:text-brand-primary transition-colors block"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Final Meta */}
      <div className="max-w-7xl mx-auto px-8 mt-24 pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-900">© 2024 Hapna Systems Inc.</p>
          <div className="h-4 w-px bg-slate-200 hidden md:block" />
          <p className="text-[10px] font-medium text-slate-600 hidden md:block italic">Designed for High Performance</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Lattice-Node Operational</span>
          </div>
          <div className="flex items-center gap-2 group cursor-pointer">
            <Cpu className="w-4 h-4 text-brand-primary group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">v4.0.2-Stable</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
