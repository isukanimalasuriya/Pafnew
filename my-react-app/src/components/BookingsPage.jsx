import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import BookingForm from "./BookingForm";
import BookingTable from "./BookingTable";

const API_BASE_URL = "/api";

export default function BookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [userRole, setUserRole] = useState("student"); // For demo purposes

  const getErrorMessage = (error) => {
    const data = error?.response?.data;
    if (!data) return error?.message || "Unknown error";
    if (typeof data === "string") return data;
    if (data.errors && typeof data.errors === "object") {
      const entries = Object.entries(data.errors).map(([field, message]) => `${field}: ${message}`);
      return entries.join(", ");
    }
    if (typeof data.message === "string") return data.message;
    return JSON.stringify(data);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadBookings();
    loadResources();
  }, [isAuthenticated]);

  const loadBookings = async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/bookings/my`);
      setBookings(response.data);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/resources`);
      setResources(response.data);
    } catch (error) {
      console.error("Error loading resources:", error);
    }
  };

  const handleCreateBooking = async (bookingData) => {
    try {
      await api.post(`${API_BASE_URL}/bookings`, {
        ...bookingData
      });
      setShowForm(false);
      loadBookings();
    } catch (error) {
      alert("Error creating booking: " + getErrorMessage(error));
    }
  };

  const handleUpdateBooking = async (bookingData) => {
    try {
      await api.put(`${API_BASE_URL}/bookings/${editingBooking.id}`, bookingData);
      setShowForm(false);
      setEditingBooking(null);
      loadBookings();
    } catch (error) {
      alert("Error updating booking: " + getErrorMessage(error));
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      await api.delete(`${API_BASE_URL}/bookings/${bookingId}`);
      loadBookings();
    } catch (error) {
      alert("Error deleting booking: " + getErrorMessage(error));
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await api.put(`${API_BASE_URL}/bookings/${bookingId}/cancel`);
      loadBookings();
    } catch (error) {
      alert("Error cancelling booking: " + getErrorMessage(error));
    }
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setShowForm(true);
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
          <h1 className="text-xl font-medium text-slate-900">My Bookings</h1>
          <p className="text-sm text-slate-500">Manage your resource bookings</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Booking
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <BookingForm
            resources={resources}
            booking={editingBooking}
            onSubmit={editingBooking ? handleUpdateBooking : handleCreateBooking}
            onCancel={() => {
              setShowForm(false);
              setEditingBooking(null);
            }}
          />
        </div>
      )}

      <BookingTable
        bookings={bookings}
        onEdit={handleEditBooking}
        onDelete={handleDeleteBooking}
        onCancel={handleCancelBooking}
        userRole={userRole}
      />
    </div>
  );
}