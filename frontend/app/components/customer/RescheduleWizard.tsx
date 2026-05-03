"use client";

import { useState } from "react";
import { customerApi } from "@/lib/customer-api";
import StepDatePicker from "@/app/(customer)/book/[serviceId]/StepDatePicker";
import StepSlotGrid from "@/app/(customer)/book/[serviceId]/StepSlotGrid";
import { useRouter } from "next/navigation";

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
    <div className="max-w-3xl mx-auto p-4 sm:p-6 w-full pt-20">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => {
            if (state.step === 1) router.back();
            else if (state.step === 2) update({ step: 1 });
            else handleBackFromConfirm();
          }}
          className="text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.2)] rounded-xl p-4 mb-6 text-center">
        <p className="text-[#94a3b8] text-sm">Currently scheduled for:</p>
        <p className="text-white font-medium">{currentLabel}</p>
      </div>

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
        <div className="glass-card p-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <h2 className="text-xl font-bold mb-6">Confirm Reschedule</h2>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-xl flex-1 max-w-[200px]">
              <p className="text-xs text-[#ef4444] font-medium mb-1 line-through">Old Time</p>
              <p className="text-sm text-[#94a3b8]">{currentLabel}</p>
            </div>
            <div className="text-[#94a3b8]">→</div>
            <div className="bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] p-4 rounded-xl flex-1 max-w-[200px]">
              <p className="text-xs text-[#4ade80] font-bold mb-1">New Time</p>
              <p className="text-sm text-white font-medium">{newLabel}</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleBackFromConfirm}
              disabled={isRescheduling}
              className="flex-1 py-4 rounded-xl font-bold text-sm bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-all disabled:opacity-50"
            >
              Change Date/Time
            </button>
            <button
              onClick={handleConfirmSwap}
              disabled={isRescheduling}
              className="flex-1 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#7c3aed] to-[#2563eb] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isRescheduling ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                "Confirm Reschedule"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
