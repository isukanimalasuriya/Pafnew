import { api } from './api'

export async function fetchNotifications() {
  const response = await api.get('/api/notifications')
  return response.data
}

export async function markNotificationRead(id) {
  const response = await api.put(`/api/notifications/${id}/read`)
  return response.data
}

export async function deleteNotification(id) {
  await api.delete(`/api/notifications/${id}`)
}

