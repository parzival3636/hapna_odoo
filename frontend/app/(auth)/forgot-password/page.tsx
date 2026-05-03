"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, Mail, ChevronLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Password reset is not yet implemented in the Django backend.
    // For now, show a placeholder message.
    setSent(true);
    setLoading(false);
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-heading font-black text-slate-900 mb-1 tracking-tight">Recover Access</h2>
        <p className="text-sm text-slate-500 font-medium">Re-initialize your security credentials</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-shake flex items-center gap-3">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {sent ? (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 text-sm flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="font-bold">Recovery module offline. Please contact your system administrator to manualy reset credentials.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Network Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                required
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-brand-primary transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Deploy Reset Request"
            )}
          </button>
        </form>
      )}

      <p className="mt-8 text-center">
        <Link href="/login" className="text-[10px] font-black text-slate-400 hover:text-brand-primary uppercase tracking-widest transition-all flex items-center justify-center gap-2">
          <ChevronLeft className="w-3 h-3" />
          Back to Login
        </Link>
      </p>
    </>
  );
}
