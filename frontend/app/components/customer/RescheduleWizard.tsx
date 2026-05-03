"use client";

import { useState } from "react";
import { customerApi } from "@/lib/customer-api";
import StepDatePicker from "@/app/(customer)/book/[serviceId]/StepDatePicker";
import StepSlotGrid from "@/app/(customer)/book/[serviceId]/StepSlotGrid";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Calendar, ArrowRight, XCircle } from "lucide-react";

interface Booking {
  id: string;
  service_id: string;
  service_title: string;
  resource_id: string | null;
  slot_date: string;
  slot_start: string;
  slot_end: string;
}

interface RescheduleState {
  step: 1 | 2 | 3;
  selectedDate: string | null;
  selectedSlot: { start: string; end: string } | null;
  holdId: string | null;
  capacity: number; // For reschedule, we keep capacity the same
}

export function RescheduleWizard({ booking, maxCapacity }: { booking: Booking; maxCapacity: number }) {
  const router = useRouter();
  const [state, setState] = useState<RescheduleState>({
    step: 1,
    selectedDate: null,
    selectedSlot: null,
    holdId: null,
    capacity: 1, // backend keeps the capacity, but slot grid expects it
  });
  
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [error, setError] = useState("");

  const update = (patch: Partial<RescheduleState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  async function handleConfirmSwap() {
    if (!state.holdId || !state.selectedDate || !state.selectedSlot) return;
    setIsRescheduling(true);
    setError("");

    try {
      await customerApi(`/bookings/${booking.id}/reschedule/`, {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify({
          slot_date: state.selectedDate,
          slot_start: state.selectedSlot.start,
          slot_end: state.selectedSlot.end,
          hold_id: state.holdId,
          ...(booking.resource_id ? { resource_id: booking.resource_id } : {}),
        }),
      });
      // Success! Go back to booking detail
      router.push(`/booking/${booking.id}`);
    } catch (err: any) {
      setError(err?.data?.message || err.message || "Failed to reschedule booking.");
      setIsRescheduling(false);
    }
  }

  async function handleBackFromConfirm() {
    if (state.holdId) {
      const confirmRelease = window.confirm("Are you sure you want to go back? This will release your new slot reservation.");
      if (!confirmRelease) return;

      try {
        await customerApi(`/slots/hold/${state.holdId}/`, {
          method: "DELETE",
          requireAuth: true,
        });
      } catch {
        // ignore
      }
    }
    update({ step: 2, holdId: null, selectedSlot: null });
  }

  const currentLabel = `${new Date(booking.slot_date + "T00:00:00").toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  })} at ${booking.slot_start.slice(0, 5)}`;

  const newLabel = state.selectedDate && state.selectedSlot ? `${new Date(state.selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  })} at ${state.selectedSlot.start}` : "";

  return (
    <div className="w-full">
      <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Schedule</p>
            <p className="text-sm font-black text-slate-900">{currentLabel}</p>
          </div>
        </div>
        <div className="px-5 py-2 rounded-pill bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-widest">
          Rescheduling Mode
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[3rem] p-10 lg:p-14 shadow-card">
        {state.step === 1 && (
          <StepDatePicker
            serviceId={booking.service_id}
            resourceId={booking.resource_id}
            selectedDate={state.selectedDate}
            onSelect={(date) => update({ selectedDate: date, step: 2 })}
          />
        )}

        {state.step === 2 && state.selectedDate && (
          <StepSlotGrid
            serviceId={booking.service_id}
            resourceId={booking.resource_id}
            date={state.selectedDate}
            maxCapacity={maxCapacity}
            state={state as any}
            update={(patch: any) => {
              if (patch.step === 2) {
                patch.step = 3;
              }
              update(patch);
            }}
            onBack={() => update({ step: 1 })}
          />
        )}

        {state.step === 3 && (
          <div className="text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-[2rem] bg-brand-soft text-brand-primary flex items-center justify-center mx-auto mb-8 shadow-sm">
              <ArrowRight className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl font-heading font-black text-slate-900 mb-8 tracking-tight">Confirm Migration</h2>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
              <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2rem] flex-1 w-full max-w-[240px]">
                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-3 line-through">Discarded Slot</p>
                <p className="text-sm text-slate-500 font-bold">{currentLabel}</p>
              </div>
              
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ArrowRight className="w-5 h-5" />
              </div>
              
              <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2rem] flex-1 w-full max-w-[240px] shadow-sm">
                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-3">Target Slot</p>
                <p className="text-sm text-emerald-700 font-black">{newLabel}</p>
              </div>
            </div>

            {error && (
              <div className="mb-10 p-6 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 animate-shake">
                <XCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleBackFromConfirm}
                disabled={isRescheduling}
                className="flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Abort & Re-pick
              </button>
              <button
                onClick={handleConfirmSwap}
                disabled={isRescheduling}
                className="flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-brand-primary text-white hover:bg-brand-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-3 shadow-xl shadow-brand-primary/20"
              >
                {isRescheduling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  "Confirm Migration"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
  );
}
