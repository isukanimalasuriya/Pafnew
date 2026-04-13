import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const { registerUser } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await registerUser(name, email, password)
      navigate('/')
    } catch (err) {
      const msg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || 'Failed to register. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 text-center">Create Account</h1>
        <p className="mt-2 text-slate-500 text-center text-sm">Join us today! It's free and always will be.</p>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="name">
              Full Name
            </label>
            <input
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              id="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              type="text"
              value={name}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="email">
              Email Address
            </label>
            <input
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              type="email"
              value={email}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              type="password"
              value={password}
            />
          </div>

          <button
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link className="font-semibold text-indigo-600 hover:text-indigo-500" to="/login">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
