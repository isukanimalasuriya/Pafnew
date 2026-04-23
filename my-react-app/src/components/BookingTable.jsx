import { useState } from "react";

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800"
};

export default function BookingTable({ bookings, onEdit, onDelete, userRole }) {
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
    <div className="bg-white rounded-2xl ring-1 ring-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-slate-900">Bookings</h2>
          <div className="flex space-x-2">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === status
                    ? "bg-blue-100 text-blue-800"
                    : "text-slate-600 hover:bg-slate-100"
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
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Resource
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Purpose
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                  No bookings found
                </td>
              </tr>
            ) : (
              filteredBookings.map(booking => (
                <tr key={booking.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {booking.resourceName}
                      </div>
                      <div className="text-sm text-slate-500">
                        ID: {booking.resourceId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {formatDateTime(booking.startTime)}
                    </div>
                    <div className="text-sm text-slate-500">
                      to {formatDateTime(booking.endTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 max-w-xs truncate">
                      {booking.purpose}
                    </div>
                    {booking.expectedAttendees && (
                      <div className="text-sm text-slate-500">
                        {booking.expectedAttendees} attendees
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[booking.status]}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {canEdit(booking) && (
                        <button
                          onClick={() => onEdit(booking)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(booking.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
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