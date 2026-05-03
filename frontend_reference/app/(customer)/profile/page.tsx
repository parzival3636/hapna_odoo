"use client";

import Image from "next/image";

export default function CustomerProfile() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 pt-8 pb-16">
        {/* Left Column (60%): My Profile Form */}
        <div className="lg:col-span-6">
          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-2">My Profile</h1>
            <p className="text-base text-slate-500">Manage your personal information and preferences.</p>
          </header>

          <section className="bg-white border border-slate-200 rounded-xl p-8 mb-8 shadow-sm">
            {/* Avatar Upload */}
            <div className="flex justify-center mb-10">
              <div className="relative group cursor-pointer">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-50 relative">
                  <Image 
                    src="https://lh3.googleusercontent.com/aida/ADBb0ujOMUqxd-_Cg8D13rQSTH-mEQgu2OXgfGf1DgBC0KEWs_0Km4tZr8xp1XYJ3bhBkaFgm4gqXEz8ytxdxq62kT6ehO9DUq7siVonz7jhCn1xzouaC0ynYj3qdpeKsUdkPojJ5LKcTm7WbUSaIwWw1xZ9UbrNcD6C-ql3j9EGAjv6nBhLmI6FGWNUCRp8isbKKqd6Gs88Yjpy9k1rdcGDsgID28Lkm3bIqGECuHYUrEVpWlp-hy0OuCPKm6-UPL6tbiNL4dkE5r-m" 
                    alt="Avatar" 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Full Name</label>
                <input className="border border-slate-200 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 px-4 py-3 text-base outline-none" type="text" defaultValue="Eleanor Fitzgerald" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Phone</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-slate-200 rounded-l-lg bg-slate-50 text-slate-500 text-base">+44</span>
                  <input className="w-full border border-slate-200 rounded-r-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 px-4 py-3 text-base outline-none" type="tel" defaultValue="7700 900123" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Date of Birth</label>
                <input className="border border-slate-200 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 px-4 py-3 text-base outline-none" type="date" defaultValue="1992-05-14" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Gender</label>
                <select className="border border-slate-200 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 px-4 py-3 text-base outline-none">
                  <option>Female</option>
                  <option>Male</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">City</label>
                <input className="border border-slate-200 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 px-4 py-3 text-base outline-none" placeholder="Start typing city..." type="text" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Preferred Language</label>
                <select className="border border-slate-200 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 px-4 py-3 text-base outline-none">
                  <option>English (UK)</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Spanish</option>
                </select>
              </div>
            </div>

            {/* Toggle Section */}
            <div className="mt-8 flex items-center justify-between py-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-indigo-600">chat</span>
                <div>
                  <p className="text-base font-bold text-slate-900">WhatsApp Opt-in</p>
                  <p className="text-sm text-slate-500">Receive booking confirmations via WhatsApp.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input defaultChecked className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Integration Section */}
            <div className="mt-4 p-6 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-indigo-600 text-3xl">calendar_month</span>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900">Google Calendar</h3>
                  <p className="text-sm text-indigo-700">Sync your appointments automatically.</p>
                </div>
              </div>
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest hover:bg-indigo-700 transition-all">Connect</button>
            </div>

            {/* Timezone */}
            <div className="mt-6 flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Timezone</label>
              <select className="border border-slate-200 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 px-4 py-3 text-base outline-none">
                <option>(GMT+00:00) London</option>
                <option>(GMT-05:00) New York</option>
                <option>(GMT+01:00) Paris</option>
              </select>
            </div>

            {/* Progress Bar */}
            <div className="mt-12">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Profile Completion</span>
                <span className="text-xs font-semibold text-indigo-600">85%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <button className="bg-slate-900 text-white px-8 py-3 rounded-lg text-sm font-semibold uppercase tracking-widest hover:bg-slate-800 transition-all">Save Changes</button>
            </div>
          </section>
        </div>

        {/* Right Column (40%): Booking History & Waitlists */}
        <div className="lg:col-span-4 space-y-8">
          {/* Booking History */}
          <section className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold font-serif text-slate-900 mb-8">Booking History</h2>
            
            {/* Month Group */}
            <div className="mb-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">October 2026</p>
              <div className="space-y-6 relative border-l border-slate-200 ml-2">
                {/* Timeline Entry */}
                <div className="relative pl-6 pb-2">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm"></div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-base font-semibold text-slate-900 leading-tight">Dermatology Consult</h4>
                    <span className="material-symbols-outlined text-slate-400 text-sm">globe</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">Oct 12, 10:30 AM</p>
                  <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded">Confirmed</span>
                </div>
                
                <div className="relative pl-6 pb-2">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-400 border-4 border-white shadow-sm"></div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-base font-semibold text-slate-900 leading-tight">Private Pilates Session</h4>
                    <span className="material-symbols-outlined text-slate-400 text-sm">chat</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">Oct 05, 04:00 PM</p>
                  <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded">Completed</span>
                </div>
              </div>
            </div>

            {/* Month Group */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">September 2026</p>
              <div className="space-y-6 relative border-l border-slate-200 ml-2">
                <div className="relative pl-6 pb-2">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow-sm"></div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-base font-semibold text-slate-900 leading-tight">Business Strategy Audit</h4>
                    <span className="material-symbols-outlined text-slate-400 text-sm">call</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">Sep 28, 02:00 PM</p>
                  <span className="inline-block px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded">Pending</span>
                </div>
                
                <div className="relative pl-6 pb-2">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-rose-500 border-4 border-white shadow-sm"></div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-base font-semibold text-slate-900 leading-tight">Hair Sculpting Appointment</h4>
                    <span className="material-symbols-outlined text-slate-400 text-sm">globe</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">Sep 15, 11:00 AM</p>
                  <span className="inline-block px-2 py-1 bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-widest rounded">Cancelled</span>
                </div>
              </div>
            </div>
          </section>

          {/* Active Waitlists */}
          <section>
            <h2 className="text-2xl font-bold font-serif text-slate-900 mb-6">Active Waitlists</h2>
            <div className="space-y-4">
              {/* Waitlist Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-indigo-600 text-white px-3 py-1 text-[10px] font-bold rounded-full">#2 IN LINE</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1 pr-20">Gourmet Tasting Event</h3>
                <p className="text-sm text-slate-500 mb-6">Nov 22, 2026 • 08:00 PM</p>
                <button className="text-rose-600 text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:text-rose-700 transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span> Leave Waitlist
                </button>
              </div>

              {/* Secondary Waitlist Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 text-[10px] font-bold rounded-full">#12 IN LINE</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1 pr-24">Yoga Flow Intensive</h3>
                <p className="text-sm text-slate-500 mb-6">Dec 02, 2026 • 07:30 AM</p>
                <button className="text-rose-600 text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:text-rose-700 transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span> Leave Waitlist
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
