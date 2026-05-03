"use client";

import React from 'react';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  XCircle, 
  AlertTriangle,
  IndianRupee
} from 'lucide-react';

interface StatsProps {
  stats: {
    current_month_meetings: number;
    last_month_meetings: number;
    total_revenue: number;
    pct_change_bookings: number;
    pct_change_revenue: number;
    cancellation_rate: number;
    no_show_rate: number;
  };
}

export default function DashboardStats({ stats }: StatsProps) {
  const cards = [
    {
      title: 'Total Bookings',
      value: stats.current_month_meetings,
      change: stats.pct_change_bookings,
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.total_revenue.toLocaleString()}`,
      change: stats.pct_change_revenue,
      icon: IndianRupee,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Cancellation Rate',
      value: `${stats.cancellation_rate}%`,
      icon: XCircle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      inverse: true,
    },
    {
      title: 'No-Show Rate',
      value: `${stats.no_show_rate}%`,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      inverse: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${card.bgColor} ${card.color}`}>
              <card.icon size={24} />
            </div>
            {card.change !== undefined && (
              <div className={`flex items-center text-sm font-medium ${
                card.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                <TrendingUp size={16} className={`mr-1 ${card.change < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(card.change)}%
              </div>
            )}
          </div>
          <div>
            <p className="text-slate-600 text-sm font-bold uppercase tracking-widest text-[10px]">{card.title}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
