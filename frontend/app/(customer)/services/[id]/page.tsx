"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { customerApi } from "@/lib/customer-api";

interface ServiceQuestion {
  id: string;
  question_text: string;
  question_type: string;
  is_required: boolean;
  options?: string[] | null;
}

interface Resource {
  id: string;
  name: string;
  resource_type: string;
}

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  appointment_type: string;
  location: string;
  venue_address: string;
  image_url: string | null;
  payment_amount: string;
  advance_payment_required: boolean;
  manual_confirmation: boolean;
  max_capacity: number | null;
  timezone: string;
  intro_message: string | null;
  questions: ServiceQuestion[];
  resources: Resource[];
}

interface NextAvailableDate {
  date: string;
  slots_available: number;
}

export default function ServiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextDates, setNextDates] = useState<string[]>([]);

  useEffect(() => {
    loadService();
  }, [id]);

  async function loadService() {
    try {
      const data = await customerApi(`/services/${id}/`, {
        requireAuth: false,
      });
      setService(data);

      // Also fetch next available dates
      try {
        const avail = await customerApi(
          `/services/${id}/next-available/?count=5`,
          { requireAuth: false }
        );
        setNextDates(avail.next_available_dates || []);
      } catch (err: any) {
        console.error("Failed to load next available dates:", err);
      }
    } catch (err: any) {
      console.error("loadService error:", err);
      setError(err.message || String(err));
    }
    setLoading(false);
  }

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-[#94a3b8] animate-pulse text-lg">
          Loading service details...
        </div>
      </div>
    );

  if (!service)
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="text-4xl mb-4">😔</div>
          <p className="text-[#ef4444] text-lg mb-4">{error}</p>
          <Link
            href="/services"
            className="text-[#7c3aed] hover:underline"
          >
            ← Browse all services
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,15,0.9)] backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/services"
            className="text-[#94a3b8] hover:text-white transition-colors text-sm flex items-center gap-2"
          >
            ← Back to Services
          </Link>
          <span className="text-sm text-[#64748b]">{service.timezone}</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="glass-card p-8">
          {/* Title */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-[rgba(124,58,237,0.1)] text-[#a78bfa] mb-3 inline-block">
                {service.appointment_type}
              </span>
              <h1 className="text-3xl font-bold mt-2">{service.title}</h1>
            </div>
            {service.advance_payment_required && (
              <div className="text-right">
                <div className="text-2xl font-bold text-[#4ade80]">
                  ₹{service.payment_amount}
                </div>
                <div className="text-xs text-[#64748b]">advance required</div>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-[#94a3b8] mb-6 leading-relaxed">
            {service.description || "No description provided."}
          </p>

          {service.intro_message && (
            <div className="bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.2)] rounded-xl p-4 mb-6">
              <p className="text-sm text-[#cbd5e1]">{service.intro_message}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-4">
              <div className="text-xs text-[#64748b] mb-1">Duration</div>
              <div className="text-white font-semibold">
                {service.duration_minutes} min
              </div>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-4">
              <div className="text-xs text-[#64748b] mb-1">Location</div>
              <div className="text-white font-semibold text-sm">
                {service.location || "Online"}
              </div>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-4">
              <div className="text-xs text-[#64748b] mb-1">Capacity</div>
              <div className="text-white font-semibold">
                {service.max_capacity || 1} seat{(service.max_capacity || 1) > 1 ? "s" : ""}
              </div>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-4">
              <div className="text-xs text-[#64748b] mb-1">Confirmation</div>
              <div className="text-white font-semibold text-sm">
                {service.manual_confirmation ? "Manual" : "Auto"}
              </div>
            </div>
          </div>

          {/* Resources (if resource-type) */}
          {service.resources.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
                Available Resources
              </h3>
              <div className="flex flex-wrap gap-2">
                {service.resources.map((r) => (
                  <span
                    key={r.id}
                    className="px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-sm"
                  >
                    {r.name}
                    <span className="text-[#64748b] ml-1 text-xs">
                      ({r.resource_type})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Intake Questions Preview */}
          {service.questions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
                Intake Questions
              </h3>
              <div className="space-y-2">
                {service.questions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center gap-2 text-sm text-[#cbd5e1]"
                  >
                    <span className="text-[#64748b]">•</span>
                    {q.question_text}
                    {q.is_required && (
                      <span className="text-[#ef4444] text-xs">*</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Available Dates */}
          {nextDates.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
                Next Available Dates
              </h3>
              <div className="flex flex-wrap gap-2">
                {nextDates.map((d, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      router.push(`/book/${service.id}?date=${d}`)
                    }
                    className="px-4 py-2 rounded-lg bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.2)] text-sm text-[#a78bfa] hover:bg-[rgba(124,58,237,0.2)] transition-all"
                  >
                    {new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={() => router.push(`/book/${service.id}`)}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#2563eb] text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] transition-all"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
