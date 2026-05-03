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
    <div className="p-4 md:p-10 text-center">
      <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
        <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>

      <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Secure Payment</h2>
      <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">Pay securely with Stripe. You'll be redirected to complete your transaction.</p>

      <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10 mb-10 max-w-xs mx-auto shadow-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Amount</p>
        <p className="text-5xl font-black text-slate-900">₹{fee.toFixed(2)}</p>
      </div>

      {error && (
        <div className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-100 text-red-600 font-bold text-sm animate-shake">
          {error}
        </div>
      )}

      <div className="space-y-4 max-w-xs mx-auto">
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-5 rounded-[2rem] font-black text-xl bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            "Pay Securely"
          )}
        </button>
        
        <button
          onClick={onBack}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-xs text-slate-400 hover:text-slate-900 hover:bg-slate-50 uppercase tracking-widest transition-all"
        >
          ← Go Back
        </button>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-6 opacity-60" />
        <div className="flex gap-2">
          <div className="w-8 h-5 bg-slate-100 rounded-md border border-slate-200" />
          <div className="w-8 h-5 bg-slate-100 rounded-md border border-slate-200" />
          <div className="w-8 h-5 bg-slate-100 rounded-md border border-slate-200" />
        </div>
      </div>
    </div>
  );
}


