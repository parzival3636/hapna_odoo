import Image from "next/image";

export function Hero() {
  return (
    <header className="relative pt-32 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Copy */}
        <div className="z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-700 rounded-full text-xs font-semibold tracking-wider uppercase mb-6">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
            </svg>
            AI-Powered Scheduling
          </span>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
            Book appointments through{" "}
            <span className="text-[#3525cd]">AI chat</span>, web, or a phone call.
          </h1>

          <p className="text-lg text-slate-500 mb-8 max-w-lg leading-relaxed">
            The world&apos;s first omnichannel scheduling engine. Let AI handle your
            bookings while you focus on your business.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <input
              type="email"
              placeholder="Enter your work email"
              className="flex-grow px-5 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-white"
            />
            <button className="bg-[#4F46E5] text-white font-semibold px-8 py-3 rounded-full hover:bg-[#3525cd] transition-all whitespace-nowrap active:scale-95">
              Start for Free
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAN8hJNhDCyOw4rlwh3dlHsKBTADJKYg89z7SYApmESOc7FhmNpS9dpHk_ocQ0xmZkDEzUWrpJIAyKUUTjKT7XIkw_Q9J3nl7uNod4fSrd8l52m2FOB3d1NTfJ4T6wH1-ZMLG1c0eQ0ocEXdZGofTkJl8UmAqFIsQ2iiQPkmVjvvP1R12gTaq6uB5ecfW-jgANgzKq8y-zQf-FeppYGO1OQwL2fy7e1nIHUNsxX3XhFi39EiJTF_mys2AjWYaw013QsiVEBFKqa-g"
                alt="User"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQLrwVtoFwJ9jLlXHeYhYjhqO4ljR3hz_f56kKoCCN6L5k0kj268w-E0NxORK_GVQ-zmKRreQlhT6Vs0n1a4HSpfuXaPkLAVkGCsvuhwnWuKlrhT_nGKy4bZ5XeRuV87Zi6gAVa-MbLmq1k3zV-DPAGZCj6RJ77Bf42njSbdrswk44cOdmnXIAGmYKr1r4xY72ZdTfrFGhapWRYn77YIPVCoHamvhfNn6dL4mjSF_n3uvDhudgdiZAnoNcSugvRDF_JWjd8SEaLA"
                alt="User"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmxoP50JTRPSwzt7BTHLpSrgSbp0vqGeRlJmRH26O6D11KDwQqASxXSvbTh6NKp1loeADtYXZLUDFZaZb3Nv4-8mb6mi5LpqKXyxvFTfoRXFsvdOdZu9A5xlr0WMHzyjm_HTtLGJnbGGuY9uXEImWlQ52l2bAtyEocgJKDtx1-P4zDsyrNZuGPAgQzvyaVkABMdasTiyzQwmwSFwDLs-x6EY0SbGZVPJFd08KqsoTd7KaLDj4w2PE3ir4xzFLY_6X4QBkc--xQ9A"
                alt="User"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Trusted by 500+ businesses
            </p>
          </div>
        </div>

        {/* Right: Dashboard mockup */}
        <div className="relative">
          {/* Main dashboard image */}
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden relative z-0">
            <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
            </div>
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJJ92NevtGFRVFtWeJ8H-Xp7TVBT3Gv9mINpVZwJpru10GEmFR0PO6_pODK1GEYZmgLe0GvApFRxoVjdrkxQoHYN4L0timAQPKNKwUFfojVioyiZcmVJVRFBT2wgT-P5FwdGLbBZgETan6qkRIyTy-k2w2p7v7cKcwMTspQyoS9v-JOEmCb4ZWnsjEVZXnGtAGTQhKUsA3KScyRo8UBNtgBXv1yhaSnKWCCK03_6tRMwAZDOvVfKqoYhzdF5ox47OXyVlLOB4vWg"
              alt="Hapna Dashboard"
              width={800}
              height={500}
              className="w-full h-auto opacity-80"
              priority
            />
          </div>

          {/* Floating: AI Bot card */}
          <div className="absolute -left-6 top-1/4 bg-white p-4 rounded-xl shadow-xl border border-slate-100 max-w-[240px] hover:-translate-y-1 transition-all duration-200 z-20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600">
                AI Bot Active
              </span>
            </div>
            <p className="text-sm font-medium text-slate-800">
              &ldquo;Great! Your dental cleaning is confirmed for Tuesday at 10 AM.&rdquo;
            </p>
          </div>

          {/* Floating: No-show risk card */}
          <div className="absolute -right-4 bottom-1/4 bg-white p-5 rounded-xl shadow-xl border border-slate-100 max-w-[200px] hover:-translate-y-1 transition-all duration-200 z-20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                Risk Analysis
              </span>
              <span className="text-red-500 font-bold text-sm">High</span>
            </div>
            <h4 className="text-base font-semibold text-slate-900 mb-1">
              No-Show Risk
            </h4>
            <p className="text-sm text-slate-500">
              John Doe missed 2 prior sessions. Sending auto-reminder now.
            </p>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 w-3/4 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
