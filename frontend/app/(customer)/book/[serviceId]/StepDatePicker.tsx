"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

interface Props {
  serviceId: string;
  resourceId: string | null;
  selectedDate: string | null;
  onSelect: (date: string) => void;
}

export default function StepDatePicker({
  serviceId,
  resourceId,
  selectedDate,
  onSelect,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    async function loadAvail() {
      try {
        const data = await fetchApi(
          `/services/${serviceId}/available-dates/`,
          { requireAuth: false }
        );
        setAvailableDates(data || []);
      } catch {
        /* empty */
      }
    }
    loadAvail();
  }, [serviceId, resourceId]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(
    currentMonth.year,
    currentMonth.month + 1,
    0
  ).getDate();
  const firstDay = new Date(
    currentMonth.year,
    currentMonth.month,
    1
  ).getDay();

  const monthName = new Date(
    currentMonth.year,
    currentMonth.month
  ).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  function prevMonth() {
    setCurrentMonth((c) => {
      const d = new Date(c.year, c.month - 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }
  function nextMonth() {
    setCurrentMonth((c) => {
      const d = new Date(c.year, c.month + 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function dateStr(day: number) {
    const m = String(currentMonth.month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${currentMonth.year}-${m}-${d}`;
  }

  function isPast(day: number) {
    const d = new Date(currentMonth.year, currentMonth.month, day);
    return d < today;
  }

  function isAvailable(day: number) {
    return availableDates.includes(dateStr(day));
  }

  return (
    <div className="p-2">
      <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
        Select a Date
      </h2>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-8 bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <button
          onClick={prevMonth}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 flex items-center justify-center transition-all shadow-sm active:scale-95"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span className="font-black text-slate-900 uppercase tracking-widest text-sm">{monthName}</span>
        <button
          onClick={nextMonth}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 flex items-center justify-center transition-all shadow-sm active:scale-95"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="text-center text-[10px] text-slate-400 py-1 font-black uppercase tracking-widest"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const ds = dateStr(day);
          const past = isPast(day);
          const avail = isAvailable(day);
          const selected = ds === selectedDate;
          return (
            <button
              key={day}
              disabled={past}
              onClick={() => onSelect(ds)}
              className={`aspect-square rounded-xl text-sm font-black flex items-center justify-center relative transition-all border-2 ${
                past
                  ? "text-slate-200 border-transparent cursor-not-allowed"
                  : selected
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                  : avail
                  ? "bg-white border-slate-100 text-slate-900 hover:border-indigo-500 hover:text-indigo-600 cursor-pointer shadow-sm"
                  : "bg-white border-transparent text-slate-400 hover:bg-slate-50 cursor-pointer"
              }`}
            >
              {day}
              {avail && !selected && (
                <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selected</span>
        </div>
      </div>
    </div>
  );
}
