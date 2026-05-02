"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

interface Booking {
  id: string;
  customer_name: string;
  service_title: string;
  slot_date: string;
  slot_start: string;
  status: string;
  total_price: string;
}

export default function OrganiserBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  async function loadBookings() {
    setLoading(true);
    try {
      const data = await fetchApi(`/bookings/?status=${statusFilter}`);
      setBookings(data.results || []);
    } catch (err: any) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(bookingId: string, action: string) {
    try {
      await fetchApi(`/bookings/${bookingId}/${action}/`, { method: "PATCH" });
      loadBookings();
    } catch (err: any) {
      alert(err.message || `Failed to ${action} booking`);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Bookings</h1>
      <p className="text-[#94a3b8] mb-8">Manage appointments and customer requests</p>

      <div className="flex gap-2 mb-6">
        {["pending", "confirmed", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              statusFilter === s
                ? "bg-[#7c3aed] text-white"
                : "bg-[rgba(255,255,255,0.05)] text-[#64748b] hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]">
              <th className="p-4 text-sm font-medium text-[#94a3b8]">Customer</th>
              <th className="p-4 text-sm font-medium text-[#94a3b8]">Service</th>
              <th className="p-4 text-sm font-medium text-[#94a3b8]">Time</th>
              <th className="p-4 text-sm font-medium text-[#94a3b8]">Status</th>
              <th className="p-4 text-sm font-medium text-[#94a3b8]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center text-sm text-[#94a3b8]">Loading...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-sm text-[#94a3b8]">No bookings found for this filter.</td></tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <td className="p-4 text-sm font-medium text-white">{booking.customer_name || "Guest"}</td>
                  <td className="p-4 text-sm text-[#94a3b8]">{booking.service_title}</td>
                  <td className="p-4">
                    <div className="text-sm text-white">{booking.slot_date}</div>
                    <div className="text-xs text-[#64748b]">{booking.slot_start}</div>
                  </td>
                  <td className="p-4">
                    <span className={`status-badge ${booking.status}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleAction(booking.id, "approve")}
                            className="text-xs text-green-500 hover:underline"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(booking.id, "reject")}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => handleAction(booking.id, "cancel")}
                          className="text-xs text-[#64748b] hover:text-red-500 hover:underline"
                        >
                          Cancel
                        </button>
                      )}
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
