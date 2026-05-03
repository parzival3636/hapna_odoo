"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

interface PendingService {
  id: string;
  title: string;
  organization: string;
  created_at: string;
}

export default function AdminServices() {
  const [services, setServices] = useState<PendingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPendingServices();
  }, []);

  async function loadPendingServices() {
    try {
      const data = await fetchApi("/admin/pending-services/");
      setServices(data.results || []);
    } catch (err: any) {
      setError(err.message || "Failed to load pending services");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(serviceId: string, action: "approve" | "reject") {
    setActionLoading(serviceId);
    try {
      await fetchApi(`/admin/services/${serviceId}/${action}/`, {
        method: "PATCH",
      });
      loadPendingServices();
    } catch (err: any) {
      alert(err.message || `Failed to ${action} service`);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Service Approvals</h1>
      <p className="text-[#94a3b8] mb-8">Review and approve new service listings</p>

      {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

      <div className="glass-card overflow-hidden bg-white border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="p-4 text-sm font-medium text-slate-500">Service</th>
              <th className="p-4 text-sm font-medium text-slate-500">Organization</th>
              <th className="p-4 text-sm font-medium text-slate-500">Submitted</th>
              <th className="p-4 text-sm font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center text-sm text-slate-500">Loading...</td></tr>
            ) : services.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-sm text-slate-500">No services pending approval.</td></tr>
            ) : (
              services.map((service) => (
                <tr key={service.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-bold text-slate-900">{service.title}</td>
                  <td className="p-4 text-sm font-medium text-slate-500">{service.organization}</td>
                  <td className="p-4 text-sm text-slate-400">{new Date(service.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(service.id, "approve")}
                        disabled={actionLoading === service.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(service.id, "reject")}
                        disabled={actionLoading === service.id}
                        className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
