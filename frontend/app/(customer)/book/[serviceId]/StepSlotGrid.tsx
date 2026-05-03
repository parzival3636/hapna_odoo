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
      return "border-[#7c3aed] bg-[rgba(124,58,237,0.15)] shadow-[0_0_12px_rgba(124,58,237,0.3)]";
    }
    if (isPending || slot.status === "pending") {
      return "border-[rgba(100,116,139,0.4)] bg-[rgba(100,116,139,0.08)] opacity-60 cursor-wait animate-pulse";
    }
    switch (slot.status) {
      case "available":
        return "border-[rgba(74,222,128,0.3)] hover:border-[#4ade80] hover:bg-[rgba(74,222,128,0.08)] cursor-pointer";
      case "last_2":
        return "border-[rgba(251,191,36,0.3)] hover:border-[#fbbf24] hover:bg-[rgba(251,191,36,0.08)] cursor-pointer";
      case "last_1":
        return "border-[rgba(248,113,113,0.3)] hover:border-[#f87171] hover:bg-[rgba(248,113,113,0.08)] cursor-pointer";
      case "full":
        return "border-[rgba(255,255,255,0.05)] opacity-40 cursor-not-allowed";
      default:
        return "border-[rgba(255,255,255,0.1)] cursor-pointer";
    }
  }

  function statusDot(slot: Slot) {
    const isPending =
      pendingSlot === `${slot.start}-${slot.end}` ||
      slot.status === "pending";
    if (isPending) return "bg-[#64748b] animate-pulse";
    switch (slot.status) {
      case "available": return "bg-[#4ade80]";
      case "last_2":    return "bg-[#fbbf24]";
      case "last_1":    return "bg-[#f87171]";
      default:          return "bg-[#334155]";
    }
  }

  const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Pick a Time Slot</h2>
        <button
          onClick={onBack}
          className="text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          ← Change Date
        </button>
      </div>
      <p className="text-[#94a3b8] text-sm mb-6">{dateLabel}</p>

      {/* Capacity selector (if max > 1) */}
      {maxCapacity > 1 && (
        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm text-[#94a3b8]">Seats:</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCapacity(Math.max(1, capacity - 1))}
              className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] flex items-center justify-center transition-all"
            >
              −
            </button>
            <span className="w-8 text-center font-bold">{capacity}</span>
            <button
              onClick={() => setCapacity(Math.min(maxCapacity, capacity + 1))}
              className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] flex items-center justify-center transition-all"
            >
              +
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-[rgba(255,255,255,0.04)] animate-pulse"
            />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[#94a3b8] mb-2">No slots available on this date</p>
          <button
            onClick={onBack}
            className="text-[#7c3aed] text-sm hover:underline"
          >
            Pick another date
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {slots.map((slot) => {
              const slotKey = `${slot.start}-${slot.end}`;
              const isPending = pendingSlot === slotKey;
              const isFull = slot.status === "full";
              return (
                <button
                  key={slotKey}
                  disabled={isFull || !!pendingSlot}
                  onClick={() => selectSlot(slot)}
                  className={`relative rounded-xl border p-3 text-center transition-all ${slotClassName(slot)}`}
                >
                  {isPending && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[rgba(0,0,0,0.4)] z-10">
                      <div className="w-4 h-4 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <div className="text-sm font-semibold">{slot.start}</div>
                  <div className="text-xs text-[#64748b] mt-1">to {slot.end}</div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <span className={`w-2 h-2 rounded-full ${statusDot(slot)}`} />
                    <span className="text-[10px] text-[#94a3b8]">
                      {isFull ? "Full" : `${slot.remaining}/${slot.total_capacity}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#64748b]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#4ade80]" /> Available
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#fbbf24]" /> Last 2
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#f87171]" /> Last 1
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#334155]" /> Full
            </span>
            <span className="ml-auto text-[10px] text-[#475569] animate-pulse">
              ● Live
            </span>
          </div>
        </>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]">
          <p className="text-[#ef4444] text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
