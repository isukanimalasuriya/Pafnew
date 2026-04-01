function DashboardPage({ onNavigate }) {
  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-3xl font-semibold text-slate-900">Resource Management Portal</h1>
      <p className="mt-3 text-slate-600">Manage labs, rooms, and equipment from one place.</p>
      <button
        className="mt-6 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
        onClick={() => onNavigate('/resources')}
      >
        Open Resources
      </button>
    </section>
  )
}

export default DashboardPage
