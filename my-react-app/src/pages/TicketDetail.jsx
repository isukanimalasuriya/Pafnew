import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchTicketById, assignTicket, resolveTicket, updateTicketStatus } from "../services/ticketService";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";

function formatDate(value) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString();
}

const STAGES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "ADMIN";
  const isTechOrManager = user?.role === "TECHNICIAN" || user?.role === "MANAGER";

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

  useEffect(() => {
    loadTicket();
  }, [id]);

  const handleAssign = async () => {
    const email = prompt("Enter technician's email to assign this ticket:");
    if (!email) return;
    try {
      await assignTicket(ticket.ticketId, email);
      toast.success("Ticket assigned successfully!");
      loadTicket();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleResolve = async () => {
    const notes = prompt("Enter resolution notes:");
    if (!notes) return;
    try {
      await resolveTicket(ticket.ticketId, notes);
      toast.success("Ticket resolved successfully!");
      loadTicket();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    let reason = undefined;
    let notes = undefined;

    if (newStatus === "REJECTED") {
      reason = prompt("Enter rejection reason:");
      if (!reason) return;
    }

    try {
      await updateTicketStatus(ticket.ticketId, newStatus, reason, notes);
      toast.success(`Ticket status updated to ${newStatus}`);
      loadTicket();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ticket Details</h1>
          <p className="mt-2 text-slate-500">
            View the full lifecycle and details of this incident.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/tickets")}
          className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200 hover:text-slate-900"
        >
          &larr; Back to Tickets
        </button>
      </div>

      {loading && (
        <div className="rounded-2xl bg-white px-5 py-12 text-center text-slate-500 ring-1 ring-slate-200 shadow-sm animate-pulse">
          Loading ticket details...
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 p-6 ring-1 ring-red-200">
          <p className="text-sm font-semibold text-red-800">{error}</p>
        </div>
      )}

      {ticket && (
        <>
          {/* Timeline Stepper */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Current Stage</h3>
            <div className="flex items-center">
              {STAGES.map((stage, index) => {
                const isRejected = ticket.status === "REJECTED";
                const isCurrent = ticket.status === stage || (isRejected && stage === "CLOSED");
                const isCompleted = STAGES.indexOf(ticket.status) > index || ticket.status === "CLOSED" || ticket.status === "RESOLVED" && index < 2;
                
                return (
                  <div key={stage} className="flex-1 flex items-center relative">
                    <div className="flex flex-col items-center flex-1 relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        isRejected && index === 3 ? "bg-red-500 text-white" :
                        isCurrent ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                        isCompleted ? "bg-emerald-500 text-white" :
                        "bg-slate-100 text-slate-400"
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`mt-2 text-xs font-semibold ${
                        isRejected && index === 3 ? "text-red-600" :
                        isCurrent || isCompleted ? "text-slate-900" : "text-slate-400"
                      }`}>
                        {isRejected && index === 3 ? "REJECTED" : stage.replace("_", " ")}
                      </span>
                    </div>
                    {index < STAGES.length - 1 && (
                      <div className={`absolute left-1/2 right-[-50%] top-4 h-0.5 -translate-y-1/2 ${
                        isCompleted ? "bg-emerald-500" : "bg-slate-100"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-500 tracking-wider uppercase">Ticket ID</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                      {ticket.ticketId}
                    </h2>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    ticket.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                    ticket.status === 'CLOSED' ? 'bg-slate-100 text-slate-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <DetailItem label="Location / Resource ID" value={ticket.resourceId} />
                  <DetailItem label="Resource Name" value={ticket.resourceName} />
                  <DetailItem label="Category" value={ticket.category} />
                  <DetailItem label="Priority" value={ticket.priority} />
                  <DetailItem label="Created By" value={ticket.createdBy} />
                  <DetailItem label="Preferred Contact" value={ticket.preferredContact} />
                </div>

                <div className="mt-8 border-t border-slate-100 pt-6">
                  <p className="text-sm font-bold text-slate-900 mb-3">Description</p>
                  <p className="rounded-xl bg-slate-50 p-4 text-slate-700 leading-relaxed text-sm">
                    {ticket.description}
                  </p>
                </div>
                
                {ticket.rejectedReason && (
                  <div className="mt-6 border-t border-slate-100 pt-6">
                    <p className="text-sm font-bold text-red-600 mb-3">Rejection Reason</p>
                    <p className="rounded-xl bg-red-50 p-4 text-red-800 leading-relaxed text-sm">
                      {ticket.rejectedReason}
                    </p>
                  </div>
                )}
                
                {ticket.resolutionNotes && (
                  <div className="mt-6 border-t border-slate-100 pt-6">
                    <p className="text-sm font-bold text-emerald-600 mb-3">Resolution Notes</p>
                    <p className="rounded-xl bg-emerald-50 p-4 text-emerald-800 leading-relaxed text-sm">
                      {ticket.resolutionNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Image Gallery */}
              {ticket.imageUrls && ticket.imageUrls.length > 0 && (
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Attachments</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {ticket.imageUrls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden rounded-xl ring-1 ring-slate-200 hover:ring-blue-500 transition">
                        <img src={url} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Activity Info</h3>
                <div className="mt-5 space-y-5">
                  <DetailItem label="Created At" value={formatDate(ticket.createdAt)} />
                  <DetailItem label="First Response" value={formatDate(ticket.firstRespondedAt)} />
                  <DetailItem label="Resolved At" value={formatDate(ticket.resolvedAt)} />
                  <DetailItem label="Closed At" value={formatDate(ticket.closedAt)} />
                  <DetailItem label="Assigned To" value={ticket.assignedTo || "Unassigned"} />
                </div>
              </div>

              {/* Role Based Actions */}
              {(isAdmin || isTechOrManager) && ticket.status !== "CLOSED" && ticket.status !== "REJECTED" && (
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">Actions</h3>
                  <div className="flex flex-col gap-3">
                    {isAdmin && ticket.status === "OPEN" && (
                      <button onClick={handleAssign} className="w-full rounded-xl bg-blue-50 text-blue-700 px-4 py-2.5 text-sm font-bold transition hover:bg-blue-100">
                        Assign Technician
                      </button>
                    )}
                    
                    {isAdmin && ticket.status === "OPEN" && (
                      <button onClick={() => handleUpdateStatus("IN_PROGRESS")} className="w-full rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-bold transition hover:bg-blue-700">
                        Mark In Progress
                      </button>
                    )}
                    
                    {(isAdmin || isTechOrManager) && ticket.status === "IN_PROGRESS" && (
                      <button onClick={handleResolve} className="w-full rounded-xl bg-emerald-600 text-white px-4 py-2.5 text-sm font-bold transition hover:bg-emerald-700">
                        Resolve Ticket
                      </button>
                    )}
                    
                    {isAdmin && ticket.status === "RESOLVED" && (
                      <button onClick={() => handleUpdateStatus("CLOSED")} className="w-full rounded-xl bg-slate-800 text-white px-4 py-2.5 text-sm font-bold transition hover:bg-slate-900">
                        Close Ticket
                      </button>
                    )}
                    
                    {isAdmin && ticket.status === "OPEN" && (
                      <button onClick={() => handleUpdateStatus("REJECTED")} className="w-full rounded-xl bg-red-50 text-red-700 px-4 py-2.5 text-sm font-bold transition hover:bg-red-100 mt-4">
                        Reject Ticket
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value || "Not available"}</p>
    </div>
  );
}

export default TicketDetail;
