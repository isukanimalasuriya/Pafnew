import { useState } from "react";

const STATUS_COLORS = {
  PENDING: "bg-amber-100/80 border border-amber-200 text-amber-800 shadow-sm backdrop-blur-sm",
  APPROVED: "bg-emerald-100/80 border border-emerald-200 text-emerald-800 shadow-sm backdrop-blur-sm",
  REJECTED: "bg-rose-100/80 border border-rose-200 text-rose-800 shadow-sm backdrop-blur-sm",
  CANCELLED: "bg-slate-100/80 border border-slate-200 text-slate-700 shadow-sm backdrop-blur-sm"
};

export default function BookingTable({ bookings, onEdit, onDelete, onCancel, userRole }) {
  const [filter, setFilter] = useState("ALL");

  const filteredBookings = bookings.filter(booking => {
    if (filter === "ALL") return true;
    return booking.status === filter;
  });

  const canEdit = (booking) => {
    return userRole === "student" && booking.status === "PENDING";
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Bookings
          </h2>
          <div className="flex flex-wrap space-x-2">
            {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-1.5 text-xs font-bold tracking-wide rounded-full transition-all duration-200 ${filter === status
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105"
                    : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 cursor-pointer"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest w-1/5">
                Resource Target
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest w-1/5">
                Time Window
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest w-1/5">
                Details & Scope
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest w-1/5">
                Approval Status
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest w-1/5">
                Quick Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium">No bookings align with your current filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredBookings.map(booking => (
                <tr key={booking.id} className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                        {booking.resourceName?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          {booking.resourceName}
                        </div>
                        <div className="text-[11px] text-slate-400 tracking-wide mt-0.5 font-mono">
                          ID: {booking.resourceId?.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-700">
                      {formatDateTime(booking.startTime).split(',')[0]}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDateTime(booking.startTime).split(',')[1]} - {formatDateTime(booking.endTime).split(',')[1]}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-medium text-slate-800 max-w-xs truncate" title={booking.purpose}>
                      {booking.purpose}
                    </div>
                    {booking.expectedAttendees && (
                      <div className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider mt-1 bg-indigo-50 inline-block px-2 py-0.5 rounded-full">
                        {booking.expectedAttendees} Attendees
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 text-[11px] font-bold tracking-widest uppercase rounded-full ${STATUS_COLORS[booking.status]}`}>
                      {booking.status === 'PENDING' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 animate-pulse"></span>}
                      {booking.status === 'APPROVED' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>}
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canEdit(booking) && (
                        <button
                          onClick={() => onEdit(booking)}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          Edit
                        </button>
                      )}
                      {booking.status === "PENDING" && (
                        <button
                          onClick={() => onCancel(booking.id)}
                          className="flex items-center gap-1 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          Cancel
                        </button>
                      )}
                      {booking.status === "CANCELLED" && (
                        <button
                          onClick={() => onDelete(booking.id)}
                          className="flex items-center gap-1 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}