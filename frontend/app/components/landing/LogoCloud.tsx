export function LogoCloud() {
  const logos = ["Twilio", "Google", "Claude", "Supabase", "Stripe"];

  return (
    <section className="py-20 bg-white border-y border-slate-50 font-body">
      <div className="max-w-7xl mx-auto px-8">
        <p className="text-center text-[10px] font-black tracking-[0.25em] uppercase text-slate-400 mb-12">
          Infrastructure Integrity & Ecosystem Partners
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 hover:opacity-100 transition-all duration-700 grayscale hover:grayscale-0">
          {logos.map((logo) => (
            <span
              key={logo}
              className="font-heading font-black text-slate-900 text-2xl lg:text-3xl tracking-tighter hover:text-brand-primary transition-colors cursor-default"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
