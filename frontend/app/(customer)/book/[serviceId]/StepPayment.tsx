"use client";

import { useState } from "react";
import { customerApi } from "@/lib/customer-api";
import type { BookingState } from "./page";

interface Props {
  service: any;
  state: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onBack: () => void;
}

export default function StepPayment({ service, state, onBack }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fee = service.payment_amount ? parseFloat(service.payment_amount) : (service.booking_fee ? parseFloat(service.booking_fee) : 0);

  async function handleCheckout() {
    setLoading(true);
    setError("");
    try {
      const data = await customerApi(`/payments/${state.bookingId}/checkout-session/`, {
        method: "POST",
        requireAuth: true,
      });
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to start checkout.");
      setLoading(false);
    }
  }

  if (fee <= 0) return null;

  return (
    <div className="glass-card p-6 md:p-10 text-center">
      <div className="w-16 h-16 bg-[rgba(124,58,237,0.1)] rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold mb-2">Secure Payment</h2>
      <p className="text-[#94a3b8] mb-8">You will be redirected to Stripe's secure checkout page to complete your payment.</p>

      <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 mb-8 max-w-sm mx-auto">
        <p className="text-[#64748b] text-xs uppercase tracking-widest font-bold mb-2">Amount to Pay</p>
        <p className="text-4xl font-bold text-white">₹{fee.toFixed(2)}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4 max-w-sm mx-auto">
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-4 rounded-xl font-bold text-lg bg-[#7c3aed] text-white hover:bg-[#6d28d9] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Redirecting...
            </>
          ) : (
            "Pay with Stripe"
          )}
        </button>
        
        <button
          onClick={onBack}
          disabled={loading}
          className="w-full py-3 rounded-xl font-medium text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
        >
          Go Back
        </button>
      </div>

      <div className="mt-10 pt-6 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-center gap-6 opacity-40">
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-6 invert" />
        <div className="flex gap-2">
          <div className="w-8 h-5 bg-white/20 rounded-sm" />
          <div className="w-8 h-5 bg-white/20 rounded-sm" />
          <div className="w-8 h-5 bg-white/20 rounded-sm" />
        </div>
      </div>
    </div>
  );
}


