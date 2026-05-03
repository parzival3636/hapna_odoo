"use client";

import { useState, useEffect, useRef } from "react";
import { customerApi } from "@/lib/customer-api";
import type { BookingState } from "./page";

interface Props {
  service: any;
  state: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onBack: () => void;
}

const HOLD_DURATION_SEC = 10 * 60; // 10 minutes
const HEARTBEAT_MS = 3 * 60 * 1000; // 3 minutes

export default function StepIntakeForm({ service, state, update, onBack }: Props) {
  const questions = service.questions || [];
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    questions.forEach((q: any) => {
      const existing = state.answers.find((a) => a.question_id === q.id);
      init[q.id] = existing?.value || "";
    });
    return init;
  });
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [alternatives, setAlternatives] = useState<string[]>([]);
  // Layer 2 — hold expiry countdown
  const [holdSecondsLeft, setHoldSecondsLeft] = useState(HOLD_DURATION_SEC);
  const [holdExpired, setHoldExpired] = useState(false);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const holdCreatedAt = useRef(Date.now());
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Layer 2 — Countdown timer
  useEffect(() => {
    holdCreatedAt.current = Date.now();
    countdownRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - holdCreatedAt.current) / 1000);
      const left = HOLD_DURATION_SEC - elapsed;
      if (left <= 0) {
        setHoldExpired(true);
        setHoldSecondsLeft(0);
        clearInterval(countdownRef.current!);
      } else {
        setHoldSecondsLeft(left);
      }
    }, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [state.holdId]);

  // Layer 2 — Heartbeat: extend hold every 3 min while user is on this page
  useEffect(() => {
    if (!state.holdId) return;
    heartbeatRef.current = setInterval(async () => {
      try {
        await customerApi(`/slots/hold/${state.holdId}/`, {
          method: "PATCH",
          requireAuth: true,
        });
        // Reset countdown after successful extend
        holdCreatedAt.current = Date.now();
        setHoldSecondsLeft(HOLD_DURATION_SEC);
        setHoldExpired(false);
      } catch {
        // Hold already expired — mark it
        setHoldExpired(true);
      }
    }, HEARTBEAT_MS);
    return () => { if (heartbeatRef.current) clearInterval(heartbeatRef.current); };
  }, [state.holdId]);

  // Layer 3/B5 — Conflict Warning: check if user already has an appointment at this time
  useEffect(() => {
    async function checkConflicts() {
      if (!state.selectedDate || !state.selectedSlot) return;
      try {
        const bookings = await customerApi(`/bookings/mine/?date=${state.selectedDate}`, {
          requireAuth: true,
        });
        
        const overlap = bookings.find((b: any) => {
          // Exclude cancelled/rescheduled from conflict check
          if (["cancelled", "rescheduled"].includes(b.status)) return false;
          
          const s1 = b.slot_start.slice(0, 5);
          const e1 = b.slot_end.slice(0, 5);
          const s2 = state.selectedSlot!.start;
          const e2 = state.selectedSlot!.end;
          
          // Check for time overlap
          return (s1 < e2 && s2 < e1);
        });

        if (overlap) {
          setConflictWarning(`⚠️ You already have a booking (${overlap.service_title || 'another service'}) overlapping this time slot (${overlap.slot_start.slice(0,5)} - ${overlap.slot_end.slice(0,5)}).`);
        } else {
          setConflictWarning(null);
        }
      } catch (err) {
        // ignore errors for conflict check
      }
    }
    checkConflicts();
  }, [state.selectedDate, state.selectedSlot]);

  function updateAnswer(qId: string, val: string) {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  }

  async function handleSubmit() {
    if (holdExpired) {
      setError("Your slot reservation expired. Please go back and pick a slot again.");
      return;
    }

    // Validate required
    for (const q of questions) {
      if (q.is_required && !answers[q.id]?.trim()) {
        setError(`Please answer: "${q.question_text}"`);
        return;
      }
    }

    setSubmitting(true);
    setError("");
    setAlternatives([]);

    const answersPayload = questions
      .filter((q: any) => answers[q.id]?.trim())
      .map((q: any) => ({
        question_id: q.id,
        value: answers[q.id],
      }));

    try {
      // ── Layer 3 — Booking creation (atomic, select_for_update on backend) ──
      const booking = await customerApi("/bookings/", {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify({
          service_id: state.serviceId,
          slot_date: state.selectedDate,
          slot_start: state.selectedSlot!.start,
          slot_end: state.selectedSlot!.end,
          hold_id: state.holdId,
          capacity_booked: state.capacity,
          ...(state.resourceId ? { resource_id: state.resourceId } : {}),
          answers: answersPayload,
          notes,
        }),
      });
      update({
        bookingId: booking.id,
        bookingData: booking,
        answers: answersPayload,
        step: 3,
      });
    } catch (err: any) {
      const code = err?.data?.code || err?.code;
      const msg = err?.data?.message || err?.message || "Failed to create booking.";

      if (code === "SLOT_FULL") {
        // Layer 3: 409 with alternatives from backend
        const alts: string[] = err?.data?.alternatives || [];
        setAlternatives(alts);
        setError("⚡ This slot just filled up while you were on the form.");
      } else if (code === "HOLD_EXPIRED") {
        setHoldExpired(true);
        setError("Your slot reservation expired. Please go back and re-select.");
      } else {
        setError(msg);
      }
      setSubmitting(false);
    }
  }

  async function handleBack() {
    if (!holdExpired && state.holdId) {
      const confirmRelease = window.confirm(
        "Are you sure you want to go back? This will release your current slot reservation."
      );
      if (!confirmRelease) return;

      try {
        await customerApi(`/slots/hold/${state.holdId}/`, {
          method: "DELETE",
          requireAuth: true,
        });
      } catch {
        // ignore idempotent deletion errors
      }
    }
    
    update({ holdId: undefined, selectedSlot: null });
    onBack();
  }

  const slotLabel = state.selectedSlot
    ? `${state.selectedSlot.start} – ${state.selectedSlot.end}`
    : "";
  const dateLabel = state.selectedDate
    ? new Date(state.selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "";

  const holdMinutes = Math.floor(holdSecondsLeft / 60);
  const holdSecs = holdSecondsLeft % 60;
  const holdUrgent = holdSecondsLeft <= 60;

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl font-black text-slate-900">Finalize Booking</h2>
        <button
          onClick={handleBack}
          className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest px-4 py-2 bg-indigo-50 rounded-xl transition-all"
        >
          ← Change Slot
        </button>
      </div>

      {/* Summary + Hold Timer */}
      <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Appointment Date</p>
              <p className="text-sm font-black text-slate-900">{dateLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time & Seats</p>
              <p className="text-sm font-black text-slate-900">{slotLabel} • {state.capacity} Guest{state.capacity > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-200/50 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${holdExpired ? 'bg-red-500' : (holdUrgent ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500')}`} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reservation Hold</span>
           </div>
           {holdExpired ? (
              <span className="text-xs font-black text-red-500 uppercase tracking-widest">Expired</span>
            ) : (
              <span className={`text-sm font-black font-mono ${holdUrgent ? "text-red-500 animate-pulse" : "text-emerald-600"}`}>
                {holdMinutes}:{holdSecs.toString().padStart(2, "0")}
              </span>
            )}
        </div>
      </div>

      {/* Hold expired banner */}
      {holdExpired && (
        <div className="mb-10 p-6 rounded-[2rem] bg-red-50 border border-red-100 flex flex-col items-center text-center animate-shake">
          <p className="text-red-600 font-black uppercase tracking-widest text-xs mb-4">
            ⏰ Reservation Expired
          </p>
          <button
            onClick={handleBack}
            className="px-8 py-3 bg-red-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-100"
          >
            Select New Slot
          </button>
        </div>
      )}

      {/* Pre-Booking Conflict Warning */}
      {conflictWarning && (
        <div className="mb-10 p-6 rounded-[2rem] bg-amber-50 border border-amber-100">
          <p className="text-amber-700 font-bold text-sm mb-2">
            {conflictWarning}
          </p>
          <p className="text-amber-600/70 text-[10px] font-black uppercase tracking-widest">
            Please verify your availability
          </p>
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div className="space-y-8 mb-10">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
            <span className="w-1 h-4 bg-indigo-600 rounded-full" />
            Intake Requirements
          </h3>
          {questions.map((q: any) => (
            <div key={q.id} className="space-y-3">
              <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                {q.question_text}
                {q.is_required && (
                  <span className="text-red-500 text-[10px] font-black uppercase">Required</span>
                )}
              </label>
              {q.question_type === "radio" && q.options ? (
                <div className="flex flex-wrap gap-3">
                  {q.options.map((opt: string) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateAnswer(q.id, opt)}
                      className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${
                        answers[q.id] === opt
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                          : "bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50 shadow-sm"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : q.question_type === "checkbox" && q.options ? (
                <div className="flex flex-wrap gap-3">
                  {q.options.map((opt: string) => {
                    const selected = (answers[q.id] || "").split(",").filter(Boolean);
                    const isChecked = selected.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          const s = selected.includes(opt)
                            ? selected.filter((x) => x !== opt)
                            : [...selected, opt];
                          updateAnswer(q.id, s.join(","));
                        }}
                        className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${
                          isChecked
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50 shadow-sm"
                        }`}
                      >
                        {isChecked ? "✓ " : ""}{opt}
                      </button>
                    );
                  })}
                </div>
              ) : q.question_type === "multi_line" ? (
                <textarea
                  value={answers[q.id] || ""}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[120px]"
                  placeholder="Tell us more..."
                />
              ) : (
                <input
                  type={q.question_type === "phone" ? "tel" : "text"}
                  value={answers[q.id] || ""}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  placeholder="Enter answer"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      <div className="mb-12 space-y-3">
        <label className="text-sm font-black text-slate-700">
          Personal Notes <span className="text-[10px] font-black text-slate-400 uppercase ml-2">(Optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[100px]"
          placeholder="Anything else we should know?"
        />
      </div>

      {/* Error + Alternatives */}
      {error && (
        <div className="mb-10 p-6 rounded-[2rem] bg-red-50 border border-red-100 animate-shake">
          <p className="text-red-600 font-bold text-sm mb-4">{error}</p>
          {alternatives.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Suggested Alternatives</p>
              <div className="flex flex-wrap gap-2">
                {alternatives.map((alt) => (
                  <button
                    key={alt}
                    onClick={handleBack}
                    className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-white border border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                  >
                    {alt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || holdExpired}
        className={`w-full py-6 rounded-[2rem] font-black text-xl transition-all shadow-2xl ${
          submitting || holdExpired
            ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
            : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] shadow-indigo-200"
        }`}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
            Creating Appointment...
          </span>
        ) : holdExpired ? (
          "Hold Expired"
        ) : (
          "Confirm Booking"
        )}
      </button>
    </div>
  );
}
