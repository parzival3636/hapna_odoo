"use client";

import React from 'react';
import { TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface ChartData {
  daily_bookings: any[];
  by_service: any[];
  by_status: any[];
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#10b981', // emerald-500
  pending: '#f59e0b',   // amber-500
  cancelled: '#f43f5e', // rose-500
  completed: '#6366f1', // indigo-500
  no_show: '#64748b',   // slate-500
};

export default function BookingCharts({ data }: { data: ChartData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Booking Trends Line Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Booking & Revenue Trends</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.daily_bookings}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(str) => {
                  const date = new Date(str);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#6366f1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCount)" 
                name="Bookings"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service Popularity Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Service Performance</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.by_service} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" axisLine={false} tickLine={false} hide />
              <YAxis 
                dataKey="title" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                width={100}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                }}
              />
              <Bar 
                dataKey="count" 
                fill="#8b5cf6" 
                radius={[0, 4, 4, 0]} 
                barSize={20}
                name="Total Bookings"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution Pie Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Status Breakdown</h3>
        <div className="h-[300px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.by_status}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
                nameKey="status"
              >
                {data.by_status.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATUS_COLORS[entry.status] || '#cbd5e1'} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Distribution (Placeholder or Secondary Metric) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Efficiency Score</h3>
          <p className="text-slate-500 text-sm">Overall booking completion and customer retention metric.</p>
        </div>
        <div className="flex-1 flex items-center justify-center py-8">
           <div className="text-center">
             <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-indigo-100 border-t-indigo-600">
               <span className="text-3xl font-bold text-slate-900">92%</span>
             </div>
             <p className="mt-4 text-emerald-600 font-medium flex items-center justify-center">
               <TrendingUp size={16} className="mr-1" />
               +4.2% from last month
             </p>
           </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Confirmed</p>
             <p className="text-xl font-black text-slate-900">
               {data.by_status.find(s => s.status === 'confirmed')?.count || 0}
             </p>
           </div>
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">No-Show</p>
             <p className="text-xl font-black text-slate-900">
               {data.by_status.find(s => s.status === 'no_show')?.count || 0}
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
