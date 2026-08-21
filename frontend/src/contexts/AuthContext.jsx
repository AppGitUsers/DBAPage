import { createContext, useContext, useEffect, useState } from 'react'
import { apiGet, apiPost, ApiError, clearToken, getToken, setToken } from '../lib/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = not yet known
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // loading = we haven't resolved whether there's a session yet
  const loading = user === undefined

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setUser(null)
      setProfile(null)
      return
    }
    setProfileLoading(true)
    apiGet('/api/auth/me/')
      .then((me) => {
        setUser(me)
        setProfile(me)
      })
      .catch(() => {
        clearToken()
        setUser(null)
        setProfile(null)
      })
      .finally(() => setProfileLoading(false))
  }, [])

  const login = async (email, password) => {
    try {
      const { token, user: me } = await apiPost('/api/auth/login/', { email, password })
      setToken(token)
      setUser(me)
      setProfile(me)
      return { ok: true }
    } catch (err) {
      const awaitingApproval = err instanceof ApiError && err.status === 403
      return {
        ok: false,
        awaitingApproval,
        message: awaitingApproval
          ? 'Your account is awaiting admin approval. Please wait.'
          : err.message || 'Login failed. Please check your credentials.',
      }
    }
  }

  const register = async ({ name, email, password, course }) => {
    try {
      await apiPost('/api/auth/register/', { name, email, password, course })
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.message || 'Registration failed. Please try again.' }
    }
  }

  const signOut = async () => {
    await apiPost('/api/auth/logout/').catch(() => {})
    clearToken()
    setUser(null)
    setProfile(null)
    setProfileLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileLoading, login, register, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
