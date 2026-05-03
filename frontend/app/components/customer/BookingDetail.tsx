import { useState } from "react";
import { useRouter } from "next/navigation";
import { customerApi } from "@/lib/customer-api";
import { CancelDialog } from "./CancelDialog";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  MoreVertical, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  Hash,
  MessageSquare,
  ArrowRight,
  Info
} from "lucide-react";
import QRCode from "react-qr-code";

interface BookingAnswer {
  id: string;
  question_id: string;
  answer_text: string;
  question_text: string;
}

export interface Booking {
  id: string;
  service_id: string;
  service_title: string;
  resource_id: string | null;
  slot_date: string;
  slot_start: string;
  slot_end: string;
  status: string;
  capacity_booked: number;
  payment_status: string;
  payment_amount?: string;
  paid_at?: string;
  booking_channel: string;
  notes: string;
  answers: BookingAnswer[];
}

import toast from "react-hot-toast";

export function BookingDetail({ booking: initialBooking }: { booking: Booking }) {
  const router = useRouter();
  const [booking, setBooking] = useState(initialBooking);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");

  const isActive = ["pending", "confirmed"].includes(booking.status);

  async function handleCancel() {
    setIsCancelling(true);
    setError("");
    try {
      await customerApi(`/bookings/${booking.id}/cancel/`, {
        method: "POST",
        requireAuth: true,
      });
      // Update local state to cancelled
      setBooking((prev) => ({ ...prev, status: "cancelled" }));
      setIsCancelOpen(false);
      toast.success("Appointment successfully disconnected from registry.", {
        icon: "🛡️",
        style: {
          borderRadius: "1rem",
          background: "#333",
          color: "#fff",
          fontSize: "12px",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        },
      });
    } catch (err: any) {
      const msg = err?.data?.message || err.message || "Failed to cancel booking.";
      setError(msg);
      toast.error(msg, {
        style: {
          borderRadius: "1rem",
          fontSize: "12px",
          fontWeight: "bold",
        }
      });
    } finally {
      setIsCancelling(false);
    }
  }

  function handleReschedule() {
    router.push(`/reschedule/${booking.id}`);
  }

  const dateLabel = new Date(booking.slot_date + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const timeLabel = `${booking.slot_start.slice(0, 5)} – ${booking.slot_end.slice(0, 5)}`;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 w-full pt-32">
      <div className="mb-12 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-4 text-xs font-black text-slate-500 hover:text-brand-primary uppercase tracking-widest transition-all"
        >
          Return to Registry
        </button>
        
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-slate-100 hidden sm:block" />
          <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm ${
            booking.status === "confirmed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
            booking.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-100" :
            booking.status === "completed" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
            "bg-slate-50 text-slate-500 border-slate-100"
          }`}>
            {booking.status}
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[4rem] shadow-card overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
        {/* Aesthetic Anchors */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        
        {/* Header Section */}
        <div className="p-12 lg:p-16 border-b border-slate-50 bg-gradient-to-br from-slate-50/30 to-white relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-soft text-brand-primary rounded-pill text-xs font-black uppercase tracking-[0.2em] mb-8 border border-brand-primary/10">
                <Hash className="w-3 h-3" />
                Artifact #{booking.id.slice(0, 8).toUpperCase()}
              </span>
              <h1 className="text-4xl lg:text-6xl font-heading font-black text-slate-900 tracking-tighter leading-[1.1] mb-10">
                {booking.service_title}
              </h1>
              <div className="flex flex-wrap items-center gap-10">
                <div className="flex items-center gap-4 text-slate-700 font-black text-xs uppercase tracking-widest">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-brand-primary shadow-sm">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  {dateLabel}
                </div>
                <div className="flex items-center gap-4 text-slate-700 font-black text-xs uppercase tracking-widest">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-brand-primary shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  {timeLabel}
                </div>
              </div>
            </div>
            
            {isActive && (
              <div className="flex flex-col sm:flex-row items-stretch gap-4 min-w-[200px]">
                <button
                  onClick={handleReschedule}
                  className="px-8 py-5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-xs font-black uppercase tracking-widest hover:border-brand-primary hover:text-brand-primary transition-all shadow-sm active:scale-95"
                >
                  Reschedule
                </button>
                <button
                  onClick={() => setIsCancelOpen(true)}
                  className="px-8 py-5 rounded-2xl bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 active:scale-95"
                >
                  Abort Session
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-12 lg:p-16 space-y-16 relative z-10">
          <div>
            <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.25em] mb-10 flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-brand-primary" />
              Ingested Network Intelligence
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 group hover:bg-white hover:border-brand-primary/20 transition-all duration-500 shadow-sm flex flex-col items-center justify-center">
                <div className="flex items-center gap-3 mb-4 self-start">
                  <Hash className="w-4 h-4 text-slate-500 group-hover:text-brand-primary transition-colors" />
                  <p className="text-xs text-slate-600 font-black uppercase tracking-widest">Registry QR Code</p>
                </div>
                <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 opacity-90 group-hover:opacity-100 transition-opacity mb-3">
                  <QRCode value={booking.id} size={96} />
                </div>
                <p className="text-xs text-slate-500 font-black font-mono tracking-tight group-hover:text-brand-primary transition-colors">#{booking.id.toUpperCase()}</p>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 group hover:bg-white hover:border-brand-primary/20 transition-all duration-500 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-primary transition-colors" />
                  <p className="text-xs text-slate-600 font-black uppercase tracking-widest">Inbound Channel</p>
                </div>
                <p className="text-lg text-slate-900 font-black group-hover:text-brand-primary transition-colors uppercase tracking-tight">{booking.booking_channel}</p>
              </div>

              {booking.capacity_booked > 1 && (
                <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 group hover:bg-white hover:border-brand-primary/20 transition-all duration-500 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-4 h-4 text-slate-500 group-hover:text-brand-primary transition-colors" />
                    <p className="text-xs text-slate-600 font-black uppercase tracking-widest">Capacity Allocation</p>
                  </div>
                  <p className="text-xl text-slate-900 font-black group-hover:text-brand-primary transition-colors">{booking.capacity_booked} Units</p>
                </div>
              )}

              {booking.payment_status === "paid" && (
                <div className="p-8 rounded-[2.5rem] bg-emerald-50 border border-emerald-100 group hover:bg-white hover:border-emerald-300 transition-all duration-500 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-4 h-4 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                    <p className="text-xs text-emerald-600 font-black uppercase tracking-widest">Payment Settled</p>
                  </div>
                  <p className="text-2xl text-emerald-700 font-black tracking-tight mb-2">₹{booking.payment_amount}</p>
                  {booking.paid_at && (
                    <p className="text-sm text-emerald-600/80 font-medium">{new Date(booking.paid_at).toLocaleString()}</p>
                  )}
                </div>
              )}
              
              {booking.answers && booking.answers.map((ans) => (
                <div key={ans.id} className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 group hover:bg-white hover:border-brand-primary/20 transition-all duration-500 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="w-4 h-4 text-slate-500 group-hover:text-brand-primary transition-colors" />
                    <p className="text-xs text-slate-600 font-black uppercase tracking-widest">{ans.question_text || "Logic Node"}</p>
                  </div>
                  <p className="text-lg text-slate-900 font-bold group-hover:text-brand-primary transition-colors leading-relaxed">{ans.answer_text}</p>
                </div>
              ))}

                <div className="md:col-span-2 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 group hover:bg-white hover:border-brand-primary/20 transition-all duration-500 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Info className="w-4 h-4 text-slate-500 group-hover:text-brand-primary transition-colors" />
                    <p className="text-xs text-slate-600 font-black uppercase tracking-widest">Organiser Handover Notes</p>
                  </div>
                  <p className="text-lg text-slate-900 font-medium leading-relaxed whitespace-pre-wrap">{booking.notes}</p>
                </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-10 p-8 rounded-[2.5rem] bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-6 animate-in shake duration-500 shadow-sm">
          <AlertCircle className="w-6 h-6" />
          {error}
        </div>
      )}

      <CancelDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleCancel}
        isCancelling={isCancelling}
      />
    </div>
  );
}
