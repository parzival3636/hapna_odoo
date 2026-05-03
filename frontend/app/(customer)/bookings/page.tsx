"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { customerApi } from "@/lib/customer-api";
import Link from "next/link";

interface BookingListItem {
  id: string;
  service_id: string;
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
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-20">
      {/* Header */}
      <header className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,15,0.9)] backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/services" className="text-2xl font-bold bg-gradient-to-r from-[#7c3aed] to-[#2563eb] bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              Hapna
            </Link>
            <span className="text-[#64748b] text-sm hidden sm:inline">
              | My Bookings
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/services"
              className="px-3 py-2 rounded-lg text-sm text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-10 pb-6">
        <h1 className="text-3xl font-bold mb-8">My Appointments</h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] text-sm">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
              📅
            </div>
            <h2 className="text-xl font-bold mb-2">No active bookings</h2>
            <p className="text-[#94a3b8] mb-6">You don't have any upcoming appointments right now.</p>
            <Link
              href="/services"
              className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#7c3aed] to-[#2563eb] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all inline-block"
            >
              Find a Service
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {bookings.map((booking) => {
              const dateLabel = new Date(booking.slot_date + "T00:00:00").toLocaleDateString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              const timeLabel = `${booking.slot_start.slice(0, 5)} – ${booking.slot_end.slice(0, 5)}`;

              return (
                <div
                  key={booking.id}
                  onClick={() => router.push(`/booking/${booking.id}`)}
                  className="glass-card p-5 cursor-pointer hover:border-[rgba(124,58,237,0.5)] transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-[#a78bfa] transition-colors mb-1">
                        Appointment
                      </h3>
                      <p className="text-sm text-[#94a3b8]">
                        {dateLabel} • {timeLabel}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-md uppercase tracking-wider ${
                      booking.status === "confirmed" ? "bg-[rgba(34,197,94,0.15)] text-[#4ade80] border border-[rgba(34,197,94,0.2)]" :
                      "bg-[rgba(251,191,36,0.15)] text-[#fbbf24] border border-[rgba(251,191,36,0.2)]"
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748b]">View Details →</span>
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
