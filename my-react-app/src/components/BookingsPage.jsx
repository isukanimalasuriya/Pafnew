import { useState, useEffect } from "react";
import axios from "axios";
import BookingForm from "./BookingForm";
import BookingTable from "./BookingTable";

const API_BASE_URL = "http://localhost:8080/api";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [userRole, setUserRole] = useState("student"); // For demo purposes
  const [studentId, setStudentId] = useState("student123"); // For demo purposes

  useEffect(() => {
    loadBookings();
    loadResources();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/my?studentId=${studentId}`);
      setBookings(response.data);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/resources");
      setResources(response.data);
    } catch (error) {
      console.error("Error loading resources:", error);
    }
  };

  const handleCreateBooking = async (bookingData) => {
    try {
      await axios.post(`${API_BASE_URL}/bookings`, {
        ...bookingData,
        userId: studentId
      });
      setShowForm(false);
      loadBookings();
    } catch (error) {
      alert("Error creating booking: " + error.response?.data || error.message);
    }
  };

  const handleUpdateBooking = async (bookingData) => {
    try {
      await axios.put(`${API_BASE_URL}/bookings/${editingBooking.id}?studentId=${studentId}`, bookingData);
      setShowForm(false);
      setEditingBooking(null);
      loadBookings();
    } catch (error) {
      alert("Error updating booking: " + error.response?.data || error.message);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/bookings/${bookingId}?studentId=${studentId}`);
      loadBookings();
    } catch (error) {
      alert("Error deleting booking: " + error.response?.data || error.message);
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
        userRole={userRole}
      />
    </div>
  );
}