"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { Plus, Calendar, AlertTriangle, Share2, Settings, Clock, Users, ArrowUpRight } from "lucide-react";

interface Service {
  id: string;
  title: string;
  appointment_type: string;
  is_published: boolean;
  approval_status: string;
  duration_minutes?: number;
}

export default function OrganiserServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      window.location.href = `/dashboard/services/${newService.id}`;
    } catch (err: any) {
      alert(err.message || "Failed to create service");
    } finally {
      setCreating(false);
    }
  }

  const handleShare = (e: React.MouseEvent, serviceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/book/${serviceId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(serviceId);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      alert("Failed to copy link");
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">Service Architecture</p>
          <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight">Service Hub</h1>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="px-8 py-4 rounded-2xl bg-brand-primary text-white text-xs font-black uppercase tracking-widest hover:bg-brand-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-primary/20 flex items-center gap-3"
        >
          {creating ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Plus className="w-4 h-4 stroke-[3]" />
          )}
          Register Service
        </button>
      </div>

      {/* Google Calendar Sync Banner */}
      <div className={`mb-16 p-8 rounded-[2.5rem] border flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-500 ${
        user?.google_calendar_connected 
          ? "bg-emerald-50/50 border-emerald-100" 
          : "bg-amber-50/50 border-amber-100"
      }`}>
        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-sm ${
            user?.google_calendar_connected ? "bg-white text-emerald-500" : "bg-white text-amber-500"
          }`}>
            {user?.google_calendar_connected ? (
              <Calendar className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            )}
          </div>
          <div>
            <h4 className={`text-[10px] font-black uppercase tracking-widest ${user?.google_calendar_connected ? "text-emerald-700" : "text-amber-700"}`}>
              {user?.google_calendar_connected ? "Ecosystem Synchronized" : "Connection Required"}
            </h4>
            <p className="text-sm font-medium text-slate-600 mt-1">
              {user?.google_calendar_connected 
                ? "Your Hapna schedule is perfectly aligned with your Google Calendar." 
                : "Bridge the gap. Connect your calendar to prevent scheduling conflicts."}
            </p>
          </div>
        </div>
        {!user?.google_calendar_connected ? (
          <Link 
            href="/dashboard/settings"
            className="px-6 py-3 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-200"
          >
            Authorize Hub
          </Link>
        ) : (
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-pill bg-emerald-100/50 border border-emerald-200 text-[10px] text-emerald-700 font-black uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-time Sync Active
          </div>
        )}
      </div>

      {error && (
        <div className="mb-12 p-5 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black uppercase tracking-widest text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 rounded-[2.5rem] bg-white border border-slate-100 animate-pulse shadow-card" />
          ))
        ) : services.length === 0 ? (
          <div className="md:col-span-2 text-center py-24 bg-white border border-slate-100 border-dashed rounded-[3rem] shadow-card">
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mb-6">Zero services deployed</p>
            <button onClick={handleCreate} className="text-brand-primary font-black text-sm uppercase tracking-widest hover:underline flex items-center gap-2 mx-auto">
              Launch your first service <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="group bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-card hover:shadow-card-hover hover:border-brand-primary/30 transition-all duration-500 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
              
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className={`text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-pill ${
                    service.approval_status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {service.appointment_type} • {service.approval_status}
                  </span>
                  {service.is_published && (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-heading font-black text-slate-900 group-hover:text-brand-primary transition-colors mb-3">
                  {service.title}
                </h3>
                <div className="flex items-center gap-6 text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{service.duration_minutes || 30} MINS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{service.appointment_type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-10">
                <button
                  onClick={(e) => handleShare(e, service.id)}
                  className="flex-1 px-5 py-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-brand-soft hover:text-brand-primary hover:border-brand-primary/20 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {copiedId === service.id ? "✓ Copied" : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </>
                  )}
                </button>
                <Link
                  href={`/dashboard/services/${service.id}`}
                  className="flex-1 px-5 py-4 rounded-xl bg-slate-900 text-white hover:bg-brand-primary transition-all text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Configure
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

