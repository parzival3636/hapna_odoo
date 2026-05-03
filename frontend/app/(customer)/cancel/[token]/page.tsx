"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { customerApi } from "@/lib/customer-api";
import { Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 font-body">
      <div className="bg-white border border-slate-200 p-12 lg:p-16 max-w-lg w-full text-center rounded-[3rem] shadow-card animate-in fade-in zoom-in-95 duration-500">
        
        {status === "idle" && (
          <>
            <div className="w-20 h-20 rounded-[2rem] bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-8 shadow-sm">
              <AlertCircle className="w-10 h-10" />
            </div>
            <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-3">Critical Action</p>
            <h2 className="text-3xl font-heading font-black text-slate-900 mb-4 tracking-tight leading-tight">Abort Appointment?</h2>
            <p className="text-slate-500 font-medium mb-12 leading-relaxed">
              You are about to permanently disconnect this appointment from our network. This action cannot be reversed.
            </p>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-red-100"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Aborting...
                  </>
                ) : (
                  "Confirm Abort"
                )}
              </button>
              
              <button
                onClick={() => router.push("/")}
                disabled={isCancelling}
                className="w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Keep Active
              </button>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-[2rem] bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-8 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Success</p>
            <h2 className="text-3xl font-heading font-black text-slate-900 mb-4 tracking-tight">Appointment Aborted</h2>
            <p className="text-slate-500 font-medium mb-12 leading-relaxed">
              Your appointment has been successfully purged from the system.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-slate-900 hover:bg-brand-primary transition-all shadow-xl shadow-slate-100"
            >
              Back to Home
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 rounded-[2rem] bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-8 shadow-sm">
              <XCircle className="w-10 h-10" />
            </div>
            <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-3">Error</p>
            <h2 className="text-3xl font-heading font-black text-slate-900 mb-4 tracking-tight leading-tight">Link Invalid</h2>
            <p className="text-red-500/70 font-medium mb-12 leading-relaxed italic">
              {errorMsg}
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-slate-900 hover:bg-brand-primary transition-all shadow-xl shadow-slate-100"
            >
              Back to Home
            </button>
          </>
        )}

      </div>
    </div>
  );
}
