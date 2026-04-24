import React, { useState, useEffect } from 'react';
import { assignTicket } from '../services/ticketService';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

export default function AssignTechnicianModal({ isOpen, onClose, ticketId, onSuccess }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    if (isOpen) {
      api.get('/api/admin/users').then(res => {
        const staffUsers = res.data.filter(u => u.roles.includes("TECHNICIAN") || u.roles.includes("MANAGER"));
        setStaff(staffUsers);
      }).catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter or select an email");
      return;
    }
    setLoading(true);
    try {
      await assignTicket(ticketId, email);
      toast.success("Ticket assigned successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to assign ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Assign Technician</h3>
        <p className="text-sm text-slate-500 mb-6">Select a technician from the list or enter their email directly to assign them to this ticket.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {staff.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">Quick Select Staff</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {staff.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setEmail(user.email)}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition"
                  >
                    {user.name || user.email}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <label className="flex flex-col gap-1.5 text-sm font-bold text-slate-700">
            Technician Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="technician@example.com"
              className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
              disabled={loading || !email.trim()}
              className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Assigning..." : "Assign Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
