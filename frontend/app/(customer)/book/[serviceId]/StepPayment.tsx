"use client";

import { useState, useEffect } from "react";
import { customerApi } from "@/lib/customer-api";
import type { BookingState } from "./page";

interface Props {
  service: any;
  state: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onBack: () => void;
}

export default function StepPayment({ service, state, update, onBack }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSimulatePayment(success: boolean) {
    if (!state.bookingId) return;
    
    setSubmitting(true);
    setError("");

    try {
      if (success) {
        // In a real app, this would hit Stripe or similar.
        // For simulation, we'll hit the Customer_Backend payment simulation endpoint or
        // directly update the booking status if such an endpoint isn't fully ready.
        // Let's call the backend to mark it as paid. 
        // We will assume the backend handles this or we'll mock it here.
        // As per requirements, we simulate processing then update state.
        
        // Wait 1.5s to simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Assume payment succeeded and booking is confirmed
        const updatedBooking = { ...state.bookingData, status: "confirmed", payment_status: "paid" };
        
        update({
          bookingData: updatedBooking,
          step: 4, // Move to confirmation
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setError("Payment failed. Please try again.");
      }
    } catch (err: any) {
      setError(err?.data?.message || err.message || "Payment processing failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const fee = service.payment_amount ? parseFloat(service.payment_amount) : 0;
  
  // If no fee, skip payment logic and go straight to confirmation
  useEffect(() => {
    if (fee <= 0) {
      update({ step: 4 });
    }
  }, [fee, update]);

  if (fee <= 0) return null;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Payment</h2>
      </div>

      <div className="bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.2)] rounded-xl p-6 mb-6 text-center">
        <p className="text-[#94a3b8] text-sm mb-2">Amount Due</p>
        <p className="text-4xl font-bold text-white">₹{fee.toFixed(2)}</p>
      </div>

      <div className="space-y-4 mb-8">
        <p className="text-sm text-[#94a3b8] text-center">
          Payment Simulation Mode
        </p>
        
        <button
          onClick={() => handleSimulatePayment(true)}
          disabled={submitting}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            submitting
              ? "bg-[rgba(34,197,94,0.4)] text-white/50 cursor-wait"
              : "bg-[#22c55e] text-white hover:bg-[#16a34a] active:scale-[0.99] shadow-[0_0_20px_rgba(34,197,94,0.2)]"
          }`}
        >
          {submitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            "Simulate Successful Payment"
          )}
        </button>
        
        <button
          onClick={() => handleSimulatePayment(false)}
          disabled={submitting}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            submitting
              ? "bg-[rgba(239,68,68,0.2)] text-[#ef4444]/50 cursor-not-allowed"
              : "bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.2)] active:scale-[0.99]"
          }`}
        >
          Simulate Failed Payment
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-center">
          <p className="text-[#ef4444] font-medium text-sm">
            {error}
          </p>
        </div>
      )}

      <p className="text-xs text-center text-[#64748b]">
        Your booking is currently reserved for 15 minutes while you complete this payment.
      </p>
    </div>
  );
}
