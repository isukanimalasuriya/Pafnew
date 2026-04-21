import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api";

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800"
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/admin/all`);
      setBookings(response.data);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      await axios.put(`${API_BASE_URL}/bookings/admin/${bookingId}/approve`);
      loadBookings();
    } catch (error) {
      alert("Error approving booking: " + error.response?.data || error.message);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await axios.put(`${API_BASE_URL}/bookings/admin/${bookingId}/reject`);
      loadBookings();
    } catch (error) {
      alert("Error rejecting booking: " + error.response?.data || error.message);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/bookings/admin/${bookingId}`);
      loadBookings();
    } catch (error) {
      alert("Error deleting booking: " + error.response?.data || error.message);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === "ALL") return true;
    return booking.status === filter;
  });

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-medium text-slate-900">All Bookings</h1>
          <p className="text-sm text-slate-500">Manage all student booking requests</p>
        </div>
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

      <div className="bg-white rounded-2xl ring-1 ring-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Student
                </th>
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
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {booking.studentName}
                      </div>
                      <div className="text-sm text-slate-500">
                        ID: {booking.studentId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {booking.resourceName}
                      </div>
                      <div className="text-sm text-slate-500">
                        ID: {booking.resourceId}
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
                        {booking.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApprove(booking.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(booking.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(booking.id)}
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
    </div>
  );
}