function ResourceForm({ form, isEditing, onChange, onSubmit, onCancel }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-xl font-semibold text-slate-900">{isEditing ? 'Update Resource' : 'Add Resource'}</h2>
      <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Name
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            name="name"
            value={form.name}
            onChange={onChange}
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
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
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

        <div className="mt-1 flex flex-wrap gap-2 md:col-span-2">
          <button
            className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
            type="submit"
          >
            {isEditing ? 'Update Resource' : 'Create Resource'}
          </button>
          {isEditing && (
            <button
              className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-800 transition hover:bg-slate-300"
              type="button"
              onClick={onCancel}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default ResourceForm
