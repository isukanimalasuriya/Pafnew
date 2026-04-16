import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchTicketById } from "../services/ticketService";

function formatDate(value) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString();
}

function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTicket = async () => {
      setLoading(true);
      setError("");
      try {
        setTicket(await fetchTicketById(id));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [id]);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Ticket Details</h1>
          <p className="mt-1 text-slate-500">
            View the incident record returned by the backend API.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/tickets")}
          className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-300"
        >
          Back
        </button>
      </div>

      {loading && (
        <div className="rounded-2xl bg-white px-5 py-8 text-center text-slate-500 ring-1 ring-slate-200">
          Loading ticket...
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </p>
      )}

      {ticket && (
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Ticket ID</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                  {ticket.ticketId}
                </h2>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                {ticket.status}
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <DetailItem label="Resource ID" value={ticket.resourceId} />
              <DetailItem label="Resource Name" value={ticket.resourceName} />
              <DetailItem label="Category" value={ticket.category} />
              <DetailItem label="Priority" value={ticket.priority} />
              <DetailItem label="Created By" value={ticket.createdBy} />
              <DetailItem label="Preferred Contact" value={ticket.preferredContact} />
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-slate-500">Description</p>
              <p className="mt-2 rounded-xl bg-slate-50 p-4 text-slate-700">
                {ticket.description}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Timeline</h3>
            <div className="mt-4 space-y-4">
              <DetailItem label="Created At" value={formatDate(ticket.createdAt)} />
              <DetailItem label="Resolved At" value={formatDate(ticket.resolvedAt)} />
              <DetailItem label="Closed At" value={formatDate(ticket.closedAt)} />
              <DetailItem label="Assigned To" value={ticket.assignedTo || "Not assigned"} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-slate-900">{value || "Not available"}</p>
    </div>
  );
}

export default TicketDetail;
