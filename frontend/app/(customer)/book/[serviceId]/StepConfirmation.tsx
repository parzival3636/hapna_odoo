"use client";

import Link from "next/link";

interface Props {
  bookingData: any;
  service: any;
}

export default function StepConfirmation({ bookingData, service }: Props) {
  const isConfirmed = bookingData.status === "confirmed";

  const dateLabel = bookingData.slot_date
    ? new Date(bookingData.slot_date + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="glass-card p-8 text-center">
      {/* Icon */}
      <div
        className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl ${
          isConfirmed
            ? "bg-[rgba(34,197,94,0.15)]"
            : "bg-[rgba(251,191,36,0.15)]"
        }`}
      >
        {isConfirmed ? "✅" : "⏳"}
      </div>

      <h2 className="text-2xl font-bold mb-2">
        {isConfirmed
          ? "Booking Confirmed!"
          : "Booking Reserved"}
      </h2>
      <p className="text-[#94a3b8] mb-8">
        {isConfirmed
          ? "Your appointment has been confirmed. You'll receive a confirmation email shortly."
          : "Your booking is pending organiser approval. You'll be notified once confirmed."}
      </p>

      {/* Details */}
      <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[#64748b]">Service</span>
            <span className="text-white font-medium">{service.title}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#64748b]">Date</span>
            <span className="text-white font-medium">{dateLabel}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#64748b]">Time</span>
            <span className="text-white font-medium">
              {bookingData.slot_start?.slice(0, 5)} – {bookingData.slot_end?.slice(0, 5)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#64748b]">Status</span>
            <span
              className={`font-bold ${
                isConfirmed ? "text-[#4ade80]" : "text-[#fbbf24]"
              }`}
            >
              {bookingData.status?.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#64748b]">Booking ID</span>
            <span className="text-[#94a3b8] font-mono text-xs">
              {bookingData.id?.slice(0, 8)}...
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <Link
          href="/services"
          className="flex-1 py-3 rounded-xl bg-[rgba(255,255,255,0.06)] text-[#94a3b8] font-medium hover:bg-[rgba(255,255,255,0.1)] transition-all text-center"
        >
          Browse More
        </Link>
        <Link
          href={`/services/${service.id}`}
          className="flex-1 py-3 rounded-xl bg-[#7c3aed] text-white font-medium hover:bg-[#6d28d9] transition-all text-center"
        >
          Book Again
        </Link>
      </div>
    </div>
  );
}
