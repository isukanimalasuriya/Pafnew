import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchMe, login as apiLogin, register as apiRegister } from '../services/authApi'

const AuthContext = createContext(null)

const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function parseJwt(token) {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken('')
    setUser(null)
  }, [])

  const setAuthFromToken = useCallback(async (nextToken) => {
    localStorage.setItem('token', nextToken)
    setToken(nextToken)
    try {
      const me = await fetchMe()
      setUser(me)
    } catch (error) {
      logout()
    }
  }, [logout])

  const loginWithGoogle = useCallback(() => {
    window.location.href = `${BACKEND_BASE_URL}/oauth2/authorization/google`
  }, [])

  const loginEmail = useCallback(async (email, password) => {
    const data = await apiLogin(email, password)
    await setAuthFromToken(data.token)
  }, [setAuthFromToken])

  const registerUser = useCallback(async (name, email, password) => {
    const data = await apiRegister(name, email, password)
    return data
  }, [])

  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem('token')
      if (!savedToken) {
        setInitializing(false)
        return
      }

      const decoded = parseJwt(savedToken)
      if (!decoded?.exp || decoded.exp * 1000 < Date.now()) {
        logout()
        setInitializing(false)
        return
      }

      try {
        setToken(savedToken)
        const me = await fetchMe()
        setUser(me)
      } catch {
        logout()
      } finally {
        setInitializing(false)
      }
    }

    init()
  }, [logout])

  const value = useMemo(
    () => ({
      token,
      user,
      initializing,
      isAuthenticated: Boolean(token && user),
      loginWithGoogle,
      loginEmail,
      registerUser,
      logout,
      setAuthFromToken,
    }),
    [token, user, initializing, loginWithGoogle, loginEmail, registerUser, logout, setAuthFromToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
