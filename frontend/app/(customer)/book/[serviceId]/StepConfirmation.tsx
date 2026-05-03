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
    <div className="p-4 text-center">
      {/* Icon */}
      <div
        className={`w-24 h-24 rounded-[2.5rem] mx-auto mb-8 flex items-center justify-center text-5xl shadow-xl ${
          isConfirmed
            ? "bg-emerald-50 text-emerald-500 shadow-emerald-100"
            : "bg-amber-50 text-amber-500 shadow-amber-100"
        }`}
      >
        {isConfirmed ? "✓" : "⏳"}
      </div>

      <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
        {isConfirmed
          ? "Appointment Confirmed!"
          : "Request Received"}
      </h2>
      <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">
        {isConfirmed
          ? "Great news! Your booking is locked in. We've sent the details to your inbox."
          : "We've received your request. The provider will review it and notify you shortly."}
      </p>

      {/* Details Card */}
      <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 mb-10 text-left max-w-md mx-auto shadow-sm">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</span>
            <span className="text-sm font-black text-slate-900">{service.title}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</span>
            <span className="text-sm font-black text-slate-900">{dateLabel}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</span>
            <span className="text-sm font-black text-slate-900">
              {bookingData.slot_start?.slice(0, 5)} – {bookingData.slot_end?.slice(0, 5)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-slate-200/50">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
            <span
              className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                isConfirmed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {bookingData.status?.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking Ref</span>
            <span className="text-[10px] font-mono text-slate-500">
              #{bookingData.id?.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <Link
          href="/services"
          className="flex-1 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all text-center shadow-sm"
        >
          Explore More
        </Link>
        <Link
          href={`/services/${service.id}`}
          className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all text-center shadow-xl shadow-indigo-100"
        >
          Book Another
        </Link>
      </div>
    </div>
  );
}
