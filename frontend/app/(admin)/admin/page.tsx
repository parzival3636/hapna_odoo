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
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
      <p className="text-[#94a3b8] mb-8">Platform overview and statistics</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5">
          <p className="text-sm text-[#64748b]">Total Users</p>
          <p className="text-3xl font-bold">{stats.total_users}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-[#64748b]">Organisers</p>
          <p className="text-3xl font-bold">{stats.total_organisers}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-[#64748b]">Customers</p>
          <p className="text-3xl font-bold">{stats.total_customers}</p>
        </div>
        <div className="glass-card p-5 border-[#7c3aed]">
          <p className="text-sm text-[#64748b]">Active Services</p>
          <p className="text-3xl font-bold text-[#7c3aed]">{stats.total_active_services}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Bookings Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-sm text-[#64748b]">Today</p>
          <p className="text-2xl font-bold">{stats.total_bookings_today}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-[#64748b]">This Week</p>
          <p className="text-2xl font-bold">{stats.total_bookings_this_week}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-[#64748b]">This Month</p>
          <p className="text-2xl font-bold">{stats.total_bookings_this_month}</p>
        </div>
      </div>
    </div>
  );
}
