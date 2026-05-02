"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { customerApi } from "@/lib/customer-api";
import StepDatePicker from "./StepDatePicker";
import StepSlotGrid from "./StepSlotGrid";
import StepIntakeForm from "./StepIntakeForm";
import StepPayment from "./StepPayment";
import StepConfirmation from "./StepConfirmation";

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  appointment_type: string;
  location: string;
  venue_address: string;
  payment_amount: string;
  advance_payment_required: boolean;
  manual_confirmation: boolean;
  max_capacity: number | null;
  timezone: string;
  questions: any[];
  resources: any[];
}

export interface BookingState {
  step: number;
  serviceId: string;
  resourceId: string | null;
  selectedDate: string | null;
  selectedSlot: { start: string; end: string } | null;
  capacity: number;
  answers: { question_id: string; value: string }[];
  holdId: string | null;
  bookingId: string | null;
  bookingData: any | null;
}

const BASE_STEP_LABELS = ["Select Date", "Pick Slot", "Details", "Confirmed"];

export default function BookingWizardPage() {
  const { serviceId } = useParams();
  const searchParams = useSearchParams();
  const preDate = searchParams.get("date");
  const preResource = searchParams.get("resource");

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [state, setState] = useState<BookingState>({
    step: 0,
    serviceId: serviceId as string,
    resourceId: preResource || null,
    selectedDate: preDate || null,
    selectedSlot: null,
    capacity: 1,
    answers: [],
    holdId: null,
    bookingId: null,
    bookingData: null,
  });

  const update = useCallback(
    (patch: Partial<BookingState>) =>
      setState((prev) => ({ ...prev, ...patch })),
    []
  );

  useEffect(() => {
    async function load() {
      try {
        const data = await customerApi(`/services/${serviceId}/`, {
          requireAuth: false,
        });
        setService(data);
        if (preResource && data.resources?.some((r: any) => r.id === preResource)) {
          // preResource is valid
        } else if (data.resources?.length > 0) {
          update({ resourceId: data.resources[0].id });
        }
        if (preDate) update({ step: 1 });
      } catch {
        setError("Service not found.");
      }
      setLoading(false);
    }
    load();
  }, [serviceId, preDate, update]);

  // Cleanup hold on unmount
  useEffect(() => {
    return () => {
      if (state.holdId) {
        customerApi(`/slots/hold/${state.holdId}/delete/`, {
          method: "DELETE",
          requireAuth: true,
        }).catch(() => {});
      }
    };
  }, [state.holdId]);

  const stepLabels = service?.advance_payment_required
    ? ["Select Date", "Pick Slot", "Details", "Payment", "Confirmed"]
    : BASE_STEP_LABELS;

  // We need to map the Confirmation component's logical step based on if payment is present
  const confirmationStep = service?.advance_payment_required ? 4 : 3;

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="animate-pulse text-[#94a3b8]">Loading booking flow...</div>
      </div>
    );

  if (!service)
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <p className="text-[#ef4444] mb-4">{error}</p>
          <Link href="/services" className="text-[#7c3aed] hover:underline">← Back</Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,15,0.9)] backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/services/${serviceId}`} className="text-[#94a3b8] hover:text-white text-sm">
            ← {service.title}
          </Link>
          <span className="text-xs text-[#64748b]">
            {service.duration_minutes} min · {service.location || "Online"}
          </span>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-center gap-2">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < state.step
                    ? "bg-[#22c55e] text-white"
                    : i === state.step
                    ? "bg-[#7c3aed] text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                    : "bg-[rgba(255,255,255,0.06)] text-[#64748b]"
                }`}
              >
                {i < state.step ? "✓" : i + 1}
              </div>
              <span
                className={`text-xs hidden sm:inline ${
                  i === state.step ? "text-white" : "text-[#64748b]"
                }`}
              >
                {label}
              </span>
              {i < stepLabels.length - 1 && (
                <div
                  className={`flex-1 h-px ${
                    i < state.step
                      ? "bg-[#22c55e]"
                      : "bg-[rgba(255,255,255,0.08)]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resource Selector (if resource-type) */}
      {service.appointment_type === "resource" &&
        service.resources.length > 0 &&
        state.step < 3 && (
          <div className="max-w-3xl mx-auto px-6 pb-4">
            <label className="text-xs text-[#94a3b8] mb-2 block">
              Select Resource
            </label>
            <div className="flex flex-wrap gap-2">
              {service.resources.map((r: any) => (
                <button
                  key={r.id}
                  onClick={() => update({ resourceId: r.id, selectedSlot: null, holdId: null })}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    state.resourceId === r.id
                      ? "bg-[#7c3aed] text-white"
                      : "bg-[rgba(255,255,255,0.05)] text-[#94a3b8] hover:bg-[rgba(255,255,255,0.08)]"
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>
        )}

      {/* Step Content */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        {state.step === 0 && (
          <StepDatePicker
            serviceId={service.id}
            resourceId={state.resourceId}
            selectedDate={state.selectedDate}
            onSelect={(date) => update({ selectedDate: date, step: 1, selectedSlot: null, holdId: null })}
          />
        )}
        {state.step === 1 && state.selectedDate && (
          <StepSlotGrid
            serviceId={service.id}
            resourceId={state.resourceId}
            date={state.selectedDate}
            maxCapacity={service.max_capacity || 1}
            state={state}
            update={update}
            onBack={() => update({ step: 0 })}
          />
        )}
        {state.step === 2 && (
          <StepIntakeForm
            service={service}
            state={state}
            update={update}
            onBack={() => update({ step: 1 })}
          />
        )}
        {state.step === 3 && service.advance_payment_required && (
          <StepPayment
            service={service}
            state={state}
            update={update}
            onBack={() => update({ step: 2 })}
          />
        )}
        {state.step === confirmationStep && state.bookingData && (
          <StepConfirmation
            bookingData={state.bookingData}
            service={service}
          />
        )}
      </div>
    </div>
  );
}
