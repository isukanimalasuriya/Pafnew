import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { toast } from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const BookingAnalyticsPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/api/bookings/admin/analytics');
        setAnalytics(response.data);
      } catch (error) {
        toast.error("Failed to fetch analytics");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center font-poppins text-lg font-medium">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="flex h-64 items-center justify-center font-poppins text-lg font-medium">No analytics data available.</div>;
  }

  const { totalBookings, popularResources, statusDistribution, peakHours } = analytics;

  // Format data for Recharts
  const formatData = (obj) => {
    return Object.keys(obj).map(key => ({
      name: key,
      value: obj[key]
    })).sort((a, b) => b.value - a.value); // sort descending
  };

  const formatPeakHours = (obj) => {
    return Object.keys(obj).map(key => ({
      name: key,
      value: obj[key]
    })).sort((a, b) => a.name.localeCompare(b.name)); // sort by time ascending
  };

  const resourceData = formatData(popularResources);
  const statusData = formatData(statusDistribution);
  const peakHoursData = formatPeakHours(peakHours);

  return (
    <div className="font-poppins flex flex-col gap-8 pb-10">
      <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600 tracking-tight">Booking Analytics</h1>
          <p className="text-slate-500 mt-2 font-medium">Real-time statistics and insights on campus resources</p>
        </div>
        <div className="hidden md:flex p-4 rounded-2xl bg-indigo-50 border border-indigo-100 items-center justify-center">
          <svg className="w-10 h-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-white bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 shadow-xl shadow-indigo-200 transition-transform hover:-translate-y-1">
          <p className="text-sm font-bold text-indigo-100 uppercase tracking-widest mb-2">Total Bookings</p>
          <p className="text-5xl font-black text-white">{totalBookings}</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 transition-transform hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 bg-emerald-50 rounded-full w-24 h-24"></div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Most Popular</p>
          <p className="text-3xl font-extrabold text-emerald-600 truncate relative z-10" title={resourceData[0]?.name || 'N/A'}>
            {resourceData[0]?.name || 'N/A'}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 transition-transform hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 bg-amber-50 rounded-full w-24 h-24"></div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Peak Hour</p>
          <p className="text-3xl font-extrabold text-amber-500 relative z-10">
            {formatData(peakHours)[0]?.name || 'N/A'}
          </p>
        </div>
        <div className="rounded-3xl border border-white bg-gradient-to-br from-rose-400 to-rose-600 p-8 shadow-xl shadow-rose-200 transition-transform hover:-translate-y-1">
          <p className="text-sm font-bold text-rose-100 uppercase tracking-widest mb-2">Pending Requests</p>
          <p className="text-5xl font-black text-white">{statusDistribution['PENDING'] || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Popular Resources Chart */}
        <div className="rounded-3xl border border-slate-100 bg-white/80 backdrop-blur-md p-8 shadow-xl shadow-slate-200/50">
          <h2 className="mb-8 text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
            Popular Resources
          </h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} wrapperStyle={{ outline: "none", borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }} contentStyle={{ border: 'none', fontWeight: 600 }} />
                <Bar dataKey="value" fill="#8884d8" radius={[0, 8, 8, 0]} barSize={20}>
                  {resourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="rounded-3xl border border-slate-100 bg-white/80 backdrop-blur-md p-8 shadow-xl shadow-slate-200/50">
          <h2 className="mb-8 text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            Approval Distribution
          </h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip wrapperStyle={{ outline: "none", borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} contentStyle={{ border: 'none', fontWeight: 600 }} />
                <Legend iconType="circle" wrapperStyle={{ fontWeight: 600, fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours Chart */}
        <div className="col-span-1 lg:col-span-2 rounded-3xl border border-slate-100 bg-white/80 backdrop-blur-md p-8 shadow-xl shadow-slate-200/50">
          <h2 className="mb-8 text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
            Booking Demand Over Time
          </h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip cursor={{ fill: '#f8fafc' }} wrapperStyle={{ outline: "none", borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} contentStyle={{ border: 'none', fontWeight: 600 }} />
                <Bar dataKey="value" fill="url(#colorValue)" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingAnalyticsPage;
