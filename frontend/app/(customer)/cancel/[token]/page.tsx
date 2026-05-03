"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { customerApi } from "@/lib/customer-api";

export default function CancelByTokenPage() {
  const { token } = useParams();
  const router = useRouter();
  
  const [isCancelling, setIsCancelling] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleConfirmCancel() {
    setIsCancelling(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      // The backend expects a GET request for token cancellations
      await customerApi(`/bookings/cancel/${token}/`, {
        method: "GET",
        requireAuth: false,
      });
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.data?.message || err.message || "Invalid or expired cancellation link.");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-6">
      <div className="glass-card p-8 max-w-md w-full text-center animate-in fade-in zoom-in-95 duration-200">
        
        {status === "idle" && (
          <>
            <div className="w-16 h-16 rounded-full bg-[rgba(239,68,68,0.1)] flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Cancel Appointment?</h2>
            <p className="text-[#94a3b8] text-sm mb-8">
              You are about to cancel your appointment. This action cannot be undone. Are you sure you want to proceed?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="w-full py-3 rounded-xl font-bold text-white bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCancelling ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Appointment"
                )}
              </button>
              
              <button
                onClick={() => router.push("/")}
                disabled={isCancelling}
                className="w-full py-3 rounded-xl font-bold text-white bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-all disabled:opacity-50"
              >
                No, Keep It
              </button>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-[rgba(34,197,94,0.1)] flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-xl font-bold mb-2 text-[#4ade80]">Appointment Cancelled</h2>
            <p className="text-[#94a3b8] text-sm mb-8">
              Your appointment has been successfully cancelled.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 rounded-xl font-bold text-white bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-all"
            >
              Back to Home
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-[rgba(239,68,68,0.1)] flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-xl font-bold mb-2 text-[#ef4444]">Cancellation Failed</h2>
            <p className="text-[#94a3b8] text-sm mb-8">
              {errorMsg}
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 rounded-xl font-bold text-white bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-all"
            >
              Back to Home
            </button>
          </>
        )}

      </div>
    </div>
  );
}
