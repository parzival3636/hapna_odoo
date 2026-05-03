"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { customerApi } from "@/lib/customer-api";
import { fetchApi } from "@/lib/api";
import { RescheduleWizard } from "@/app/components/customer/RescheduleWizard";
import { Loader2, AlertCircle, ChevronLeft } from "lucide-react";

export default function ReschedulePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const bookingData = await customerApi(`/bookings/${id}/`, {
          requireAuth: true,
        });
        setBooking(bookingData);

        const serviceData = await fetchApi(`/services/${bookingData.service_id}/`, {
          requireAuth: false,
        });
        setService(serviceData);
      } catch (err: any) {
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recalibrating Schedule...</p>
      </div>
    );
  }

  if (error || !booking || !service) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="bg-red-50 border border-red-100 p-12 rounded-[2.5rem] text-center max-w-lg shadow-card">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-6" />
          <h2 className="text-xl font-heading font-black text-red-600 uppercase tracking-tight mb-4">Scheduling Interrupted</h2>
          <p className="text-red-500/80 font-medium mb-8 leading-relaxed">{error || "The requested scheduling node could not be re-initialized."}</p>
          <button onClick={() => router.back()} className="px-8 py-4 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-100">
            Revert Path
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-body pb-20">
      <div className="max-w-4xl mx-auto pt-28 px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-3 text-[10px] font-black text-slate-400 hover:text-brand-primary uppercase tracking-widest transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center group-hover:border-brand-primary/20 group-hover:bg-brand-soft transition-all">
              <ChevronLeft className="w-4 h-4" />
            </div>
            Back to Artifact
          </button>
        </div>

        <RescheduleWizard booking={booking} maxCapacity={service?.max_capacity || 1} />
      </div>
    </div>
  );
}
