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
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Complete Your Booking</h2>
        <button
          onClick={onBack}
          className="text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          ← Change Slot
        </button>
      </div>

      {/* Summary + Hold Timer */}
      <div className="bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.2)] rounded-xl p-4 mb-6">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-[#64748b]">Date:</span>{" "}
            <span className="text-white font-medium">{dateLabel}</span>
          </div>
          <div>
            <span className="text-[#64748b]">Time:</span>{" "}
            <span className="text-white font-medium">{slotLabel}</span>
          </div>
          <div>
            <span className="text-[#64748b]">Seats:</span>{" "}
            <span className="text-white font-medium">{state.capacity}</span>
          </div>
          <div>
            <span className="text-[#64748b]">Hold:</span>{" "}
            {holdExpired ? (
              <span className="text-[#ef4444] font-medium text-xs">Expired ✗</span>
            ) : (
              <span
                className={`font-mono font-medium text-xs ${
                  holdUrgent ? "text-[#ef4444] animate-pulse" : "text-[#4ade80]"
                }`}
              >
                {holdUrgent ? "⚠ " : ""}
                {holdMinutes}:{holdSecs.toString().padStart(2, "0")} left
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hold expired banner */}
      {holdExpired && (
        <div className="mb-6 p-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)]">
          <p className="text-[#ef4444] font-medium text-sm mb-2">
            ⏰ Your slot reservation has expired.
          </p>
          <button
            onClick={onBack}
            className="text-sm text-white bg-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.5)] px-4 py-2 rounded-lg transition-all"
          >
            ← Go back and pick a slot
          </button>
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div className="space-y-5 mb-6">
          <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider">
            Intake Questions
          </h3>
          {questions.map((q: any) => (
            <div key={q.id} className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center gap-1">
                {q.question_text}
                {q.is_required && (
                  <span className="text-[#ef4444] text-xs">*</span>
                )}
              </label>
              {q.question_type === "radio" && q.options ? (
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt: string) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateAnswer(q.id, opt)}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        answers[q.id] === opt
                          ? "bg-[#7c3aed] text-white"
                          : "bg-[rgba(255,255,255,0.05)] text-[#94a3b8] hover:bg-[rgba(255,255,255,0.08)]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : q.question_type === "checkbox" && q.options ? (
                <div className="flex flex-wrap gap-2">
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
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${
                          isChecked
                            ? "bg-[#7c3aed] text-white"
                            : "bg-[rgba(255,255,255,0.05)] text-[#94a3b8] hover:bg-[rgba(255,255,255,0.08)]"
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
                  className="auth-input min-h-[80px]"
                  placeholder="Your answer"
                />
              ) : (
                <input
                  type={q.question_type === "phone" ? "tel" : "text"}
                  value={answers[q.id] || ""}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                  className="auth-input"
                  placeholder="Your answer"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      <div className="mb-6 space-y-2">
        <label className="text-sm font-medium text-[#94a3b8]">
          Additional Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="auth-input min-h-[80px]"
          placeholder="Anything else the provider should know?"
        />
      </div>

      {/* Error + Alternatives */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)]">
          <p className="text-[#ef4444] text-sm">{error}</p>
          {alternatives.length > 0 && (
            <div className="mt-3">
              <p className="text-[#94a3b8] text-xs mb-2">Next available slots:</p>
              <div className="flex flex-wrap gap-2">
                {alternatives.map((alt) => (
                  <button
                    key={alt}
                    onClick={onBack}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.3)] text-[#a78bfa] hover:bg-[rgba(124,58,237,0.25)] transition-all"
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
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          submitting || holdExpired
            ? "bg-[rgba(124,58,237,0.4)] text-[#94a3b8] cursor-not-allowed"
            : "bg-gradient-to-r from-[#7c3aed] to-[#2563eb] text-white hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] active:scale-[0.99]"
        }`}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating Booking...
          </span>
        ) : holdExpired ? (
          "Hold Expired — Go Back"
        ) : (
          "Confirm Booking"
        )}
      </button>
    </div>
  );
}
