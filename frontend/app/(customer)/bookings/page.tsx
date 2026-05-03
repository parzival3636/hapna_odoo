"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { customerApi } from "@/lib/customer-api";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  Search, 
  ArrowRight, 
  Plus, 
  Clock, 
  AlertCircle,
  CalendarCheck,
  ChevronRight
} from "lucide-react";
import QRCode from "react-qr-code";

interface BookingListItem {
  id: string;
  service_id: string;
  service_title?: string;
  slot_date: string;
  slot_start: string;
  slot_end: string;
  status: string;
  payment_status: string;
  created_at: string;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await customerApi("/bookings/mine/", {
          requireAuth: true,
        });
        // Sort bookings by date descending
        const sorted = data.sort((a: any, b: any) => {
          return new Date(`${b.slot_date}T${b.slot_start}`).getTime() - new Date(`${a.slot_date}T${a.slot_start}`).getTime();
        });
        setBookings(sorted);
      } catch (err: any) {
        setError(err?.data?.message || err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  return (
    <div className="min-h-screen text-slate-900 pb-24 pt-32 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-secondary/5 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div>
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.25em] mb-4">Registry Overview</p>
            <h1 className="text-5xl lg:text-6xl font-heading font-black text-slate-900 tracking-tighter leading-tight">
              My Appointments
            </h1>
          </div>
          <Link
            href="/services"
            className="group px-10 py-5 rounded-[1.5rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all shadow-2xl shadow-slate-200 flex items-center gap-4 w-fit active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Discover New Nodes
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-8 animate-in fade-in duration-700">
            <div className="w-14 h-14 border-[3px] border-brand-primary border-t-transparent rounded-full animate-spin shadow-2xl shadow-brand-primary/20" />
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing schedule...</p>
          </div>
        ) : error ? (
          <div className="p-10 rounded-[3rem] bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-6 animate-in shake duration-500 shadow-sm">
            <AlertCircle className="w-8 h-8" />
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[4rem] p-24 text-center flex flex-col items-center shadow-card animate-in zoom-in-95 duration-700 max-w-4xl mx-auto">
            <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-10 shadow-inner border border-slate-100">
              <CalendarCheck className="w-10 h-10 text-slate-200" />
            </div>
            <h2 className="text-4xl font-heading font-black text-slate-900 mb-6 tracking-tight">Your Registry is Empty</h2>
            <p className="text-slate-500 mb-12 max-w-sm font-medium leading-relaxed text-lg text-slate-400">No appointments have been initialized. Explore our network of high-performance services to begin.</p>
            <Link
              href="/services"
              className="px-12 py-6 rounded-[1.5rem] font-black text-[10px] text-white bg-brand-primary uppercase tracking-widest hover:scale-[1.05] shadow-2xl shadow-brand-primary/30 transition-all active:scale-95"
            >
              Initialize First Session
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {bookings.map((booking) => {
              const dateLabel = new Date(booking.slot_date + "T00:00:00").toLocaleDateString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              const timeLabel = `${booking.slot_start.slice(0, 5)} – ${booking.slot_end.slice(0, 5)}`;
              
              const isConfirmed = booking.status === "confirmed";
              const isCompleted = booking.status === "completed";

              return (
                <div
                  key={booking.id}
                  onClick={() => router.push(`/booking/${booking.id}`)}
                  className="group bg-white border border-slate-100 rounded-[3rem] p-12 cursor-pointer hover:shadow-card-hover hover:border-brand-primary/30 transition-all duration-500 relative overflow-hidden flex flex-col justify-between h-[360px]"
                >
                  {/* Decorative neural accent */}
                  <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -mr-20 -mt-20 opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${
                    isConfirmed ? 'bg-emerald-500' : isCompleted ? 'bg-indigo-500' : 'bg-amber-500'
                  }`} />
                  
                  <div className={`absolute top-0 left-0 w-2 h-full transition-transform duration-500 origin-top scale-y-0 group-hover:scale-y-100 ${
                    isConfirmed ? 'bg-emerald-500' : isCompleted ? 'bg-indigo-500' : 'bg-amber-500'
                  }`} />
                  
                  <div>
                    <div className="flex justify-between items-start mb-12">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-100 opacity-80 group-hover:opacity-100 transition-opacity">
                            <QRCode value={booking.id} size={40} />
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] mb-1">Access Token</div>
                            <div className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">#{booking.id.slice(0, 8).toUpperCase()}</div>
                          </div>
                        </div>
                        <h3 className="text-3xl font-heading font-black text-slate-900 group-hover:text-brand-primary transition-colors tracking-tight leading-[1.2]">
                          {booking.service_title || `Session ${booking.id.slice(0, 4)}`}
                        </h3>
                      </div>
                      <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all shadow-sm ${
                        isConfirmed ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        isCompleted ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                        "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-4 text-slate-400 group-hover:text-slate-900 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-brand-soft group-hover:border-brand-primary/20 transition-all">
                          <CalendarIcon className="w-5 h-5 text-slate-300 group-hover:text-brand-primary transition-colors" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest leading-none">{dateLabel}</span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400 group-hover:text-slate-900 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-brand-soft group-hover:border-brand-primary/20 transition-all">
                          <Clock className="w-5 h-5 text-slate-300 group-hover:text-brand-primary transition-colors" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest leading-none">{timeLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-10 border-t border-slate-50">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] group-hover:text-brand-primary group-hover:translate-x-2 transition-all flex items-center gap-3">
                      Access Node <ChevronRight className="w-4 h-4" />
                    </span>
                    <div className="flex items-center gap-2">
                      {booking.payment_status === 'paid' ? (
                        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-widest shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Validated
                        </div>
                      ) : (
                        <div className="px-4 py-1.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100 text-[9px] font-black uppercase tracking-widest">
                          Awaiting Hub
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
