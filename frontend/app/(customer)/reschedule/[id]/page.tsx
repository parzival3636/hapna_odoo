"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { customerApi } from "@/lib/customer-api";
import { fetchApi } from "@/lib/api";
import { RescheduleWizard } from "@/app/components/customer/RescheduleWizard";

export default function ReschedulePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const bookingData = await customerApi(`/bookings/${id}/`, {
          requireAuth: true,
        });
        setBooking(bookingData);

        const serviceData = await fetchApi(`/services/${bookingData.service_id}/`, {
          requireAuth: false,
        });
        setService(serviceData);
      } catch (err: any) {
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] p-4 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !booking || !service) {
    return (
      <div className="min-h-screen bg-[#020617] p-4 flex items-center justify-center">
        <div className="text-red-400">{error || "Data not found."}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto mt-12">
        <button
          onClick={() => router.back()}
          className="text-[#94A3B8] hover:text-white flex items-center gap-2 mb-6 text-sm font-medium"
        >
          &larr; Back
        </button>

        <RescheduleWizard booking={booking} service={service} />
      </div>
    </div>
  );
}
