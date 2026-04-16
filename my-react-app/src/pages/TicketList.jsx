import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTickets } from "../services/ticketService";

function badgeClasses(priority) {
  if (priority === "URGENT") return "bg-red-100 text-red-700";
  if (priority === "HIGH") return "bg-amber-100 text-amber-700";
  if (priority === "MEDIUM") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-700";
}

function TicketList() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

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
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return tickets;

    return tickets.filter((ticket) =>
      [ticket.ticketId, ticket.resourceName, ticket.description, ticket.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [tickets, query]);

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Tickets</h1>
          <p className="mt-1 text-slate-500">
            Create and review incident tickets submitted to Module C.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/tickets/new")}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          New Ticket
        </button>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by ticket ID, resource, description, or category"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <p className="px-5 py-8 text-center text-slate-500">Loading tickets...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Ticket ID</th>
                  <th className="px-5 py-3">Resource</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created By</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td className="px-5 py-10 text-center text-slate-400" colSpan={7}>
                      No tickets found
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.ticketId} className="transition hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {ticket.ticketId}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{ticket.resourceName}</td>
                      <td className="px-5 py-3 text-slate-600">{ticket.category}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${badgeClasses(ticket.priority)}`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{ticket.status}</td>
                      <td className="px-5 py-3 text-slate-600">{ticket.createdBy}</td>
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/tickets/${ticket.ticketId}`)}
                          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                        >
                          View
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
