import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTickets, updateTicketStatus } from "../services/ticketService";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";

/* ── helpers ────────────────────────────────────────────────────── */
const STATUS_META = {
  OPEN:        { label: "Open",        bg: "bg-amber-100",   text: "text-amber-800",   ring: "ring-amber-300",   dot: "bg-amber-500",   bar: "bg-amber-400"   },
  IN_PROGRESS: { label: "In Progress", bg: "bg-blue-100",    text: "text-blue-800",    ring: "ring-blue-300",    dot: "bg-blue-500",    bar: "bg-blue-500"    },
  RESOLVED:    { label: "Resolved",    bg: "bg-emerald-100", text: "text-emerald-800", ring: "ring-emerald-300", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  CLOSED:      { label: "Closed",      bg: "bg-slate-100",   text: "text-slate-700",   ring: "ring-slate-300",   dot: "bg-slate-400",   bar: "bg-slate-400"   },
  REJECTED:    { label: "Rejected",    bg: "bg-red-100",     text: "text-red-800",     ring: "ring-red-300",     dot: "bg-red-500",     bar: "bg-red-500"     },
};

const PRIORITY_COLORS = {
  URGENT: "bg-red-500 text-white",
  HIGH:   "bg-orange-400 text-white",
  MEDIUM: "bg-blue-500 text-white",
  LOW:    "bg-slate-400 text-white",
};

const CATEGORY_ICONS = {
  ELECTRICAL:   "⚡",
  PLUMBING:     "🔧",
  IT_EQUIPMENT: "💻",
  FURNITURE:    "🪑",
  OTHER:        "📋",
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.OPEN;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${m.bg} ${m.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function StatCard({ label, value, icon, sub, accent }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 ring-1 ${accent} bg-white`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <span className="text-3xl opacity-70">{icon}</span>
      </div>
    </div>
  );
}

function MiniBarChart({ data, total }) {
  if (!total) return <p className="text-xs text-slate-400">No data</p>;
  return (
    <div className="flex flex-col gap-2">
      {data.map(({ label, value, bar }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-xs text-slate-500">{label}</span>
          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${bar} transition-all duration-700`}
              style={{ width: `${Math.round((value / total) * 100)}%` }}
            />
          </div>
          <span className="w-6 text-right text-xs font-bold text-slate-700">{value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── component ──────────────────────────────────────────────────── */
export default function ManagerDashboard() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [tickets,  setTickets]  = useState([]);
  const [staff,    setStaff]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("overview"); // overview | team | tickets
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [closing, setClosing]   = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [tRes, uRes] = await Promise.all([
        fetchTickets(),
        api.get("/api/tickets/technicians"),
      ]);
      setTickets(tRes);
      setStaff(uRes.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  /* ── derived stats ── */
  const stats = useMemo(() => ({
    total:      tickets.length,
    open:       tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved:   tickets.filter((t) => t.status === "RESOLVED").length,
    closed:     tickets.filter((t) => t.status === "CLOSED").length,
    rejected:   tickets.filter((t) => t.status === "REJECTED").length,
    urgent:     tickets.filter((t) => t.priority === "URGENT").length,
    unassigned: tickets.filter((t) => !t.assignedTo && t.status === "OPEN").length,
  }), [tickets]);

  /* staff workload */
  const staffWorkload = useMemo(() => {
    return staff.map((member) => {
      const assigned = tickets.filter((t) => t.assignedTo === member.email);
      return {
        ...member,
        assigned: assigned.length,
        open:       assigned.filter((t) => t.status === "OPEN").length,
        inProgress: assigned.filter((t) => t.status === "IN_PROGRESS").length,
        resolved:   assigned.filter((t) => t.status === "RESOLVED").length,
      };
    }).sort((a, b) => b.assigned - a.assigned);
  }, [staff, tickets]);

  /* category breakdown */
  const catBreakdown = useMemo(() => {
    const cats = ["ELECTRICAL","PLUMBING","IT_EQUIPMENT","FURNITURE","OTHER"];
    return cats.map((c) => ({
      label: c.replace("_", " "),
      value: tickets.filter((t) => t.category === c).length,
      bar: "bg-indigo-400",
    }));
  }, [tickets]);

  /* filtered ticket list */
  const displayedTickets = useMemo(() => {
    const base = filterStatus === "ALL" ? tickets : tickets.filter((t) => t.status === filterStatus);
    return [...base].sort((a, b) => {
      const order = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
    });
  }, [tickets, filterStatus]);

  const closeTicket = async (ticketId) => {
    setClosing(ticketId);
    try {
      await updateTicketStatus(ticketId, "CLOSED");
      toast.success("Ticket closed");
      await load();
    } catch {
      toast.error("Failed to close ticket");
    } finally {
      setClosing(null);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  /* ── UI ── */
  const TABS = [
    { id: "overview", label: "📊 Overview"   },
    { id: "team",     label: "👥 Team"        },
    { id: "tickets",  label: "🎫 All Tickets" },
  ];

  return (
    <div className="flex flex-col gap-7 pb-10">

      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between
                      rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-600 p-6 text-white shadow-xl">
        <div>
          <p className="text-sm font-medium text-violet-300">{greeting()}, Manager</p>
          <h1 className="text-2xl font-bold">{user?.name || "Manager"}</h1>
          <p className="mt-0.5 text-sm text-violet-300">
            Operations Dashboard · {new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}
          </p>
        </div>
        <div className="mt-3 sm:mt-0 flex flex-col items-end gap-2">
          {stats.urgent > 0 && (
            <span className="animate-pulse rounded-full bg-red-500 px-3 py-1 text-xs font-bold">
              🚨 {stats.urgent} URGENT
            </span>
          )}
          {stats.unassigned > 0 && (
            <span className="rounded-full bg-amber-500/80 px-3 py-1 text-xs font-bold">
              ⚠️ {stats.unassigned} Unassigned
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition
              ${tab === t.id ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400 animate-pulse text-lg">Loading dashboard…</div>
      ) : (
        <>
          {/* ════ OVERVIEW ════ */}
          {tab === "overview" && (
            <div className="flex flex-col gap-6">
              {/* stats grid */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Total Tickets"  value={stats.total}      icon="🎫" accent="ring-slate-200" />
                <StatCard label="Open"           value={stats.open}       icon="🔴" accent="ring-amber-200"   sub="awaiting action" />
                <StatCard label="In Progress"    value={stats.inProgress} icon="🔵" accent="ring-blue-200"    sub="being worked on" />
                <StatCard label="Resolved"       value={stats.resolved}   icon="✅" accent="ring-emerald-200" sub="pending closure" />
              </div>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Closed"     value={stats.closed}     icon="🔒" accent="ring-slate-200" />
                <StatCard label="Rejected"   value={stats.rejected}   icon="❌" accent="ring-red-200" />
                <StatCard label="Urgent"     value={stats.urgent}     icon="🚨" accent="ring-red-300"    sub="need immediate fix" />
                <StatCard label="Unassigned" value={stats.unassigned} icon="⚠️" accent="ring-amber-300"  sub="no technician yet" />
              </div>

              {/* charts row */}
              <div className="grid gap-5 lg:grid-cols-2">
                {/* status breakdown */}
                <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm">
                  <h3 className="mb-4 text-sm font-bold text-slate-700">Tickets by Status</h3>
                  <MiniBarChart
                    total={stats.total}
                    data={Object.entries(STATUS_META).map(([k,v]) => ({
                      label: v.label,
                      value: tickets.filter((t) => t.status === k).length,
                      bar: v.bar,
                    }))}
                  />
                </div>

                {/* category breakdown */}
                <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm">
                  <h3 className="mb-4 text-sm font-bold text-slate-700">Tickets by Category</h3>
                  <MiniBarChart total={stats.total} data={catBreakdown} />
                </div>
              </div>

              {/* priority breakdown donut-style pills */}
              <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm">
                <h3 className="mb-4 text-sm font-bold text-slate-700">Priority Distribution</h3>
                <div className="flex flex-wrap gap-3">
                  {["URGENT","HIGH","MEDIUM","LOW"].map((p) => {
                    const count = tickets.filter((t) => t.priority === p).length;
                    const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={p} className={`flex items-center gap-2 rounded-xl px-4 py-3 ${PRIORITY_COLORS[p]} min-w-[120px]`}>
                        <div>
                          <p className="text-xs font-bold opacity-80">{p}</p>
                          <p className="text-2xl font-bold">{count}</p>
                          <p className="text-xs opacity-70">{pct}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent resolved - SLA timer info */}
              {tickets.filter((t) => t.timeToResolutionMinutes).length > 0 && (
                <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm">
                  <h3 className="mb-4 text-sm font-bold text-slate-700">Resolution Time (Recent)</h3>
                  <div className="flex flex-col gap-2">
                    {tickets
                      .filter((t) => t.timeToResolutionMinutes)
                      .slice(0, 5)
                      .map((t) => (
                        <div key={t.ticketId} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                          <span className="text-sm text-slate-700">
                            {CATEGORY_ICONS[t.category]} {t.resourceName}
                          </span>
                          <span className={`text-sm font-bold ${
                            t.timeToResolutionMinutes > 1440 ? "text-red-600"
                            : t.timeToResolutionMinutes > 480 ? "text-amber-600"
                            : "text-emerald-600"
                          }`}>
                            {t.timeToResolutionMinutes < 60
                              ? `${t.timeToResolutionMinutes}m`
                              : `${Math.floor(t.timeToResolutionMinutes / 60)}h ${t.timeToResolutionMinutes % 60}m`}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ TEAM ════ */}
          {tab === "team" && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-700">
                  Staff Workload
                  <span className="ml-2 text-xs font-normal text-slate-400">{staff.length} members</span>
                </h2>
              </div>

              {staffWorkload.length === 0 ? (
                <div className="rounded-2xl bg-white p-10 text-center text-slate-400 ring-1 ring-slate-200">
                  No technicians or managers found.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {staffWorkload.map((member) => (
                    <div key={member.id}
                         className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm hover:shadow-md transition">
                      {/* avatar + name */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                          {(member.name || member.email || "?")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{member.name || member.email}</p>
                          <p className="text-xs text-slate-400 truncate">{member.email}</p>
                          <span className="mt-0.5 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-600 ring-1 ring-indigo-200">
                            {member.roles?.join(", ")}
                          </span>
                        </div>
                      </div>

                      {/* workload pills */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {[
                          { label: "Open",    value: member.open,       cls: "bg-amber-50 text-amber-700"   },
                          { label: "Working", value: member.inProgress, cls: "bg-blue-50 text-blue-700"     },
                          { label: "Done",    value: member.resolved,   cls: "bg-emerald-50 text-emerald-700" },
                        ].map((s) => (
                          <div key={s.label} className={`rounded-xl py-2 ${s.cls}`}>
                            <p className="text-lg font-bold">{s.value}</p>
                            <p className="text-[10px] font-medium">{s.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* total bar */}
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          {member.assigned > 0 && (
                            <div
                              className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                              style={{ width: `${Math.min(100, Math.round((member.inProgress / Math.max(member.assigned, 1)) * 100))}%` }}
                            />
                          )}
                        </div>
                        <span className="text-xs text-slate-500">{member.assigned} total</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Unassigned tickets panel */}
              {stats.unassigned > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-800">
                    <span>⚠️</span> Unassigned Tickets ({stats.unassigned})
                  </h3>
                  <div className="flex flex-col gap-2">
                    {tickets
                      .filter((t) => !t.assignedTo && t.status === "OPEN")
                      .slice(0, 6)
                      .map((t) => (
                        <div key={t.ticketId}
                             className="flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-amber-200">
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {CATEGORY_ICONS[t.category]} {t.resourceName}
                            </p>
                            <p className="text-xs text-slate-500">{t.description?.slice(0,60)}</p>
                          </div>
                          <button
                            onClick={() => navigate(`/tickets/${t.ticketId}`)}
                            className="ml-3 shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition"
                          >
                            Assign
                          </button>
                        </div>
                      ))}
                    {stats.unassigned > 6 && (
                      <button onClick={() => { setTab("tickets"); setFilterStatus("OPEN"); }}
                        className="text-sm font-semibold text-amber-700 hover:underline text-center pt-1">
                        View all →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ ALL TICKETS ════ */}
          {tab === "tickets" && (
            <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden">
              {/* toolbar */}
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-bold text-slate-800">
                  All Tickets
                  <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
                    {displayedTickets.length}
                  </span>
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {["ALL","OPEN","IN_PROGRESS","RESOLVED","CLOSED","REJECTED"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`rounded-lg px-3 py-1 text-xs font-bold transition
                        ${filterStatus === s
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >
                      {s === "ALL" ? "All" : STATUS_META[s]?.label}
                    </button>
                  ))}
                </div>
              </div>

              {displayedTickets.length === 0 ? (
                <div className="py-16 text-center text-slate-400">No tickets found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-5 py-3">ID</th>
                        <th className="px-5 py-3">Resource</th>
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3">Priority</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Assigned To</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedTickets.map((ticket) => (
                        <tr key={ticket.ticketId} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-3 font-bold text-slate-600 text-xs">
                            #{ticket.ticketId?.slice(-6)}
                          </td>
                          <td className="px-5 py-3">
                            <p className="font-semibold text-slate-900">{ticket.resourceName}</p>
                            <p className="text-xs text-slate-400 line-clamp-1">{ticket.description}</p>
                          </td>
                          <td className="px-5 py-3 text-slate-600">
                            {CATEGORY_ICONS[ticket.category]} {ticket.category?.replace("_"," ")}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${PRIORITY_COLORS[ticket.priority]}`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <StatusBadge status={ticket.status} />
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-500">
                            {ticket.assignedTo || <span className="text-amber-600 font-semibold">Unassigned</span>}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {ticket.status === "RESOLVED" && (
                                <button
                                  disabled={closing === ticket.ticketId}
                                  onClick={() => closeTicket(ticket.ticketId)}
                                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                                >
                                  {closing === ticket.ticketId ? "…" : "Close"}
                                </button>
                              )}
                              <button
                                onClick={() => navigate(`/tickets/${ticket.ticketId}`)}
                                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
