"use client";

import { useState } from "react";
import Link from "next/link";

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
      <h2 className="text-xl font-semibold text-white mb-1">Reset Password</h2>
      <p className="text-sm text-[#94a3b8] mb-6">Enter your email to receive a reset link</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm">
          {error}
        </div>
      )}

      {sent ? (
        <div className="p-4 rounded-lg bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] text-[#22c55e] text-sm">
          Password reset is not yet available. Please contact your administrator.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="auth-input"
              required
            />
          </div>
          <button type="submit" disabled={loading} className={`auth-button ${loading ? "loading" : ""}`}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[#94a3b8]">
        <Link href="/login" className="text-[#7c3aed] hover:text-[#a78bfa] transition-colors font-medium">
          Back to Sign In
        </Link>
      </p>
    </>
  );
}
