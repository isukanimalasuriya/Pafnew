import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket, uploadTicketImages } from "../services/ticketService";
import { api } from "../services/api";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

const initialForm = {
  category: "OTHER",
  description: "",
  priority: "MEDIUM",
  resourceName: "",
};

function CreateTicket() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    async function loadResources() {
      try {
        const { data } = await api.get('/api/resources');
        setResources(data);
      } catch (err) {
        toast.error("Failed to load resources");
      }
    }
    loadResources();
  }, []);

  const isValid = useMemo(() => {
    return form.description.trim() && form.resourceName.trim();
  }, [form]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length > 3) {
      toast.error("You can only upload up to 3 images");
      return;
    }
    setFiles(selectedFiles);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      // 1. Create the ticket
      const createdTicket = await createTicket({
        ...form,
        resourceName: form.resourceName.trim(),
        description: form.description.trim(),
        preferredContact: user?.email || "",
      });

      // 2. Upload images if any
      if (files.length > 0) {
        await uploadTicketImages(createdTicket.ticketId, files);
      }

      toast.success("Ticket created successfully!");
      navigate(`/tickets/${createdTicket.ticketId}`);
    } catch (err) {
      toast.error(err.message || "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-2 border-b border-slate-200 pb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-2 ring-1 ring-blue-100">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Report an Incident</h1>
        <p className="text-slate-500">
          Please provide details about the issue. Our team will review and assign it to a technician.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 md:grid-cols-2"
      >
        <div className="md:col-span-2">
          <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
            Resource <span className="text-red-500">*</span>
            <select
              name="resourceName"
              value={form.resourceName}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              required
            >
              <option value="" disabled>Select a resource...</option>
              {resources.map((res) => (
                <option key={res.id} value={res.name}>{res.name} ({res.location})</option>
              ))}
            </select>
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
            Description <span className="text-red-500">*</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Clearly describe the issue you are facing..."
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 resize-none"
              required
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
          Category
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="ELECTRICAL">Electrical</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="IT_EQUIPMENT">IT Equipment</option>
            <option value="FURNITURE">Furniture</option>
            <option value="OTHER">Other</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
          Priority
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </label>

        <div className="md:col-span-2">
          <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
            Attachments <span className="text-xs font-normal text-slate-500 ml-1">(Up to 3 images, max 5MB each)</span>
            <input
              type="file"
              multiple
              accept="image/jpeg, image/png, image/jpg"
              onChange={handleFileChange}
              className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-600 outline-none transition hover:bg-slate-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 file:hidden cursor-pointer"
            />
          </label>
        </div>


        <div className="md:col-span-2 mt-4 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() => navigate("/tickets")}
            className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default CreateTicket;
