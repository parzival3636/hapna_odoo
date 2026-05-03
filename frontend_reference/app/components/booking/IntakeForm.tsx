"use client";

import Image from "next/image";
import { useState } from "react";

interface IntakeFormProps {
  onSubmit: (data: any) => void;
  selectedDate: Date | null;
  selectedTime: string | null;
  serviceName: string;
  providerName: string;
  price: string;
}

export function IntakeForm({ onSubmit, selectedDate, selectedTime, serviceName, providerName, price }: IntakeFormProps) {
  const [formData, setFormData] = useState({
    name: "Julian Alexander",
    email: "j.alexander@email.com",
    reason: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Area */}
        <section className="lg:col-span-7 space-y-8">
          <header>
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-2">A few details</h1>
            <p className="text-lg text-slate-600">Please provide the necessary information for your upcoming visit.</p>
          </header>
          
          <form className="space-y-6 bg-white border border-slate-200 p-8 rounded-xl shadow-sm" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="name">Full Name</label>
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 text-[10px] font-bold text-indigo-600 uppercase border border-indigo-100">From your profile</span>
              </div>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all" 
                id="name" 
                name="name" 
                placeholder="Enter your full name" 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            {/* Email Address */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="email">Email Address</label>
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 text-[10px] font-bold text-indigo-600 uppercase border border-indigo-100">From your profile</span>
              </div>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all" 
                id="email" 
                name="email" 
                placeholder="Enter your email address" 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            {/* Reason for Visit */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="reason">Reason for visit</label>
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-[10px] font-bold text-emerald-600 uppercase border border-emerald-100">From your last visit</span>
              </div>
              <textarea 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all" 
                id="reason" 
                name="reason" 
                placeholder="Briefly describe the purpose of your consultation..." 
                rows={4}
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              ></textarea>
            </div>
            
            {/* Submit Button */}
            <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end">
              <button 
                className="px-10 py-3 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-md hover:bg-indigo-700 transition-all active:scale-95" 
                type="submit"
              >
                Continue to Payment
              </button>
            </div>
          </form>
        </section>
        
        {/* Sidebar / Summary Card */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold font-serif text-slate-900 mb-6 border-b border-slate-100 pb-4">Booking Summary</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-indigo-50 flex items-center justify-center rounded-lg border border-indigo-100 shrink-0">
                  <span className="material-symbols-outlined text-indigo-600 text-3xl">medical_services</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">{serviceName}</h3>
                  <p className="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-widest">60 MINUTE SESSION</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 py-6 border-y border-slate-100">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                  <Image 
                    src="https://lh3.googleusercontent.com/aida/ADBb0ugAlcOxgCNwS71v6E0TI1YokQernWs5ElOgie2wxMrSVLq2YDr4wYhmTuYgOtywZHX_DR69RDM__qI6nQPQrOP71kOAfngzvB_Za1vtRNu6vQMsAb-SlnxcdeCvTCx_4r9y_w-XwhMjIBXISA9_Ng-6Dwanh5Jy6ahup0fbjOk1kJLE7aap-41i7F1hFGxIz4Ub7wMPPOV3EZ3wAylGFbN2E81rBPKsuRa4lNepe3btU_4hky_W3fvxWEoqNB-AtWSUyZJsby0" 
                    alt="Provider"
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Provider</p>
                  <p className="text-base font-bold text-slate-900">{providerName}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-base">
                  <span className="text-slate-500">Date</span>
                  <span className="font-bold text-slate-900">
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-base">
                  <span className="text-slate-500">Time</span>
                  <span className="font-bold text-slate-900">{selectedTime || "Not selected"}</span>
                </div>
                <div className="flex justify-between items-center text-base pt-4 border-t border-slate-100">
                  <span className="text-slate-900 font-bold uppercase text-[10px] tracking-widest">Total Fee</span>
                  <span className="text-3xl font-serif font-bold text-indigo-600">{price}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Secondary Visual Element */}
          <div className="relative bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col items-center justify-center text-center p-8 overflow-hidden">
            <span className="material-symbols-outlined text-indigo-600 text-4xl mb-3 opacity-80">verified_user</span>
            <p className="text-sm text-slate-700 italic">"Your data is protected by industry-leading encryption and HIPAA compliance standards."</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
