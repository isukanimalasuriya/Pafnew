function Sidebar({ route, onNavigate }) {
  return (
    <>
      <h2 className="mb-2 text-lg font-semibold text-slate-50">Campus Manager</h2>
      <button
        className={`rounded-xl px-3 py-2 text-left font-medium transition ${
          route === '/' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
        onClick={() => onNavigate('/')}
      >
        Dashboard
      </button>
      <button
        className={`rounded-xl px-3 py-2 text-left font-medium transition ${
          route === '/resources'
            ? 'bg-slate-700 text-white'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
        onClick={() => onNavigate('/resources')}
      >
        Resources
      </button>
    </>
  )
}

export default Sidebar
