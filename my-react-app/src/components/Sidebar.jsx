import { useLocation, useNavigate } from "react-router-dom";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Campus",
    items: [
      {
        id: "resources",
        label: "Resources",
        path: "/resources",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
      },
      {
        id: "bookings",
        label: "Bookings",
        path: "/bookings",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
    ],
  },
];

function Sidebar({ route, onNavigate, user, logout }) {
  return (
    <div className="flex h-full flex-col gap-2">
      <h2 className="mb-4 text-xl font-bold text-white px-2 shrink-0">Operations Hub</h2>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
        {/* Dynamic nav groups */}
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-2">
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {group.label}
            </p>
            {group.items.map((item) => (
              <button
                key={item.id}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left font-medium transition ${
                  route === item.path
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                onClick={() => onNavigate(item.path)}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-indigo-500/30 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}

        {/* Role-specific items */}
        {(user?.role === 'TECHNICIAN' || user?.role === 'ADMIN') && (
          <div className="mb-2">
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Maintenance</p>
            <button
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left font-medium transition ${
                route === '/maintenance' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              onClick={() => onNavigate('/maintenance')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Maintenance
            </button>
          </div>
        )}

        {user?.role === 'ADMIN' && (
          <div className="mb-2">
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Admin</p>
            <button
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left font-medium transition ${
                route === '/admin/bookings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              onClick={() => onNavigate('/admin/bookings')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Manage Bookings
            </button>
            <button
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left font-medium transition ${
                route === '/admin' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              onClick={() => onNavigate('/admin')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              System Admin
            </button>
          </div>
        )}
      </div>

      {/* User info & logout */}
      <div className="mt-auto border-t border-slate-800 pt-6 px-2 shrink-0">
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
