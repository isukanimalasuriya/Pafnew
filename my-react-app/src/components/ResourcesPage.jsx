import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://localhost:8080/api/resources";

const initialForm = {
  name: "",
  type: "room",
  capacity: "",
  location: "",
  status: "ACTIVE",
};

function normalizeStatusLabel(status) {
  return status === "OUT_OF_SERVICE" ? "Inactive" : "Active";
}

// ── Modal ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ── ResourceForm (inside modal) ──────────────────────────────────────────────
function ResourceForm({ form, isEditing, onChange, onSubmit, onCancel }) {
  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          {isEditing ? "Update Resource" : "Add New Resource"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <form
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        onSubmit={onSubmit}
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Name
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Conference Room A"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Type
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            name="type"
            value={form.type}
            onChange={onChange}
            required
          >
            <option value="room">Room</option>
            <option value="lab">Lab</option>
            <option value="equipment">Equipment</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Capacity
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            name="capacity"
            type="number"
            min="0"
            value={form.capacity}
            onChange={onChange}
            placeholder="30"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Location
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            name="location"
            value={form.location}
            onChange={onChange}
            placeholder="Building A, Floor 2"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 sm:col-span-2">
          Status
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            name="status"
            value={form.status}
            onChange={onChange}
            required
          >
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Inactive</option>
          </select>
        </label>

        <div className="mt-1 flex flex-wrap gap-2 sm:col-span-2">
          <button
            className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700"
            type="submit"
          >
            {isEditing ? "Update Resource" : "Create Resource"}
          </button>
          <button
            className="rounded-xl bg-slate-200 px-5 py-2 font-semibold text-slate-800 transition hover:bg-slate-300"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}

// ── Filter Panel (collapsible) ───────────────────────────────────────────────
function FilterPanel({ filters, setFilters, onApply, onReset, open }) {
  if (!open) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Type
          <input
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={filters.type}
            onChange={(e) =>
              setFilters((s) => ({ ...s, type: e.target.value }))
            }
            placeholder="room / lab / equipment"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Location
          <input
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={filters.location}
            onChange={(e) =>
              setFilters((s) => ({ ...s, location: e.target.value }))
            }
            placeholder="Building A"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Min Capacity
          <input
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            type="number"
            min="0"
            value={filters.capacity}
            onChange={(e) =>
              setFilters((s) => ({ ...s, capacity: e.target.value }))
            }
            placeholder="30"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Status
          <select
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={filters.status}
            onChange={(e) =>
              setFilters((s) => ({ ...s, status: e.target.value }))
            }
          >
            <option value="">Any</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Inactive</option>
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          type="button"
          onClick={onApply}
        >
          Apply Filters
        </button>
        <button
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-100"
          type="button"
          onClick={onReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

// ── ResourcesPage ────────────────────────────────────────────────────────────
function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    location: "",
    capacity: "",
    status: "",
  });

  const isEditing = useMemo(() => editId !== null, [editId]);

  // ── API helpers ────────────────────────────────────────────────────────────
  const loadResources = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) throw new Error("Failed to load resources");
      setResources(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  // ── Form handlers ──────────────────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditId(null);
    setModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const payload = {
      name: form.name.trim(),
      type: form.type.trim(),
      capacity: Number(form.capacity),
      location: form.location.trim(),
      status: form.status,
    };

    try {
      const url = isEditing ? `${API_BASE_URL}/${editId}` : API_BASE_URL;
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Unable to save resource");
      }
      setMessage(
        isEditing
          ? "Resource updated successfully"
          : "Resource created successfully",
      );
      resetForm();
      await loadResources();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleEdit = (resource) => {
    setForm({
      name: resource.name ?? "",
      type: resource.type ?? "room",
      capacity: resource.capacity?.toString() ?? "",
      location: resource.location ?? "",
      status: resource.status ?? "ACTIVE",
    });
    setEditId(resource.id);
    setMessage("");
    setError("");
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    setMessage("");
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete resource");
      setMessage("Resource deleted");
      if (editId === id) resetForm();
      await loadResources();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleToggleStatus = async (resource) => {
    const nextStatus =
      resource.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";
    try {
      const res = await fetch(`${API_BASE_URL}/${resource.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...resource, status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setMessage(`Status changed to ${normalizeStatusLabel(nextStatus)}`);
      await loadResources();
    } catch (e) {
      setError(e.message);
    }
  };

  // ── Filter handlers ────────────────────────────────────────────────────────
  const applyFilters = async () => {
    const q = new URLSearchParams();
    if (filters.type.trim()) q.append("type", filters.type.trim());
    if (filters.location.trim()) q.append("location", filters.location.trim());
    if (filters.capacity.trim()) q.append("capacity", filters.capacity.trim());
    if (filters.status.trim()) q.append("status", filters.status.trim());

    const qs = q.toString();
    const url = qs ? `${API_BASE_URL}/filter?${qs}` : API_BASE_URL;

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to apply filters");
      setResources(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setFilters({ type: "", location: "", capacity: "", status: "" });
    await loadResources();
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="flex flex-col gap-5">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Resources</h1>
          <p className="mt-1 text-slate-500">
            Manage rooms, labs, and equipment availability.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              filterOpen || hasActiveFilters
                ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
                : "bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6 10a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zM9 15a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-xs text-white">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Add resource */}
          <button
            type="button"
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Resource
          </button>
        </div>
      </header>

      {/* Filter panel */}
      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        onApply={applyFilters}
        onReset={clearFilters}
        open={filterOpen}
      />

      {/* Notifications */}
      {message && (
        <p className="rounded-xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800">
          ✓ {message}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
          ✕ {error}
        </p>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <p className="px-5 py-8 text-center text-slate-500">
            Loading resources…
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Capacity</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resources.length === 0 ? (
                  <tr>
                    <td
                      className="px-5 py-10 text-center text-slate-400"
                      colSpan={6}
                    >
                      No resources found
                    </td>
                  </tr>
                ) : (
                  resources.map((resource) => (
                    <tr
                      key={resource.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {resource.name}
                      </td>
                      <td className="px-5 py-3 capitalize text-slate-600">
                        {resource.type}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {resource.capacity}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {resource.location}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            resource.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {normalizeStatusLabel(resource.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                            onClick={() => handleEdit(resource)}
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                            onClick={() => handleDelete(resource.id)}
                          >
                            Delete
                          </button>
                          <button
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                            onClick={() => handleToggleStatus(resource)}
                          >
                            Toggle
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={resetForm}>
        <ResourceForm
          form={form}
          isEditing={isEditing}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      </Modal>
    </section>
  );
}

export default ResourcesPage;
