import React, { useState } from 'react';
import { updateTicketStatus } from '../services/ticketService';
import { toast } from 'react-hot-toast';

export default function ResolveTicketModal({ isOpen, onClose, ticketId, onSuccess }) {
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      toast.error("Please provide resolution notes");
      return;
    }
    setLoading(true);
    try {
      await updateTicketStatus(ticketId, "RESOLVED", undefined, resolutionNotes);
      toast.success("Ticket resolved successfully", { icon: '✅' });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to resolve ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Resolve Ticket</h3>
        </div>
        
        <p className="text-sm text-slate-500 mb-6">Please provide a summary of how this issue was resolved. This will be visible to the user.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-bold text-slate-700">
            Resolution Summary <span className="text-red-500">*</span>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Fixed the leaky pipe and cleaned the area."
              rows={4}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none"
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
              disabled={loading || !resolutionNotes.trim()}
              className="rounded-xl bg-emerald-600 px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? "Resolving..." : "Mark as Resolved"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
