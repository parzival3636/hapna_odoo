"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  service_title: string;
  slot_date: string;
  slot_start: string;
  status: string;
  meeting_provider: string | null;
  meeting_id: string | null;
  meeting_link: string | null;
}

export default function OrganiserBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [meetingModal, setMeetingModal] = useState<Booking | null>(null);

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
      if (action === "confirm") {
        await fetchApi(`/bookings/${bookingId}/confirm/`, { method: "POST" });
      } else if (action === "reject") {
        await fetchApi(`/bookings/${bookingId}/reject/`, { method: "POST", body: JSON.stringify({ reason: "" }) });
      } else {
        await fetchApi(`/bookings/${bookingId}/status/`, {
          method: "PATCH",
          body: JSON.stringify({ status: "cancelled" }),
        });
      }
      loadBookings();
    } catch (err: any) {
      alert(err.message || `Failed to ${action} booking`);
    }
  }

  function getMeetingBadge(booking: Booking) {
    if (!booking.meeting_provider || booking.meeting_provider === "none") return null;
    const isJitsi = booking.meeting_provider === "jitsi";
    return (
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
            isJitsi
              ? "bg-[rgba(0,178,255,0.15)] text-[#00B2FF] border border-[rgba(0,178,255,0.3)]"
              : "bg-[rgba(45,140,255,0.15)] text-[#60a5fa] border border-[rgba(45,140,255,0.3)]"
          }`}
        >
          <span className="text-xs">{isJitsi ? "🎥" : "🎥"}</span>
          {isJitsi ? "Jitsi" : "Zoom"}
        </span>
      </div>
    );
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
              <th className="p-4 text-sm font-medium text-[#94a3b8]">Meeting</th>
              <th className="p-4 text-sm font-medium text-[#94a3b8]">Status</th>
              <th className="p-4 text-sm font-medium text-[#94a3b8]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center text-sm text-[#94a3b8]">Loading...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-sm text-[#94a3b8]">No bookings found for this filter.</td></tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <td className="p-4">
                    <div className="text-sm font-medium text-white">{booking.customer_name || "Guest"}</div>
                    <div className="text-xs text-[#64748b]">{booking.customer_email}</div>
                  </td>
                  <td className="p-4 text-sm text-[#94a3b8]">{booking.service_title}</td>
                  <td className="p-4">
                    <div className="text-sm text-white">{booking.slot_date}</div>
                    <div className="text-xs text-[#64748b]">{booking.slot_start}</div>
                  </td>
                  <td className="p-4">
                    {booking.meeting_link ? (
                      <button
                        onClick={() => setMeetingModal(booking)}
                        className="group flex items-center gap-1.5 cursor-pointer"
                      >
                        {getMeetingBadge(booking)}
                        <svg className="w-3.5 h-3.5 text-[#64748b] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    ) : (
                      <span className="text-xs text-[#4b5563]">—</span>
                    )}
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
                            onClick={() => handleAction(booking.id, "confirm")}
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

      {/* Meeting Details Modal */}
      {meetingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setMeetingModal(null)}
        >
          <div
            className="glass-card p-0 w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "fadeInUp 0.3s ease-out" }}
          >
            {/* Modal Header */}
            <div
              className={`p-6 ${
                meetingModal.meeting_provider === "jitsi"
                  ? "bg-gradient-to-r from-[rgba(0,178,255,0.2)] to-[rgba(0,178,255,0.1)]"
                  : "bg-gradient-to-r from-[rgba(11,92,255,0.2)] to-[rgba(45,140,255,0.1)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                      meetingModal.meeting_provider === "jitsi"
                        ? "bg-gradient-to-br from-[#1b3d5c] to-[#00B2FF]"
                        : "bg-gradient-to-br from-[#0b5cff] to-[#2d8cff]"
                    }`}
                  >
                    {meetingModal.meeting_provider === "jitsi" ? (
                      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    ) : (
                      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 4h10v10H4V4zm12 2l4-2v12l-4-2V6z"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {meetingModal.meeting_provider === "jitsi" ? "Jitsi Meet" : "Zoom Meeting"}
                    </h3>
                    <p className="text-xs text-[#94a3b8]">{meetingModal.service_title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMeetingModal(null)}
                  className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.2)] transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Customer Info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-sm font-bold">
                  {(meetingModal.customer_name || "G")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{meetingModal.customer_name || "Guest"}</p>
                  <p className="text-xs text-[#64748b]">{meetingModal.customer_email}</p>
                </div>
              </div>

              {/* Meeting ID */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[#64748b] mb-1.5 block">Meeting ID</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-white font-mono text-sm tracking-wider">
                    {meetingModal.meeting_id}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(meetingModal.meeting_id || "");
                    }}
                    className="px-3 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-all text-xs"
                    title="Copy Meeting ID"
                  >
                    📋
                  </button>
                </div>
              </div>

              {/* Meeting Link */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[#64748b] mb-1.5 block">Meeting Link</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[#94a3b8] text-sm truncate">
                    {meetingModal.meeting_link}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(meetingModal.meeting_link || "");
                    }}
                    className="px-3 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-all text-xs"
                    title="Copy Link"
                  >
                    📋
                  </button>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-[#64748b] mb-1.5 block">Date</label>
                  <p className="text-sm text-white font-medium">{meetingModal.slot_date}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-[#64748b] mb-1.5 block">Time</label>
                  <p className="text-sm text-white font-medium">{meetingModal.slot_start}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <a
                  href={meetingModal.meeting_link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:shadow-lg ${
                    meetingModal.meeting_provider === "jitsi"
                      ? "bg-gradient-to-r from-[#1b3d5c] to-[#00B2FF] hover:shadow-[0_4px_20px_rgba(0,178,255,0.3)]"
                      : "bg-gradient-to-r from-[#0b5cff] to-[#2d8cff] hover:shadow-[0_4px_20px_rgba(45,140,255,0.3)]"
                  }`}
                >
                  🚀 Join Meeting
                </a>
                <button
                  onClick={() => setMeetingModal(null)}
                  className="px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.1)] text-[#94a3b8] text-sm hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
