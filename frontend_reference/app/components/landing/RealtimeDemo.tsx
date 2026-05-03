"use client";

import { useState } from "react";

const allSlots = [
  { time: "09:00 AM", available: true },
  { time: "10:30 AM", available: true },
  { time: "11:00 AM", available: false },
  { time: "01:00 PM", available: true },
  { time: "02:00 PM", available: true },
  { time: "03:30 PM", available: true },
  { time: "04:00 PM", available: true },
  { time: "05:00 PM", available: true },
  { time: "06:00 PM", available: true },
];

export function RealtimeDemo() {
  const [selectedSlot, setSelectedSlot] = useState("02:00 PM");

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              Watch availability update in real-time.
            </h2>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              Test the responsiveness of our grid. When a booking happens on
              another channel, the web availability vanishes instantly.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <svg
                  className="w-5 h-5 text-[#4F46E5] mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="font-bold text-slate-900">Zero Latency</p>
                  <p className="text-sm text-slate-500">
                    Global edge network ensures your availability is always
                    accurate.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Demo grid */}
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400" />
                <div>
                  <p className="font-bold text-slate-900">Dr. Sarah Smith</p>
                  <p className="text-xs text-slate-500">60 min Consult</p>
                </div>
              </div>
              <span className="text-xs font-semibold tracking-wider uppercase text-[#3525cd] px-3 py-1 bg-indigo-50 rounded-full">
                Next available: 2:00 PM
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {allSlots.map((slot) => {
                const isSelected = slot.time === selectedSlot;
                const isBooked = !slot.available;

                return (
                  <button
                    key={slot.time}
                    onClick={() =>
                      slot.available && setSelectedSlot(slot.time)
                    }
                    disabled={isBooked}
                    className={`py-3 rounded-xl font-medium text-sm transition-all ${
                      isBooked
                        ? "bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed"
                        : isSelected
                        ? "bg-[#4F46E5] text-white border border-[#4F46E5] shadow-lg shadow-indigo-500/20"
                        : "bg-white border border-slate-200 hover:border-[#4F46E5] hover:text-[#4F46E5]"
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
