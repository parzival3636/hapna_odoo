"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/lib/api";

interface Service {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  appointment_type: string;
  location: string;
  venue_address: string;
  is_published: boolean;
  approval_status: string;
  schedules: any[];
  questions: any[];
  resources: any[];
}

export default function ServiceConfig() {
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadService();
  }, [id]);

  async function loadService() {
    try {
      const data = await fetchApi(`/services/${id}/`);
      setService(data);
    } catch (err: any) {
      alert("Failed to load service");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchApi(`/services/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(service),
      });
      alert("Saved!");
    } catch (err) {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish() {
    if (!service) return;
    const action = service.is_published ? "unpublish" : "publish";
    try {
      await fetchApi(`/services/${id}/${action}/`, { method: "POST" });
      loadService();
    } catch (err: any) {
      alert(err.message || "Failed to change publish status");
    }
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (!service) return <div className="p-8">Service not found.</div>;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{service.title}</h1>
            <span className={`status-badge ${service.approval_status}`}>
              {service.approval_status}
            </span>
          </div>
          <p className="text-[#94a3b8]">Configure your service listing and booking rules</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={togglePublish}
            disabled={service.approval_status !== "approved"}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              service.is_published
                ? "bg-[rgba(255,255,255,0.05)] text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)]"
                : "bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {service.is_published ? "Unpublish" : "Publish Listing"}
          </button>
        </div>
      </div>

      <div className="flex border-b border-[rgba(255,255,255,0.08)] mb-8 overflow-x-auto">
        {["details", "schedule", "questions", "resources"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-all capitalize whitespace-nowrap ${
              activeTab === tab
                ? "border-[#7c3aed] text-white"
                : "border-transparent text-[#64748b] hover:text-[#94a3b8]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="glass-card p-8">
        {activeTab === "details" && (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#94a3b8]">Title</label>
                <input
                  type="text"
                  value={service.title}
                  onChange={(e) => setService({ ...service, title: e.target.value })}
                  className="auth-input"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#94a3b8]">Duration (minutes)</label>
                <input
                  type="number"
                  value={service.duration_minutes}
                  onChange={(e) => setService({ ...service, duration_minutes: parseInt(e.target.value) })}
                  className="auth-input"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#94a3b8]">Location Type</label>
                <select
                  value={service.location}
                  onChange={(e) => setService({ ...service, location: e.target.value })}
                  className="auth-input"
                >
                  <option value="Online">Online</option>
                  <option value="Physical">Physical</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#94a3b8]">Venue Address</label>
                <input
                  type="text"
                  value={service.venue_address}
                  onChange={(e) => setService({ ...service, venue_address: e.target.value })}
                  className="auth-input"
                  placeholder="e.g. Zoom link or Office address"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#94a3b8]">Description</label>
              <textarea
                value={service.description}
                onChange={(e) => setService({ ...service, description: e.target.value })}
                className="auth-input min-h-[120px] py-3"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-[#7c3aed] text-white font-medium hover:bg-[#6d28d9] transition-all"
            >
              {saving ? "Saving..." : "Save Details"}
            </button>
          </form>
        )}

        {activeTab === "schedule" && (
          <div className="text-center py-12 text-[#64748b]">
            <p className="mb-4">Schedule management component will go here.</p>
            <p className="text-xs">Supports Weekly slots and Flexible specific dates.</p>
          </div>
        )}

        {activeTab === "questions" && (
          <div className="text-center py-12 text-[#64748b]">
            <p className="mb-4">Intake questions component will go here.</p>
            <p className="text-xs">Custom fields to collect from customers during booking.</p>
          </div>
        )}

        {activeTab === "resources" && (
          <div className="text-center py-12 text-[#64748b]">
            <p className="mb-4">Resources and Staffing component will go here.</p>
            <p className="text-xs">Assign people or physical assets to this service.</p>
          </div>
        )}
      </div>
    </div>
  );
}
