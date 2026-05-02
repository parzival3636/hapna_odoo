"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

interface User {
  id: string;
  username: string;
  role: string;
  is_active: boolean;
  total_bookings: number;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await fetchApi("/admin/users/");
      setUsers(data.results || []);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(userId: string) {
    setActionLoading(userId);
    try {
      await fetchApi(`/admin/users/${userId}/approve-role/`, {
        method: "PATCH",
      });
      loadUsers();
    } catch (err: any) {
      alert(err.message || "Failed to approve user");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Users & Roles</h1>
      <p className="text-[#94a3b8] mb-8">Manage user access and roles</p>

      {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]">
              <th className="p-4 text-sm font-medium text-[#94a3b8]">User</th>
              <th className="p-4 text-sm font-medium text-[#94a3b8]">Role</th>
              <th className="p-4 text-sm font-medium text-[#94a3b8]">Status</th>
              <th className="p-4 text-sm font-medium text-[#94a3b8]">Bookings</th>
              <th className="p-4 text-sm font-medium text-[#94a3b8]">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center text-sm text-[#94a3b8]">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-sm text-[#94a3b8]">No users found.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <td className="p-4">
                    <div className="text-sm font-medium text-white">{user.username}</div>
                    <div className="text-xs text-[#64748b]">Joined {new Date(user.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4">
                    <span className={`role-badge ${user.role}`}>
                      {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs ${user.is_active ? "text-green-500" : "text-red-500"}`}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[#94a3b8]">{user.total_bookings}</td>
                  <td className="p-4">
                    {user.role === "pending_organiser" && (
                      <button
                        onClick={() => handleApprove(user.id)}
                        disabled={actionLoading === user.id}
                        className="px-3 py-1 rounded-lg bg-[#7c3aed] text-white text-xs hover:bg-[#6d28d9] transition-colors disabled:opacity-50"
                      >
                        {actionLoading === user.id ? "..." : "Approve"}
                      </button>
                    )}
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
