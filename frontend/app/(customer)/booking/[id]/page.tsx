"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { customerApi } from "@/lib/customer-api";
import { BookingDetail } from "@/app/components/customer/BookingDetail";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBooking() {
      try {
        const data = await customerApi(`/bookings/${id}/`, {
          requireAuth: true,
        });
        setBooking(data);
      } catch (err: any) {
        setError(err.message || "Failed to load booking.");
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] p-4 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#020617] p-4 flex items-center justify-center">
        <div className="text-red-400">{error || "Booking not found."}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto mt-12">
        <button
          onClick={() => router.push("/services")}
          className="text-[#94A3B8] hover:text-white flex items-center gap-2 mb-6"
        >
          &larr; Back to Services
        </button>

        <h1 className="text-3xl font-semibold text-white mb-6">Booking Detail</h1>
        <BookingDetail booking={booking} />
      </div>
    </div>
  );
}
