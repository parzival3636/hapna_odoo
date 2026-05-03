"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useSearchParams } from "next/navigation";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await fetchApi("/users/me/");
        setUser(data);
      } catch (err) {
        console.error("Failed to load user", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();

    if (searchParams.get("google_sync") === "success") {
      setSyncStatus("successfully_connected");
    }
  }, [searchParams]);

  async function handleConnectGoogle() {
    try {
      const data = await fetchApi("/users/google-auth/url/");
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      alert("Failed to start Google Sync. Check your .env keys.");
    }
  }

  if (loading) return <div className="p-8 text-slate-500">Loading settings...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500">Manage your integrations and account preferences</p>
      </header>

      {syncStatus === "successfully_connected" && (
        <div className="p-4 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] rounded-xl text-emerald-400 flex items-center gap-3">
          <span className="text-xl">✅</span>
          <span>Google Calendar successfully connected! Your availability is now synced.</span>
        </div>
      )}

      {/* Integrations Section */}
      <section className="glass-card overflow-hidden bg-white border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Integrations</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Google Calendar Row */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-lg">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" 
                  alt="Google Calendar" 
                  className="w-7 h-7"
                />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Google Calendar</h3>
                <p className="text-sm text-slate-500">
                  {user?.google_calendar_connected 
                    ? "Syncing your busy slots and adding new bookings automatically." 
                    : "Connect your calendar to sync availability dynamically."}
                </p>
              </div>
            </div>
            
            {user?.google_calendar_connected ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(16,185,129,0.1)] text-emerald-400 text-sm font-medium border border-[rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Connected
              </div>
            ) : (
              <button
                onClick={handleConnectGoogle}
                className="px-6 py-2.5 rounded-lg bg-brand-soft text-brand-primary font-bold hover:bg-brand-primary hover:text-white transition-all shadow-sm"
              >
                Connect
              </button>
            )}
          </div>

          {/* Zoom Integration Row */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 opacity-80">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#2d8cff] flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h10v10H4V4zm12 2l4-2v12l-4-2V6z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Zoom Meetings</h3>
                <p className="text-sm text-slate-500">Automatically generate Zoom links for every booking.</p>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-slate-200 text-slate-500 text-sm font-medium">
              Enabled (Global)
            </div>
          </div>
        </div>
      </section>

      {/* Account Section */}
      <section className="glass-card overflow-hidden bg-white border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Account Preferences</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Display Name</label>
              <input 
                type="text" 
                defaultValue={user?.username} 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Email Address</label>
              <input 
                type="email" 
                defaultValue={user?.email} 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                readOnly
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
