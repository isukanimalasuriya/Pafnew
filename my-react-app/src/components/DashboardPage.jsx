import React, { useEffect, useState } from "react";
import { api } from "../services/api";

function PageHeader({ title, subtitle }) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-8 shadow-2xl">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500 blur-[80px] opacity-30"></div>
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500 blur-[80px] opacity-30"></div>
      
      <div className="relative z-10">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm font-medium text-indigo-200 sm:text-base">{subtitle}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, trendUp, icon, colorFrom, colorTo }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${colorFrom} ${colorTo} opacity-10 blur-2xl transition-all duration-300 group-hover:opacity-30 group-hover:blur-3xl`}></div>
      
      <div className="relative flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${colorFrom} ${colorTo} text-white shadow-lg`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${trendUp ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
            <svg className={`h-3 w-3 ${trendUp ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {trend}
          </div>
        )}
      </div>
      
      <div className="relative mt-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-4xl font-black tracking-tight text-slate-900">{value}</span>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ name, meta, status, icon }) {
  const statusMap = {
    confirmed: { dot: "bg-emerald-400", bg: "bg-emerald-50", label: "Active", text: "text-emerald-700" },
    warning: { dot: "bg-amber-400", bg: "bg-amber-50", label: "Pending", text: "text-amber-700" },
    info: { dot: "bg-blue-400", bg: "bg-blue-50", label: "Scheduled", text: "text-blue-700" },
  };

  const s = statusMap[status] || statusMap.info;

  return (
    <div className="group flex items-center justify-between border-b border-slate-100 p-5 transition-all duration-200 hover:bg-slate-50 last:border-0">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 group-hover:scale-110 transition-transform duration-300">
          <span className="text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 transition-colors group-hover:text-indigo-600">{name}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{meta}</p>
        </div>
      </div>
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${s.bg} ${s.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${s.dot} shadow-sm animate-pulse`} />
        {s.label}
      </span>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h2>
      </div>
      <div className="flex flex-col">
        {children}
      </div>
    </div>
  );
}

const DashboardPage = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    activeRooms: 0,
    todaysBookings: 0,
    students: 0,
    openIncidents: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data from backend
        const [bookingsRes, ticketsRes, usersRes] = await Promise.all([
          api.get("/api/bookings/admin/all").catch(() => ({ data: [] })),
          api.get("/api/tickets").catch(() => ({ data: [] })),
          api.get("/api/admin/users").catch(() => ({ data: [] }))
        ]);

        const bookings = bookingsRes.data || [];
        const tickets = ticketsRes.data || [];
        const users = usersRes.data || [];

        const today = new Date().toISOString().split('T')[0];
        
        // Calculate metrics
        const todaysBookings = bookings.filter(b => b.date && b.date.startsWith(today)).length;
        const activeRooms = new Set(bookings.filter(b => b.status === "APPROVED").map(b => b.resourceId)).size;
        const openIncidents = tickets.filter(t => t.status === "OPEN").length;
        const students = users.filter(u => u.roles && u.roles.includes("USER")).length;

        setStats({
          activeRooms,
          todaysBookings,
          students: students || users.length,
          openIncidents
        });

        // Build recent activity feed
        const activity = [];
        bookings.slice(0, 3).forEach(b => {
          activity.push({
            id: `b-${b.id}`,
            timestamp: b.createdAt || new Date().toISOString(),
            name: b.resourceName || `Resource ${b.resourceId || 'Unknown'}`,
            meta: `Booking · ${b.date || ''} ${b.startTime || ''}-${b.endTime || ''}`,
            status: b.status === "APPROVED" ? "confirmed" : b.status === "PENDING" ? "warning" : "info",
            icon: "📅"
          });
        });
        
        tickets.slice(0, 3).forEach(t => {
          activity.push({
            id: `t-${t.ticketId}`,
            timestamp: t.createdAt || new Date().toISOString(),
            name: t.resourceName || `Ticket #${t.ticketId?.slice(-6)}`,
            meta: `${t.category} issue · ${t.status}`,
            status: t.status === "OPEN" ? "warning" : t.status === "RESOLVED" ? "confirmed" : "info",
            icon: "🔧"
          });
        });

        activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentActivity(activity.slice(0, 4));

      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="pb-10">
      <PageHeader
        title="Operations Hub"
        subtitle="Welcome back, Admin — here's your real-time campus overview."
      />

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard 
          label="Active Rooms" 
          value={loading ? "..." : stats.activeRooms} 
          trend="Live" 
          trendUp 
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
          colorFrom="from-blue-500" 
          colorTo="to-cyan-400" 
        />
        <StatCard 
          label="Today's Bookings" 
          value={loading ? "..." : stats.todaysBookings} 
          trend="Today" 
          trendUp 
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          colorFrom="from-purple-500" 
          colorTo="to-indigo-500" 
        />
        <StatCard
          label="Registered Users"
          value={loading ? "..." : stats.students}
          trend="Total"
          trendUp={false}
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          colorFrom="from-emerald-500" 
          colorTo="to-teal-400" 
        />
        <StatCard 
          label="Open Incidents" 
          value={loading ? "..." : stats.openIncidents} 
          trend="Action Req" 
          trendUp={false} 
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          colorFrom="from-rose-500" 
          colorTo="to-orange-400" 
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Live Campus Activity">
            {loading ? (
              <div className="p-8 text-center text-slate-400 animate-pulse">Syncing real-time data...</div>
            ) : recentActivity.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No recent activity detected.</div>
            ) : (
              recentActivity.map((item) => (
                <ActivityRow key={item.id} {...item} />
              ))
            )}
          </Card>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-8 text-white shadow-xl relative">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white opacity-10 blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold tracking-tight">Quick Actions</h3>
              <p className="mt-2 text-sm font-medium text-indigo-200">Manage resources quickly.</p>
              <div className="mt-8 flex flex-col gap-3">
                <button 
                  onClick={() => onNavigate && onNavigate("/bookings")}
                  className="group flex w-full items-center justify-between rounded-xl bg-white/10 px-5 py-4 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:shadow-lg"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">📅</span> New Booking
                  </span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
                <button 
                  onClick={() => onNavigate && onNavigate("/tickets/new")}
                  className="group flex w-full items-center justify-between rounded-xl bg-white/10 px-5 py-4 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:shadow-lg"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">🚨</span> Report Incident
                  </span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
                <button 
                  onClick={() => onNavigate && onNavigate("/resources")}
                  className="group flex w-full items-center justify-between rounded-xl bg-white/10 px-5 py-4 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:shadow-lg"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">🏢</span> Add Resource
                  </span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
