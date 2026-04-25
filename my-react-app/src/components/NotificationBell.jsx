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
        className={`group relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 shadow-xl hover:scale-105 ${
          open ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-slate-200'
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
          <span className="absolute right-3 top-3 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 bottom-full z-50 mb-4 w-[360px] sm:w-[400px] origin-bottom-right overflow-hidden rounded-3xl bg-white/90 shadow-2xl backdrop-blur-xl ring-1 ring-slate-200 animate-in fade-in zoom-in-95 duration-200">
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
                  className={`group relative flex items-start gap-4 border-b border-slate-100 px-6 py-4 transition-all duration-200 hover:bg-slate-50 ${
                    !n.isRead ? 'bg-indigo-50/20' : 'bg-white'
                  }`}
                >
                  <div className="mt-1.5 flex-shrink-0">
                    {!n.isRead ? (
                      <div className="h-2 w-2 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)] animate-pulse" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-slate-200" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                       <span className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${getTypeColor(n.type)}`}>
                        {n.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                    </div>
                    <div className={`mt-2 text-sm leading-snug ${!n.isRead ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                      {n.message}
                    </div>
                    
                    <div className="mt-3 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => remove(n.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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

