"use client";

import { useState } from "react";
import { Zap, Activity, Clock, ShieldCheck } from "lucide-react";

const allSlots = [
  { time: "09:00 AM", available: true },
  { time: "10:30 AM", available: true },
  { time: "11:00 AM", available: false },
  { time: "01:00 PM", available: true },
  { time: "02:00 PM", available: true },
  { time: "03:30 PM", available: true },
  { time: "04:00 PM", available: true },
  { time: "05:00 PM", available: true },
  { time: "06:00 PM", available: true },
];

export function RealtimeDemo() {
  const [selectedSlot, setSelectedSlot] = useState("02:00 PM");

  return (
    <section className="py-32 bg-white overflow-hidden font-body">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          {/* Text Engagement */}
          <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
            <p className="text-[10px] font-black text-[#5B4EE8] uppercase tracking-[0.2em] mb-3">Live Synchronization</p>
            <h2 className="text-4xl lg:text-5xl font-heading font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
              Witness real-time <br />
              <span className="text-[#5B4EE8]">Lattice-Node Updates.</span>
            </h2>
            <p className="text-lg text-slate-500 mb-10 leading-relaxed font-medium">
              Stress-test the resilience of our global state management. When a transaction occurs on any channel, 
              availability is purged across all nodes in under 40ms.
            </p>
            
            <div className="space-y-6">
              {[
                { title: "Zero Latency", desc: "Global edge propagation ensures absolute state integrity.", icon: Zap },
                { title: "Conflict Resolution", desc: "Atomic operations prevent double-booking at the database level.", icon: ShieldCheck }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-5 p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 group hover:border-[#5B4EE8]/20 transition-all shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#5B4EE8] shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-heading font-black text-slate-900 uppercase tracking-widest text-[10px] mb-1">{item.title}</p>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High-Fidelity Demo Grid */}
          <div className="bg-slate-50 p-10 lg:p-14 rounded-[3.5rem] border border-slate-100 shadow-card relative group">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#5B4EE8]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#5B4EE8]/10 flex items-center justify-center text-[#5B4EE8] shadow-sm">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <p className="font-heading font-black text-slate-900 tracking-tight">System Node #42</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">60m Runtime Context</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#5B4EE8]/5 rounded-[2rem] border border-[#5B4EE8]/10">
                <Clock className="w-3.5 h-3.5 text-[#5B4EE8]" />
                <span className="text-[10px] font-black text-[#5B4EE8] uppercase tracking-widest">Next Available: 2:00 PM</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {allSlots.map((slot) => {
                const isSelected = slot.time === selectedSlot;
                const isBooked = !slot.available;

                return (
                  <button
                    key={slot.time}
                    onClick={() =>
                      slot.available && setSelectedSlot(slot.time)
                    }
                    disabled={isBooked}
                    className={`py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${
                      isBooked
                        ? "bg-red-50 text-red-500 border border-red-200 cursor-not-allowed opacity-80"
                        : isSelected
                        ? "bg-[#5B4EE8]/10 text-[#5B4EE8] border border-[#5B4EE8] shadow-sm scale-[1.02]"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-[#5B4EE8] hover:text-[#5B4EE8] hover:shadow-lg hover:shadow-[#5B4EE8]/10"
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-10 flex items-center justify-center gap-3 opacity-30">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500">Live Lattice Sync Active</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
