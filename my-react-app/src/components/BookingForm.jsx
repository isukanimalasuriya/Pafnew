import { useState, useEffect } from "react";

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

    // Basic validation
    if (!formData.resourceId || !formData.startTime || !formData.endTime || !formData.purpose) {
      alert("Please fill in all required fields");
      return;
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      alert("End time must be after start time");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-6">
      <h2 className="text-lg font-medium text-slate-900 mb-4">
        {booking ? "Edit Booking" : "Create New Booking"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Resource *
          </label>
          <select
            name="resourceId"
            value={formData.resourceId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a resource</option>
            {resources.map(resource => (
              <option key={resource.id} value={resource.id}>
                {resource.name} ({resource.type})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Start Time *
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              End Time *
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Purpose *
          </label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the purpose of this booking"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Expected Attendees
          </label>
          <input
            type="number"
            name="expectedAttendees"
            value={formData.expectedAttendees}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {booking ? "Update Booking" : "Create Booking"}
          </button>
        </div>
      </form>
    </div>
  );
}