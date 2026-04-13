function Sidebar({ route, onNavigate, user, logout }) {
  return (
    <div className="flex h-full flex-col gap-2">
      <h2 className="mb-4 text-xl font-bold text-white px-2">Operations Hub</h2>
      
      <button
        className={`rounded-xl px-4 py-2.5 text-left font-medium transition ${
          route === '/' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
        onClick={() => onNavigate('/')}
      >
        Dashboard
      </button>

      <button
        className={`rounded-xl px-4 py-2.5 text-left font-medium transition ${
          route === '/resources' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
        onClick={() => onNavigate('/resources')}
      >
        Resources
      </button>

      {(user?.role === 'TECHNICIAN' || user?.role === 'ADMIN') && (
        <button
          className={`rounded-xl px-4 py-2.5 text-left font-medium transition ${
            route === '/maintenance' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
          onClick={() => onNavigate('/maintenance')}
        >
          Maintenance
        </button>
      )}

      {user?.role === 'ADMIN' && (
        <button
          className={`rounded-xl px-4 py-2.5 text-left font-medium transition ${
            route === '/admin' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
          onClick={() => onNavigate('/admin')}
        >
          System Admin
        </button>
      )}

      <div className="mt-auto border-t border-slate-800 pt-6 px-2">
        <div className="mb-4">
          <div className="font-semibold text-white truncate">{user?.name || 'User'}</div>
          <div className="text-xs text-slate-400 truncate">{user?.email}</div>
          <div className="mt-1 inline-flex rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400 ring-1 ring-inset ring-indigo-400/20">
            {user?.role}
          </div>
        </div>
        <button
          className="w-full rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
          onClick={logout}
          type="button"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default Sidebar
