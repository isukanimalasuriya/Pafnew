import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../services/ticketService";

const initialForm = {
  resourceId: "",
  resourceName: "",
  category: "OTHER",
  description: "",
  priority: "MEDIUM",
  preferredContact: "",
  imageUrls: [],
};

function CreateTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isValid = useMemo(() => {
    return (
      form.resourceId.trim() &&
      form.resourceName.trim() &&
      form.description.trim() &&
      form.preferredContact.trim()
    );
  }, [form]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const createdTicket = await createTicket({
        ...form,
        resourceId: form.resourceId.trim(),
        resourceName: form.resourceName.trim(),
        description: form.description.trim(),
        preferredContact: form.preferredContact.trim(),
      });

      navigate(`/tickets/${createdTicket.ticketId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-5">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">Create Ticket</h1>
        <p className="mt-1 text-slate-500">
          Submit a new incident using the backend API created for Module C.
        </p>
      </header>

      {error && (
        <p className="rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:grid-cols-2"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Resource ID
          <input
            name="resourceId"
            value={form.resourceId}
            onChange={handleChange}
            placeholder="res-101"
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Resource Name
          <input
            name="resourceName"
            value={form.resourceName}
            onChange={handleChange}
            placeholder="Library Projector"
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Category
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ELECTRICAL">Electrical</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="IT_EQUIPMENT">IT Equipment</option>
            <option value="FURNITURE">Furniture</option>
            <option value="OTHER">Other</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Priority
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 md:col-span-2">
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            placeholder="Describe the issue clearly"
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 md:col-span-2">
          Preferred Contact
          <input
            name="preferredContact"
            value={form.preferredContact}
            onChange={handleChange}
            placeholder="user1@campus.lk"
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          />
        </label>

        <div className="md:col-span-2 flex gap-2">
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? "Creating..." : "Create Ticket"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/tickets")}
            className="rounded-xl bg-slate-200 px-5 py-2 font-semibold text-slate-800 transition hover:bg-slate-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export default CreateTicket;
