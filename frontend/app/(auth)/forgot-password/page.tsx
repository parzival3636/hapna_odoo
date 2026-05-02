"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 1: Send reset OTP
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/auth/callback?next=/forgot-password` }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("otp");
  }

  // OTP input handlers
  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || "";
    setOtp(newOtp);
  }

  // Step 2: Verify OTP
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "recovery",
    });

    if (verifyError) {
      setError("Invalid or expired code. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("reset");
  }

  // Step 3: Set new password
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/login?message=Password reset successfully. Please sign in.");
  }

  return (
    <>
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {(["email", "otp", "reset"] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all duration-300 ${
              step === s
                ? "w-8 bg-gradient-to-r from-[#7c3aed] to-[#2563eb]"
                : i < ["email", "otp", "reset"].indexOf(step)
                ? "w-2 bg-[#7c3aed]"
                : "w-2 bg-[rgba(255,255,255,0.1)]"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm animate-shake">
          {error}
        </div>
      )}

      {/* Step 1: Enter email */}
      {step === "email" && (
        <>
          <h2 className="text-xl font-semibold text-white mb-1">
            Forgot password?
          </h2>
          <p className="text-sm text-[#94a3b8] mb-6">
            Enter your email and we&apos;ll send you a reset code
          </p>

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="auth-input"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`auth-button ${loading ? "loading" : ""}`}
            >
              Send Reset Code
            </button>
          </form>
        </>
      )}

      {/* Step 2: Enter OTP */}
      {step === "otp" && (
        <>
          <h2 className="text-xl font-semibold text-white mb-1">
            Enter reset code
          </h2>
          <p className="text-sm text-[#94a3b8] mb-6">
            We sent a 6-digit code to{" "}
            <span className="text-white font-medium">{email}</span>
          </p>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="otp-container" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`otp-box ${digit ? "filled" : ""}`}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.some((d) => d === "")}
              className={`auth-button ${loading ? "loading" : ""}`}
            >
              Verify Code
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp(["", "", "", "", "", ""]);
                setError("");
              }}
              className="w-full text-center text-sm text-[#94a3b8] hover:text-white transition-colors"
            >
              ← Change email
            </button>
          </form>
        </>
      )}

      {/* Step 3: New password */}
      {step === "reset" && (
        <>
          <h2 className="text-xl font-semibold text-white mb-1">
            Set new password
          </h2>
          <p className="text-sm text-[#94a3b8] mb-6">
            Choose a strong password for your account
          </p>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-input pr-12"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8] transition-colors"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`auth-button ${loading ? "loading" : ""}`}
            >
              Reset Password
            </button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-[#64748b]">
        <Link
          href="/login"
          className="text-[#94a3b8] hover:text-white transition-colors"
        >
          ← Back to Sign In
        </Link>
      </p>
    </>
  );
}
