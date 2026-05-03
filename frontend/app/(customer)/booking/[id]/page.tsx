"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { customerApi } from "@/lib/customer-api";
import { BookingDetail } from "@/app/components/customer/BookingDetail";
import { Loader2, AlertCircle } from "lucide-react";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBooking() {
      try {
        const data = await customerApi(`/bookings/${id}/`, {
          requireAuth: true,
        });
        setBooking(data);
      } catch (err: any) {
        setError(err.message || "Failed to load booking.");
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Artifact...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="bg-red-50 border border-red-100 p-12 rounded-[2.5rem] text-center max-w-lg shadow-card">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-6" />
          <h2 className="text-xl font-heading font-black text-red-600 uppercase tracking-tight mb-4">Registry Fault</h2>
          <p className="text-red-500/80 font-medium mb-8 leading-relaxed">{error || "The requested booking node could not be located in our network."}</p>
          <button onClick={() => router.push("/bookings")} className="px-8 py-4 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-100">
            Back to Registry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-body">
      <BookingDetail booking={booking} />
    </div>
  );
}
