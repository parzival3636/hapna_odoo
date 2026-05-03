"use client";

interface CapacitySelectorProps {
  capacity: number;
  maxCapacity: number;
  basePrice?: number;
  additionalPrice?: number;
  onChange: (capacity: number) => void;
}

export function CapacitySelector({ 
  capacity, 
  maxCapacity, 
  basePrice = 1000, 
  additionalPrice = 500,
  onChange 
}: CapacitySelectorProps) {
  
  const increment = () => {
    if (capacity < maxCapacity) {
      onChange(capacity + 1);
    }
  };
  
  const decrement = () => {
    if (capacity > 1) {
      onChange(capacity - 1);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-4">How many spots?</h2>
        <p className="text-lg text-slate-500 mb-12 italic">This service allows group bookings</p>
        
        <div className="bg-white/70 backdrop-blur-md border border-indigo-100/50 p-12 rounded-[3rem] shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            {/* Stepper */}
            <div className="flex items-center gap-10 mb-10">
              <button 
                onClick={decrement}
                disabled={capacity <= 1}
                className="w-20 h-20 rounded-full bg-slate-50 border border-indigo-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:hover:bg-slate-50 disabled:hover:text-slate-400 disabled:cursor-not-allowed text-indigo-600"
              >
                <span className="material-symbols-outlined text-2xl">remove</span>
              </button>
              
              <div className="flex flex-col items-center min-w-[80px]">
                <span className="text-7xl md:text-[96px] font-bold leading-none text-slate-900">{capacity}</span>
              </div>
              
              <button 
                onClick={increment}
                disabled={capacity >= maxCapacity}
                className="w-20 h-20 rounded-full bg-slate-50 border border-indigo-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:hover:bg-slate-50 disabled:hover:text-slate-400 disabled:cursor-not-allowed text-indigo-600"
              >
                <span className="material-symbols-outlined text-2xl">add</span>
              </button>
            </div>
            
            <div className="mb-10 w-full">
              <p className="text-sm text-slate-600 font-medium mb-4 italic">{capacity} of {maxCapacity} spots remaining</p>
              
              {/* Visual indicators of capacity */}
              <div className="flex flex-wrap gap-3 justify-center">
                {Array.from({ length: maxCapacity }).map((_, i) => (
                  <span 
                    key={i} 
                    className={`material-symbols-outlined text-3xl ${i < capacity ? "text-indigo-600 font-variation-fill-1" : "text-indigo-100"}`}
                    style={i < capacity ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    person
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 rounded-full border border-emerald-100">
              <span className="material-symbols-outlined text-emerald-600 text-sm">info</span>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest text-center">
                Each additional person will be charged ₹{additionalPrice}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Intelligence Indicator */}
      <div className="mt-8">
        <div className="p-[1px] bg-indigo-200 rounded-full shadow-sm">
          <div className="bg-white rounded-full px-5 py-2 flex items-center gap-3 border border-indigo-50">
            <span className="material-symbols-outlined text-indigo-600 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">AI Optimized Availability</span>
          </div>
        </div>
      </div>
    </div>
  );
}
