import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function OAuth2RedirectPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setAuthFromToken } = useAuth()
  const [error, setError] = useState('')

  useEffect(() => {
    const errParam = params.get('error')
    if (errParam) {
      navigate(`/login?error=${encodeURIComponent(errParam)}`, { replace: true })
      return
    }

    const token = params.get('token')
    if (!token) {
      navigate('/login?error=Sign-in+failed.+Please+try+again.', { replace: true })
      return
    }

    const run = async () => {
      try {
        await setAuthFromToken(token)
        navigate('/', { replace: true })
      } catch (e) {
        navigate('/login?error=Unable+to+complete+sign-in.+Please+try+again.', { replace: true })
      }
    }

    run()
  }, [params, setAuthFromToken, navigate])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-semibold text-slate-900">Login failed</h1>
          <p className="mt-2 text-slate-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      <div className="flex flex-col items-center space-y-4 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <svg className="h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-lg font-medium text-slate-700">Finishing sign-in...</span>
      </div>
    </div>
  )
}

