"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

interface ServiceQuestion {
  id?: string;
  question_text: string;
  question_type: string;
  is_required: boolean;
  display_order: number;
  options?: string[] | null;
  // local-only flags
  _isNew?: boolean;
  _editing?: boolean;
}

interface Service {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  appointment_type: string;
  location: string;
  venue_address: string;
  online_meeting_provider: string;
  meeting_auto_create: boolean;
  is_published: boolean;
  approval_status: string;
  manual_confirmation: boolean;
  manual_confirmation_percent: number | null;
  advance_payment_required: boolean;
  booking_fee: number | null;
  cancellation_hours: number;
  intro_message: string;
  confirmation_message: string;
  schedules: any[];
  questions: ServiceQuestion[];
  resources: any[];
  // Scheduling
  schedule_start_date: string | null;
  schedule_days: number;
  excluded_days: number[];
  working_start_time: string | null;
  working_end_time: string | null;
  capacity_per_slot: number;
  max_capacity: number | null;
}

const WEEKDAYS = [
  { value: 0, label: "Mon" },
  { value: 1, label: "Tue" },
  { value: 2, label: "Wed" },
  { value: 3, label: "Thu" },
  { value: 4, label: "Fri" },
  { value: 5, label: "Sat" },
  { value: 6, label: "Sun" },
];

const QUESTION_TYPES = [
  { value: "single_line", label: "Single line text" },
  { value: "multi_line", label: "Multi-line text" },
  { value: "phone", label: "Phone Number" },
  { value: "radio", label: "Radio (One Answer)" },
  { value: "checkbox", label: "Checkboxes (Multiple)" },
];

function typeLabel(val: string) {
  return QUESTION_TYPES.find((t) => t.value === val)?.label ?? val;
}

