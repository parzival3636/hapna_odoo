"use client";

import { use } from "react";
import { BookingWizard } from "@/app/components/booking/BookingWizard";

export default function BookServicePage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = use(params);

  return (
    <div className="w-full">
      <BookingWizard serviceId={serviceId} serviceName="General Consultation" price="₹1,200" />
    </div>
  );
}
