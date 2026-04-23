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
      setError(errParam)
      return
    }

    const token = params.get('token')
    if (!token) {
      setError('Missing token from redirect')
      return
    }

    const run = async () => {
      try {
        await setAuthFromToken(token)
        navigate('/', { replace: true })
      } catch (e) {
        setError('Unable to complete login')
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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-700">
      Finishing sign-in...
    </div>
  )
}

