"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

interface ServiceQuestion {
  id: string;
  question_text: string;
  question_type: string;
  is_required: boolean;
  options?: string[] | null;
}

interface Service {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  location: string;
  venue_address: string;
  online_meeting_provider: string;
  capacity_per_slot: number;
  questions: ServiceQuestion[];
}

interface AvailableSlot {
  start_time: string;
  end_time: string;
  remaining_capacity: number;
}

export default function PublicBookingPage() {
  const { serviceId } = useParams();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

  // Answers keyed by question id
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    async function loadService() {
      try {
        const data = await fetchApi(`/services/${serviceId}/preview/`, {
          requireAuth: false,
        });
        setService(data);
        const initial: Record<string, string | string[]> = {};
        (data.questions ?? []).forEach((q: ServiceQuestion) => {
          initial[q.id] = q.question_type === "checkbox" ? [] : "";
        });
        setAnswers(initial);
      } catch (err: any) {
        setError("Service not found or unavailable.");
      } finally {
        setLoading(false);
      }
    }
    loadService();
  }, [serviceId]);

  // Load available dates
  useEffect(() => {
    if (!serviceId) return;
    async function loadDates() {
      try {
        const data = await fetchApi(
          `/services/${serviceId}/available-dates/`,
          { requireAuth: false }
        );
        setAvailableDates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load available dates:", err);
        setAvailableDates([]);
      }
    }
    loadDates();
  }, [serviceId]);

  // Load slots when date is selected
  useEffect(() => {
    if (!selectedDate || !serviceId) return;
    async function loadSlots() {
      setSlotLoading(true);
      setSelectedTime("");
      try {
        const data = await fetchApi(
          `/services/${serviceId}/slots/?date=${selectedDate}`,
          { requireAuth: false }
        );
        setAvailableSlots(data);
      } catch (err) {
        console.error("Failed to load slots:", err);
        setAvailableSlots([]);
      } finally {
        setSlotLoading(false);
      }
    }
    loadSlots();
  }, [selectedDate, serviceId]);

  // Available dates as Set for quick lookup
  const availableDateSet = useMemo(
    () => new Set(availableDates),
    [availableDates]
  );

  function updateAnswer(qId: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }

  function handleCheckboxToggle(qId: string, option: string) {
    setAnswers((prev) => {
      const current = (prev[qId] as string[]) || [];
      if (current.includes(option)) {
        return { ...prev, [qId]: current.filter((v) => v !== option) };
      }
      return { ...prev, [qId]: [...current, option] };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const questions = service?.questions ?? [];
    for (const q of questions) {
      const ans = answers[q.id];
      if (q.is_required) {
        const isEmpty =
          ans === undefined ||
          ans === "" ||
          (Array.isArray(ans) && ans.length === 0);
        if (isEmpty) {
          setError(`Please answer: "${q.question_text}"`);
          setSubmitting(false);
          return;
        }
      }
    }

    const answersPayload = questions
      .filter((q) => {
        const ans = answers[q.id];
        return (
          ans !== undefined &&
          ans !== "" &&
          !(Array.isArray(ans) && ans.length === 0)
        );
      })
      .map((q) => ({
        question_id: q.id,
        answer_text: Array.isArray(answers[q.id])
          ? (answers[q.id] as string[]).join(", ")
          : answers[q.id],
      }));

    try {
      await fetchApi("/bookings/create/", {
        method: "POST",
        body: JSON.stringify({
          service_id: serviceId,
          slot_date: selectedDate,
          slot_start: selectedTime,
          slot_end: selectedTime,
          booking_channel: "web",
          answers: answersPayload,
        }),
      });
      alert("Booking request submitted! Check your email for confirmation.");
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to submit booking");
      setSubmitting(false);
    }
  }

  // ── Calendar rendering ──────────────────────────
  function renderCalendar() {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(monthStart);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);

    const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const rows = [];
    let day = calStart;

    while (day <= calEnd) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const d = day;
        const dateStr = format(d, "yyyy-MM-dd");
        const isCurrentMonth = isSameMonth(d, monthStart);
        const isAvailable = availableDateSet.has(dateStr);
        const isSelected = selectedDate === dateStr;
        const isToday = isSameDay(d, new Date());
        const isPast = d < new Date(new Date().toDateString());

        week.push(
          <button
            type="button"
            key={dateStr}
            disabled={!isAvailable || !isCurrentMonth || isPast}
            onClick={() => {
              if (isAvailable && isCurrentMonth && !isPast) {
                setSelectedDate(dateStr);
              }
            }}
            className={`
              relative w-full aspect-square flex items-center justify-center text-sm font-medium rounded-xl transition-all
              ${!isCurrentMonth ? "opacity-15 cursor-default" : ""}
              ${isPast && isCurrentMonth ? "opacity-25 cursor-default" : ""}
              ${
                isAvailable && isCurrentMonth && !isPast
                  ? "cursor-pointer hover:bg-[rgba(124,58,237,0.1)] hover:text-[#a78bfa]"
                  : ""
              }
              ${
                isSelected
                  ? "bg-[#7c3aed] text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:bg-[#6d28d9] hover:text-white"
                  : ""
              }
              ${isToday && !isSelected ? "text-[#7c3aed] font-bold" : ""}
              ${
                !isAvailable && isCurrentMonth && !isPast
                  ? "text-[#374151] cursor-default"
                  : ""
              }
              ${isAvailable && !isSelected && isCurrentMonth && !isPast ? "text-white" : ""}
            `}
          >
            {format(d, "d")}
            {isAvailable && isCurrentMonth && !isPast && !isSelected && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#7c3aed]"></span>
            )}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {week}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
          >
            ←
          </button>
          <span className="text-sm font-semibold text-white">
            {format(calendarMonth, "MMMM yyyy")}
          </span>
          <button
            type="button"
            onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
          >
            →
          </button>
        </div>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayHeaders.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-bold text-[#64748b] uppercase tracking-wider py-1"
            >
              {d}
            </div>
          ))}
        </div>
        {/* Dates grid */}
        <div className="space-y-1">{rows}</div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="p-12 text-center text-white">
        Loading service details...
      </div>
    );
  if (!service)
    return <div className="p-12 text-center text-red-500">{error}</div>;

  const questions = service.questions ?? [];
  const isOnline = service.location === "Online";
  const isGroup = (service.capacity_per_slot || 1) > 1;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-8">
          <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
          <p className="text-[#94a3b8] mb-6">{service.description}</p>

          {/* Service info badges */}
          <div className="flex flex-wrap gap-4 mb-8 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.15)]">
              <span className="text-[#7c3aed]">⏱️</span>
              <span className="text-[#a78bfa] font-medium">
                {service.duration_minutes} min
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.15)]">
              <span className="text-[#7c3aed]">{isOnline ? "🎥" : "📍"}</span>
              <span className="text-[#a78bfa] font-medium">
                {isOnline ? "Online" : "In-Person"}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.15)]">
              <span className="text-[#7c3aed]">{isGroup ? "👥" : "👤"}</span>
              <span className="text-[#a78bfa] font-medium">
                {isGroup
                  ? `Group (up to ${service.capacity_per_slot})`
                  : "1-on-1"}
              </span>
            </div>
          </div>

          {/* Venue address for offline */}
          {!isOnline && service.venue_address && (
            <div className="mb-6 p-4 rounded-xl bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.15)]">
              <div className="flex items-start gap-3">
                <span className="text-lg">📍</span>
                <div>
                  <h4 className="text-sm font-semibold text-amber-400">
                    Venue Address
                  </h4>
                  <p className="text-sm text-[#94a3b8] mt-1">
                    {service.venue_address}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Online meeting provider */}
          {isOnline && service.online_meeting_provider !== "none" && (
            <div className="mb-6 p-4 rounded-xl bg-[rgba(66,133,244,0.05)] border border-[rgba(66,133,244,0.15)]">
              <div className="flex items-center gap-3">
                <span className="text-lg">🎥</span>
                <div>
                  <h4 className="text-sm font-semibold text-[#93bbfc]">
                    Online Meeting
                  </h4>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    A{" "}
                    {service.online_meeting_provider === "jitsi"
                      ? "Jitsi Meet"
                      : "Zoom"}{" "}
                    link will be sent to you upon booking confirmation
                  </p>
                </div>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 border-t border-[rgba(255,255,255,0.08)] pt-8"
          >
            {/* ── Date & Time selection ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Calendar */}
              <div>
                <label className="text-sm font-medium text-[#94a3b8] mb-3 block">
                  Select Date
                </label>
                <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)]">
                  {renderCalendar()}
                </div>
                {availableDates.length === 0 && (
                  <p className="text-xs text-amber-400 mt-2">
                    No dates available for this service yet. The organizer may
                    not have configured a schedule.
                  </p>
                )}
              </div>

              {/* Time slots */}
              <div>
                <label className="text-sm font-medium text-[#94a3b8] mb-3 block">
                  Select Time
                </label>
                {!selectedDate ? (
                  <div className="h-full min-h-[200px] flex items-center justify-center rounded-xl bg-[rgba(255,255,255,0.02)] border border-dashed border-[rgba(255,255,255,0.08)]">
                    <p className="text-xs text-[#4b5563] italic">
                      ← Select a date first
                    </p>
                  </div>
                ) : slotLoading ? (
                  <div className="h-full min-h-[200px] flex items-center justify-center rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)]">
                    <div className="text-sm text-[#64748b] animate-pulse">
                      Loading available slots...
                    </div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="h-full min-h-[200px] flex items-center justify-center rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)]">
                    <div className="text-center">
                      <p className="text-sm text-red-400 font-medium">
                        No slots available
                      </p>
                      <p className="text-xs text-[#64748b] mt-1">
                        All slots are booked for this date.
                        <br />
                        Try another date.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {availableSlots.map((s) => (
                      <button
                        key={s.start_time}
                        type="button"
                        onClick={() => setSelectedTime(s.start_time)}
                        className={`w-full py-3 px-4 rounded-xl border transition-all flex items-center justify-between group ${
                          selectedTime === s.start_time
                            ? "bg-[#7c3aed] border-[#7c3aed] text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                            : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)] text-[#94a3b8] hover:border-[rgba(124,58,237,0.3)] hover:text-white hover:bg-[rgba(124,58,237,0.05)]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold font-mono">
                            {s.start_time}
                          </span>
                          <span
                            className={`text-xs ${
                              selectedTime === s.start_time
                                ? "text-white/60"
                                : "text-[#4b5563]"
                            }`}
                          >
                            – {s.end_time}
                          </span>
                        </div>
                        {isGroup && (
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              selectedTime === s.start_time
                                ? "bg-white/20 text-white"
                                : s.remaining_capacity <= 2
                                ? "bg-red-500/10 text-red-400"
                                : "bg-emerald-500/10 text-emerald-400"
                            }`}
                          >
                            {s.remaining_capacity} spot
                            {s.remaining_capacity !== 1 ? "s" : ""} left
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Dynamic questions ── */}
            {questions.length > 0 && (
              <div className="space-y-5 border-t border-[rgba(255,255,255,0.08)] pt-6">
                <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider">
                  Additional Information
                </h3>
                {questions.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <label className="text-sm font-medium text-white flex items-center gap-1">
                      {q.question_text}
                      {q.is_required && (
                        <span className="text-[#ef4444] text-xs">*</span>
                      )}
                    </label>

                    {/* Single line text */}
                    {q.question_type === "single_line" && (
                      <input
                        type="text"
                        value={(answers[q.id] as string) || ""}
                        onChange={(e) => updateAnswer(q.id, e.target.value)}
                        className="auth-input"
                        required={q.is_required}
                        placeholder="Your answer"
                      />
                    )}

                    {/* Multi-line text */}
                    {q.question_type === "multi_line" && (
                      <textarea
                        value={(answers[q.id] as string) || ""}
                        onChange={(e) => updateAnswer(q.id, e.target.value)}
                        className="auth-input min-h-[80px] py-3"
                        required={q.is_required}
                        placeholder="Your answer"
                      />
                    )}

                    {/* Phone number */}
                    {q.question_type === "phone" && (
                      <input
                        type="tel"
                        value={(answers[q.id] as string) || ""}
                        onChange={(e) => updateAnswer(q.id, e.target.value)}
                        className="auth-input"
                        required={q.is_required}
                        placeholder="e.g. +91 98765 43210"
                      />
                    )}

                    {/* Radio (one answer) */}
                    {q.question_type === "radio" && q.options && (
                      <div className="space-y-2 pl-1">
                        {q.options.map((opt) => (
                          <label
                            key={opt}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <span
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                (answers[q.id] as string) === opt
                                  ? "border-[#7c3aed] bg-[#7c3aed]"
                                  : "border-[rgba(255,255,255,0.25)] group-hover:border-[rgba(255,255,255,0.4)]"
                              }`}
                            >
                              {(answers[q.id] as string) === opt && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </span>
                            <input
                              type="radio"
                              name={`q_${q.id}`}
                              value={opt}
                              checked={(answers[q.id] as string) === opt}
                              onChange={() => updateAnswer(q.id, opt)}
                              className="sr-only"
                              required={q.is_required && !answers[q.id]}
                            />
                            <span className="text-sm text-[#cbd5e1]">
                              {opt}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Checkboxes (multiple answers) */}
                    {q.question_type === "checkbox" && q.options && (
                      <div className="space-y-2 pl-1">
                        {q.options.map((opt) => {
                          const checked = (
                            (answers[q.id] as string[]) || []
                          ).includes(opt);
                          return (
                            <label
                              key={opt}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              <span
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                  checked
                                    ? "bg-[#7c3aed] border-[#7c3aed]"
                                    : "border-[rgba(255,255,255,0.25)] group-hover:border-[rgba(255,255,255,0.4)]"
                                }`}
                              >
                                {checked && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </span>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  handleCheckboxToggle(q.id, opt)
                                }
                                className="sr-only"
                              />
                              <span className="text-sm text-[#cbd5e1]">
                                {opt}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Fallback for unknown types */}
                    {![
                      "single_line",
                      "multi_line",
                      "phone",
                      "radio",
                      "checkbox",
                    ].includes(q.question_type) && (
                      <input
                        type="text"
                        value={(answers[q.id] as string) || ""}
                        onChange={(e) => updateAnswer(q.id, e.target.value)}
                        className="auth-input"
                        placeholder="Your answer"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !selectedDate || !selectedTime}
              className={`w-full py-4 rounded-xl bg-[#7c3aed] text-white font-bold text-lg hover:bg-[#6d28d9] transition-all ${
                submitting || !selectedDate || !selectedTime
                  ? "opacity-50 cursor-not-allowed"
                  : "shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]"
              }`}
            >
              {submitting ? "Processing..." : "Confirm Booking"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
