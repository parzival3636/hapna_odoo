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
      <h2 className="text-xl font-semibold text-white mb-1">Join an Organization</h2>
      <p className="text-sm text-[#94a3b8] mb-6">Select your organization to start managing services.</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm animate-shake">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-[#94a3b8]">Loading organizations...</div>
      ) : organizations.length === 0 ? (
        <div className="text-sm text-[#94a3b8]">No organizations found. Please ask your Admin to create one.</div>
      ) : (
        <div className="space-y-3">
          {organizations.map((org) => (
            <button
              key={org.id}
              disabled={joining}
              onClick={() => handleJoin(org.id)}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] hover:border-[#7c3aed] transition-colors"
            >
              <span className="text-white font-medium">{org.name}</span>
              <span className="text-[#7c3aed] text-sm">Join &rarr;</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
