"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { customerApi } from "@/lib/customer-api";
import { logoutUser } from "@/app/actions/auth";

interface Service {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  location: string;
  appointment_type: string;
  image_url: string | null;
  payment_amount: string;
  advance_payment_required: boolean;
  max_capacity: number | null;
  timezone: string;
}

export default function CustomerServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [filtered, setFiltered] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    let list = services;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.description || "").toLowerCase().includes(q) ||
          (s.location || "").toLowerCase().includes(q)
      );
    }
    if (typeFilter) {
      list = list.filter((s) => s.appointment_type === typeFilter);
    }
    setFiltered(list);
  }, [search, typeFilter, services]);

  async function loadServices() {
    try {
      const data = await customerApi("/services/", { requireAuth: false });
      const list = Array.isArray(data) ? data : data.results ?? [];
      setServices(list);
    } catch (err: any) {
      console.error("loadServices error:", err);
      setErrorMsg(err.message || String(err));
    }
    setLoading(false);
  }

  async function handleSignOut() {
    await logoutUser();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,15,0.9)] backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#7c3aed] to-[#2563eb] bg-clip-text text-transparent">
              Hapna
            </span>
            <span className="text-[#64748b] text-sm hidden sm:inline">
              | Book Services
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="px-3 py-2 rounded-lg text-sm text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
            >
              Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="px-3 py-2 rounded-lg text-sm text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <h1 className="text-4xl font-bold mb-2">Browse Services</h1>
        <p className="text-[#94a3b8] text-lg">
          Find and book appointments with ease
        </p>
      </div>

      {/* Search & Filter */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, description, or location..."
              className="w-full pl-11 pr-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder-[#64748b] focus:outline-none focus:border-[rgba(124,58,237,0.5)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#94a3b8] focus:outline-none focus:border-[rgba(124,58,237,0.5)] transition-all appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="">All Types</option>
            <option value="user">User-based</option>
            <option value="resource">Resource-based</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card p-6 animate-pulse h-48"
              >
                <div className="h-4 bg-[rgba(255,255,255,0.06)] rounded w-3/4 mb-4" />
                <div className="h-3 bg-[rgba(255,255,255,0.04)] rounded w-full mb-2" />
                <div className="h-3 bg-[rgba(255,255,255,0.04)] rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : errorMsg ? (
          <div className="glass-card p-12 text-center border-red-500/30">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-[#ef4444] text-lg">Error loading services</p>
            <p className="text-[#64748b] text-sm mt-1">{errorMsg}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-[#94a3b8] text-lg">No services found</p>
            <p className="text-[#64748b] text-sm mt-1">
              {search || typeFilter
                ? "Try adjusting your search or filters"
                : "No services are available yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s) => (
              <Link
                key={s.id}
                href={`/services/${s.id}`}
                className="glass-card p-6 hover:border-[#7c3aed] transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-[rgba(124,58,237,0.1)] text-[#a78bfa]">
                    {s.appointment_type}
                  </span>
                  {s.advance_payment_required && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-[rgba(34,197,94,0.1)] text-[#4ade80]">
                      ₹{s.payment_amount}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#7c3aed] transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-[#94a3b8] mb-4 line-clamp-2">
                  {s.description || "No description"}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-[#64748b]">
                  <span className="flex items-center gap-1">⏱️ {s.duration_minutes} min</span>
                  <span className="flex items-center gap-1">📍 {s.location || "Online"}</span>
                  {s.max_capacity && s.max_capacity > 1 && (
                    <span className="flex items-center gap-1">👥 {s.max_capacity} seats</span>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                  <span className="text-sm text-[#7c3aed] font-medium group-hover:underline">
                    View & Book →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
