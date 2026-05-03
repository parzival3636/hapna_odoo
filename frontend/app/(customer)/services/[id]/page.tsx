"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { customerApi } from "@/lib/customer-api";
import { 
  ChevronLeft, 
  Clock, 
  MapPin, 
  Users, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Globe,
  Calendar,
  Quote
} from "lucide-react";

interface ServiceQuestion {
  id: string;
  question_text: string;
  question_type: string;
  is_required: boolean;
  options?: string[] | null;
}

interface Resource {
  id: string;
  name: string;
  resource_type: string;
}

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  appointment_type: string;
  location: string;
  venue_address: string;
  image_url: string | null;
  payment_amount: string;
  advance_payment_required: boolean;
  manual_confirmation: boolean;
  max_capacity: number | null;
  timezone: string;
  intro_message: string | null;
  questions: ServiceQuestion[];
  resources: Resource[];
}

export default function ServiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextDates, setNextDates] = useState<string[]>([]);

  useEffect(() => {
    loadService();
  }, [id]);

  async function loadService() {
    try {
      const data = await customerApi(`/services/${id}/`, {
        requireAuth: false,
      });
      setService(data);

      try {
        const avail = await customerApi(
          `/services/${id}/next-available/?count=5`,
          { requireAuth: false }
        );
        setNextDates(avail.next_available_dates || []);
      } catch (err: any) {
        console.error("Failed to load next available dates:", err);
      }
    } catch (err: any) {
      console.error("loadService error:", err);
      setError(err.message || String(err));
    }
    setLoading(false);
  }

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 font-body text-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-4 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
          <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          Analyzing Hub Configuration...
        </div>
      </div>
    );

  if (!service)
    return (
      <div className="min-h-screen bg-slate-50 font-body text-slate-900 flex items-center justify-center p-8">
        <div className="bg-white border border-slate-200 p-16 text-center rounded-[3rem] shadow-card max-w-lg w-full">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner shadow-red-100/50">
            <Zap className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-heading font-black text-slate-900 mb-4 uppercase tracking-tight">System Interrupted</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">{error || "The requested service configuration is currently unavailable."}</p>
          <Link href="/services" className="inline-flex items-center gap-3 px-10 py-4 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20">
            <ChevronLeft className="w-5 h-5" /> Back to Discovery
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen font-body text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between">
          <Link
            href="/services"
            className="text-slate-400 hover:text-brand-primary font-black transition-all text-[10px] uppercase tracking-widest flex items-center gap-3 group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:border-brand-primary/20 group-hover:bg-brand-soft transition-all">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> 
            </div>
            Discovery Hub
          </Link>
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-pill border border-slate-100">
            <Globe className="w-3.5 h-3.5 text-brand-primary opacity-50" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{service.timezone}</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-16 lg:py-24">
        <div className="bg-white border border-slate-100 rounded-[4rem] p-12 lg:p-20 shadow-card relative overflow-hidden">
          {/* Aesthetic Background Accents */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
          
          {/* Title Area */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20 relative z-10">
            <div className="flex-1 animate-in fade-in slide-in-from-left-8 duration-1000">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-soft text-brand-primary text-[9px] font-black uppercase tracking-[0.2em] mb-8 border border-brand-primary/10">
                {service.appointment_type}
              </span>
              <h1 className="text-5xl lg:text-7xl font-heading font-black text-slate-900 tracking-tighter leading-[1.05] mb-8">
                {service.title}
              </h1>
              <div className="h-1.5 w-24 bg-brand-primary rounded-full mb-8" />
            </div>
            {service.advance_payment_required && (
              <div className="bg-white border border-slate-100 rounded-[3rem] p-10 text-center min-w-[240px] shadow-card group hover:border-emerald-500/30 transition-all duration-500 animate-in fade-in slide-in-from-right-8 duration-1000">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Secure Deposit</div>
                <div className="text-5xl font-heading font-black text-emerald-500 mb-2">
                  ₹{service.payment_amount}
                </div>
                <div className="text-[10px] font-black text-emerald-600/50 uppercase tracking-[0.1em]">
                  Lattice Verified
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="max-w-3xl mb-20 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <p className="text-slate-500 text-xl lg:text-2xl leading-relaxed font-medium">
              {service.description || "Experience top-tier service tailored to your needs. Our experts are ready to assist you in achieving your goals with precision and care."}
            </p>
          </div>

          {service.intro_message && (
            <div className="bg-slate-50 rounded-[3rem] p-12 mb-20 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary" />
              <Quote className="absolute top-8 right-12 w-24 h-24 text-brand-primary/5 -rotate-12" />
              <p className="italic text-slate-700 font-medium text-xl lg:text-2xl leading-relaxed relative z-10">
                &ldquo;{service.intro_message}&rdquo;
              </p>
            </div>
          )}

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
            {[
              { label: "Duration", value: `${service.duration_minutes}m`, icon: Clock },
              { label: "Location", value: service.location || "Online", icon: MapPin },
              { label: "Capacity", value: service.max_capacity || 1, icon: Users },
              { label: "Logic", value: service.manual_confirmation ? "Manual" : "Instant", icon: ShieldCheck },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] p-10 border border-slate-50 shadow-card hover:shadow-card-hover hover:border-brand-primary/30 transition-all duration-700 flex flex-col items-center text-center group">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-brand-primary mb-6 group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-sm">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                  {item.label}
                </div>
                <div className="text-slate-900 font-heading font-black text-2xl tracking-tight leading-none">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-20 relative z-10">
            {/* Resources Section */}
            {service.resources.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-8 text-center sm:text-left">Execution Specialist Assets</p>
                <div className="flex flex-wrap gap-5">
                  {service.resources.map((r) => (
                    <div
                      key={r.id}
                      className="px-8 py-5 rounded-[1.75rem] bg-slate-50 border border-slate-100 text-sm font-bold text-slate-700 flex items-center gap-5 group hover:bg-white hover:border-brand-primary transition-all shadow-sm"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
                      <div>
                        <div className="text-slate-900 leading-none mb-1">{r.name}</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{r.resource_type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions Preview */}
            {service.questions.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-600">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-8 text-center sm:text-left">Heuristic Intake Requirements</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {service.questions.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-start gap-6 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 hover:border-brand-primary/20 hover:bg-white transition-all duration-500 group shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-all">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-800 leading-tight mb-3">{q.question_text}</p>
                        {q.is_required && (
                          <span className="inline-flex px-3 py-1 rounded-full bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest border border-red-100">
                            Required Node
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Available Dates */}
            {nextDates.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-8 text-center sm:text-left">Accelerated Date Selection</p>
                <div className="flex flex-wrap gap-5 justify-center sm:justify-start">
                  {nextDates.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => router.push(`/book/${service.id}?date=${d}`)}
                      className="px-8 py-5 rounded-[2rem] bg-white border border-slate-100 hover:border-brand-primary hover:bg-brand-soft hover:text-brand-primary text-slate-700 font-black text-[11px] uppercase tracking-widest transition-all shadow-card hover:shadow-card-hover flex items-center gap-4 group/date"
                    >
                      <Calendar className="w-4 h-4 text-brand-primary opacity-30 group-hover/date:opacity-100 transition-opacity" />
                      {new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ultimate CTA */}
          <div className="mt-24 pt-20 border-t border-slate-100 relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-1000">
            <button
              onClick={() => router.push(`/book/${service.id}`)}
              className="w-full py-8 rounded-[3rem] bg-slate-900 text-white font-heading font-black text-3xl hover:bg-brand-primary hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-6 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 uppercase tracking-tighter">Initialize Booking Engine</span>
              <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform duration-500 relative z-10" />
            </button>
            <div className="flex items-center justify-center gap-6 mt-12 opacity-30">
              <div className="h-px w-20 bg-slate-300" />
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">
                Lattice Network Verified Protocol
              </p>
              <div className="h-px w-20 bg-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
