"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { customerApi } from "@/lib/customer-api";
import { logoutUser } from "@/app/actions/auth";
import { Search, SlidersHorizontal, ArrowRight, Clock, MapPin, User, LogOut, Zap } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  location: string;
  appointment_type: string;
  image_url: string | null;
  payment_amount: string;
  advance_payment_required: boolean;
  max_capacity: number | null;
  timezone: string;
}

export default function CustomerServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [filtered, setFiltered] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    let list = services;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.description || "").toLowerCase().includes(q) ||
          (s.location || "").toLowerCase().includes(q)
      );
    }
    if (typeFilter) {
      list = list.filter((s) => s.appointment_type === typeFilter);
    }
    setFiltered(list);
  }, [search, typeFilter, services]);

  async function loadServices() {
    try {
      const data = await customerApi("/services/", { requireAuth: false });
      const list = Array.isArray(data) ? data : data.results ?? [];
      setServices(list);
    } catch (err: any) {
      console.error("loadServices error:", err);
      setErrorMsg(err.message || String(err));
    }
    setLoading(false);
  }

  async function handleSignOut() {
    await logoutUser();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 font-body text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/70 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-heading font-black tracking-tighter text-brand-primary">
              Hapna
            </Link>
            <div className="h-6 w-px bg-slate-100 hidden sm:block" />
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">
              Service Discovery Hub
            </span>
          </div>
          <div className="flex items-center gap-8">
            <Link
              href="/bookings"
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-all"
            >
              My Appointments
            </Link>
            <button
              onClick={handleSignOut}
              className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden border-b border-slate-100 bg-white">
        {/* Aesthetic Anchors */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-secondary/5 rounded-full blur-[80px] -ml-32 -mb-32" />
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <span className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-brand-soft text-brand-primary rounded-pill text-[10px] font-black tracking-[0.15em] uppercase mb-8 border border-brand-primary/10">
              <Zap className="w-3 h-3 fill-brand-primary" />
              Infrastructure Ready
            </span>
            <h1 className="text-6xl lg:text-7xl font-heading font-black text-slate-900 tracking-tight mb-8 leading-[1.05]">
              Find your next<br />
              <span className="text-brand-primary">Expert Session.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
              Engineered for precision. Browse our network of verified services and orchestrate your next session in sub-second response times.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12 lg:py-24">
        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-6 mb-20">
          <div className="relative flex-1 group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors">
              <Search className="w-5 h-5" strokeWidth={2.5} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services, providers, or locations..."
              className="w-full pl-16 pr-8 py-6 bg-white/50 backdrop-blur-md border border-slate-200 rounded-[2rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary transition-all shadow-card"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative min-w-[240px]">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-14 pr-10 py-6 bg-white border border-slate-200 rounded-[2rem] text-slate-700 font-bold appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary transition-all shadow-card"
              >
                <option value="">All Categories</option>
                <option value="user">Individual Session</option>
                <option value="resource">Team / Asset</option>
              </select>
              <SlidersHorizontal className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-[3rem] border border-slate-100 p-12 h-96 animate-pulse" />
            ))}
          </div>
        ) : errorMsg ? (
          <div className="bg-white border border-slate-200 rounded-[4rem] p-20 text-center max-w-2xl mx-auto shadow-card">
            <h2 className="text-3xl font-heading font-black text-slate-900 mb-6 uppercase tracking-tight">Discovery Paused</h2>
            <p className="text-slate-500 mb-12 font-medium leading-relaxed">{errorMsg}</p>
            <button onClick={loadServices} className="px-12 py-5 bg-brand-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-primary/30">
              Refresh Feed
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[4rem] p-24 text-center shadow-card max-w-4xl mx-auto">
            <h2 className="text-4xl font-heading font-black text-slate-900 mb-6 tracking-tight">No match found.</h2>
            <p className="text-slate-500 max-w-md mx-auto font-medium text-lg mb-12">
              We couldn't match any sessions for "{search || typeFilter}". Try adjusting your heuristic filters.
            </p>
            <button onClick={() => { setSearch(""); setTypeFilter(""); }} className="text-brand-primary font-black text-xs uppercase tracking-[0.2em] hover:underline">
              Reset Configuration
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
            {filtered.map((s) => (
              <Link
                key={s.id}
                href={`/services/${s.id}`}
                className="group bg-white border border-slate-100 rounded-[3rem] p-12 shadow-card hover:shadow-card-hover hover:border-brand-primary/30 transition-all duration-500 flex flex-col h-full relative overflow-hidden"
              >
                {/* Decorative neural accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="flex justify-between items-center mb-10">
                  <span className="text-[9px] uppercase font-black tracking-[0.25em] px-5 py-2.5 rounded-full bg-slate-50 text-slate-400 group-hover:bg-brand-soft group-hover:text-brand-primary transition-all border border-transparent group-hover:border-brand-primary/10">
                    {s.appointment_type}
                  </span>
                  {s.advance_payment_required && (
                    <span className="text-xl font-heading font-black text-slate-900 group-hover:text-brand-primary transition-colors">
                      ₹{s.payment_amount}
                    </span>
                  )}
                </div>
                
                <h3 className="text-3xl font-heading font-black text-slate-900 mb-6 group-hover:text-brand-primary transition-colors leading-[1.2] tracking-tight">
                  {s.title}
                </h3>
                
                <p className="text-slate-500 text-lg font-medium leading-relaxed mb-12 line-clamp-3">
                  {s.description || "Tailored expertise designed for your specific goals. Book a high-impact session with our professionals today."}
                </p>
                
                <div className="mt-auto pt-10 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex gap-6">
                    <span className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                      <Clock className="w-4 h-4 text-brand-primary/40" />
                      {s.duration_minutes}m
                    </span>
                    <span className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                      <MapPin className="w-4 h-4 text-brand-primary/40" />
                      {s.location?.split(',')[0] || "Online"}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-brand-primary/30 group-hover:rotate-12">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
