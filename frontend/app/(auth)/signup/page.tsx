"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Role = "customer" | "organiser" | "admin";

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score;
}

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["", "#ef4444", "#f59e0b", "#22c55e", "#10b981"];

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("customer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const strength = getPasswordStrength(password);

  function validate() {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = "Full name is required";
    if (!email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email format";
    if (password.length < 8) errors.password = "Password must be at least 8 characters";
    else if (!/[a-z]/.test(password)) errors.password = "Must contain a lowercase letter";
    else if (!/[A-Z]/.test(password)) errors.password = "Must contain an uppercase letter";
    else if (!/[^a-zA-Z0-9]/.test(password)) errors.password = "Must contain a special character";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        setError("An account with this email already exists");
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=signup`);
  }

  const roleOptions = [
    { value: "customer" as const, label: "Customer", desc: "Book appointments", icon: "🎫" },
    { value: "organiser" as const, label: "Organiser", desc: "Manage services", icon: "🛎️" },
    { value: "admin" as const, label: "Admin", desc: "Platform admin", icon: "🛡️" },
  ];

  return (
    <>
      <h2 className="text-xl font-semibold text-white mb-1">Create account</h2>
      <p className="text-sm text-[#94a3b8] mb-6">Sign up to get started with Hapna</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        {/* Role Selector */}
        <div>
          <label className="block text-sm font-medium text-[#94a3b8] mb-2">
            I am a
          </label>
          <div className="grid grid-cols-3 gap-3">
            {roleOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-300 ${
                  role === opt.value
                    ? "border-[#7c3aed] bg-[rgba(124,58,237,0.08)] shadow-[0_0_20px_rgba(124,58,237,0.15)]"
                    : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.15)]"
                }`}
              >
                <span className="text-xl">{opt.icon}</span>
                <span className={`text-xs font-semibold ${role === opt.value ? "text-white" : "text-[#94a3b8]"}`}>
                  {opt.label}
                </span>
                <span className="text-[9px] text-[#64748b] leading-tight">{opt.desc}</span>
                {role === opt.value && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#7c3aed] flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-[#94a3b8] mb-2">Full Name</label>
          <input
            id="signup-name"
            type="text"
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); setFieldErrors((p) => ({ ...p, fullName: "" })); }}
            placeholder="John Doe"
            className={`auth-input ${fieldErrors.fullName ? "error" : ""}`}
            autoComplete="name"
          />
          {fieldErrors.fullName && <p className="mt-1 text-xs text-[#ef4444]">{fieldErrors.fullName}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-[#94a3b8] mb-2">Email</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
            placeholder="you@example.com"
            className={`auth-input ${fieldErrors.email ? "error" : ""}`}
            autoComplete="email"
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-[#ef4444]">{fieldErrors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-[#94a3b8] mb-2">Password</label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
              placeholder="••••••••"
              className={`auth-input pr-12 ${fieldErrors.password ? "error" : ""}`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8] transition-colors"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
          {password && (
            <>
              <div className="strength-bar">
                <div className="strength-fill" style={{ width: `${(strength / 4) * 100}%`, backgroundColor: strengthColors[strength] }} />
              </div>
              <p className="mt-1 text-xs" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</p>
            </>
          )}
          {fieldErrors.password && <p className="mt-1 text-xs text-[#ef4444]">{fieldErrors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-[#94a3b8] mb-2">Confirm Password</label>
          <input
            id="signup-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: "" })); }}
            placeholder="••••••••"
            className={`auth-input ${fieldErrors.confirmPassword ? "error" : ""}`}
            autoComplete="new-password"
          />
          {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-[#ef4444]">{fieldErrors.confirmPassword}</p>}
        </div>

        <button
          id="signup-submit"
          type="submit"
          disabled={loading}
          className={`auth-button ${loading ? "loading" : ""}`}
        >
          Sign Up as {role === "customer" ? "Customer" : role === "organiser" ? "Organiser" : "Admin"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#94a3b8]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#7c3aed] hover:text-[#a78bfa] transition-colors font-medium">
          Sign In
        </Link>
      </p>
    </>
  );
}
