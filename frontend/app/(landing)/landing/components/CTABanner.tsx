import Link from "next/link";

export function CTABanner() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-br from-[#4F46E5] to-[#4b4dd8] rounded-[2rem] p-12 text-center text-white relative overflow-hidden">
          {/* Decorative blurs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl -ml-32 -mb-32" />

          <h2 className="text-4xl font-bold mb-6 relative z-10 tracking-tight">
            Ready to automate your bookings?
          </h2>
          <p className="text-lg mb-10 text-indigo-200 max-w-xl mx-auto relative z-10 leading-relaxed">
            Join 500+ businesses who have reclaimed their time with Hapna. Start
            your 14-day free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link
              href="/signup"
              className="bg-white text-[#4F46E5] font-semibold px-8 py-4 rounded-full hover:bg-slate-100 transition-all text-lg shadow-xl active:scale-95"
            >
              Get Started Free
            </Link>
            <button className="bg-white/20 text-white font-semibold px-8 py-4 rounded-full border border-white/30 hover:bg-white/10 transition-all text-lg active:scale-95">
              Book a Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
