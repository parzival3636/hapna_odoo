"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/lib/api";

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
  is_published: boolean;
  approval_status: string;
  schedules: any[];
  questions: ServiceQuestion[];
  resources: any[];
}

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
        {["details", "schedule", "questions", "resources"].map((tab) => (
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
                  onChange={(e) => setService({ ...service, location: e.target.value })}
                  className="auth-input"
                >
                  <option value="Online">Online</option>
                  <option value="Physical">Physical</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#94a3b8]">Venue Address</label>
                <input
                  type="text"
                  value={service.venue_address}
                  onChange={(e) => setService({ ...service, venue_address: e.target.value })}
                  className="auth-input"
                  placeholder="e.g. Zoom link or Office address"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#94a3b8]">Description</label>
              <textarea
                value={service.description}
                onChange={(e) => setService({ ...service, description: e.target.value })}
                className="auth-input min-h-[120px] py-3"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-[#7c3aed] text-white font-medium hover:bg-[#6d28d9] transition-all"
            >
              {saving ? "Saving..." : "Save Details"}
            </button>
          </form>
        )}

        {/* ═══════ SCHEDULE TAB ═══════ */}
        {activeTab === "schedule" && (
          <div className="text-center py-12 text-[#64748b]">
            <p className="mb-4">Schedule management component will go here.</p>
            <p className="text-xs">Supports Weekly slots and Flexible specific dates.</p>
          </div>
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
      </div>
    </div>
  );
}
