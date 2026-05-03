"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

type Organization = {
  id: string;
  name: string;
};

export default function JoinOrganizationPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrgs() {
      try {
        const data = await fetchApi("/users/organizations/", { requireAuth: false });
        // DRF returns paginated response { results: [...] } — extract the array
        setOrganizations(Array.isArray(data) ? data : data.results ?? []);
      } catch (err: any) {
        setError(err.message || "Failed to load organizations");
      } finally {
        setLoading(false);
      }
    }
    loadOrgs();
  }, []);

  async function handleJoin(orgId: string) {
    setJoining(true);
    setError("");
    try {
      await fetchApi("/users/join-organization/", {
        method: "POST",
        body: JSON.stringify({ organization_id: orgId }),
      });
      // After joining, they are pending_organiser. Redirect to pending screen or dashboard
      router.push("/dashboard/services?status=pending");
    } catch (err: any) {
      setError(err.message || "Failed to join organization");
      setJoining(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Select Organization</h2>
      <p className="text-sm text-slate-500 mb-8">Choose your organization to start managing services.</p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-shake">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Loading organizations...
        </div>
      ) : organizations.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-3xl text-slate-400 font-medium">
          No organizations found. <br /> Ask your Admin to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {organizations.map((org) => (
            <button
              key={org.id}
              disabled={joining}
              onClick={() => handleJoin(org.id)}
              className="w-full flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"
            >
              <span className="text-slate-900 font-bold group-hover:text-indigo-600 transition-colors">{org.name}</span>
              <span className="text-indigo-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">Join &rarr;</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
