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
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold mb-6">Select a Date</h2>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-9 h-9 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] flex items-center justify-center transition-all"
        >
          ‹
        </button>
        <span className="font-semibold">{monthName}</span>
        <button
          onClick={nextMonth}
          className="w-9 h-9 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] flex items-center justify-center transition-all"
        >
          ›
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="text-center text-xs text-[#64748b] py-1 font-medium"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
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
              className={`aspect-square rounded-lg text-sm font-medium flex items-center justify-center relative transition-all ${
                past
                  ? "text-[#334155] cursor-not-allowed"
                  : selected
                  ? "bg-[#7c3aed] text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                  : avail
                  ? "text-white hover:bg-[rgba(124,58,237,0.2)] cursor-pointer"
                  : "text-[#94a3b8] hover:bg-[rgba(255,255,255,0.05)] cursor-pointer"
              }`}
            >
              {day}
              {avail && !selected && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
              )}
            </button>
          );
        })}
      </div>

      {availableDates.length > 0 && (
        <div className="mt-4 flex items-center gap-3 text-xs text-[#64748b]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#4ade80]" /> Available
          </span>
        </div>
      )}
    </div>
  );
}
