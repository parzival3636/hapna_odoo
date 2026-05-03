"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getUserRole, ROLE_DASHBOARDS } from "@/lib/utils/get-role";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = (searchParams.get("type") || "signup") as "signup" | "email";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || "";
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  const handleVerify = useCallback(async () => {
    const code = otp.join("");
    if (code.length !== 6) { setError("Please enter all 6 digits"); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email, token: code, type: type === "signup" ? "signup" : "email",
    });

    if (verifyError) { setError("Invalid or expired OTP. Please try again."); setLoading(false); return; }

    const { role } = await getUserRole(supabase);
    router.push(ROLE_DASHBOARDS[role] || "/services");
  }, [otp, email, type, router]);

  useEffect(() => {
    if (otp.every((d) => d !== "")) handleVerify();
  }, [otp, handleVerify]);

  async function handleResend() {
    if (!canResend) return;
    setCanResend(false);
    setResendCooldown(60);
    setError("");
    const supabase = createClient();
    await supabase.auth.resend({ type: "signup", email });
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-white mb-1">Verify your email</h2>
      <p className="text-sm text-[#94a3b8] mb-6">
        We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
      </p>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm animate-shake">{error}</div>
      )}
      <div className="otp-container mb-6" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input key={index} ref={(el) => { inputRefs.current[index] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
            onChange={(e) => handleChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)}
            className={`otp-box ${digit ? "filled" : ""}`} autoFocus={index === 0} />
        ))}
      </div>
      <button id="verify-submit" type="button" onClick={handleVerify} disabled={loading || otp.some((d) => d === "")}
        className={`auth-button ${loading ? "loading" : ""}`}>Verify</button>
      <div className="mt-6 text-center">
        {canResend ? (
          <button onClick={handleResend} className="text-sm text-[#7c3aed] hover:text-[#a78bfa] transition-colors font-medium">Resend OTP</button>
        ) : (
          <p className="text-sm text-[#64748b]">Resend code in <span className="text-[#94a3b8] font-medium">{resendCooldown}s</span></p>
        )}
      </div>
      <p className="mt-4 text-center text-sm text-[#64748b]">
        <Link href="/login" className="text-[#94a3b8] hover:text-white transition-colors">← Back to Sign In</Link>
      </p>
    </>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm text-[#94a3b8]">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
