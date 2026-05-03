"use client";

import Image from "next/image";

interface Resource {
  id: string;
  name: string;
  role: string;
  availability: string;
  imageUrl?: string;
  isAvailableToday?: boolean;
}

interface ResourceSelectorProps {
  resources: Resource[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ResourceSelector({ resources, selectedId, onSelect }: ResourceSelectorProps) {
  return (
    <div className="w-full">
      {/* Heading Section */}
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">Choose a Resource</h2>
        <p className="text-lg text-slate-500">Select who or what you'd like to book with</p>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {resources.map((resource) => {
          const isActive = selectedId === resource.id;
          
          return (
            <button 
              key={resource.id}
              onClick={() => onSelect(resource.id)}
              className={`group text-left p-8 rounded-[2rem] transition-all duration-300 relative overflow-hidden bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                isActive 
                  ? "border-2 border-indigo-600 ring-4 ring-indigo-600/10" 
                  : "border border-slate-200 hover:border-indigo-200"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 p-6">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col gap-6">
                <div className="relative w-28 h-28">
                  {resource.imageUrl ? (
                    <Image 
                      src={resource.imageUrl}
                      alt={resource.name}
                      fill
                      sizes="112px"
                      className="object-cover rounded-full border-4 border-indigo-50"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full border-4 border-slate-50 overflow-hidden bg-slate-100 flex items-center justify-center text-slate-300">
                      <span className="material-symbols-outlined text-6xl">person</span>
                    </div>
                  )}
                  
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <div className={`w-4 h-4 rounded-full border-2 border-white ${resource.isAvailableToday ? "bg-emerald-500" : "bg-amber-400"}`}></div>
                  </div>
                </div>
                
                <div>
                  <h3 className={`text-2xl font-bold mb-1 transition-colors ${isActive ? "text-indigo-600" : "text-slate-900 group-hover:text-indigo-600"}`}>
                    {resource.name}
                  </h3>
                  <p className="text-slate-500 font-medium mb-4">{resource.role}</p>
                  <div className={`flex items-center gap-2 text-sm font-semibold ${resource.isAvailableToday ? "text-emerald-600" : "text-slate-400"}`}>
                    <span className="material-symbols-outlined text-sm">
                      {resource.isAvailableToday ? "calendar_today" : "schedule"}
                    </span>
                    {resource.availability}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
