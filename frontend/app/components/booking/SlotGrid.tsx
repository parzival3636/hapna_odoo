"use client";

interface TimeSlot {
  time: string;
  availability: "available" | "limited" | "almost_gone";
}

interface SlotGridProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

export function SlotGrid({ selectedDate, selectedTime, onSelect }: SlotGridProps) {
  // Mock data for time slots
  const morningSlots: TimeSlot[] = [
    { time: "09:00 AM", availability: "available" },
    { time: "09:30 AM", availability: "available" },
    { time: "10:00 AM", availability: "available" },
    { time: "11:30 AM", availability: "limited" },
  ];
  
  const afternoonSlots: TimeSlot[] = [
    { time: "01:00 PM", availability: "available" },
    { time: "02:00 PM", availability: "almost_gone" },
    { time: "03:30 PM", availability: "available" },
    { time: "04:00 PM", availability: "available" },
  ];
  
  const eveningSlots: TimeSlot[] = [
    { time: "06:00 PM", availability: "available" },
    { time: "07:30 PM", availability: "limited" },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "available": return "bg-emerald-500";
      case "limited": return "bg-amber-500";
      case "almost_gone": return "bg-rose-500";
      default: return "bg-slate-300";
    }
  };

  const renderSlots = (slots: TimeSlot[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {slots.map((slot) => {
        const isSelected = selectedTime === slot.time;
        
        return (
          <button 
            key={slot.time}
            onClick={() => onSelect(slot.time)}
            className={`py-4 px-6 border transition-all flex flex-col items-center gap-1 relative ${
              isSelected
                ? "border-indigo-600 bg-indigo-600 text-white font-bold shadow-md scale-105 z-10 rounded-lg"
                : "border-slate-200 text-slate-700 hover:border-indigo-600 rounded-lg"
            }`}
          >
            {slot.time}
            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : getStatusColor(slot.availability)}`}></span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Selection Information */}
        <div className="lg:col-span-4 space-y-8">
          <div className="p-8 bg-white border border-slate-200 shadow-sm space-y-4">
            <h1 className="text-4xl font-bold font-serif text-slate-900 mb-2">Pick a Time</h1>
            <p className="text-xl font-bold text-slate-600">
              {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : "Select a date first"}
            </p>
            <div className="pt-6 border-t border-slate-100 flex items-center gap-4 text-slate-500">
              <span className="material-symbols-outlined text-indigo-500">calendar_today</span>
              <span className="text-base">Duration: 60 minutes</span>
            </div>
          </div>
          
          {/* Decorative Imagery */}
          <div className="relative h-64 overflow-hidden border border-slate-200">
            <img 
              className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-0cfeMqvo1VEdufmH-9DP4TlsxeB8Z4tT9AXuwhj-s5icHfHkTCUN3HR5MCDvMtxwEsO3RMQ4Be_9hZP6hs6i9oVWxZvwU3oAZWjF9V4mRfslDo0ro_hTRV_ggl4Dy0ZUh7Wgd-iMl02O6fHDoeXadaRAcGicPYM5Il-NuY96slj2TxJrd4abARZhOZ3QcV6XeETv8oHn-0Zti8BUlpbF-NEOijDgGqyQyDwuCZZG3pHCKrtiV7ldGylryzQc5P8tc2qcCfG2Ww" 
              alt="Clinic interior" 
            />
          </div>
        </div>
        
        {/* Right Side: Time Slot Grid */}
        <div className="lg:col-span-8 space-y-8">
          {/* Availability Legend */}
          <div className="flex gap-6 justify-end items-center mb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Limited
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Almost Gone
            </div>
          </div>
          
          {/* Morning Slots */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">wb_twilight</span> Morning
            </h3>
            {renderSlots(morningSlots)}
          </section>
          
          {/* Afternoon Slots */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">light_mode</span> Afternoon
            </h3>
            {renderSlots(afternoonSlots)}
          </section>
          
          {/* Evening Slots */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">bedtime</span> Evening
            </h3>
            {renderSlots(eveningSlots)}
          </section>
          
          {/* Real-time Alert Banner */}
          <div className="mt-8 bg-indigo-50 border border-indigo-100 py-3 px-6 flex items-center justify-between text-indigo-900 animate-pulse rounded-lg">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-indigo-600">sync</span>
              <span className="text-base">A slot was just taken. Updating...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
