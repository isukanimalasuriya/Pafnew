import { useMemo, useState, useEffect, useRef } from 'react'
import { useNotifications } from '../contexts/NotificationContext'

function timeAgo(iso) {
  const then = new Date(iso).getTime()
  const diff = Math.max(0, Date.now() - then)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const getTypeColor = (type) => {
  switch (type) {
    case 'BOOKING_APPROVED': return 'text-emerald-500 bg-emerald-500/10 ring-emerald-500/20'
    case 'BOOKING_REJECTED': return 'text-rose-500 bg-rose-500/10 ring-rose-500/20'
    case 'TICKET_STATUS_CHANGED': return 'text-amber-500 bg-amber-500/10 ring-amber-500/20'
    case 'COMMENT_ADDED': return 'text-indigo-500 bg-indigo-500/10 ring-indigo-500/20'
    default: return 'text-slate-500 bg-slate-500/10 ring-slate-500/20'
  }
}

export default function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead, remove } = useNotifications()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  const latest = useMemo(() => notifications.slice(0, 10), [notifications])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
          open ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm ring-1 ring-slate-200'
        }`}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-[400px] origin-top-right overflow-hidden rounded-2xl bg-white/80 shadow-2xl backdrop-blur-xl ring-1 ring-slate-200 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 bg-white/50 px-5 py-4">
            <h3 className="font-bold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-600">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="max-h-[480px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200">
            {latest.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-3 px-5 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">All caught up! No notifications for now.</p>
              </div>
            ) : (
              latest.map((n) => (
                <div
                  key={n.id}
                  className={`group relative flex gap-4 border-b border-slate-50 px-5 py-4 transition-colors hover:bg-slate-50/50 ${
                    !n.isRead ? 'bg-indigo-50/30' : ''
                  }`}
                >
                  {!n.isRead && (
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${getTypeColor(n.type)}`}>
                        {n.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{timeAgo(n.createdAt)}</span>
                    </div>
                    <div className={`mt-1.5 text-sm leading-relaxed ${!n.isRead ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                      {n.message}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-4 decoration-indigo-200"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => remove(n.id)}
                        className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            className="flex w-full items-center justify-center border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
            onClick={() => setOpen(false)}
          >
            Close Panel
          </button>
        </div>
      )}
    </div>
  )
}

