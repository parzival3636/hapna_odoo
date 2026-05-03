"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

interface Stats {
  total_users: number;
  total_organisers: number;
  total_customers: number;
  total_bookings_today: number;
  total_bookings_this_week: number;
  total_bookings_this_month: number;
  total_active_services: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchApi("/admin/stats/");
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Failed to load admin stats");
      }
    }
    loadStats();
  }, []);

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-10 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Platform Console</h1>
          <p className="text-slate-500 text-lg font-medium">Real-time platform metrics and ecosystem overview.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Network</p>
            <p className="text-3xl font-black text-slate-900">{stats.total_users}</p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Organisers</p>
            <p className="text-3xl font-black text-slate-900">{stats.total_organisers}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Active Customers</p>
            <p className="text-3xl font-black text-slate-900">{stats.total_customers}</p>
          </div>

          <div className="bg-brand-soft border border-brand-primary/20 rounded-[2rem] p-8 shadow-xl shadow-brand-primary/10 transition-transform hover:scale-[1.02]">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            </div>
            <p className="text-xs font-black text-brand-primary/60 uppercase tracking-widest mb-1">Live Services</p>
            <p className="text-3xl font-black text-brand-primary">{stats.total_active_services}</p>
          </div>
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <span className="w-1.5 h-8 bg-indigo-600 rounded-full" />
          Booking Throughput
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Today</p>
            <p className="text-4xl font-black text-slate-900">{stats.total_bookings_today}</p>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">This Week</p>
            <p className="text-4xl font-black text-slate-900">{stats.total_bookings_this_week}</p>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '45%' }} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">This Month</p>
            <p className="text-4xl font-black text-slate-900">{stats.total_bookings_this_month}</p>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '30%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
