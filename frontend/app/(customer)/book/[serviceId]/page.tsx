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
import { ChevronLeft, Clock, MapPin, Check, User, Sparkles } from "lucide-react";

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
        
        const success = searchParams.get("success");
        const bookingId = searchParams.get("booking_id");
        
        if (success === "true" && bookingId) {
          try {
            await customerApi(`/payments/${bookingId}/confirm/`, {
              method: "POST",
              requireAuth: true,
            });
            const bookingData = await customerApi(`/bookings/${bookingId}/`, {
              requireAuth: true,
            });
            update({
              step: data.advance_payment_required ? 4 : 3,
              bookingId,
              bookingData,
            });
          } catch (err) {
            console.error("Confirmation error:", err);
            setError("Could not verify your payment. Please contact support.");
          }
        } else if (preDate) {
          update({ step: 1 });
        }
      } catch {
        setError("Service not found.");
      }
      setLoading(false);
    }
    load();
  }, [serviceId, preDate, update, searchParams]);

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

  const confirmationStep = service?.advance_payment_required ? 4 : 3;

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 font-body text-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-4 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
          <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          Synchronizing Hub...
        </div>
      </div>
    );

  if (!service)
    return (
      <div className="min-h-screen bg-slate-50 font-body text-slate-900 flex items-center justify-center p-8">
        <div className="bg-white border border-slate-200 p-16 text-center rounded-[3rem] shadow-card max-w-lg w-full">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner shadow-red-100/50">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-heading font-black text-slate-900 mb-4 uppercase tracking-tight">System Interrupted</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">{error || "The requested service configuration is currently unavailable."}</p>
          <Link href="/services" className="inline-flex items-center gap-3 px-10 py-4 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20">
            <ChevronLeft className="w-5 h-5" /> Back to Discovery
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-body text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-8 py-6 flex items-center justify-between">
          <Link href={`/services/${serviceId}`} className="text-slate-500 hover:text-brand-primary font-bold transition-all text-sm flex items-center gap-3 group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-heading font-black tracking-tight">{service.title}</span>
          </Link>
          <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-pill border border-slate-100">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" /> {service.duration_minutes}m
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <MapPin className="w-3.5 h-3.5" /> {service.location || "Online"}
            </div>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="max-w-4xl mx-auto px-8 pt-16 pb-12">
        <div className="flex items-center gap-4">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center gap-4 flex-1 last:flex-none">
              <div
                className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-sm font-black transition-all duration-500 ${
                  i < state.step
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
                    : i === state.step
                    ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/20 scale-110"
                    : "bg-white border border-slate-200 text-slate-300"
                }`}
              >
                {i < state.step ? <Check className="w-5 h-5 stroke-[3]" /> : i + 1}
              </div>
              <div className="hidden lg:block">
                <p className={`text-[10px] font-black uppercase tracking-[0.1em] ${
                  i === state.step ? "text-brand-primary" : "text-slate-400"
                }`}>
                  {label}
                </p>
              </div>
              {i < stepLabels.length - 1 && (
                <div
                  className={`flex-1 h-1 rounded-full transition-colors duration-700 ${
                    i < state.step ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resource Selector */}
      {service.appointment_type === "resource" &&
        service.resources.length > 0 &&
        state.step < 3 && (
          <div className="max-w-4xl mx-auto px-8 pb-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Execution Specialist</p>
            <div className="flex flex-wrap gap-4">
              {service.resources.map((r: any) => (
                <button
                  key={r.id}
                  onClick={() => update({ resourceId: r.id, selectedSlot: null, holdId: null })}
                  className={`px-8 py-4 rounded-[1.25rem] text-sm font-bold transition-all border-2 flex items-center gap-3 ${
                    state.resourceId === r.id
                      ? "bg-brand-primary border-brand-primary text-white shadow-xl shadow-brand-primary/10"
                      : "bg-white border-slate-100 text-slate-500 hover:border-brand-primary/30 hover:bg-slate-50"
                  }`}
                >
                  <User className={`w-4 h-4 ${state.resourceId === r.id ? "text-white/70" : "text-slate-300"}`} />
                  {r.name}
                </button>
              ))}
            </div>
          </div>
        )}

      {/* Step Content Content */}
      <div className="max-w-4xl mx-auto px-8 pb-32">
        <div className="bg-white border border-slate-200 rounded-[3rem] p-12 lg:p-20 shadow-card">
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
    </div>
  );
}
