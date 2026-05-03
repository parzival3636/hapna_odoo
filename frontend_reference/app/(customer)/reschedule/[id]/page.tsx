"use client";

import { use, useState } from "react";
import Link from "next/link";
import { DatePicker } from "@/app/components/booking/DatePicker";
import { SlotGrid } from "@/app/components/booking/SlotGrid";

export default function ReschedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [step, setStep] = useState<"date" | "time">("date");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  return (
    <div className="w-full pt-8 pb-32">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-8">
        <Link className="hover:text-indigo-600 transition-colors" href={`/booking/${id}`}>Booking #{id}</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-slate-900">Reschedule</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-2">Reschedule Appointment</h1>
        <p className="text-lg text-slate-500">Pick a new date and time for booking <span className="font-semibold text-slate-700">#{id}</span></p>
      </header>

      {/* Progress */}
      <div className="max-w-md mb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setStep("date")}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${step === "date" ? "text-indigo-600" : "text-slate-400"}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step === "date" ? "bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-50" : selectedDate ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-400"
            }`}>
              {selectedDate ? "✓" : "1"}
            </div>
            Select Date
          </button>

          <div className="flex-1 h-px bg-slate-200"></div>

          <button
            onClick={() => selectedDate && setStep("time")}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${step === "time" ? "text-indigo-600" : "text-slate-400"}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step === "time" ? "bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-50" : "bg-slate-100 text-slate-400"
            }`}>
              2
            </div>
            Select Time
          </button>
        </div>
      </div>

      {/* Step Content */}
      {step === "date" && (
        <DatePicker selectedDate={selectedDate} onSelect={handleDateSelect} />
      )}
      {step === "time" && (
        <SlotGrid selectedDate={selectedDate} selectedTime={selectedTime} onSelect={handleTimeSelect} />
      )}

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-8 md:px-16 py-5 bg-white/90 backdrop-blur-2xl border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        {step === "date" ? (
          <>
            <Link
              href={`/booking/${id}`}
              className="flex items-center gap-2 text-slate-600 border border-slate-200 rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-slate-50 transition-all"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Cancel
            </Link>
            <button
              onClick={() => selectedDate && setStep("time")}
              disabled={!selectedDate}
              className={`flex items-center gap-2 rounded-full px-12 py-3 text-xs font-bold uppercase tracking-wider shadow-lg transition-all active:scale-95 ${
                selectedDate
                  ? "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Continue
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setStep("date")}
              className="flex items-center gap-2 text-slate-600 border border-slate-200 rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-slate-50 transition-all"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back
            </button>
            <button
              disabled={!selectedTime}
              className={`flex items-center gap-2 rounded-full px-12 py-3 text-xs font-bold uppercase tracking-wider shadow-lg transition-all active:scale-95 ${
                selectedTime
                  ? "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Confirm Reschedule
              <span className="material-symbols-outlined text-sm">check</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
