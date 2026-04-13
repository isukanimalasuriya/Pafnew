import React from "react";

function PageHeader({ title, subtitle }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h1 className="text-xl font-medium text-slate-900">{title}</h1>
        <p className="text-[13px] text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, trendUp }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <p className="text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-[22px] font-medium text-slate-900">{value}</span>
        {trend && (
          <span
            className={`text-[11px] font-medium ${
              trendUp ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function ActivityRow({ name, meta, status }) {
  const statusMap = {
    confirmed: {
      dot: "bg-emerald-500",
      label: "Active",
      text: "text-emerald-700",
    },
    warning: { dot: "bg-amber-500", label: "Pending", text: "text-amber-700" },
    info: { dot: "bg-blue-500", label: "Scheduled", text: "text-blue-700" },
  };

  const s = statusMap[status] || statusMap.info;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-[13px] font-medium text-slate-800">{name}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{meta}</p>
      </div>
      <span
        className={`flex items-center gap-1.5 text-[11px] font-medium ${s.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {s.label}
      </span>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-[13px] font-medium text-slate-800">{title}</p>
      </div>
      {children}
    </div>
  );
}

const DashboardPage = () => {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back, Admin — here's your campus overview."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Active Rooms" value="42" trend="+2" trendUp />
        <StatCard label="Today's Bookings" value="128" trend="+14%" trendUp />
        <StatCard
          label="Students On-site"
          value="1,847"
          trend="-3%"
          trendUp={false}
        />
        <StatCard label="Open Incidents" value="5" trend="-2" trendUp />
      </div>

      <Card title="Recent Activity">
        {[
          {
            name: "Hall A — Lecture 101",
            meta: "Booked by Dr. Perera · 09:00–11:00",
            status: "confirmed",
          },
          {
            name: "Lab 3 — Chemistry",
            meta: "Booked by Prof. Silva · 11:00–13:00",
            status: "confirmed",
          },
          {
            name: "Conference Room B",
            meta: "Maintenance request · Pending",
            status: "warning",
          },
        ].map((item, i) => (
          <ActivityRow key={i} {...item} />
        ))}
      </Card>
    </div>
  );
};

export default DashboardPage;
