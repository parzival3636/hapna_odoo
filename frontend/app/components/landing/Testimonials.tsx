import Image from "next/image";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Hapna engineered a 45% reduction in session churn. The autonomous response latency is sub-human, making it our primary engagement node.",
    name: "Dr. Elena Rodriguez",
    role: "Wellness Architecture Director",
    avatar: "https://i.pravatar.cc/150?u=elena",
  },
  {
    quote:
      "Integration was completed in under 10 minutes. The vocal synthesis handles complex domain vernacular with zero hallucination.",
    name: "Marcus Thorne",
    role: "Founder, Thorne Infrastructure",
    avatar: "https://i.pravatar.cc/150?u=marcus",
  },
  {
    quote:
      "Finally, a scheduling protocol that respects omnichannel integrity. The real-time lattice sync is the backbone of our operation.",
    name: "Sarah Jenkins",
    role: "COO at RecruitSync Systems",
    avatar: "https://i.pravatar.cc/150?u=sarah",
  },
];

export function Testimonials() {
  return (
    <section className="py-32 bg-slate-50 font-body">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-3">Global Validation</p>
          <h2 className="text-4xl lg:text-5xl font-heading font-black text-slate-900 tracking-tight">
            Loved by thousands of <br />
            <span className="text-brand-primary font-black italic">Industry Architects.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white p-12 rounded-[2.5rem] shadow-card border border-slate-100 hover:shadow-card-hover hover:border-brand-primary/30 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <Quote className="w-20 h-20 rotate-12" />
              </div>
              
              <div className="flex gap-1 mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-brand-primary text-brand-primary" />
                ))}
              </div>
              
              <p className="text-base text-slate-600 font-medium italic mb-10 leading-relaxed relative z-10">
                &ldquo;{t.quote}&rdquo;
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm group-hover:border-brand-primary/30 transition-colors">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-heading font-black text-slate-900 tracking-tight text-base">{t.name}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
