"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { customerApi } from "@/lib/customer-api";
import { fetchApi } from "@/lib/api";
import type { BookingState } from "./page";

interface Slot {
  start: string;
  end: string;
  remaining: number;
  total_capacity: number;
  status: string;
}

interface Props {
  serviceId: string;
  resourceId: string | null;
  date: string;
  maxCapacity: number;
  state: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onBack: () => void;
}

export default function StepSlotGrid({
  serviceId,
  resourceId,
  date,
  maxCapacity,
  state,
  update,
  onBack,
}: Props) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  // Layer 1 — optimistic pending: slot key -> true while server is processing
  const [pendingSlot, setPendingSlot] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [capacity, setCapacity] = useState(state.capacity);
  // Layer 4 — track last fetch for polling
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSlots = useCallback(async () => {
    try {
      const params = new URLSearchParams({ date });
      const data = await customerApi(
        `/services/${serviceId}/availability/?${params}`,
        { requireAuth: false }
      );
      const mapped = (data.slots || []).map((s: any) => {
        return {
          start: s.start.slice(0, 5),
          end: s.end.slice(0, 5),
          remaining: s.remaining,
          total_capacity: s.total_capacity,
          status: s.status,
        };
      });
      setSlots(mapped);
    } catch {
      setError("Failed to load slots.");
    }
  }, [serviceId, date, maxCapacity]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchSlots().finally(() => setLoading(false));
  }, [fetchSlots]);

  // Layer 4 — Poll every 15 s to reflect holds/bookings by other users
  useEffect(() => {
    pollRef.current = setInterval(fetchSlots, 15_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchSlots]);

  async function selectSlot(slot: Slot) {
    if (slot.status === "full" || slot.remaining < 1 || pendingSlot) return;

    const slotKey = `${slot.start}-${slot.end}`;

    // ── Layer 1: Optimistic UI — dim slot instantly ──────────────────────────
    setPendingSlot(slotKey);
    setError("");

    // Gray out optimistically in local state
    setSlots((prev) =>
      prev.map((s) =>
        s.start === slot.start && s.end === slot.end
          ? { ...s, status: "pending" as string }
          : s
      )
    );

    // Release previous hold if any
    if (state.holdId) {
      try {
        await customerApi(`/slots/hold/${state.holdId}/`, {
          method: "DELETE",
          requireAuth: true,
        });
      } catch { /* ok — idempotent */ }
    }

    try {
      // ── Layer 2: Soft reservation — 10-minute hold ────────────────────────
      const hold = await customerApi("/slots/hold/", {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify({
          service_id: serviceId,
          slot_date: date,
          slot_start: slot.start,
          slot_end: slot.end,
          capacity_held: capacity,
          ...(resourceId ? { resource_id: resourceId } : {}),
        }),
      });

      // Navigate to intake form with hold in state
      update({
        selectedSlot: { start: slot.start, end: slot.end },
        holdId: hold.id,
        capacity,
        step: 2,
      });
    } catch (err: any) {
      // Undo optimistic dim on failure
      setSlots((prev) =>
        prev.map((s) =>
          s.start === slot.start && s.end === slot.end
            ? { ...s, status: slot.status }
            : s
        )
      );

      const code = err?.code || err?.data?.code;
      const msg = err?.data?.message || err?.message || "Failed to reserve slot.";

      if (code === "SLOT_FULL") {
        setError("⚡ Someone just grabbed that slot! Pick another.");
        // Immediately refresh to show real state
        fetchSlots();
      } else if (code === "SLOT_NOT_FOUND") {
        setError("Slot no longer available. Refreshing...");
        fetchSlots();
      } else {
        setError(msg);
      }
    } finally {
      setPendingSlot(null);
    }
  }

  function slotClassName(slot: Slot): string {
    const slotKey = `${slot.start}-${slot.end}`;
    const isSelected =
      state.selectedSlot?.start === slot.start &&
      state.selectedSlot?.end === slot.end;
    const isPending = pendingSlot === slotKey;

    if (isSelected) {
      return "border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100";
    }
    if (isPending || slot.status === "pending") {
      return "border-slate-200 bg-slate-50 opacity-60 cursor-wait animate-pulse";
    }
    if (slot.status === "full" || slot.remaining < 1) {
      return "border-red-100 bg-red-50 text-red-600 opacity-60 cursor-not-allowed";
    }
    switch (slot.status) {
      case "available":
        return "border-slate-100 bg-white hover:border-indigo-500 hover:shadow-md cursor-pointer";
      case "last_2":
        return "border-amber-100 bg-amber-50/30 hover:border-amber-500 hover:shadow-md cursor-pointer";
      case "last_1":
        return "border-red-100 bg-red-50/30 hover:border-red-500 hover:shadow-md cursor-pointer";
      default:
        return "border-slate-100 cursor-pointer";
    }
  }

  function statusDot(slot: Slot) {
    const isPending =
      pendingSlot === `${slot.start}-${slot.end}` ||
      slot.status === "pending";
    if (isPending) return "bg-slate-400 animate-pulse";
    if (slot.status === "full" || slot.remaining < 1) return "bg-red-500";
    switch (slot.status) {
      case "available": return "bg-emerald-500";
      case "last_2":    return "bg-amber-500";
      case "last_1":    return "bg-red-500";
      default:          return "bg-slate-200";
    }
  }

  const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Pick a Time Slot</h2>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{dateLabel}</p>
        </div>
        <button
          onClick={onBack}
          className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest px-4 py-2 bg-indigo-50 rounded-xl transition-all w-fit"
        >
          ← Change Date
        </button>
      </div>

      {/* Capacity selector (if max > 1) */}
      {maxCapacity > 1 && (
        <div className="mb-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking Seats</p>
              <p className="text-sm font-black text-slate-900">{capacity} Guest{capacity > 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCapacity(Math.max(1, capacity - 1))}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:border-red-200 hover:text-red-500 flex items-center justify-center transition-all shadow-sm active:scale-95"
            >
              −
            </button>
            <button
              onClick={() => setCapacity(Math.min(maxCapacity, capacity + 1))}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:border-emerald-200 hover:text-emerald-500 flex items-center justify-center transition-all shadow-sm active:scale-95"
            >
              +
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-24 rounded-3xl bg-slate-50 animate-pulse border border-slate-100"
            />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-slate-100 border-dashed">
          <div className="text-4xl mb-4">🌙</div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-6">No slots found for this date</p>
          <button
            onClick={onBack}
            className="text-indigo-600 font-black text-sm uppercase tracking-widest hover:underline"
          >
            Pick another date
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {slots.map((slot) => {
              const slotKey = `${slot.start}-${slot.end}`;
              const isPending = pendingSlot === slotKey;
              const isFull = slot.status === "full" || slot.remaining < 1;
              return (
                <button
                  key={slotKey}
                  disabled={isFull || !!pendingSlot}
                  onClick={() => selectSlot(slot)}
                  className={`relative rounded-3xl border-2 p-5 text-center transition-all group ${slotClassName(slot)}`}
                >
                  {isPending && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-[1.4rem] bg-white/80 backdrop-blur-[2px] z-10">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <div className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{slot.start}</div>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">to {slot.end}</div>
                  <div className="flex flex-col items-center gap-1.5 pt-3 border-t border-slate-50">
                    <div className={`w-1.5 h-1.5 rounded-full ${statusDot(slot)}`} />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      {isFull ? "FULL" : `${slot.remaining}/${slot.total_capacity}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last 2</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last 1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full</span>
            </div>
            <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live Updates</span>
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="mt-8 p-5 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 animate-shake">
          <span className="text-xl">⚡</span>
          <p className="text-red-600 font-bold text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
