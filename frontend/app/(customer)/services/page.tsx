"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { logoutUser } from "@/app/actions/auth";

interface Service {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  location: string;
}

export default function CustomerServices() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchApi("/services/", { requireAuth: false });
        setServices(data || []);
      } catch { /* empty */ }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSignOut() {
    await logoutUser();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Services</h1>
            <p className="text-[#94a3b8]">Browse & book appointments</p>
          </div>
          <button onClick={handleSignOut} className="px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-[#94a3b8] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all text-sm">
            Sign Out
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full text-center p-12 text-[#94a3b8]">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="col-span-full glass-card p-8 text-center">
              <p className="text-[#64748b] text-lg">No services available yet</p>
              <p className="text-[#4b5563] text-sm mt-1">Available services will appear here</p>
            </div>
          ) : (
            services.map((s) => (
              <Link key={s.id} href={`/book/${s.id}`} className="glass-card p-6 hover:border-[#7c3aed] transition-all">
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-[#94a3b8] mb-3">{s.description}</p>
                <div className="flex gap-4 text-xs text-[#64748b]">
                  <span>⏱️ {s.duration_minutes} min</span>
                  <span>📍 {s.location}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
