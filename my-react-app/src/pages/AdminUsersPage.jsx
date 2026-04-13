import { useEffect, useState } from 'react'
import { fetchUsers, createUser, updateUserRole, toggleUserStatus } from '../services/adminApi'
import { useAuth } from '../contexts/AuthContext'

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await fetchUsers()
      setUsers(data)
    } catch (err) {
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await createUser(newName, newEmail, newPassword)
      setShowModal(false)
      setNewName('')
      setNewEmail('')
      setNewPassword('')
      setSuccess('User created successfully.')
      loadUsers()
    } catch (err) {
      setError(err.response?.data || 'Failed to create user.')
    }
  }

  const handleRoleChange = async (targetId, newRole) => {
    setError('')
    setSuccess('')
    try {
      await updateUserRole(targetId, newRole)
      setSuccess('User role updated.')
      loadUsers()
    } catch (err) {
      setError(err.response?.data || 'Failed to update role.')
    }
  }

  const handleToggleStatus = async (targetId, currentStatus) => {
    setError('')
    setSuccess('')
    try {
      await toggleUserStatus(targetId, !currentStatus)
      setSuccess(`User has been ${currentStatus ? 'banned' : 'activated'}.`)
      loadUsers()
    } catch (err) {
      setError(err.response?.data || 'Failed to update user status.')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between rounded-2xl bg-white/70 p-6 shadow-xl backdrop-blur-xl ring-1 ring-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">View and manage system users, roles, and access.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 active:scale-95"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {(error || success) && (
        <div className={`rounded-xl p-4 text-sm font-semibold ring-1 ${error ? 'bg-red-50 text-red-600 ring-red-200' : 'bg-emerald-50 text-emerald-600 ring-emerald-200'}`}>
          {error || success}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-900">Name & Email</th>
              <th className="px-6 py-4 font-semibold text-slate-900">Role</th>
              <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
              <th className="px-6 py-4 text-right font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
               <tr><td colSpan="4" className="py-8 text-center text-slate-500">Loading users...</td></tr>
            ) : users.length === 0 ? (
               <tr><td colSpan="4" className="py-8 text-center text-slate-500">No users found.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{u.name} {u.id === currentUser?.id && <span className="ml-2 text-[10px] uppercase font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">You</span>}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={u.id === currentUser?.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      <option value="USER">User</option>
                      <option value="TECHNICIAN">Technician</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${u.active ? 'bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200' : 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      {u.active ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id, u.active)}
                      disabled={u.id === currentUser?.id}
                      className={`rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition disabled:opacity-50 ${u.active ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 ring-1 ring-inset ring-rose-200/50' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 ring-1 ring-inset ring-emerald-200/50'}`}
                    >
                      {u.active ? 'Ban User' : 'Activate User'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Add New User</h2>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <input required value={newName} onChange={e => setNewName(e.target.value)} type="text" className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                <input required value={newEmail} onChange={e => setNewEmail(e.target.value)} type="email" className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10" placeholder="name@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input required value={newPassword} onChange={e => setNewPassword(e.target.value)} type="text" className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10" placeholder="TempPass123" />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-4 py-2 font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
