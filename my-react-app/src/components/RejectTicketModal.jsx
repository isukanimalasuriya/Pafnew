import React, { useState } from 'react';
import { updateTicketStatus } from '../services/ticketService';
import { toast } from 'react-hot-toast';

export default function RejectTicketModal({ isOpen, onClose, ticketId, onSuccess }) {
  const [rejectedReason, setRejectedReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rejectedReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setLoading(true);
    try {
      await updateTicketStatus(ticketId, "REJECTED", rejectedReason, undefined);
      toast.success("Ticket rejected", { icon: '❌' });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to reject ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Reject Ticket</h3>
        </div>
        
        <p className="text-sm text-slate-500 mb-6">Are you sure you want to reject this ticket? Please provide a reason below.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-bold text-slate-700">
            Reason for Rejection <span className="text-red-500">*</span>
            <textarea
              value={rejectedReason}
              onChange={(e) => setRejectedReason(e.target.value)}
              placeholder="e.g. Duplicate of ticket #1234, or Not enough information."
              rows={4}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 resize-none"
              required
            />
          </label>
          
          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !rejectedReason.trim()}
              className="rounded-xl bg-red-600 px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? "Rejecting..." : "Reject Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
