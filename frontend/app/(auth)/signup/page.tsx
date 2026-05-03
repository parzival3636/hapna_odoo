"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";

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

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData, role);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.success) {
      // Set cookie on client side to ensure immediate availability for fetchApi
      import("js-cookie").then((Cookies) => {
        Cookies.default.set("access_token", result.token, { path: "/" });
      });

      if (role === 'organiser') {
        router.push('/join-organization');
      } else if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/services');
      }
    }
  }

  const roleOptions = [
    { value: "customer" as const, label: "Customer", desc: "Book appointments", icon: "🎫" },
    { value: "organiser" as const, label: "Organiser", desc: "Manage services", icon: "🛎️" },
    { value: "admin" as const, label: "Admin", desc: "Platform admin", icon: "🛡️" },
  ];

  return (
    <>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Create account</h2>
      <p className="text-sm text-slate-500 mb-8">Sign up to get started with Hapna</p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-shake flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-6">
        {/* Role Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
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
                    ? "border-indigo-500 bg-indigo-50 shadow-[0_0_20px_rgba(79,70,229,0.1)]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className="text-xl">{opt.icon}</span>
                <span className={`text-[11px] font-bold ${role === opt.value ? "text-indigo-600" : "text-slate-600"}`}>
                  {opt.label}
                </span>
                <span className="text-[9px] text-slate-400 leading-tight text-center">{opt.desc}</span>
                {role === opt.value && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
            <input
              name="fullName"
              id="signup-name"
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setFieldErrors((p) => ({ ...p, fullName: "" })); }}
              placeholder="John Doe"
              className={`w-full px-4 py-2.5 bg-slate-50 border ${fieldErrors.fullName ? "border-red-500" : "border-slate-200"} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all`}
              autoComplete="name"
            />
            {fieldErrors.fullName && <p className="mt-1 text-[10px] text-red-500 font-medium">{fieldErrors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input
              name="email"
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
              placeholder="you@example.com"
              className={`w-full px-4 py-2.5 bg-slate-50 border ${fieldErrors.email ? "border-red-500" : "border-slate-200"} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all`}
              autoComplete="email"
            />
            {fieldErrors.email && <p className="mt-1 text-[10px] text-red-500 font-medium">{fieldErrors.email}</p>}
          </div>

          {/* Passwords Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 bg-slate-50 border ${fieldErrors.password ? "border-red-500" : "border-slate-200"} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pr-10`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-500" style={{ width: `${(strength / 4) * 100}%`, backgroundColor: strengthColors[strength] }} />
                  </div>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</p>
                </div>
              )}
              {fieldErrors.password && <p className="mt-1 text-[10px] text-red-500 font-medium">{fieldErrors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm</label>
              <input
                id="signup-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: "" })); }}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 bg-slate-50 border ${fieldErrors.confirmPassword ? "border-red-500" : "border-slate-200"} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all`}
                autoComplete="new-password"
              />
              {fieldErrors.confirmPassword && <p className="mt-1 text-[10px] text-red-500 font-medium">{fieldErrors.confirmPassword}</p>}
            </div>
          </div>
        </div>

        <button
          id="signup-submit"
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? (
             <>
             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             Creating account...
           </>
          ) : (
            `Sign Up as ${role.charAt(0).toUpperCase() + role.slice(1)}`
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 hover:text-indigo-700 transition-colors font-bold underline">
          Sign In
        </Link>
      </p>
    </>
  );
}
