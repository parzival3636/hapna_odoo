"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { 
  Save, 
  Trash2, 
  Plus, 
  Settings, 
  Users, 
  Clock, 
  MapPin, 
  HelpCircle, 
  Sparkles, 
  Globe, 
  CheckCircle2,
  Calendar as CalendarIcon,
  AlertTriangle,
  ChevronRight,
  Info,
  ChevronLeft
} from "lucide-react";
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
    <div className="max-w-6xl mx-auto py-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4 sm:px-0">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-pill bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest border border-slate-200">
              {service.appointment_type} Architecture
            </span>
            {service.is_published ? (
              <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Node
              </span>
            ) : (
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Draft State
              </span>
            )}
          </div>
          <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight">
            {service.title}
          </h1>
          <p className="text-slate-600 font-medium mt-2">Configure your service listing and booking rules</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={togglePublish}
            disabled={service.approval_status !== "approved" || saving}
            className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              service.is_published 
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200" 
                : "bg-brand-primary text-white shadow-xl shadow-brand-primary/20 hover:scale-[1.02] disabled:opacity-50"
            }`}
          >
            {service.is_published ? "Unpublish Listing" : "Publish Listing"}
          </button>
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="px-8 py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-brand-primary transition-all shadow-xl shadow-slate-300 flex items-center gap-3"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Commit Changes"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-12 overflow-x-auto gap-8 px-4 sm:px-0">
        {["details", "questions", "misc"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab === "details" ? "Configuration" : tab === "questions" ? "Intake Questions" : "SEO & Misc"}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 lg:p-16 shadow-card">
        {/* ═══════ DETAILS TAB ═══════ */}
        {activeTab === "details" && (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Title</label>
                <input
                  type="text"
                  value={service.title}
                  onChange={(e) => setService({ ...service, title: e.target.value })}
                  className="auth-input text-slate-900 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Duration (minutes)</label>
                <input
                  type="number"
                  value={service.duration_minutes}
                  onChange={(e) =>
                    setService({ ...service, duration_minutes: parseInt(e.target.value) })
                  }
                  className="auth-input text-slate-900 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Location Type</label>
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
                  className="auth-input text-slate-900 border-slate-200"
                >
                  <option value="Online">Online</option>
                  <option value="Physical">Physical</option>
                </select>
              </div>
              {service.location !== 'Online' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Venue Address</label>
                  <input
                    type="text"
                    value={service.venue_address || ""}
                    onChange={(e) => setService({ ...service, venue_address: e.target.value })}
                    className="auth-input text-slate-900 border-slate-200"
                    placeholder="e.g. Office address"
                  />
                </div>
              )}
            </div>

            {/* ══ Online Meeting Provider Picker ══ */}
            {service.location === 'Online' && (
              <div className="space-y-4 p-6 rounded-2xl border border-slate-100 bg-slate-50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Video Meeting Platform</h3>
                  <p className="text-xs text-slate-500 font-medium">Choose a platform — a meeting link will be auto-generated for every booking</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Jitsi Meet Card */}
                  <button
                    type="button"
                    onClick={() => setService({ ...service, online_meeting_provider: 'jitsi' })}
                    className={`relative p-5 rounded-2xl border-2 transition-all text-left group ${
                      service.online_meeting_provider === 'jitsi'
                        ? 'border-brand-primary bg-brand-primary-soft shadow-lg shadow-brand-primary/5'
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {service.online_meeting_provider === 'jitsi' && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-primary flex items-center justify-center shadow-lg">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900">Jitsi Meet</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">meet.jit.si</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">Auto-generate a Jitsi meeting link for each booking. Jitsi is 100% free and requires no account.</p>
                  </button>

                  {/* Zoom Card */}
                  <button
                    type="button"
                    onClick={() => setService({ ...service, online_meeting_provider: 'zoom' })}
                    className={`relative p-5 rounded-2xl border-2 transition-all text-left group ${
                      service.online_meeting_provider === 'zoom'
                        ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/5'
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {service.online_meeting_provider === 'zoom' && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900">Zoom</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">zoom.us</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">Auto-generate a Zoom meeting ID for each booking. Customers receive the join link via email.</p>
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Description</label>
              <textarea
                value={service.description || ""}
                onChange={(e) => setService({ ...service, description: e.target.value })}
                className="auth-input min-h-[100px] py-3 text-slate-900 border-slate-200"
              />
            </div>

            {/* ══════ RULES & PAYMENT ══════ */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-base font-semibold text-slate-900 mb-1">Rules & Payment</h3>
              <p className="text-xs text-slate-500 mb-4">Configure confirmation protocol and financial settlement</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Manual Confirmation */}
                <div className="space-y-4">
                   <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirmation Protocol</label>
                  </div>
                  <label className="flex items-center gap-4 p-6 rounded-2xl border border-slate-100 bg-slate-50 cursor-pointer group transition-all hover:border-brand-primary/30 h-full">
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      checked={service.manual_confirmation}
                      onChange={() => setService({ ...service, manual_confirmation: !service.manual_confirmation })}
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${service.manual_confirmation ? 'bg-brand-primary border-brand-primary' : 'border-slate-200 bg-white'}`}>
                      {service.manual_confirmation && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">Require Manual Verification</p>
                      <p className="text-[10px] text-slate-500 font-medium">Bookings must be approved by an administrator before confirmation</p>
                    </div>
                  </label>
                </div>

                {/* Advance Payment */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-4 h-4 text-slate-400" />
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Financial Settlement</label>
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-4 p-6 rounded-2xl border border-slate-100 bg-slate-50 cursor-pointer group transition-all hover:border-brand-primary/30">
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={service.advance_payment_required}
                        onChange={() => setService({ ...service, advance_payment_required: !service.advance_payment_required })}
                      />
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${service.advance_payment_required ? 'bg-brand-primary border-brand-primary' : 'border-slate-200 bg-white'}`}>
                        {service.advance_payment_required && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">Enforce Advance Payment</p>
                        <p className="text-[10px] text-slate-500 font-medium">Require upfront payment via Stripe to secure the slot</p>
                      </div>
                    </label>

                    {service.advance_payment_required && (
                      <div className="p-6 rounded-2xl border border-brand-primary/20 bg-brand-primary-soft animate-in slide-in-from-top-2">
                        <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2 block">Transaction Amount (Rs)</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            value={service.booking_fee || ""}
                            onChange={(e) => setService({ ...service, booking_fee: parseFloat(e.target.value) || 0 })}
                            className="auth-input bg-white text-slate-900 border-brand-primary/20 text-xl font-black"
                            placeholder="500"
                          />
                          <span className="text-sm font-bold text-slate-600">INR</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ══════ SCHEDULE TYPE ══════ */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-base font-semibold text-slate-900 mb-1">Schedule Type</h3>
              <p className="text-xs text-slate-500 mb-4">Choose how this service is scheduled</p>
              <div className="flex gap-3">
                {[{v:"weekly",l:"📅 Weekly",d:"Repeats every week"},{v:"monthly",l:"🗓️ Monthly",d:"Repeats every month"}].map(t=>(
                  <button key={t.v} type="button"
                    onClick={()=>setService({...service,appointment_type:t.v})}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${service.appointment_type===t.v?"border-brand-primary bg-brand-soft shadow-sm":"border-slate-100 bg-white hover:border-slate-200"}`}>
                    <div className="text-lg mb-1">{t.l}</div>
                    <div className="text-xs text-slate-500">{t.d}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ══════ BOOKING WINDOW ══════ */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-base font-semibold text-slate-900 mb-1">Booking Window</h3>
              <p className="text-xs text-slate-500 mb-4">Date range customers can book within</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Start Date</label>
                  <input type="date" value={service.schedule_start_date||new Date().toISOString().split('T')[0]}
                    onChange={e=>setService({...service,schedule_start_date:e.target.value})}
                    className="auth-input text-slate-900 border-slate-200" min={new Date().toISOString().split('T')[0]}/>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Duration (days)</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} max={90} value={service.schedule_days||7}
                      onChange={e=>setService({...service,schedule_days:parseInt(e.target.value)||7})}
                      className="auth-input w-20 text-center text-slate-900 border-slate-200"/>
                    <span className="text-xs text-slate-500">days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ══════ ACTIVE DAYS (exclude days) ══════ */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-base font-semibold text-slate-900 mb-1">Active Days</h3>
              <p className="text-xs text-slate-500 mb-4">Toggle off days you don't offer appointments (e.g. Saturday, Sunday)</p>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map(day=>{
                  const off=(service.excluded_days||[]).includes(day.value);
                  return(<button key={day.value} type="button" onClick={()=>{
                    const cur=service.excluded_days||[];
                    setService({...service,excluded_days:off?cur.filter((d:number)=>d!==day.value):[...cur,day.value]});
                  }} className={`px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${off?"border-slate-100 bg-transparent text-slate-400 line-through":"border-brand-primary bg-brand-soft text-brand-primary shadow-sm"}`}>
                    {day.label}
                  </button>);
                })}
              </div>
              {(service.excluded_days||[]).length>0&&(
                <p className="text-xs text-amber-600 mt-2">⚠️ {(service.excluded_days||[]).map((d:number)=>WEEKDAYS.find(w=>w.value===d)?.label).filter(Boolean).join(", ")} excluded</p>
              )}
            </div>

            {/* ══════ WORKING HOURS ══════ */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-base font-semibold text-slate-900 mb-1">Working Hours</h3>
              <p className="text-xs text-slate-500 mb-4">Daily time window for appointments</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">From</label>
                  <input type="time" value={service.working_start_time||"09:00"}
                    onChange={e=>setService({...service,working_start_time:e.target.value})} className="auth-input text-slate-900 border-slate-200"/>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">To</label>
                  <input type="time" value={service.working_end_time||"17:00"}
                    onChange={e=>setService({...service,working_end_time:e.target.value})} className="auth-input text-slate-900 border-slate-200"/>
                </div>
              </div>
            </div>

            {/* ══════ SESSION LENGTH ══════ */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-base font-semibold text-slate-900 mb-1">Session Length</h3>
              <p className="text-xs text-slate-500 mb-4">Each working day is divided into sessions of this duration</p>
              <div className="flex items-center gap-3">
                <input type="number" min={5} max={480} step={5} value={service.duration_minutes||30}
                  onChange={e=>setService({...service,duration_minutes:parseInt(e.target.value)||30})}
                  className="auth-input w-24 text-center text-slate-900 border-slate-200"/>
                <span className="text-sm text-slate-600">minutes per session</span>
              </div>
            </div>

            {/* ══════ CAPACITY PER SESSION ══════ */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-base font-semibold text-slate-900 mb-1">Capacity per Session</h3>
              <p className="text-xs text-slate-500 mb-4">How many people can book the same time slot</p>
              <div className="flex gap-3 mb-3">
                <button type="button" onClick={()=>setService({...service,capacity_per_slot:1})}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all text-left ${(service.capacity_per_slot||1)===1?"border-brand-primary bg-brand-soft shadow-sm":"border-slate-100 bg-white hover:border-slate-200"}`}>
                  <span className="text-lg">👤</span>
                  <span className="text-sm font-semibold text-slate-900 ml-2">1-on-1</span>
                  <span className="text-xs text-slate-500 ml-1">— one person per slot</span>
                </button>
                <button type="button" onClick={()=>setService({...service,capacity_per_slot:5})}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all text-left ${(service.capacity_per_slot||1)>1?"border-brand-primary bg-brand-soft shadow-sm":"border-slate-100 bg-white hover:border-slate-200"}`}>
                  <span className="text-lg">👥</span>
                  <span className="text-sm font-semibold text-slate-900 ml-2">Group</span>
                  <span className="text-xs text-slate-500 ml-1">— multiple per slot</span>
                </button>
              </div>
              {(service.capacity_per_slot||1)>1&&(
                <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-600">Max per slot:</span>
                  <input type="number" min={2} max={500} value={service.capacity_per_slot}
                    onChange={e=>setService({...service,capacity_per_slot:parseInt(e.target.value)||2})}
                    className="auth-input w-16 text-center py-1 text-sm text-slate-900 border-slate-200"/>
                  <span className="text-xs text-slate-500">people</span>
                </div>
              )}
            </div>

            {/* ══════ VISUAL DAY CALENDAR ══════ */}
            {/* ══════ LIVE AVAILABILITY PREVIEW ══════ */}
            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">Live Availability Preview</h3>
                  <p className="text-xs text-slate-500">Select a date to see actual slots based on your saved settings & Google Calendar</p>
                </div>
                <button type="button" onClick={loadPreviewDates} className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg transition-all text-slate-600">
                  Refresh Preview
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {/* Interactive Calendar */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900">{format(calendarMonth, "MMMM yyyy")}</h4>
                    <div className="flex gap-2">
                      <button type="button" onClick={(e) => { e.preventDefault(); setCalendarMonth(subMonths(calendarMonth, 1)); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-all text-slate-600">←</button>
                      <button type="button" onClick={(e) => { e.preventDefault(); setCalendarMonth(addMonths(calendarMonth, 1)); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-all text-slate-600">→</button>
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
                          className={`aspect-square flex items-center justify-center text-xs rounded-lg transition-all relative ${!isCurrentMonth ? "opacity-30" : ""} ${isSelected ? "bg-brand-primary text-white font-bold shadow-md shadow-brand-primary/20" : isAvailable ? "bg-white border border-slate-200 text-slate-900 hover:bg-brand-soft hover:text-brand-primary hover:border-brand-primary/30 cursor-pointer" : "text-slate-400 bg-transparent cursor-not-allowed"}`}
                        >
                          {format(d, "d")}
                          {isAvailable && !isSelected && (
                            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-primary"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Slots Panel */}
                <div className="border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
                  <h4 className="font-semibold text-slate-900 mb-4">
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
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 group shadow-sm">
                              <span className="text-sm font-bold text-slate-900">{sTime}</span>
                              <span className="text-[10px] text-slate-500">{(service.capacity_per_slot||1) > 1 ? `${slot.remaining_capacity} spots left` : "Available"}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-sm text-slate-500">No slots available</div>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-32 text-sm text-slate-500">Choose a date on the calendar</div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-8 py-4 rounded-2xl bg-brand-primary text-white text-xs font-black uppercase tracking-widest hover:bg-brand-primary/90 transition-all mt-4 w-full sm:w-auto shadow-lg shadow-brand-primary/20"
            >
              {saving ? "Saving..." : "Save Service"}
            </button>
          </form>
        )}



        {/* ═══════ QUESTIONS TAB ═══════ */}
        {activeTab === "questions" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[1.25rem] bg-brand-soft flex items-center justify-center text-brand-primary">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-black text-slate-900 tracking-tight">Intake Architecture</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Construct the heuristic data gathering pipeline</p>
                </div>
              </div>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all shadow-lg shadow-slate-200 flex items-center gap-3"
                >
                  <Plus className="w-4 h-4" />
                  Add Logic Node
                </button>
              )}
            </div>

            {qError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                <AlertTriangle className="w-4 h-4" />
                {qError}
              </div>
            )}

            {/* Questions table */}
            {questions.length > 0 && (
              <div className="border border-slate-100 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Question String</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Logic Type</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Required</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {questions.map((q, i) => (
                      <tr key={q.id ?? i} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="p-6">
                          <p className="text-sm font-bold text-slate-900">{q.question_text}</p>
                          {q.options && q.options.length > 0 && (
                            <p className="text-[10px] text-slate-500 mt-1 font-medium italic">Options: {q.options.join(", ")}</p>
                          )}
                        </td>
                        <td className="p-6">
                          <span className="px-3 py-1 rounded-pill bg-slate-100 text-slate-900 text-[9px] font-black uppercase tracking-widest border border-slate-200">
                            {typeLabel(q.question_type)}
                          </span>
                        </td>
                        <td className="p-6 text-center">
                          <button
                            onClick={() => handleToggleRequired(q)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all border ${
                              q.is_required 
                                ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                                : "bg-slate-50 border-slate-100 text-slate-300"
                            }`}
                          >
                            <CheckCircle2 className={`w-5 h-5 ${q.is_required ? "stroke-[2.5]" : "opacity-30"}`} />
                          </button>
                        </td>
                        <td className="p-6 text-center">
                          <button
                            onClick={() => handleDeleteQuestion(q.id!)}
                            className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center mx-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {questions.length === 0 && !showAddForm && (
              <div className="text-center py-20 border border-slate-100 border-dashed rounded-[3rem]">
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4">Zero logic nodes deployed</p>
                <button onClick={() => setShowAddForm(true)} className="text-brand-primary font-black text-sm uppercase tracking-widest hover:underline flex items-center gap-2 mx-auto">
                  Add your first intake question <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Add question form */}
            {showAddForm ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase text-xs tracking-widest">Deploy New Node</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Question Text</label>
                    <input
                      type="text"
                      value={newQ.question_text}
                      onChange={(e) => setNewQ({ ...newQ, question_text: e.target.value })}
                      className="auth-input bg-white text-slate-900 border-slate-200"
                      placeholder="e.g. Any medical history?"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Logic Type</label>
                    <select
                      value={newQ.question_type}
                      onChange={(e) => setNewQ({ ...newQ, question_type: e.target.value })}
                      className="auth-input bg-white text-slate-900 border-slate-200"
                    >
                      {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                {(newQ.question_type === "radio" || newQ.question_type === "checkbox") && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Options (comma-separated)</label>
                    <input
                      type="text"
                      value={newOptions}
                      onChange={(e) => setNewOptions(e.target.value)}
                      className="auth-input bg-white text-slate-900 border-slate-200"
                      placeholder="e.g. Morning, Afternoon, Evening"
                    />
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={newQ.is_required}
                    onChange={() => setNewQ({ ...newQ, is_required: !newQ.is_required })}
                  />
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${newQ.is_required ? 'bg-brand-primary border-brand-primary' : 'border-slate-200 bg-white'}`}>
                    {newQ.is_required && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-sm font-bold text-slate-900">Mandatory Response</span>
                </label>

                <div className="flex gap-4 pt-4">
                  <button onClick={handleAddQuestion} disabled={qSaving || !newQ.question_text.trim()} className="px-8 py-4 rounded-xl bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                    {qSaving ? "Deploying..." : "Add Logic Node"}
                  </button>
                  <button onClick={() => { setShowAddForm(false); setQError(""); }} className="px-8 py-4 rounded-xl bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest hover:bg-slate-300 transition-all">
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



            {/* ═══════ MISC TAB ═══════ */}
            {activeTab === "misc" && (
              <form onSubmit={handleUpdate} className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-brand-soft flex items-center justify-center text-brand-primary">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-black text-slate-900 tracking-tight">System Notifications</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localized interaction messages & SEO headers</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Landing Presentation</label>
                    <textarea
                      value={service.intro_message || ""}
                      onChange={(e) => setService({ ...service, intro_message: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all h-32"
                      placeholder="Schedule your visit today and experience expert care..."
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Post-Execution Dispatch</label>
                    <textarea
                      value={service.confirmation_message || ""}
                      onChange={(e) => setService({ ...service, confirmation_message: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all h-32"
                      placeholder="Thank you for your trust, we look forward to meeting you."
                    />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Included in automated confirmation protocols.</p>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-5 rounded-2xl bg-brand-primary text-white text-xs font-black uppercase tracking-widest hover:bg-brand-primary/90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3"
                  >
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    Synchronize Metadata
                  </button>
                </div>
              </form>
            )}
      </div>
    </div>
  );
}
