import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import { useAuth } from './AuthContext'
import { deleteNotification, fetchNotifications, markNotificationRead } from '../services/notificationApi'

const NotificationContext = createContext(null)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function sortNewestFirst(list) {
  return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function NotificationProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const clientRef = useRef(null)

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications])

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const data = await fetchNotifications()
      setNotifications(sortNewestFirst(data))
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  const markAsRead = useCallback(async (id) => {
    const updated = await markNotificationRead(id)
    setNotifications((current) => sortNewestFirst(current.map((n) => (n.id === id ? updated : n))))
  }, [])

  const remove = useCallback(async (id) => {
    await deleteNotification(id)
    setNotifications((current) => current.filter((n) => n.id !== id))
  }, [])

  const addNotification = useCallback((n) => {
    setNotifications((current) => sortNewestFirst([n, ...current.filter((x) => x.id !== n.id)]))
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([])
      return
    }
    refresh()
  }, [isAuthenticated, refresh])

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    const wsUrl = API_BASE_URL.replace(/^http/, 'ws')
    const client = new Client({
      brokerURL: `${wsUrl}/ws`,
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe(`/topic/users/${user.id}/notifications`, (message) => {
          try {
            const payload = JSON.parse(message.body)
            addNotification(payload)
          } catch {
            // ignore
          }
        })
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      clientRef.current?.deactivate()
      clientRef.current = null
    }
  }, [isAuthenticated, user?.id, addNotification])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      refresh,
      markAsRead,
      remove,
      addNotification,
    }),
    [notifications, unreadCount, loading, refresh, markAsRead, remove, addNotification],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}

