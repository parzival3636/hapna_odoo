"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import DashboardStats from "@/app/components/organiser/reports/DashboardStats";
import BookingCharts from "@/app/components/organiser/reports/BookingCharts";
import { 
  BarChart3, 
  Calendar, 
  ChevronDown, 
  Download, 
  Filter, 
  RefreshCw,
  AlertCircle
} from "lucide-react";

interface Stats {
  current_month_meetings: number;
  last_month_meetings: number;
  total_revenue: number;
  pct_change_bookings: number;
  pct_change_revenue: number;
  cancellation_rate: number;
  no_show_rate: number;
}

interface ChartData {
  daily_bookings: any[];
  by_service: any[];
  by_status: any[];
}

interface HighRiskBooking {
  id: string;
  customer_name: string;
  service_title: string;
  slot_date: string;
  slot_start: string;
  risk_score: number;
  risk_level: 'high' | 'medium' | 'low';
  payment_status: string;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [highRisk, setHighRisk] = useState<HighRiskBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadReportData();
  }, [range, selectedService]);

  async function loadInitialData() {
    try {
      const servicesData = await fetchApi("/services/");
      setServices(Array.isArray(servicesData) ? servicesData : servicesData.results ?? []);
    } catch (err) {
      console.error("Failed to load services", err);
    }
  }

  async function loadReportData() {
    setLoading(true);
    try {
      const serviceParam = selectedService ? `&service=${selectedService}` : "";
      
      const [summary, charts, risk] = await Promise.all([
        fetchApi(`/reports/summary/?range=${range}${serviceParam}`),
        fetchApi(`/reports/charts/?range=${range}${serviceParam}`),
        fetchApi(`/reports/no-show-risk/?${serviceParam}`)
      ]);

      setStats(summary);
      setChartData(charts);
      setHighRisk(risk.meetings || []);
    } catch (err) {
      console.error("Failed to load report data", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Business Intelligence</h1>
          <p className="text-slate-600 mt-1 font-medium">Analytics and operational performance metrics.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Service Filter */}
          <div className="relative">
            <select 
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="appearance-none pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer shadow-sm"
            >
              <option value="">All Services</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>

          {/* Time Range Filter */}
          <div className="relative">
            <select 
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="appearance-none pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer shadow-sm"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>

          <button 
            onClick={loadReportData}
            className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading && !stats ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-500">
           <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
           <p className="font-bold uppercase tracking-widest text-[10px]">Processing Data Architecture...</p>
        </div>
      ) : (
        <>
          {stats && <DashboardStats stats={stats} />}
          
          {chartData && <BookingCharts data={chartData} />}

          {/* High Risk Bookings Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-8">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <AlertCircle size={20} className="text-amber-500" />
                  Predictive No-Show Risk
                </h3>
                <p className="text-slate-500 text-sm mt-1">Bookings identified by AI as potential no-shows.</p>
              </div>
              <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Service</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Time Slot</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Risk Score</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {highRisk.length > 0 ? highRisk.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{booking.customer_name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {booking.service_title}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{booking.slot_date}</p>
                        <p className="text-xs text-slate-500 font-medium">{booking.slot_start}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          booking.risk_level === 'high' ? 'bg-rose-50 text-rose-600' :
                          booking.risk_level === 'medium' ? 'bg-amber-50 text-amber-600' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          {Math.round(booking.risk_score * 100)}% {booking.risk_level.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-slate-100 text-slate-500`}>
                          {booking.payment_status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                        No high-risk bookings detected for the selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
