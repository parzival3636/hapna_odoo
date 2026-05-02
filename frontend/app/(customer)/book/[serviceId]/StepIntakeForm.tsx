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
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Heartbeat: extend hold every 3 min
  useEffect(() => {
    if (!state.holdId) return;
    heartbeatRef.current = setInterval(async () => {
      try {
        await customerApi(`/slots/hold/${state.holdId}/`, {
          method: "PATCH",
          requireAuth: true,
        });
      } catch { /* hold expired, ignore */ }
    }, 3 * 60 * 1000);
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [state.holdId]);

  function updateAnswer(qId: string, val: string) {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  }

  async function handleSubmit() {
    // Validate required
    for (const q of questions) {
      if (q.is_required && !answers[q.id]?.trim()) {
        setError(`Please answer: "${q.question_text}"`);
        return;
      }
    }

    setSubmitting(true);
    setError("");

    const answersPayload = questions
      .filter((q: any) => answers[q.id]?.trim())
      .map((q: any) => ({
        question_id: q.id,
        value: answers[q.id],
      }));

    try {
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
      setError(
        err?.data?.message || err.message || "Failed to create booking."
      );
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

      {/* Summary */}
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
            <span className="text-[#4ade80] font-medium text-xs">Active ✓</span>
          </div>
        </div>
      </div>

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
              {q.question_type === "select" && q.options ? (
                <select
                  value={answers[q.id] || ""}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                  className="auth-input"
                >
                  <option value="">Select...</option>
                  {q.options.map((opt: string) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : q.question_type === "boolean" ? (
                <div className="flex gap-4">
                  {["Yes", "No"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateAnswer(q.id, opt)}
                      className={`px-6 py-2 rounded-lg text-sm transition-all ${
                        answers[q.id] === opt
                          ? "bg-[#7c3aed] text-white"
                          : "bg-[rgba(255,255,255,0.05)] text-[#94a3b8] hover:bg-[rgba(255,255,255,0.08)]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
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

      {error && <p className="text-[#ef4444] text-sm mb-4">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          submitting
            ? "bg-[rgba(124,58,237,0.4)] text-[#94a3b8] cursor-not-allowed"
            : "bg-gradient-to-r from-[#7c3aed] to-[#2563eb] text-white hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]"
        }`}
      >
        {submitting ? "Creating Booking..." : "Confirm Booking"}
      </button>
    </div>
  );
}
