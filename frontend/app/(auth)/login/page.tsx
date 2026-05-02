"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/app/actions/auth";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const successMessage = searchParams.get("message");
  const redirectPath = searchParams.get("redirect");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginUser(formData);

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

      if (redirectPath && redirectPath !== "/") {
        router.push(redirectPath);
      } else {
        router.refresh();
        if (result.role === 'admin') {
          router.push('/admin');
        } else if (result.role === 'organiser') {
          router.push('/dashboard/services');
        } else {
          router.push('/services');
        }
      }
    }
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
      <p className="text-sm text-[#94a3b8] mb-6">Sign in to your account to continue</p>

      {successMessage && (
        <div className="mb-4 p-3 rounded-lg bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] text-[#22c55e] text-sm">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#94a3b8] mb-2">Email</label>
          <input
            name="email"
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="auth-input"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#94a3b8] mb-2">Password</label>
          <div className="relative">
            <input
              name="password"
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="auth-input pr-12"
              required
              autoComplete="current-password"
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
        </div>

        <button
          id="login-submit"
          type="submit"
          disabled={loading}
          className={`auth-button ${loading ? "loading" : ""}`}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-[#7c3aed] hover:text-[#a78bfa] transition-colors">
          Forgot Password?
        </Link>
        <Link href="/signup" className="text-[#94a3b8] hover:text-white transition-colors">
          Create Account
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm text-[#94a3b8]">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
