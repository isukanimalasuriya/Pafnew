import { useEffect, useMemo, useState } from 'react'
import ResourceFilters from './ResourceFilters'
import ResourceForm from './ResourceForm'
import ResourceTable from './ResourceTable'

const API_BASE_URL = 'http://localhost:8080/api/resources'

const initialForm = {
  name: '',
  type: 'room',
  capacity: '',
  location: '',
  status: 'ACTIVE',
}

function normalizeStatusLabel(status) {
  return status === 'OUT_OF_SERVICE' ? 'Inactive' : 'Active'
}

function ResourcesPage() {
  const [resources, setResources] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    capacity: '',
    status: '',
  })

  const isEditing = useMemo(() => editId !== null, [editId])

  const loadResources = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API_BASE_URL)
      if (!response.ok) {
        throw new Error('Failed to load resources')
      }
      const data = await response.json()
      setResources(data)
    } catch (fetchError) {
      setError(fetchError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResources()
  }, [])

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const resetForm = () => {
    setForm(initialForm)
    setEditId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    const payload = {
      name: form.name.trim(),
      type: form.type.trim(),
      capacity: Number(form.capacity),
      location: form.location.trim(),
      status: form.status,
    }

    try {
      const url = isEditing ? `${API_BASE_URL}/${editId}` : API_BASE_URL
      const method = isEditing ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Unable to save resource')
      }

      setMessage(isEditing ? 'Resource updated successfully' : 'Resource created successfully')
      resetForm()
      await loadResources()
    } catch (submitError) {
      setError(submitError.message)
    }
  }

  const handleEdit = (resource) => {
    setForm({
      name: resource.name ?? '',
      type: resource.type ?? 'room',
      capacity: resource.capacity?.toString() ?? '',
      location: resource.location ?? '',
      status: resource.status ?? 'ACTIVE',
    })
    setEditId(resource.id)
    setMessage('')
    setError('')
  }

  const handleDelete = async (id) => {
    setMessage('')
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Failed to delete resource')
      }
      setMessage('Resource deleted')
      if (editId === id) {
        resetForm()
      }
      await loadResources()
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  const handleToggleStatus = async (resource) => {
    const nextStatus = resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE'
    try {
      const response = await fetch(`${API_BASE_URL}/${resource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: resource.name,
          type: resource.type,
          capacity: resource.capacity,
          location: resource.location,
          status: nextStatus,
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to update status')
      }
      setMessage(`Status changed to ${normalizeStatusLabel(nextStatus)}`)
      await loadResources()
    } catch (statusError) {
      setError(statusError.message)
    }
  }

  const applyFilters = async () => {
    const query = new URLSearchParams()
    if (filters.type.trim()) query.append('type', filters.type.trim())
    if (filters.location.trim()) query.append('location', filters.location.trim())
    if (filters.capacity.trim()) query.append('capacity', filters.capacity.trim())
    if (filters.status.trim()) query.append('status', filters.status.trim())

    const queryString = query.toString()
    const url = queryString ? `${API_BASE_URL}/filter?${queryString}` : API_BASE_URL

    setLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to apply filters')
      }
      const data = await response.json()
      setResources(data)
    } catch (filterError) {
      setError(filterError.message)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = async () => {
    setFilters({ type: '', location: '', capacity: '', status: '' })
    await loadResources()
  }

  return (
    <section className="flex flex-col gap-5">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">Resources</h1>
        <p className="mt-2 text-slate-600">
          Insert, update, delete, and monitor room/lab/equipment availability.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ResourceForm
          form={form}
          isEditing={isEditing}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
        <ResourceFilters
          filters={filters}
          setFilters={setFilters}
          onApply={applyFilters}
          onReset={clearFilters}
        />
      </div>

      {message && (
        <p className="rounded-xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">{error}</p>
      )}

      <ResourceTable
        resources={resources}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />
    </section>
  )
}

export default ResourcesPage
