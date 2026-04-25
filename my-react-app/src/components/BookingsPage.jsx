import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import BookingForm from "./BookingForm";
import BookingTable from "./BookingTable";
import { toast } from "react-hot-toast";

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

  const showErrorToast = (title, message) => {
    toast.error(
      <div>
        <strong>{title}</strong>
        <div className="text-sm mt-1">{message}</div>
      </div>, {
      duration: 5000,
      position: 'top-center',
      style: {
        background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
        color: '#fff',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(255, 65, 108, 0.4)'
      },
      iconTheme: { primary: '#fff', secondary: '#ff4b2b' }
    });
  };

  const showSuccessToast = (message) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-center',
      style: {
        background: 'linear-gradient(to right, #0ba360, #3cba92)',
        color: '#fff',
        padding: '16px',
        borderRadius: '12px',
        fontWeight: 'bold',
        boxShadow: '0 4px 15px rgba(11, 163, 96, 0.4)'
      },
      iconTheme: { primary: '#fff', secondary: '#0ba360' }
    });
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
      showSuccessToast("Reservation Confirmed!");
      loadBookings();
    } catch (error) {
      showErrorToast("Booking Failed", getErrorMessage(error));
    }
  };

  const handleUpdateBooking = async (bookingData) => {
    try {
      await api.put(`${API_BASE_URL}/bookings/${editingBooking.id}`, bookingData);
      setShowForm(false);
      setEditingBooking(null);
      showSuccessToast("Reservation Updated Successfully!");
      loadBookings();
    } catch (error) {
      showErrorToast("Update Failed", getErrorMessage(error));
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to permanently delete this reservation?")) return;

    try {
      await api.delete(`${API_BASE_URL}/bookings/${bookingId}`);
      showSuccessToast("Reservation Deleted");
      loadBookings();
    } catch (error) {
      showErrorToast("Deletion Failed", getErrorMessage(error));
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this pending reservation?")) return;

    try {
      await api.put(`${API_BASE_URL}/bookings/${bookingId}/cancel`);
      showSuccessToast("Reservation Cancelled");
      loadBookings();
    } catch (error) {
      showErrorToast("Cancellation Failed", getErrorMessage(error));
    }
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-poppins">
        <div className="flex space-x-2 animate-pulse">
          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-poppins pb-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Reservations</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and track your requested campus resources</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Reserve Resource
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