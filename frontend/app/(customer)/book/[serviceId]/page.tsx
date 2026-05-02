"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

interface Service {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  location: string;
  venue_address: string;
}

export default function PublicBookingPage() {
  const { serviceId } = useParams();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    async function loadService() {
      try {
        // Use the preview endpoint which doesn't require auth
        const data = await fetchApi(`/services/${serviceId}/preview/`, { requireAuth: false });
        setService(data);
      } catch (err: any) {
        setError("Service not found or unavailable.");
      } finally {
        setLoading(false);
      }
    }
    loadService();
  }, [serviceId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await fetchApi("/bookings/", {
        method: "POST",
        body: JSON.stringify({
          service_id: serviceId,
          slot_date: date,
          slot_start: time,
          // We'll calculate end time based on duration
          slot_end: time, // simplified for now
          booking_channel: "web",
        }),
      });
      alert("Booking request submitted! Check your email for confirmation.");
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to submit booking");
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-12 text-center text-white">Loading service details...</div>;
  if (!service) return <div className="p-12 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8">
          <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
          <p className="text-[#94a3b8] mb-6">{service.description}</p>
          
          <div className="flex gap-6 mb-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#7c3aed]">⏱️</span>
              <span>{service.duration_minutes} Minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#7c3aed]">📍</span>
              <span>{service.location} {service.venue_address && `— ${service.venue_address}`}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 border-t border-[rgba(255,255,255,0.08)] pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#94a3b8]">Select Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="auth-input"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#94a3b8]">Select Time</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="auth-input"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-4 rounded-xl bg-[#7c3aed] text-white font-bold text-lg hover:bg-[#6d28d9] transition-all ${
                submitting ? "opacity-50 cursor-not-allowed" : "shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]"
              }`}
            >
              {submitting ? "Processing..." : "Confirm Booking"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