export default function ServiceConfig() {
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [saving, setSaving] = useState(false);

  // ── Question‑tab state ─────────────────────────────
  const [questions, setQuestions] = useState<ServiceQuestion[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQ, setNewQ] = useState<ServiceQuestion>({
    question_text: "",
    question_type: "single_line",
    is_required: false,
    display_order: 0,
    options: [],
  });
  const [newOptions, setNewOptions] = useState(""); // comma-separated
  const [qSaving, setQSaving] = useState(false);
  const [qError, setQError] = useState("");

  // ── Live Preview state ─────────────────────────────
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);

  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates]);

  useEffect(() => {
    if (id) loadPreviewDates();
  }, [id]);

  async function loadPreviewDates() {
    try {
      const data = await fetchApi(`/services/${id}/available-dates/`);
      setAvailableDates(Array.isArray(data) ? data : []);
    } catch (err) {}
  }

  async function handleDateClick(date: Date) {
    const dStr = format(date, "yyyy-MM-dd");
    setSelectedDate(dStr);
    setSlotLoading(true);
    try {
      const data = await fetchApi(`/services/${id}/slots/?date=${dStr}`);
      setAvailableSlots(data);
    } catch (err) {}
    setSlotLoading(false);
  }

  // Generate calendar grid
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = [];
  let day = startDate;
  while (day <= endDate) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  useEffect(() => {
    loadService();
  }, [id]);

  async function loadService() {
    try {
      const data = await fetchApi(`/services/${id}/`);
      setService(data);
      setQuestions(data.questions ?? []);
    } catch (err: any) {
      alert("Failed to load service");
    } finally {
      setLoading(false);
    }
  }

  // ── Details tab ────────────────────────────────────
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

  // ── Questions CRUD ─────────────────────────────────
  async function handleAddQuestion() {
    if (!newQ.question_text.trim()) return;
    setQSaving(true);
    setQError("");
    try {
      const opts =
        newQ.question_type === "radio" || newQ.question_type === "checkbox"
          ? newOptions
              .split(",")
              .map((o) => o.trim())
              .filter(Boolean)
          : null;

      await fetchApi("/services/questions/", {
        method: "POST",
        body: JSON.stringify({
          service_id: id,
          question_text: newQ.question_text,
          question_type: newQ.question_type,
          is_required: newQ.is_required,
          display_order: questions.length,
          options: opts,
        }),
      });
      setNewQ({
        question_text: "",
        question_type: "single_line",
        is_required: false,
        display_order: 0,
        options: [],
      });
      setNewOptions("");
      setShowAddForm(false);
      loadService();
    } catch (err: any) {
      setQError(err.message || "Failed to add question");
    } finally {
      setQSaving(false);
    }
  }

  async function handleDeleteQuestion(qId: string) {
    if (!confirm("Delete this question?")) return;
    try {
      await fetchApi(`/services/questions/${qId}/`, { method: "DELETE" });
      loadService();
    } catch (err: any) {
      alert(err.message || "Failed to delete question");
    }
  }

  async function handleToggleRequired(q: ServiceQuestion) {
    try {
      await fetchApi(`/services/questions/${q.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_required: !q.is_required }),
      });
      loadService();
    } catch {
      alert("Failed to update");
    }
  }

  // ── Render ─────────────────────────────────────────
  if (loading) return <div className="p-8">Loading...</div>;
  if (!service) return <div className="p-8">Service not found.</div>;

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
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

      {/* Tabs */}
      <div className="flex border-b border-[rgba(255,255,255,0.08)] mb-8 overflow-x-auto">
        {["details", "questions", "resources", "options", "misc"].map((tab) => (
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
        {/* ═══════ DETAILS TAB ═══════ */}
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
                  onChange={(e) =>
                    setService({ ...service, duration_minutes: parseInt(e.target.value) })
                  }
                  className="auth-input"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#94a3b8]">Location Type</label>
                <select
                  value={service.location}
                  onChange={(e) => {
                    const newLoc = e.target.value;
                    setService({
                      ...service,
                      location: newLoc,
                      online_meeting_provider: newLoc === 'Online' ? service.online_meeting_provider : 'none',
                    });
                  }}
                  className="auth-input"
                >
                  <option value="Online">Online</option>
                  <option value="Physical">Physical</option>
                </select>
              </div>
              {service.location !== 'Online' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#94a3b8]">Venue Address</label>
                  <input
                    type="text"
                    value={service.venue_address || ""}
                    onChange={(e) => setService({ ...service, venue_address: e.target.value })}
                    className="auth-input"
                    placeholder="e.g. Office address"
                  />
                </div>
              )}
            </div>

            {/* ══ Online Meeting Provider Picker ══ */}
            {service.location === 'Online' && (
              <div className="space-y-4 p-6 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Video Meeting Platform</h3>
                  <p className="text-xs text-[#64748b]">Choose a platform — a meeting link will be auto-generated for every booking</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Jitsi Meet Card */}
                  <button
                    type="button"
                    onClick={() => setService({ ...service, online_meeting_provider: 'jitsi' })}
                    className={`relative p-5 rounded-xl border-2 transition-all text-left group ${
                      service.online_meeting_provider === 'jitsi'
                        ? 'border-[#00B2FF] bg-[rgba(0,178,255,0.08)] shadow-[0_0_20px_rgba(0,178,255,0.15)]'
                        : 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)]'
                    }`}
                  >
                    {service.online_meeting_provider === 'jitsi' && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#00B2FF] flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1b3d5c] to-[#00B2FF] flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white">Jitsi Meet</span>
                        <p className="text-[10px] text-[#64748b] mt-0.5">meet.jit.si</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">Auto-generate a Jitsi meeting link for each booking. Jitsi is 100% free and requires no account.</p>
                  </button>

                  {/* Zoom Card */}
                  <button
                    type="button"
                    onClick={() => setService({ ...service, online_meeting_provider: 'zoom' })}
                    className={`relative p-5 rounded-xl border-2 transition-all text-left group ${
                      service.online_meeting_provider === 'zoom'
                        ? 'border-[#2d8cff] bg-[rgba(45,140,255,0.08)] shadow-[0_0_20px_rgba(45,140,255,0.15)]'
                        : 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)]'
                    }`}
                  >
                    {service.online_meeting_provider === 'zoom' && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#2d8cff] flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0b5cff] to-[#2d8cff] flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M4 4h10v10H4V4zm12 2l4-2v12l-4-2V6z"/>
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white">Zoom</span>
                        <p className="text-[10px] text-[#64748b] mt-0.5">zoom.us</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">Auto-generate a Zoom meeting ID for each booking. Customers receive the join link via email.</p>
                  </button>
                </div>

                {/* Auto-create toggle */}
                {service.online_meeting_provider !== 'none' && (
                  <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.06)]">
                    <div>
                      <span className="text-sm font-medium text-white">Auto-create meeting on booking</span>
                      <p className="text-xs text-[#64748b] mt-0.5">Meeting link will be generated and emailed automatically</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setService({ ...service, meeting_auto_create: !service.meeting_auto_create })}
                      className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
                        service.meeting_auto_create ? 'bg-[#7c3aed]' : 'bg-[rgba(255,255,255,0.15)]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                          service.meeting_auto_create ? 'translate-x-[22px]' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Selected provider summary */}
                {service.online_meeting_provider !== 'none' && (
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${
                    service.online_meeting_provider === 'jitsi'
                      ? 'bg-[rgba(0,178,255,0.1)] border border-[rgba(0,178,255,0.2)]'
                      : 'bg-[rgba(45,140,255,0.1)] border border-[rgba(45,140,255,0.2)]'
                  }`}>
                    <span className="text-sm">
                      {service.online_meeting_provider === 'jitsi' ? '🎥' : '🔵'}
                    </span>
                    <span className="text-xs text-[#94a3b8]">
                      <strong className="text-white">
                        {service.online_meeting_provider === 'jitsi' ? 'Jitsi Meet' : 'Zoom'}
                      </strong>
                      {' '}will be used for online meetings. Links are sent to customers upon booking{service.meeting_auto_create ? ' automatically' : ' when you confirm'}.
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#94a3b8]">Description</label>
              <textarea
                value={service.description || ""}
                onChange={(e) => setService({ ...service, description: e.target.value })}
                className="auth-input min-h-[100px] py-3"
              />
            </div>

            {/* ══════ SCHEDULE TYPE ══════ */}
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-6">
              <h3 className="text-base font-semibold text-white mb-1">Schedule Type</h3>
              <p className="text-xs text-[#64748b] mb-4">Choose how this service is scheduled</p>
              <div className="flex gap-3">
                {[{v:"weekly",l:"📅 Weekly",d:"Repeats every week"},{v:"monthly",l:"🗓️ Monthly",d:"Repeats every month"}].map(t=>(
                  <button key={t.v} type="button"
                    onClick={()=>setService({...service,appointment_type:t.v})}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${service.appointment_type===t.v?"border-[#7c3aed] bg-[rgba(124,58,237,0.08)] shadow-[0_0_15px_rgba(124,58,237,0.12)]":"border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.15)]"}`}>
                    <div className="text-lg mb-1">{t.l}</div>
                    <div className="text-xs text-[#64748b]">{t.d}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ══════ BOOKING WINDOW ══════ */}
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-6">
              <h3 className="text-base font-semibold text-white mb-1">Booking Window</h3>
              <p className="text-xs text-[#64748b] mb-4">Date range customers can book within</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#94a3b8]">Start Date</label>
                  <input type="date" value={service.schedule_start_date||new Date().toISOString().split('T')[0]}
                    onChange={e=>setService({...service,schedule_start_date:e.target.value})}
                    className="auth-input" min={new Date().toISOString().split('T')[0]}/>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#94a3b8]">Duration (days)</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} max={90} value={service.schedule_days||7}
                      onChange={e=>setService({...service,schedule_days:parseInt(e.target.value)||7})}
                      className="auth-input w-20 text-center"/>
                    <span className="text-xs text-[#64748b]">days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ══════ ACTIVE DAYS (exclude days) ══════ */}
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-6">
              <h3 className="text-base font-semibold text-white mb-1">Active Days</h3>
              <p className="text-xs text-[#64748b] mb-4">Toggle off days you don't offer appointments (e.g. Saturday, Sunday)</p>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map(day=>{
                  const off=(service.excluded_days||[]).includes(day.value);
                  return(<button key={day.value} type="button" onClick={()=>{
                    const cur=service.excluded_days||[];
                    setService({...service,excluded_days:off?cur.filter((d:number)=>d!==day.value):[...cur,day.value]});
                  }} className={`px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${off?"border-[rgba(255,255,255,0.05)] bg-transparent text-[#4b5563] line-through":"border-[#7c3aed] bg-[rgba(124,58,237,0.1)] text-[#a78bfa]"}`}>
                    {day.label}
                  </button>);
                })}
              </div>
              {(service.excluded_days||[]).length>0&&(
                <p className="text-xs text-amber-400/80 mt-2">⚠️ {(service.excluded_days||[]).map((d:number)=>WEEKDAYS.find(w=>w.value===d)?.label).filter(Boolean).join(", ")} excluded</p>
              )}
            </div>

            {/* ══════ WORKING HOURS ══════ */}
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-6">
              <h3 className="text-base font-semibold text-white mb-1">Working Hours</h3>
              <p className="text-xs text-[#64748b] mb-4">Daily time window for appointments</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#94a3b8]">From</label>
                  <input type="time" value={service.working_start_time||"09:00"}
                    onChange={e=>setService({...service,working_start_time:e.target.value})} className="auth-input"/>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#94a3b8]">To</label>
                  <input type="time" value={service.working_end_time||"17:00"}
                    onChange={e=>setService({...service,working_end_time:e.target.value})} className="auth-input"/>
                </div>
              </div>
            </div>

            {/* ══════ SESSION LENGTH ══════ */}
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-6">
              <h3 className="text-base font-semibold text-white mb-1">Session Length</h3>
              <p className="text-xs text-[#64748b] mb-4">Each working day is divided into sessions of this duration</p>
              <div className="flex items-center gap-3">
                <input type="number" min={5} max={480} step={5} value={service.duration_minutes||30}
                  onChange={e=>setService({...service,duration_minutes:parseInt(e.target.value)||30})}
                  className="auth-input w-24 text-center"/>
                <span className="text-sm text-[#94a3b8]">minutes per session</span>
              </div>
            </div>

            {/* ══════ CAPACITY PER SESSION ══════ */}
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-6">
              <h3 className="text-base font-semibold text-white mb-1">Capacity per Session</h3>
              <p className="text-xs text-[#64748b] mb-4">How many people can book the same time slot</p>
              <div className="flex gap-3 mb-3">
                <button type="button" onClick={()=>setService({...service,capacity_per_slot:1})}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all text-left ${(service.capacity_per_slot||1)===1?"border-[#7c3aed] bg-[rgba(124,58,237,0.08)]":"border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.15)]"}`}>
                  <span className="text-lg">👤</span>
                  <span className="text-sm font-semibold text-white ml-2">1-on-1</span>
                  <span className="text-xs text-[#64748b] ml-1">— one person per slot</span>
                </button>
                <button type="button" onClick={()=>setService({...service,capacity_per_slot:5})}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all text-left ${(service.capacity_per_slot||1)>1?"border-[#7c3aed] bg-[rgba(124,58,237,0.08)]":"border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.15)]"}`}>
                  <span className="text-lg">👥</span>
                  <span className="text-sm font-semibold text-white ml-2">Group</span>
                  <span className="text-xs text-[#64748b] ml-1">— multiple per slot</span>
                </button>
              </div>
              {(service.capacity_per_slot||1)>1&&(
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
                  <span className="text-xs text-[#94a3b8]">Max per slot:</span>
                  <input type="number" min={2} max={500} value={service.capacity_per_slot}
                    onChange={e=>setService({...service,capacity_per_slot:parseInt(e.target.value)||2})}
                    className="auth-input w-16 text-center py-1 text-sm"/>
                  <span className="text-xs text-[#64748b]">people</span>
                </div>
              )}
            </div>

            {/* ══════ VISUAL DAY CALENDAR ══════ */}
            {/* ══════ LIVE AVAILABILITY PREVIEW ══════ */}
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">Live Availability Preview</h3>
                  <p className="text-xs text-[#64748b]">Select a date to see actual slots based on your saved settings & Google Calendar</p>
                </div>
                <button type="button" onClick={loadPreviewDates} className="px-3 py-1.5 text-xs font-medium bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-all text-[#94a3b8]">
                  Refresh Preview
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.06)]">
                {/* Interactive Calendar */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-white">{format(calendarMonth, "MMMM yyyy")}</h4>
                    <div className="flex gap-2">
                      <button type="button" onClick={(e) => { e.preventDefault(); setCalendarMonth(subMonths(calendarMonth, 1)); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-all">←</button>
                      <button type="button" onClick={(e) => { e.preventDefault(); setCalendarMonth(addMonths(calendarMonth, 1)); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-all">→</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                      <div key={d} className="text-[10px] font-bold text-[#64748b]">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((d, i) => {
                      const isCurrentMonth = isSameMonth(d, calendarMonth);
                      const dStr = format(d, "yyyy-MM-dd");
                      const isAvailable = availableDateSet.has(dStr);
                      const isSelected = selectedDate === dStr;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => handleDateClick(d)}
                          className={`aspect-square flex items-center justify-center text-xs rounded-lg transition-all relative ${!isCurrentMonth ? "opacity-30" : ""} ${isSelected ? "bg-[#7c3aed] text-white font-bold shadow-[0_0_15px_rgba(124,58,237,0.3)]" : isAvailable ? "bg-[rgba(255,255,255,0.05)] text-white hover:bg-[rgba(255,255,255,0.1)] cursor-pointer" : "text-[#4b5563] cursor-not-allowed"}`}
                        >
                          {format(d, "d")}
                          {isAvailable && !isSelected && (
                            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#a78bfa]"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Slots Panel */}
                <div className="border-t lg:border-t-0 lg:border-l border-[rgba(255,255,255,0.06)] pt-4 lg:pt-0 lg:pl-6">
                  <h4 className="font-semibold text-white mb-4">
                    {selectedDate ? format(new Date(selectedDate), "EEEE, MMMM d") : "Select a date"}
                  </h4>
                  {selectedDate ? (
                    slotLoading ? (
                      <div className="flex items-center justify-center h-32 text-sm text-[#64748b]">Loading slots...</div>
                    ) : availableSlots.length > 0 ? (
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {availableSlots.map((slot: any, i: number) => {
                          const sTime = slot.start_time.substring(0, 5);
                          return (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.15)] group">
                              <span className="text-sm font-bold text-[#a78bfa]">{sTime}</span>
                              <span className="text-[10px] text-[#64748b]">{(service.capacity_per_slot||1) > 1 ? `${slot.remaining_capacity} spots left` : "Available"}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-sm text-[#64748b]">No slots available</div>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-32 text-sm text-[#64748b]">Choose a date on the calendar</div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-[#7c3aed] text-white font-medium hover:bg-[#6d28d9] transition-all mt-4"
            >
              {saving ? "Saving..." : "Save Service"}
            </button>
          </form>
        )}



        {/* ═══════ QUESTIONS TAB ═══════ */}
        {activeTab === "questions" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Intake Questions</h2>
                <p className="text-sm text-[#64748b] mt-1">
                  Questions customers must answer when booking this service
                </p>
              </div>
            </div>

            {qError && (
              <div className="mb-4 p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm">
                {qError}
              </div>
            )}

            {/* Questions table */}
            {questions.length > 0 && (
              <div className="rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
                      <th className="p-4 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                        Question
                      </th>
                      <th className="p-4 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                        Answer Type
                      </th>
                      <th className="p-4 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                        Options
                      </th>
                      <th className="p-4 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider text-center">
                        Mandatory
                      </th>
                      <th className="p-4 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider text-center w-16">
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q, i) => (
                      <tr
                        key={q.id ?? i}
                        className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                      >
                        <td className="p-4 text-sm font-medium text-white">
                          {q.question_text}
                        </td>
                        <td className="p-4">
                          <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-[rgba(124,58,237,0.15)] text-[#a78bfa] font-medium">
                            {typeLabel(q.question_type)}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-[#64748b]">
                          {q.options && q.options.length > 0
                            ? q.options.join(", ")
                            : "—"}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleRequired(q)}
                            className="inline-flex items-center justify-center"
                            title="Toggle mandatory"
                          >
                            <span
                              className={`inline-flex items-center justify-center w-5 h-5 rounded border transition-all ${
                                q.is_required
                                  ? "bg-[#7c3aed] border-[#7c3aed]"
                                  : "border-[rgba(255,255,255,0.2)] bg-transparent"
                              }`}
                            >
                              {q.is_required && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </span>
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteQuestion(q.id!)}
                            className="text-[#64748b] hover:text-[#ef4444] transition-colors text-lg leading-none"
                            title="Delete question"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {questions.length === 0 && !showAddForm && (
              <div className="text-center py-12 mb-6 rounded-xl border border-dashed border-[rgba(255,255,255,0.1)]">
                <p className="text-[#64748b] mb-2">No intake questions yet</p>
                <p className="text-xs text-[#4b5563]">
                  Add questions that customers will fill out during booking
                </p>
              </div>
            )}

            {/* Add question form */}
            {showAddForm ? (
              <div className="rounded-xl border border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.04)] p-6 space-y-5">
                <h3 className="text-sm font-semibold text-white mb-4">New Question</h3>

                {/* Answer type selector */}
                <div className="flex flex-wrap gap-2">
                  {QUESTION_TYPES.map((t) => (
                    <button
                      type="button"
                      key={t.value}
                      onClick={() => setNewQ({ ...newQ, question_type: t.value })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        newQ.question_type === t.value
                          ? "border-[#7c3aed] bg-[rgba(124,58,237,0.2)] text-[#a78bfa]"
                          : "border-[rgba(255,255,255,0.1)] text-[#64748b] hover:border-[rgba(255,255,255,0.2)] hover:text-[#94a3b8]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Question text */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#94a3b8]">Question</label>
                  <input
                    type="text"
                    value={newQ.question_text}
                    onChange={(e) => setNewQ({ ...newQ, question_text: e.target.value })}
                    className="auth-input"
                    placeholder="Anything else we should know?"
                    autoFocus
                  />
                </div>

                {/* Options input — only for radio / checkbox */}
                {(newQ.question_type === "radio" || newQ.question_type === "checkbox") && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#94a3b8]">
                      Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newOptions}
                      onChange={(e) => setNewOptions(e.target.value)}
                      className="auth-input"
                      placeholder="e.g. Morning, Afternoon, Evening"
                    />
                  </div>
                )}

                {/* Mandatory toggle */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded border transition-all ${
                      newQ.is_required
                        ? "bg-[#7c3aed] border-[#7c3aed]"
                        : "border-[rgba(255,255,255,0.2)] bg-transparent"
                    }`}
                    onClick={() => setNewQ({ ...newQ, is_required: !newQ.is_required })}
                  >
                    {newQ.is_required && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="text-sm text-[#94a3b8]">Mandatory Answer</span>
                </label>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleAddQuestion}
                    disabled={qSaving || !newQ.question_text.trim()}
                    className="px-5 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-all disabled:opacity-50"
                  >
                    {qSaving ? "Saving..." : "Add Question"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setQError("");
                    }}
                    className="px-5 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-[#94a3b8] text-sm hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 text-sm text-[#7c3aed] hover:text-[#a78bfa] transition-colors font-medium"
              >
                <span className="text-lg leading-none">+</span> Add a question
              </button>
            )}
          </div>
        )}

        {/* ═══════ RESOURCES TAB ═══════ */}
        {activeTab === "resources" && (
          <div className="text-center py-12 text-[#64748b]">
            <p className="mb-4">Resources and Staffing component will go here.</p>
            <p className="text-xs">Assign people or physical assets to this service.</p>
          </div>
        )}

        {/* ═══════ OPTIONS TAB ═══════ */}
        {activeTab === "options" && (
          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Manual Confirmation */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer select-none min-w-[160px]">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded border transition-all ${
                        service.manual_confirmation
                          ? "bg-[#7c3aed] border-[#7c3aed]"
                          : "border-[rgba(255,255,255,0.2)] bg-transparent"
                      }`}
                      onClick={() =>
                        setService({ ...service, manual_confirmation: !service.manual_confirmation })
                      }
                    >
                      {service.manual_confirmation && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm font-medium text-white">Manual confirmation</span>
                  </label>
                  {service.manual_confirmation && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#94a3b8]">Upto</span>
                      <input
                        type="number"
                        value={service.manual_confirmation_percent || ""}
                        onChange={(e) => setService({ ...service, manual_confirmation_percent: parseInt(e.target.value) || null })}
                        className="auth-input w-20 py-1 px-2 text-center"
                        placeholder="50"
                      />
                      <span className="text-sm text-[#94a3b8]">% of capacity</span>
                    </div>
                  )}
                </div>

                {/* Paid Booking */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer select-none min-w-[160px]">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded border transition-all ${
                        service.advance_payment_required
                          ? "bg-[#7c3aed] border-[#7c3aed]"
                          : "border-[rgba(255,255,255,0.2)] bg-transparent"
                      }`}
                      onClick={() =>
                        setService({ ...service, advance_payment_required: !service.advance_payment_required })
                      }
                    >
                      {service.advance_payment_required && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm font-medium text-white">Paid Booking</span>
                  </label>
                  {service.advance_payment_required && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#94a3b8]">Booking Fees (Rs</span>
                      <input
                        type="number"
                        value={service.booking_fee || ""}
                        onChange={(e) => setService({ ...service, booking_fee: parseFloat(e.target.value) || null })}
                        className="auth-input w-24 py-1 px-2 text-center"
                        placeholder="200"
                      />
                      <span className="text-sm text-[#94a3b8]">Per booking)</span>
                    </div>
                  )}
                </div>

                {/* Schedule Type */}
                <div className="flex items-center gap-6">
                  <span className="text-sm font-medium text-white min-w-[160px]">Schedule</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="schedule_type" className="sr-only" checked={true} readOnly />
                      <span className="w-4 h-4 rounded-full border-2 border-[#7c3aed] bg-[#7c3aed] flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </span>
                      <span className="text-sm text-[#cbd5e1]">weekly</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="schedule_type" className="sr-only" checked={false} readOnly />
                      <span className="w-4 h-4 rounded-full border-2 border-[rgba(255,255,255,0.25)] flex items-center justify-center group-hover:border-[rgba(255,255,255,0.4)]">
                      </span>
                      <span className="text-sm text-[#cbd5e1]">flexible</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Create Slot */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-white min-w-[100px]">Create Slot</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={service.duration_minutes || ""}
                      onChange={(e) => setService({ ...service, duration_minutes: parseInt(e.target.value) || 0 })}
                      className="auth-input w-24 py-1 px-2 text-center"
                    />
                    <span className="text-sm text-[#94a3b8]">minutes</span>
                  </div>
                </div>

                {/* Cancellation */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-white min-w-[100px]">Cancellation</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#94a3b8]">up to</span>
                    <input
                      type="number"
                      value={service.cancellation_hours || ""}
                      onChange={(e) => setService({ ...service, cancellation_hours: parseInt(e.target.value) || 0 })}
                      className="auth-input w-20 py-1 px-2 text-center"
                    />
                    <span className="text-sm text-[#94a3b8]">hour(s) before the booking</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-[#7c3aed] text-white font-medium hover:bg-[#6d28d9] transition-all"
              >
                {saving ? "Saving..." : "Save Options"}
              </button>
            </div>
          </form>
        )}

        {/* ═══════ MISC TAB ═══════ */}
        {activeTab === "misc" && (
          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-medium text-white">Introduction page message</label>
              <textarea
                value={service.intro_message || ""}
                onChange={(e) => setService({ ...service, intro_message: e.target.value })}
                className="auth-input min-h-[100px] py-3"
                placeholder="Schedule your visit today and experience expert care brought right to your doorstep."
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-white">Confirmation page message</label>
              <textarea
                value={service.confirmation_message || ""}
                onChange={(e) => setService({ ...service, confirmation_message: e.target.value })}
                className="auth-input min-h-[100px] py-3"
                placeholder="Thank you for your trust we look forward to meeting you"
              />
              <p className="text-xs text-[#94a3b8]">This message will be included in the confirmation email sent to the user.</p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-[#7c3aed] text-white font-medium hover:bg-[#6d28d9] transition-all"
              >
                {saving ? "Saving..." : "Save Messages"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
