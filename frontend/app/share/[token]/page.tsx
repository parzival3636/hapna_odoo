"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function ShareRedirectPage() {
  const { token } = useParams();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function resolveShareLink() {
      try {
        const res = await fetch(`${API_BASE_URL}/services/shared/${token}/`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.message || "This share link is invalid or has expired.");
          setLoading(false);
          return;
        }
        const service = await res.json();
        // Redirect to the booking page with a share_token query param
        // so the booking page knows to use the share endpoint
        router.replace(`/book/${service.id}?share_token=${token}`);
      } catch (err) {
        setError("Failed to load. Please check your connection and try again.");
        setLoading(false);
      }
    }
    if (token) resolveShareLink();
  }, [token, router]);

  if (loading && !error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.2)] mb-6 animate-pulse">
            <svg className="w-8 h-8 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2">Opening your booking link...</h2>
          <p className="text-sm text-[#64748b]">Please wait while we verify the link</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] mb-6">
            <svg className="w-8 h-8 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Link Unavailable</h2>
          <p className="text-sm text-[#94a3b8] mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 rounded-xl bg-[#7c3aed] text-white font-medium hover:bg-[#6d28d9] transition-all"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return null;
}
