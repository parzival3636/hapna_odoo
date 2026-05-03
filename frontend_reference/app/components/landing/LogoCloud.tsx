export function LogoCloud() {
  const logos = ["Twilio", "Google", "Claude", "Supabase", "Stripe"];

  return (
    <section className="py-16 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-semibold tracking-widest uppercase text-slate-400 mb-10">
          INTEGRATED WITH YOUR FAVORITE TOOLS
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 hover:opacity-100 transition-opacity duration-500 grayscale hover:grayscale-0">
          {logos.map((logo) => (
            <span
              key={logo}
              className="font-bold text-slate-900 text-2xl tracking-tight"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
