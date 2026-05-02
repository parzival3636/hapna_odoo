"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  status?: string;
  color?: string;
  source?: "hapna" | "google";
  description?: string;
  location?: string;
  htmlLink?: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<CalendarEvent[]>([]);
  const [googleEvents, setGoogleEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showGoogle, setShowGoogle] = useState(true);
  const [showHapna, setShowHapna] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentDate]);

  async function loadData() {
    setLoading(true);
    const month = format(currentDate, "yyyy-MM");

    const [bookingsData, googleData] = await Promise.allSettled([
      fetchApi(`/bookings/calendar/?month=${month}`),
      fetchApi(`/bookings/google-events/?month=${month}`),
    ]);

    if (bookingsData.status === "fulfilled") {
      const items = Array.isArray(bookingsData.value) ? bookingsData.value : [];
      setBookings(
        items.map((b: any) => ({
          ...b,
          source: "hapna" as const,
        }))
      );
    }

    if (googleData.status === "fulfilled") {
      const items = Array.isArray(googleData.value) ? googleData.value : [];
      setGoogleEvents(
        items.map((e: any) => ({
          ...e,
          source: "google" as const,
        }))
      );
    }

    setLoading(false);
  }

  // Merge events for display
  const allEvents: CalendarEvent[] = [
    ...(showHapna ? bookings : []),
    ...(showGoogle ? googleEvents : []),
  ];

  function getEventsForDay(day: Date): CalendarEvent[] {
    return allEvents.filter((ev) => {
      try {
        const evDate = new Date(ev.start);
        return isSameDay(evDate, day);
      } catch {
        return false;
      }
    });
  }

  function formatTime(isoString: string) {
    try {
      const d = new Date(isoString);
      return format(d, "HH:mm");
    } catch {
      return "";
    }
  }

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Calendar</h1>
        <p className="text-[#94a3b8]">{format(currentDate, "MMMM yyyy")}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] text-[#94a3b8] hover:bg-[rgba(255,255,255,0.1)] hover:text-white transition-all"
        >
          ←
        </button>
        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] text-white font-medium hover:bg-[rgba(255,255,255,0.1)] transition-all"
        >
          Today
        </button>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] text-[#94a3b8] hover:bg-[rgba(255,255,255,0.1)] hover:text-white transition-all"
        >
          →
        </button>
      </div>
    </div>
  );

  const renderLegend = () => (
    <div className="flex items-center gap-6 mb-6 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
      <button
        onClick={() => setShowHapna(!showHapna)}
        className={`flex items-center gap-2 text-sm transition-all ${
          showHapna ? "opacity-100" : "opacity-40"
        }`}
      >
        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
        <span className="text-[#94a3b8] font-medium">Hapna Bookings</span>
      </button>
      <button
        onClick={() => setShowGoogle(!showGoogle)}
        className={`flex items-center gap-2 text-sm transition-all ${
          showGoogle ? "opacity-100" : "opacity-40"
        }`}
      >
        <span className="w-3 h-3 rounded-full bg-[#4285f4]"></span>
        <span className="text-[#94a3b8] font-medium">Google Calendar</span>
      </button>
      <div className="flex items-center gap-2 text-sm ml-auto">
        <span className="w-3 h-3 rounded-full bg-amber-500"></span>
        <span className="text-[#64748b]">Pending</span>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-bold text-[#64748b] uppercase tracking-widest py-2"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cloneDay = day;
        const dayEvents = getEventsForDay(cloneDay);
        const isToday = isSameDay(day, new Date());
        const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;

        days.push(
          <div
            key={day.toString()}
            onClick={() => setSelectedDay(cloneDay)}
            className={`min-h-[120px] p-2 border border-[rgba(255,255,255,0.05)] transition-all cursor-pointer hover:bg-[rgba(255,255,255,0.02)] ${
              !isSameMonth(day, monthStart) ? "opacity-20" : ""
            } ${isToday ? "bg-[rgba(124,58,237,0.05)]" : ""} ${
              isSelected
                ? "ring-2 ring-[#7c3aed] ring-inset bg-[rgba(124,58,237,0.08)]"
                : ""
            }`}
          >
            <span
              className={`text-sm font-medium ${
                isToday ? "text-[#7c3aed]" : "text-[#94a3b8]"
              }`}
            >
              {formattedDate}
            </span>
            <div className="mt-2 space-y-1">
              {dayEvents.slice(0, 3).map((ev) => (
                <div
                  key={ev.id}
                  className={`text-[10px] p-1.5 rounded-md truncate border ${
                    ev.source === "google"
                      ? "bg-[rgba(66,133,244,0.1)] border-[rgba(66,133,244,0.2)] text-[#93bbfc]"
                      : ev.status === "confirmed"
                      ? "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)] text-emerald-400"
                      : "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)] text-amber-400"
                  }`}
                >
                  {ev.source === "google" && (
                    <span className="mr-1 opacity-70">G</span>
                  )}
                  {formatTime(ev.start)} {ev.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-[10px] text-[#64748b] pl-1">
                  + {dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return (
      <div className="glass-card overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)]">
        {rows}
      </div>
    );
  };

  const renderDayDetail = () => {
    if (!selectedDay) return null;
    const dayEvents = getEventsForDay(selectedDay);
    const isToday = isSameDay(selectedDay, new Date());

    return (
      <div className="mt-6 glass-card p-6 rounded-xl border border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {format(selectedDay, "EEEE, MMMM d, yyyy")}
            {isToday && (
              <span className="ml-2 text-xs font-normal text-[#7c3aed] bg-[rgba(124,58,237,0.1)] px-2 py-0.5 rounded-full">
                Today
              </span>
            )}
          </h3>
          <button
            onClick={() => setSelectedDay(null)}
            className="text-[#64748b] hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {dayEvents.length === 0 ? (
          <p className="text-sm text-[#64748b] py-6 text-center">
            No events on this day
          </p>
        ) : (
          <div className="space-y-3">
            {dayEvents.map((ev) => (
              <div
                key={ev.id}
                className={`p-4 rounded-xl border transition-all ${
                  ev.source === "google"
                    ? "bg-[rgba(66,133,244,0.05)] border-[rgba(66,133,244,0.15)]"
                    : "bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.15)]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        ev.source === "google"
                          ? "bg-[rgba(66,133,244,0.2)] text-[#93bbfc]"
                          : "bg-[rgba(16,185,129,0.2)] text-emerald-400"
                      }`}
                    >
                      {ev.source === "google" ? "G" : "H"}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {ev.title}
                      </h4>
                      <p className="text-xs text-[#94a3b8]">
                        {formatTime(ev.start)} – {formatTime(ev.end)}
                      </p>
                    </div>
                  </div>
                  {ev.status && (
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        ev.status === "confirmed"
                          ? "text-emerald-400 bg-emerald-500/10"
                          : ev.status === "pending"
                          ? "text-amber-400 bg-amber-500/10"
                          : "text-[#64748b] bg-[rgba(255,255,255,0.05)]"
                      }`}
                    >
                      {ev.status}
                    </span>
                  )}
                </div>
                {ev.description && (
                  <p className="text-xs text-[#64748b] mt-2 pl-11 line-clamp-2">
                    {ev.description}
                  </p>
                )}
                {ev.location && (
                  <p className="text-xs text-[#94a3b8] mt-1 pl-11">
                    📍 {ev.location}
                  </p>
                )}
                {ev.htmlLink && ev.source === "google" && (
                  <a
                    href={ev.htmlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#4285f4] hover:underline mt-2 pl-11 inline-block"
                  >
                    Open in Google Calendar →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading)
    return <div className="p-8 text-white">Loading calendar...</div>;

  return (
    <div className="p-8">
      {renderHeader()}
      {renderLegend()}
      {renderDays()}
      {renderCells()}
      {renderDayDetail()}
    </div>
  );
}
