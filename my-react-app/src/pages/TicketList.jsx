import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTickets } from "../services/ticketService";
import { useAuth } from "../contexts/AuthContext";

function badgeClasses(status) {
  if (status === "REJECTED") return "bg-red-100 text-red-700 ring-red-600/20";
  if (status === "RESOLVED") return "bg-emerald-100 text-emerald-700 ring-emerald-600/20";
  if (status === "CLOSED") return "bg-slate-100 text-slate-700 ring-slate-600/20";
  if (status === "IN_PROGRESS") return "bg-blue-100 text-blue-700 ring-blue-600/20";
  return "bg-amber-100 text-amber-700 ring-amber-600/20";
}

function priorityBadge(priority) {
  if (priority === "URGENT") return "text-red-700 bg-red-50";
  if (priority === "HIGH") return "text-orange-700 bg-orange-50";
  if (priority === "MEDIUM") return "text-blue-700 bg-blue-50";
  return "text-slate-700 bg-slate-50";
}

function TicketList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    priority: "",
    status: "",
    resourceName: "",
  });

  const isUser = user?.role === "USER";

  useEffect(() => {
    const loadTickets = async () => {
      setLoading(true);
      setError("");
      try {
        setTickets(await fetchTickets());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (filters.search && ![ticket.ticketId, ticket.resourceName, ticket.description, ticket.category].filter(Boolean).some((v) => v.toLowerCase().includes(filters.search.toLowerCase()))) return false;
      if (filters.category && ticket.category !== filters.category) return false;
      if (filters.priority && ticket.priority !== filters.priority) return false;
      if (filters.status && ticket.status !== filters.status) return false;
      if (filters.resourceName && !ticket.resourceName?.toLowerCase().includes(filters.resourceName.toLowerCase())) return false;
      return true;
    });
  }, [tickets, filters]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Incidents & Tickets</h1>
          <p className="mt-2 text-slate-500">
            {isUser ? "Manage your reported incidents and track their resolution progress." : "Review and manage all system incident tickets."}
          </p>
        </div>

        {isUser && (
          <button
            type="button"
            onClick={() => navigate("/tickets/new")}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow"
          >
            + Report Incident
          </button>
        )}
      </header>

      {isUser ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-2 flex items-center shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 ml-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            placeholder="Search tickets by ID, location, or description..."
            className="w-full bg-transparent px-2 py-2 text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-700">Advanced Filters</h3>
            <button 
              onClick={() => setFilters({ search: "", category: "", priority: "", status: "", resourceName: "" })}
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              Clear Filters
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <input
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Search ID, desc..."
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <input
              value={filters.resourceName}
              onChange={(e) => updateFilter("resourceName", e.target.value)}
              placeholder="Resource Name..."
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <select
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="IT_EQUIPMENT">IT Equipment</option>
              <option value="FURNITURE">Furniture</option>
              <option value="OTHER">Other</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => updateFilter("priority", e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 ring-1 ring-red-200">
          <p className="text-sm font-semibold text-red-800">{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <div className="px-5 py-20 text-center text-slate-500 animate-pulse">Loading tickets...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Ticket ID</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  {!isUser && <th className="px-6 py-4">Contact</th>}
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td className="px-6 py-16 text-center text-slate-400" colSpan={isUser ? 5 : 6}>
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p>No tickets found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.ticketId} className="transition hover:bg-slate-50 group">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {ticket.ticketId}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">{ticket.category}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${priorityBadge(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${badgeClasses(ticket.status)}`}>
                          {ticket.status.replace("_", " ")}
                        </span>
                      </td>
                      {!isUser && <td className="px-6 py-4 text-slate-500">{ticket.preferredContact}</td>}
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/tickets/${ticket.ticketId}`)}
                          className="group/btn relative inline-flex w-32 items-center justify-center overflow-hidden rounded-lg bg-white py-2 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-300"
                        >
                          <span className="transition-all duration-300 group-hover/btn:-translate-x-2">View Details</span>
                          <svg className="absolute right-3 h-4 w-4 opacity-0 transition-all duration-300 -translate-x-2 group-hover/btn:translate-x-0 group-hover/btn:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default TicketList;
