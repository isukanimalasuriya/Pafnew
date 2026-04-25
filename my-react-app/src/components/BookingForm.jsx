import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function BookingForm({ resources, booking, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    resourceId: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: ""
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        resourceId: booking.resourceId || "",
        startTime: booking.startTime ? new Date(booking.startTime).toISOString().slice(0, 16) : "",
        endTime: booking.endTime ? new Date(booking.endTime).toISOString().slice(0, 16) : "",
        purpose: booking.purpose || "",
        expectedAttendees: booking.expectedAttendees || ""
      });
    }
  }, [booking]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const showError = (msg) => {
      toast.error(msg, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
          color: '#fff',
          fontWeight: 'bold',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(255, 65, 108, 0.4)'
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#ff4b2b',
        },
      });
    };

    // Basic validation
    if (!formData.resourceId || !formData.startTime || !formData.endTime || !formData.purpose) {
      showError("Please fill in all required fields to proceed.");
      return;
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      showError("Time travel isn't supported yet! End time must be after start time.");
      return;
    }

    if (new Date(formData.startTime) < new Date()) {
      showError("Start time must be exactly now or in the future.");
      return;
    }

    const selectedResource = resources.find(resource => resource.id === formData.resourceId);
    const attendees = Number(formData.expectedAttendees);

    if (!Number.isInteger(attendees) || attendees < 1) {
      showError("You must have at least 1 expected attendee!");
      return;
    }

    if (selectedResource?.capacity != null && attendees > selectedResource.capacity) {
      showError(`Whoops! Expected attendees cannot exceed the resource capacity of ${selectedResource.capacity}.`);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white p-8 max-w-2xl mx-auto mt-6 transition-all duration-300 hover:shadow-2xl font-poppins">
      <div className="flex items-center space-x-3 mb-6 border-b border-indigo-100 pb-4">
        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          {booking ? "Edit Your Booking" : "Reserve a Resource"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Resource *
          </label>
          <div className="relative">
            <select
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              className="w-full pl-4 pr-10 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 font-medium text-slate-700 shadow-sm appearance-none"
              required
            >
              <option value="">Select a resource to reserve</option>
              {resources.map(resource => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} ({resource.type})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Start Time *
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 font-medium text-slate-700 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              End Time *
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 font-medium text-slate-700 shadow-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Purpose *
          </label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 font-medium text-slate-700 shadow-sm resize-none"
            placeholder="Describe the purpose of this reservation..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Expected Attendees
          </label>
          <div className="relative">
            <input
              type="number"
              name="expectedAttendees"
              value={formData.expectedAttendees}
              onChange={handleChange}
              min="1"
              className="w-full pl-4 pr-10 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 font-medium text-slate-700 shadow-sm"
              placeholder="e.g. 5"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-all duration-200 shadow-sm hover:shadow"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-300/50 hover:shadow-indigo-400/60 flex items-center space-x-2"
          >
            <span>{booking ? "Save Changes" : "Confirm Reservation"}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}