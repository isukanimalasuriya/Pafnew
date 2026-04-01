function ResourceFilters({ filters, setFilters, onApply, onReset }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-xl font-semibold text-slate-900">Filter Resources</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Type
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={filters.type}
            onChange={(event) => setFilters((s) => ({ ...s, type: event.target.value }))}
            placeholder="room / lab / equipment"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Location
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={filters.location}
            onChange={(event) => setFilters((s) => ({ ...s, location: event.target.value }))}
            placeholder="Building A"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Capacity (min)
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            type="number"
            min="0"
            value={filters.capacity}
            onChange={(event) => setFilters((s) => ({ ...s, capacity: event.target.value }))}
            placeholder="30"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Status
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={filters.status}
            onChange={(event) => setFilters((s) => ({ ...s, status: event.target.value }))}
          >
            <option value="">Any</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Inactive</option>
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
          type="button"
          onClick={onApply}
        >
          Apply Filters
        </button>
        <button
          className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-800 transition hover:bg-slate-300"
          type="button"
          onClick={onReset}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default ResourceFilters
