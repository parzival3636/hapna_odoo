"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export default function AdminOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrganizations();
  }, []);

  async function loadOrganizations() {
    try {
      const data = await fetchApi("/admin/organizations/");
      // Wait, let's check if the endpoint is /admin/organizations/ or /users/organizations/
      // In backend/admin_panel/urls.py we have 'organizations/' mapping to AdminOrganizationCreateView
      // But we might need a list view for admins too. 
      // Actually, OrganizationListView in users/views.py is AllowAny and maps to /api/users/organizations/
      const orgs = await fetchApi("/users/organizations/", { requireAuth: true });
      setOrganizations(orgs);
    } catch (err: any) {
      setError(err.message || "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await fetchApi("/admin/organizations/", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setName("");
      loadOrganizations();
    } catch (err: any) {
      setError(err.message || "Failed to create organization");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Organizations</h1>
      <p className="text-[#94a3b8] mb-8">Manage and create platform organizations</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Create New</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-2">Organization Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="auth-input"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className={`auth-button ${submitting ? "loading" : ""}`}
              >
                {submitting ? "Creating..." : "Create Organization"}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
          
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]">
                  <th className="p-4 text-sm font-medium text-[#94a3b8]">Name</th>
                  <th className="p-4 text-sm font-medium text-[#94a3b8]">ID</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={2} className="p-4 text-center text-sm text-[#94a3b8]">Loading...</td></tr>
                ) : organizations.length === 0 ? (
                  <tr><td colSpan={2} className="p-4 text-center text-sm text-[#94a3b8]">No organizations yet.</td></tr>
                ) : (
                  organizations.map((org) => (
                    <tr key={org.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="p-4 text-sm font-medium text-white">{org.name}</td>
                      <td className="p-4 text-sm text-[#64748b] font-mono">{org.id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
