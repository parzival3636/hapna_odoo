"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  ExternalLink, 
  MoreHorizontal, 
  CheckCheck, 
  Calendar as CalendarIcon,
  Search,
  Filter,
  Share2
} from "lucide-react";

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
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
    setActionLoading(bookingId);
    try {
      if (action === "confirm") {
        await fetchApi(`/bookings/${bookingId}/confirm/`, { method: "POST" });
      } else if (action === "complete") {
        await fetchApi(`/bookings/${bookingId}/status/`, {
          method: "PATCH",
          body: JSON.stringify({ status: "completed" }),
        });
      } else if (action === "reject") {
        await fetchApi(`/bookings/${bookingId}/reject/`, { method: "POST", body: JSON.stringify({ reason: "Declined by organiser" }) });
      } else {
        await fetchApi(`/bookings/${bookingId}/status/`, {
          method: "PATCH",
          body: JSON.stringify({ status: "cancelled" }),
        });
      }
      loadBookings();
    } catch (err: any) {
      alert(err.message || `Failed to ${action} booking`);
    } finally {
      setActionLoading(null);
    }
  }

  function getMeetingBadge(booking: Booking) {
    if (!booking.meeting_provider || booking.meeting_provider === "none") return null;
    const isJitsi = booking.meeting_provider === "jitsi";
    return (
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            isJitsi
              ? "bg-sky-50 text-sky-600 border border-sky-100"
              : "bg-blue-50 text-blue-600 border border-blue-100"
          }`}
        >
          {isJitsi ? <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" /> : <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
          {isJitsi ? "Jitsi" : "Zoom"}
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">Operations Center</p>
          <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight">Bookings</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-card">
            {["pending", "confirmed", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === s
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
          <XCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching appointments...</p>
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                        <CalendarIcon className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-400">No {statusFilter} bookings found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                          {(booking.customer_name || "G")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{booking.customer_name || "Guest"}</div>
                          <div className="text-[10px] font-medium text-slate-400">{booking.customer_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-sm font-bold text-slate-700">{booking.service_title}</div>
                      <div className="text-[10px] font-black text-brand-primary/50 uppercase tracking-widest mt-1">ID: #{booking.id.slice(0, 8)}</div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-300" />
                        {booking.slot_date}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-300" />
                        {booking.slot_start}
                      </div>
                    </td>
                    <td className="p-6">
                      {booking.meeting_link ? (
                        <button
                          onClick={() => setMeetingModal(booking)}
                          className="flex items-center gap-2 group/btn"
                        >
                          {getMeetingBadge(booking)}
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover/btn:bg-brand-soft group-hover/btn:text-brand-primary transition-all">
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        </button>
                      ) : (
                        <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">—</span>
                      )}
                    </td>
                    <td className="p-6">
                      <span className={`px-4 py-1.5 rounded-pill text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 border ${
                        booking.status === "confirmed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        booking.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-100" :
                        booking.status === "completed" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                        "bg-slate-50 text-slate-400 border-slate-100"
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          booking.status === "confirmed" ? "bg-emerald-500" :
                          booking.status === "pending" ? "bg-amber-500" :
                          booking.status === "completed" ? "bg-indigo-500" :
                          "bg-slate-300"
                        }`} />
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        {actionLoading === booking.id ? (
                          <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            {booking.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleAction(booking.id, "confirm")}
                                  className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                  title="Confirm Appointment"
                                >
                                  <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                                </button>
                                <button
                                  onClick={() => handleAction(booking.id, "reject")}
                                  className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                  title="Reject Appointment"
                                >
                                  <XCircle className="w-4 h-4 stroke-[2.5]" />
                                </button>
                              </>
                            )}
                            {booking.status === "confirmed" && (
                              <>
                                <button
                                  onClick={() => handleAction(booking.id, "complete")}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm font-black text-[10px] uppercase tracking-widest"
                                  title="Mark as Complete"
                                >
                                  <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                                  Finish Session
                                </button>
                                <button
                                  onClick={() => handleAction(booking.id, "cancel")}
                                  className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                                  title="Cancel Appointment"
                                >
                                  <XCircle className="w-4 h-4 stroke-[2.5]" />
                                </button>
                              </>
                            )}
                          </>
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

      {/* Meeting Details Modal */}
      {meetingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md"
          onClick={() => setMeetingModal(null)}
        >
          <div
            className="bg-white border border-slate-200 shadow-2xl rounded-[3rem] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className={`p-10 ${
                meetingModal.meeting_provider === "jitsi"
                  ? "bg-gradient-to-br from-sky-50 to-white"
                  : "bg-gradient-to-br from-blue-50 to-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div
                    className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl ${
                      meetingModal.meeting_provider === "jitsi"
                        ? "bg-sky-500 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {meetingModal.meeting_provider === "jitsi" ? (
                      <CheckCheck className="w-8 h-8 stroke-[2.5]" />
                    ) : (
                      <CheckCheck className="w-8 h-8 stroke-[2.5]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-black text-slate-900 tracking-tight">
                      {meetingModal.meeting_provider === "jitsi" ? "Jitsi Meet" : "Zoom Meeting"}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{meetingModal.service_title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMeetingModal(null)}
                  className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-10 space-y-8">
              {/* Customer Info */}
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white text-sm font-black">
                  {(meetingModal.customer_name || "G")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{meetingModal.customer_name || "Guest"}</p>
                  <p className="text-[10px] font-medium text-slate-400">{meetingModal.customer_email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2 block">Meeting ID</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-mono text-xs tracking-wider">
                      {meetingModal.meeting_id}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(meetingModal.meeting_id || "");
                      }}
                      className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-all shadow-sm"
                      title="Copy ID"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2 block">Date & Time</label>
                  <p className="text-sm text-slate-900 font-black">{meetingModal.slot_date}</p>
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{meetingModal.slot_start}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <a
                  href={meetingModal.meeting_link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-white text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] shadow-xl ${
                    meetingModal.meeting_provider === "jitsi"
                      ? "bg-sky-500 shadow-sky-100"
                      : "bg-blue-600 shadow-blue-100"
                  }`}
                >
                  🚀 Initialize Session
                </a>
                <button
                  onClick={() => setMeetingModal(null)}
                  className="px-6 py-4 rounded-2xl border border-slate-200 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
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
