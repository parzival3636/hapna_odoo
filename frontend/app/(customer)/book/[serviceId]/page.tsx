"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

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
  questions: ServiceQuestion[];
}

export default function PublicBookingPage() {
  const { serviceId } = useParams();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // Answers keyed by question id
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    async function loadService() {
      try {
        const data = await fetchApi(`/services/${serviceId}/preview/`, { requireAuth: false });
        setService(data);
        // Initialize answers state
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

    // Validate required questions
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

    // Build answers payload
    const answersPayload = questions
      .filter((q) => {
        const ans = answers[q.id];
        return ans !== undefined && ans !== "" && !(Array.isArray(ans) && ans.length === 0);
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
          slot_date: date,
          slot_start: time,
          slot_end: time,
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

  if (loading)
    return <div className="p-12 text-center text-white">Loading service details...</div>;
  if (!service) return <div className="p-12 text-center text-red-500">{error}</div>;

  const questions = service.questions ?? [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8">
          <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
          <p className="text-[#94a3b8] mb-6">{service.description}</p>

          <div className="flex gap-6 mb-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#7c3aed]">⏱️</span>
              <span>{service.duration_minutes} Minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#7c3aed]">📍</span>
              <span>
                {service.location}{" "}
                {service.venue_address && `— ${service.venue_address}`}
              </span>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 border-t border-[rgba(255,255,255,0.08)] pt-8"
          >
            {/* Date/time row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#94a3b8]">Select Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="auth-input"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#94a3b8]">Select Time</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="auth-input"
                />
              </div>
            </div>

            {/* ═══════ Dynamic questions ═══════ */}
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
                            <span className="text-sm text-[#cbd5e1]">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Checkboxes (multiple answers) */}
                    {q.question_type === "checkbox" && q.options && (
                      <div className="space-y-2 pl-1">
                        {q.options.map((opt) => {
                          const checked = ((answers[q.id] as string[]) || []).includes(opt);
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
                                onChange={() => handleCheckboxToggle(q.id, opt)}
                                className="sr-only"
                              />
                              <span className="text-sm text-[#cbd5e1]">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Fallback for unknown types */}
                    {!["single_line", "multi_line", "phone", "radio", "checkbox"].includes(
                      q.question_type
                    ) && (
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
              disabled={submitting}
              className={`w-full py-4 rounded-xl bg-[#7c3aed] text-white font-bold text-lg hover:bg-[#6d28d9] transition-all ${
                submitting
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
