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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, ExternalLink, Filter } from "lucide-react";

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
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div>
        <div className="flex items-center gap-2 text-brand-primary mb-2">
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Global Schedule</span>
        </div>
        <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight">
          {format(currentDate, "MMMM yyyy")}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-card">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-slate-50 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-brand-primary transition-all"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-slate-50 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderLegend = () => (
    <div className="flex flex-wrap items-center gap-6 mb-10 pb-6 border-b border-slate-100">
      <button
        onClick={() => setShowHapna(!showHapna)}
        className={`flex items-center gap-3 px-4 py-2 rounded-pill transition-all ${
          showHapna ? "bg-indigo-50 border border-indigo-100" : "bg-white border border-slate-100 opacity-50"
        }`}
      >
        <div className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(91,78,232,0.4)]" />
        <span className={`text-[10px] font-black uppercase tracking-widest ${showHapna ? "text-indigo-700" : "text-slate-400"}`}>
          Hapna Bookings
        </span>
      </button>
      <button
        onClick={() => setShowGoogle(!showGoogle)}
        className={`flex items-center gap-3 px-4 py-2 rounded-pill transition-all ${
          showGoogle ? "bg-teal-50 border border-teal-100" : "bg-white border border-slate-100 opacity-50"
        }`}
      >
        <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]" />
        <span className={`text-[10px] font-black uppercase tracking-widest ${showGoogle ? "text-teal-700" : "text-slate-400"}`}>
          Google Calendar
        </span>
      </button>
      
      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Approval</span>
        </div>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-4"
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
            className={`min-h-[140px] p-4 border border-slate-100 transition-all cursor-pointer relative group ${
              !isSameMonth(day, monthStart) ? "bg-slate-50/50 opacity-30" : "bg-white"
            } ${isToday ? "ring-2 ring-brand-primary ring-inset z-10" : ""} ${
              isSelected ? "bg-brand-soft/50 z-10" : "hover:bg-slate-50"
            }`}
          >
            <span
              className={`text-sm font-black ${
                isToday ? "text-brand-primary" : "text-slate-900"
              }`}
            >
              {formattedDate}
            </span>
            <div className="mt-4 space-y-1.5">
              {dayEvents.slice(0, 3).map((ev) => (
                <div
                  key={ev.id}
                  className={`text-[10px] px-2.5 py-1.5 rounded-lg truncate font-bold uppercase tracking-wider ${
                    ev.source === "google"
                      ? "bg-teal-500 text-white shadow-sm"
                      : ev.status === "confirmed"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-amber-500 text-white shadow-sm"
                  }`}
                >
                  {formatTime(ev.start)} {ev.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1 mt-2">
                  + {dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 border-collapse" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-card">
        {rows}
      </div>
    );
  };

  const renderDayDetail = () => {
    if (!selectedDay) return null;
    const dayEvents = getEventsForDay(selectedDay);
    const isToday = isSameDay(selectedDay, new Date());

    return (
      <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">Detailed View</p>
            <h3 className="text-2xl font-heading font-black text-slate-900">
              {format(selectedDay, "EEEE, MMMM d")}
              {isToday && (
                <span className="ml-3 text-[10px] font-black text-white bg-brand-primary px-3 py-1 rounded-pill uppercase tracking-widest">
                  Today
                </span>
              )}
            </h3>
          </div>
          <button
            onClick={() => setSelectedDay(null)}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-all"
          >
            ✕
          </button>
        </div>

        {dayEvents.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[2rem] p-12 text-center shadow-card">
            <p className="text-base font-medium text-slate-400">
              Clear schedule for this day.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dayEvents.map((ev) => (
              <div
                key={ev.id}
                className={`p-6 rounded-[2rem] border transition-all shadow-card group ${
                  ev.source === "google"
                    ? "bg-white border-teal-100 hover:border-teal-500"
                    : "bg-white border-indigo-100 hover:border-indigo-500"
                }`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${
                        ev.source === "google"
                          ? "bg-teal-500 text-white"
                          : "bg-indigo-600 text-white"
                      }`}
                    >
                      {ev.source === "google" ? "G" : "H"}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 group-hover:text-brand-primary transition-colors leading-tight">
                        {ev.title}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(ev.start)} – {formatTime(ev.end)}
                        </div>
                      </div>
                    </div>
                  </div>
                  {ev.status && (
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-pill shadow-sm ${
                        ev.status === "confirmed"
                          ? "text-white bg-indigo-600"
                          : ev.status === "pending"
                          ? "text-white bg-amber-500"
                          : "text-slate-500 bg-slate-50"
                      }`}
                    >
                      {ev.status}
                    </span>
                  )}
                </div>
                
                {ev.description && (
                  <p className="text-sm font-medium text-slate-500 mb-4 line-clamp-2">
                    {ev.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                  {ev.location && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {ev.location}
                    </div>
                  )}
                  {ev.htmlLink && ev.source === "google" && (
                    <a
                      href={ev.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1.5 text-[10px] font-black text-teal-600 uppercase tracking-widest hover:underline"
                    >
                      External <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 p-12 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-xs">
          <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          Synchronizing calendar...
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {renderHeader()}
      {renderLegend()}
      {renderDays()}
      {renderCells()}
      {renderDayDetail()}
    </div>
  );
}
