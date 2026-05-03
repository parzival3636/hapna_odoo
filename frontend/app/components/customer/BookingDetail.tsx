"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { customerApi } from "@/lib/customer-api";
import { CancelDialog } from "./CancelDialog";

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
  booking_channel: string;
  notes: string;
  answers: BookingAnswer[];
}

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
    } catch (err: any) {
      setError(err?.data?.message || err.message || "Failed to cancel booking.");
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
    <div className="max-w-2xl mx-auto p-4 sm:p-6 w-full pt-20">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[rgba(255,255,255,0.05)] flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{booking.service_title}</h1>
            <p className="text-[#94a3b8] text-sm mb-4">
              {dateLabel} • {timeLabel}
            </p>
            <div className="flex gap-2 items-center text-xs font-semibold">
              <span className={`px-2 py-1 rounded-md uppercase tracking-wider ${
                booking.status === "confirmed" ? "bg-[rgba(34,197,94,0.15)] text-[#4ade80] border border-[rgba(34,197,94,0.2)]" :
                booking.status === "pending" ? "bg-[rgba(251,191,36,0.15)] text-[#fbbf24] border border-[rgba(251,191,36,0.2)]" :
                booking.status === "cancelled" ? "bg-[rgba(239,68,68,0.15)] text-[#ef4444] border border-[rgba(239,68,68,0.2)]" :
                "bg-[rgba(148,163,184,0.15)] text-[#94a3b8] border border-[rgba(148,163,184,0.2)]"
              }`}>
                {booking.status}
              </span>
              <span className="px-2 py-1 rounded-md bg-[rgba(255,255,255,0.05)] text-[#94a3b8] border border-[rgba(255,255,255,0.1)]">
                {booking.booking_channel}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isActive && (
          <div className="p-4 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.05)] flex flex-wrap gap-3">
            <button
              onClick={handleReschedule}
              className="px-4 py-2 text-sm font-bold text-white bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.3)] rounded-lg hover:bg-[rgba(124,58,237,0.25)] transition-all flex-1 text-center"
            >
              Reschedule
            </button>
            <button
              onClick={() => setIsCancelOpen(true)}
              className="px-4 py-2 text-sm font-bold text-[#ef4444] bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)] rounded-lg hover:bg-[rgba(239,68,68,0.1)] transition-all flex-1 text-center"
            >
              Cancel Appointment
            </button>
          </div>
        )}

        {/* Intake Answers */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-4">
            Booking Details
          </h3>
          
          <div className="space-y-4">
            {booking.capacity_booked > 1 && (
              <div className="bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                <p className="text-xs text-[#64748b] mb-1">Seats Booked</p>
                <p className="text-sm text-white font-medium">{booking.capacity_booked}</p>
              </div>
            )}
            
            {booking.answers.map((ans) => (
              <div key={ans.id} className="bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                <p className="text-xs text-[#64748b] mb-1">{ans.question_text || "Question"}</p>
                <p className="text-sm text-white font-medium">{ans.answer_text}</p>
              </div>
            ))}

            {booking.notes && (
              <div className="bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                <p className="text-xs text-[#64748b] mb-1">Notes</p>
                <p className="text-sm text-white font-medium whitespace-pre-wrap">{booking.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] text-sm">
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
