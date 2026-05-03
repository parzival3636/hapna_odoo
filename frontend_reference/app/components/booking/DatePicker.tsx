"use client";

import { useState } from "react";

interface DatePickerProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

export function DatePicker({ selectedDate, onSelect }: DatePickerProps) {
  // Mock calendar logic for UI demonstration
  const handleDateClick = (day: number) => {
    const newDate = new Date(2026, 4, day); // May 2026
    onSelect(newDate);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Heading */}
      <div className="w-full text-center md:text-left mb-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">Select a Date</h2>
        <p className="text-lg text-slate-500">Choose a time that works best for your schedule.</p>
      </div>

      {/* Main Calendar Grid */}
      <div className="w-full max-w-md bg-white border border-slate-100 shadow-sm rounded-3xl p-6 relative self-start md:self-center">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-500 transition-colors">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h3 className="font-semibold text-slate-900 text-xl">May 2026</h3>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-500 transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
            <div key={day} className={`text-center py-2 text-xs font-semibold uppercase tracking-widest ${i >= 5 ? 'text-indigo-600/60' : 'text-slate-400'}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Padding */}
          <div className="aspect-square"></div>
          <div className="aspect-square"></div>
          <div className="aspect-square"></div>
          <div className="aspect-square"></div>

          {/* Unavailable Days */}
          {[1, 2, 3].map(day => (
            <button key={day} className="aspect-square flex flex-col items-center justify-center rounded-full text-slate-300 cursor-not-allowed">
              <span className="text-base">{day}</span>
            </button>
          ))}

          {/* Available Days */}
          {[4, 5, 6, 7, 8].map(day => {
            const isSelected = selectedDate?.getDate() === day;
            const isWarning = day === 7;
            
            return (
              <button 
                key={day} 
                onClick={() => handleDateClick(day)}
                className={`aspect-square flex flex-col items-center justify-center rounded-full transition-all group relative ${
                  isSelected 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                    : "hover:bg-slate-50 text-slate-900 font-medium"
                }`}
              >
                <span className={`text-base ${isSelected ? "font-bold" : ""}`}>{day}</span>
                <span className={`absolute bottom-1.5 w-1 h-1 rounded-full ${
                  isSelected ? "bg-white/50" : isWarning ? "bg-rose-500" : "bg-emerald-500"
                }`}></span>
              </button>
            );
          })}

          {[9, 10].map(day => (
            <button key={day} className="aspect-square flex flex-col items-center justify-center rounded-full text-slate-300 cursor-not-allowed">
              <span className="text-base">{day}</span>
            </button>
          ))}
          
          {[11, 12, 13, 14, 15].map(day => {
            const isSelected = selectedDate?.getDate() === day;
            const isWarning = day === 11 || day === 14;
            
            return (
              <button 
                key={day} 
                onClick={() => handleDateClick(day)}
                className={`aspect-square flex flex-col items-center justify-center rounded-full transition-all group relative ${
                  isSelected 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                    : "hover:bg-slate-50 text-slate-900 font-medium"
                }`}
              >
                <span className={`text-base ${isSelected ? "font-bold" : ""}`}>{day}</span>
                <span className={`absolute bottom-1.5 w-1 h-1 rounded-full ${
                  isSelected ? "bg-white/50" : isWarning ? "bg-rose-500" : "bg-emerald-500"
                }`}></span>
              </button>
            );
          })}
          
          {[16, 17].map(day => (
            <button key={day} className="aspect-square flex flex-col items-center justify-center rounded-full text-slate-300 cursor-not-allowed">
              <span className="text-base">{day}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Next Available Section */}
      <div className="w-full max-w-md mt-8 self-start md:self-center">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-indigo-600 text-sm">event_available</span>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Next Available Slots</h4>
        </div>
        <div className="flex flex-wrap gap-3">
          {[6, 8, 12].map(day => (
            <button 
              key={`next-${day}`}
              onClick={() => handleDateClick(day)}
              className="px-6 py-2 rounded-full border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-slate-700 text-sm flex items-center gap-2 group bg-white font-medium"
            >
              May {day}
              <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
