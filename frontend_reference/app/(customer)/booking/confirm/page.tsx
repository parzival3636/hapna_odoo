"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") || "HAP-8829";

  return (
    <div className="w-full pt-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Success & Details */}
        <section className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
          <div className="space-y-4 w-full">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-100">
              <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">Appointment Confirmed</h1>
            <p className="text-lg text-slate-500 max-w-md">
              Your strategy session has been successfully scheduled. We've sent a confirmation email with all the details.
            </p>
          </div>

          {/* Booking Card */}
          <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">BOOKING REFERENCE: {ref}</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                Confirmed
              </span>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Service</p>
                  <p className="text-base font-semibold text-slate-900">Strategy Consultation</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Provider</p>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-slate-900">Alex Carter</span>
                    <span className="material-symbols-outlined text-emerald-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                  <p className="text-base font-semibold text-slate-900">May 6, 9:30 AM</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Duration</p>
                  <p className="text-base font-semibold text-slate-900">60 min</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-3">
                <button className="flex-1 min-w-[150px] bg-indigo-600 text-white py-3 px-5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-lg">event</span>
                  Google Calendar
                </button>
                <button className="flex-1 min-w-[150px] border border-slate-200 text-slate-700 py-3 px-5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-lg">mail</span>
                  Outlook Calendar
                </button>
              </div>
            </div>
          </div>

          {/* Profile Completion Banner */}
          <div className="w-full flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                  <circle className="text-white" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4"></circle>
                  <circle
                    className="text-indigo-600"
                    cx="24" cy="24" fill="transparent" r="20"
                    stroke="currentColor"
                    strokeDasharray="125.6"
                    strokeDashoffset="44"
                    strokeWidth="4"
                  ></circle>
                </svg>
                <span className="absolute text-[10px] font-bold text-indigo-800">65%</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-900">Complete profile for faster bookings</p>
                <p className="text-xs text-indigo-600">Only 2 steps remaining</p>
              </div>
            </div>
            <Link href="/profile" className="text-indigo-600 hover:text-indigo-800 transition-colors">
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* Right: Status & Share */}
        <section className="space-y-8">
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <span className="material-symbols-outlined text-2xl">schedule</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold font-serif text-amber-900">Appointment Reserved</h2>
                <p className="text-sm text-amber-700">Awaiting organiser approval</p>
              </div>
            </div>

            {/* Conflict Warning */}
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-lg flex items-start gap-3 mb-8">
              <span className="material-symbols-outlined text-rose-600 text-xl">warning</span>
              <p className="text-sm text-rose-800 font-medium">
                ⚠️ You have another booking at this time (Internal Workshop: Q4 Planning)
              </p>
            </div>

            {/* Share */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Share This Booking</p>
              <div className="flex gap-4">
                <button className="flex-1 bg-slate-100 text-slate-900 py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                  <span className="material-symbols-outlined text-lg">content_copy</span>
                  Copy Link
                </button>
                <button className="w-14 h-14 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 transition-all text-emerald-600">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                </button>
              </div>
            </div>
          </div>

          {/* Inspirational Image Card */}
          <div className="relative rounded-xl overflow-hidden aspect-video shadow-xl">
            <Image
              src="https://lh3.googleusercontent.com/aida/ADBb0ugAlcOxgCNwS71v6E0TI1YokQernWs5ElOgie2wxMrSVLq2YDr4wYhmTuYgOtywZHX_DR69RDM__qI6nQPQrOP71kOAfngzvB_Za1vtRNu6vQMsAb-SlnxcdeCvTCx_4r9y_w-XwhMjIBXISA9_Ng-6Dwanh5Jy6ahup0fbjOk1kJLE7aap-41i7F1hFGxIz4Ub7wMPPOV3EZ3wAylGFbN2E81rBPKsuRa4lNepe3btU_4hky_W3fvxWEoqNB-AtWSUyZJsby0"
              alt="Consultation Space"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
              <div className="text-white">
                <p className="font-serif text-2xl mb-1 italic">"The future belongs to those who prepare for it today."</p>
                <p className="text-sm opacity-80 uppercase tracking-widest">— Strategy Team</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-4">
            <Link
              href="/services"
              className="flex-1 text-center py-3 px-6 border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Browse More Services
            </Link>
            <Link
              href="/profile"
              className="flex-1 text-center py-3 px-6 bg-slate-900 rounded-full text-sm font-semibold text-white hover:bg-slate-800 transition-all"
            >
              View My Bookings
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
