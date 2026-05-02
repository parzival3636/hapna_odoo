"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function BookingDetail() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="w-full">
      <div className="pt-8 pb-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-8">
          <Link className="hover:text-indigo-600 transition-colors" href="/profile">My Bookings</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-slate-900">Booking #{id || "HAP-1234"}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Card */}
          <div className="lg:col-span-8 bg-white/70 backdrop-blur-md rounded-xl overflow-hidden shadow-sm border border-slate-200/80">
            {/* Status Banner */}
            <div className="w-full bg-emerald-50 border-b border-emerald-100 px-6 py-3 flex items-center space-x-2">
              <span className="material-symbols-outlined text-emerald-700 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-emerald-700 text-xs font-bold tracking-wider uppercase">Confirmed</span>
            </div>
            
            <div className="p-6 md:p-10">
              {/* Service Heading */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 mb-2">Strategic Business Consultation</h1>
                <p className="text-base text-slate-500">Session Reference: #{id || "HAP-1234"}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-12 border-y border-slate-100 py-8">
                <div className="flex items-start space-x-4">
                  <span className="material-symbols-outlined text-indigo-600 mt-1">calendar_today</span>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Date & Time</p>
                    <p className="text-lg font-bold text-slate-900 leading-tight">Tuesday, May 12, 2026<br/><span className="text-base font-normal">at 10:00 AM</span></p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <span className="material-symbols-outlined text-indigo-600 mt-1">schedule</span>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Duration</p>
                    <p className="text-lg font-bold text-slate-900">60 minutes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <span className="material-symbols-outlined text-indigo-600 mt-1">person</span>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Resource / Provider</p>
                    <p className="text-lg font-bold text-slate-900">Alex Carter</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <span className="material-symbols-outlined text-indigo-600 mt-1">videocam</span>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Location</p>
                    <p className="text-lg font-bold text-slate-900">Online (Google Meet)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <span className="material-symbols-outlined text-indigo-600 mt-1">language</span>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Channel</p>
                    <p className="text-lg font-bold text-slate-900">🌐 Web Booking</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <span className="material-symbols-outlined text-indigo-600 mt-1">tag</span>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Booking Reference</p>
                    <p className="text-lg font-bold text-slate-900">{id || "HAP-1234"}</p>
                  </div>
                </div>
              </div>

              {/* Intake Answers */}
              <section className="mb-12">
                <h3 className="text-2xl font-bold font-serif text-slate-900 mb-4">Consultation Details</h3>
                <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-200 pb-3 gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Main Goal</span>
                    <span className="md:col-span-2 text-base text-slate-900">Scale operations and expand into international markets.</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-200 pb-3 gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Team Size</span>
                    <span className="md:col-span-2 text-base text-slate-900">15-20 full-time employees.</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Industry</span>
                    <span className="md:col-span-2 text-base text-slate-900">Sustainable Fashion Retail.</span>
                  </div>
                </div>
              </section>

              {/* Payment Info */}
              <section>
                <h3 className="text-2xl font-bold font-serif text-slate-900 mb-4">Payment Information</h3>
                <div className="flex flex-wrap items-center gap-6 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</p>
                    <p className="text-lg font-bold text-slate-900">₹2,500.00</p>
                  </div>
                  <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</p>
                    <div className="flex items-center space-x-1 text-emerald-700 font-bold mt-1">
                      <span className="material-symbols-outlined text-sm">verified</span>
                      <span>Paid</span>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
                  <div className="flex-grow">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Transaction ID</p>
                    <p className="text-sm font-mono text-slate-900 mt-1">TXN_9876543210</p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 shadow-sm border border-slate-200/80">
              <h4 className="text-lg font-bold font-serif text-slate-900 mb-6">Manage Appointment</h4>
              <div className="space-y-3">
                <Link href={`/reschedule/${id}`} className="w-full bg-indigo-600 text-white py-4 rounded-lg text-xs font-bold tracking-widest uppercase hover:bg-indigo-700 transition-all flex justify-center items-center space-x-2">
                  <span className="material-symbols-outlined">event_repeat</span>
                  <span>Reschedule</span>
                </Link>
                <button className="w-full bg-white border border-slate-200 text-slate-900 py-4 rounded-lg text-xs font-bold tracking-widest uppercase hover:bg-slate-50 transition-all flex justify-center items-center space-x-2">
                  <span className="material-symbols-outlined">calendar_add_on</span>
                  <span>Add to Calendar</span>
                  <span className="material-symbols-outlined">arrow_drop_down</span>
                </button>
                
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button className="w-full bg-transparent text-rose-600 py-3 rounded-lg text-xs font-bold tracking-widest uppercase hover:bg-rose-50 transition-all flex justify-center items-center space-x-2 border border-transparent hover:border-rose-100">
                    <span className="material-symbols-outlined">cancel</span>
                    <span>Cancel Booking</span>
                  </button>
                  <p className="text-center text-[11px] text-slate-500 mt-3 flex items-center justify-center space-x-1">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    <span>Free cancellation until 24h before</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Expert Preview Card */}
            <div className="relative rounded-xl overflow-hidden group border border-slate-200/50">
              <div className="w-full aspect-[1.16] relative">
                <Image 
                  src="https://lh3.googleusercontent.com/aida/ADBb0ugAlcOxgCNwS71v6E0TI1YokQernWs5ElOgie2wxMrSVLq2YDr4wYhmTuYgOtywZHX_DR69RDM__qI6nQPQrOP71kOAfngzvB_Za1vtRNu6vQMsAb-SlnxcdeCvTCx_4r9y_w-XwhMjIBXISA9_Ng-6Dwanh5Jy6ahup0fbjOk1kJLE7aap-41i7F1hFGxIz4Ub7wMPPOV3EZ3wAylGFbN2E81rBPKsuRa4lNepe3btU_4hky_W3fvxWEoqNB-AtWSUyZJsby0" 
                  alt="Alex Carter" 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Your Consultant</p>
                <h5 className="text-white font-serif text-2xl font-bold">Alex Carter</h5>
                <p className="text-white/80 text-sm mt-2 italic">"Empowering leaders to navigate complex scaling challenges through architectural strategy."</p>
                <Link className="mt-4 text-indigo-300 text-sm font-semibold flex items-center space-x-1 hover:text-white transition-colors" href="#">
                  <span>View Full Profile</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-center space-x-3 mb-3 text-indigo-600">
                <span className="material-symbols-outlined">help_outline</span>
                <span className="font-bold text-base">Need help?</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">Questions about your consultation or technical issues with the booking?</p>
              <button className="text-indigo-600 text-xs font-bold uppercase tracking-wider hover:underline">Contact Atelier Support</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
