"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

interface Service {
  id: string;
  title: string;
  appointment_type: string;
  is_published: boolean;
  approval_status: string;
}

export default function OrganiserServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadServices();
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const data = await fetchApi("/users/me/");
      setUser(data);
    } catch (err) {
      console.error("Failed to load user", err);
    }
  }

  async function loadServices() {
    try {
      const data = await fetchApi("/services/");
      setServices(Array.isArray(data) ? data : data.results ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setCreating(true);
    try {
      const newService = await fetchApi("/services/", {
        method: "POST",
        body: JSON.stringify({
          title: "New Service",
          duration_minutes: 30,
          appointment_type: "user",
          location: "Online",
        }),
      });
      // Redirect to configuration page
      window.location.href = `/dashboard/services/${newService.id}`;
    } catch (err: any) {
      alert(err.message || "Failed to create service");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Your Services</h1>
          <p className="text-[#94a3b8]">Create and manage your appointment listings</p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="px-4 py-2 rounded-lg bg-[#7c3aed] text-white font-medium hover:bg-[#6d28d9] transition-all flex items-center gap-2"
        >
          {creating ? "..." : "➕ Create Service"}
        </button>
      </div>

      {/* Google Calendar Sync Banner */}
      <div className={`mb-8 p-4 rounded-xl border flex items-center justify-between transition-all ${
        user?.google_calendar_connected 
          ? "bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)]" 
          : "bg-[rgba(245,158,11,0.05)] border-[rgba(245,158,11,0.2)]"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            user?.google_calendar_connected ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
          }`}>
            {user?.google_calendar_connected ? "🗓️" : "⚠️"}
          </div>
          <div>
            <h4 className={`text-sm font-bold ${user?.google_calendar_connected ? "text-emerald-400" : "text-amber-400"}`}>
              {user?.google_calendar_connected ? "Google Calendar Synced" : "Calendar Not Connected"}
            </h4>
            <p className="text-xs text-[#94a3b8]">
              {user?.google_calendar_connected 
                ? "Your availability is automatically cross-checked with your Google Calendar events." 
                : "Connect your calendar to automatically block busy slots and sync new appointments."}
            </p>
          </div>
        </div>
        {!user?.google_calendar_connected && (
          <Link 
            href="/dashboard/settings"
            className="px-4 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-all"
          >
            Connect Now
          </Link>
        )}
        {user?.google_calendar_connected && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Active
          </div>
        )}
      </div>

      {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center p-12 text-[#94a3b8]">Loading your services...</div>
        ) : services.length === 0 ? (
          <div className="col-span-full text-center p-12 glass-card">
            <p className="text-[#94a3b8] mb-4">You haven't created any services yet.</p>
            <button onClick={handleCreate} className="text-[#7c3aed] font-medium hover:underline">
              Create your first service now
            </button>
          </div>
        ) : (
          services.map((service) => (
            <Link
              key={service.id}
              href={`/dashboard/services/${service.id}`}
              className="glass-card p-6 hover:border-[#7c3aed] transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-[rgba(255,255,255,0.05)] text-[#64748b]`}>
                  {service.appointment_type}
                </span>
                <span className={`status-badge ${service.approval_status}`}>
                  {service.approval_status}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-[#7c3aed] transition-colors">
                {service.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
                <span>{service.is_published ? "🟢 Published" : "⚪ Draft"}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
