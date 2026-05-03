import { Bot, LineChart, Mail, RefreshCcw, ArrowUpRight } from "lucide-react";

const features = [
  {
    title: "Autonomous Scheduling",
    description:
      "Our neural engine internalizes your business logic, pricing, and service constraints to orchestrate perfect availability across all touchpoints.",
    icon: <Bot className="w-6 h-6" />,
    accent: "indigo",
  },
  {
    title: "Risk Analysis Engine",
    description:
      "Advanced ML pipelines analyze historical engagement and behavioral patterns to flag high-risk no-shows before they impact your bottom line.",
    icon: <LineChart className="w-6 h-6" />,
    accent: "emerald",
  },
  {
    title: "Contextual Messaging",
    description:
      "Generate personalized follow-ups, intake flows, and prep instructions triggered by specific service heuristics and customer metadata.",
    icon: <Mail className="w-6 h-6" />,
    accent: "indigo",
  },
  {
    title: "Bi-Directional Sync",
    description:
      "Atomic state synchronization across your ecosystem. A slot blocked on your mobile device is instantly reflected in the AI and Web domains.",
    icon: <RefreshCcw className="w-6 h-6" />,
    accent: "emerald",
  },
];

export function AIShowcase() {
  return (
    <section className="py-32 bg-slate-50 text-slate-900 font-body overflow-hidden relative">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-24">
          <div className="max-w-2xl">
            <span className="text-brand-primary font-black tracking-[0.3em] text-[10px] uppercase mb-6 block">
              Predictive Intelligence
            </span>
            <h2 className="text-4xl lg:text-6xl font-heading font-black tracking-tight leading-[1.1]">
              Architect your workflow with <br />
              <span className="text-brand-primary">Omnichannel AI.</span>
            </h2>
          </div>
          <button className="bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest px-12 py-5 rounded-pill hover:bg-slate-100 transition-all active:scale-95 whitespace-nowrap flex items-center gap-4 shadow-sm border border-slate-200 group">
            View Capabilities <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-10">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`p-12 lg:p-16 rounded-[3rem] bg-white border border-slate-200 group transition-all duration-700 hover:bg-slate-50 hover:shadow-xl relative overflow-hidden ${
                feature.accent === "indigo"
                  ? "hover:border-brand-primary/30 hover:shadow-brand-primary/10"
                  : "hover:border-emerald-500/30 hover:shadow-emerald-500/10"
              }`}
            >
              <div className={`absolute -right-8 -bottom-8 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${
                feature.accent === "indigo" ? "bg-brand-primary" : "bg-emerald-500"
              }`} />
              
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-all duration-500 shadow-lg ${
                  feature.accent === "indigo"
                    ? "bg-brand-primary/20 text-brand-primary shadow-brand-primary/10"
                    : "bg-emerald-500/20 text-emerald-400 shadow-emerald-500/10"
                }`}
              >
                {feature.icon}
              </div>
              <h4 className="text-2xl lg:text-3xl font-heading font-black mb-6 tracking-tight text-slate-900 transition-colors">
                {feature.title}
              </h4>
              <p className="text-slate-500 leading-relaxed font-medium text-lg lg:text-xl">
                {feature.description}
              </p>
              
              <div className="mt-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 text-slate-500">
                Protocol Active <div className={`w-1.5 h-1.5 rounded-full ${feature.accent === 'indigo' ? 'bg-brand-primary' : 'bg-emerald-500'} animate-pulse`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
