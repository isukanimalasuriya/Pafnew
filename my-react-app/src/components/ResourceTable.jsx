function normalizeStatusLabel(status) {
  return status === "OUT_OF_SERVICE" ? "Inactive" : "Active";
}

function ResourceTable({
  resources,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <h2 className="px-5 pt-5 text-xl font-semibold text-slate-900">
        All Resources
      </h2>
      {loading ? (
        <p className="px-5 py-4 text-slate-600">Loading resources...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {resources.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-slate-500" colSpan={6}>
                    No resources found
                  </td>
                </tr>
              ) : (
                resources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {resource.name}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {resource.type}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {resource.capacity}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {resource.location}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          resource.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {normalizeStatusLabel(resource.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-lg bg-slate-200 px-3 py-1.5 font-semibold text-slate-800 transition hover:bg-slate-300"
                          onClick={() => onEdit(resource)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-lg bg-red-500 px-3 py-1.5 font-semibold text-white transition hover:bg-red-600"
                          onClick={() => onDelete(resource.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="rounded-lg bg-slate-200 px-3 py-1.5 font-semibold text-slate-800 transition hover:bg-slate-300"
                          onClick={() => onToggleStatus(resource)}
                        >
                          Toggle Status
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
  );
}

export default ResourceTable;
