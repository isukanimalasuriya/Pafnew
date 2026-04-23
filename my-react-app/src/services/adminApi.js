import { api } from './api'

export async function fetchUsers() {
  const response = await api.get('/api/admin/users')
  return response.data
}

export async function createUser(name, email, password) {
  const response = await api.post('/api/admin/users', { name, email, password })
  return response.data
}

export async function updateUserRole(id, role) {
  const response = await api.put(`/api/admin/users/${id}/role`, { role })
  return response.data
}

export async function toggleUserStatus(id, active) {
  const response = await api.put(`/api/admin/users/${id}/status`, { active })
  return response.data
}
