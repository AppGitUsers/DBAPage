import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

async function fetchProfileById(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) {
      console.warn('[AuthContext] profile fetch error:', error.message)
      return null
    }
    return data
  } catch (err) {
    console.warn('[AuthContext] profile fetch threw:', err.message)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user,           setUser]           = useState(undefined) // undefined = not yet known
  const [profile,        setProfile]        = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)    // true while DB fetch in-flight

  // loading = auth event hasn't fired yet at all
  const loading = user === undefined

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          // 1. Set user synchronously → loading becomes false immediately
          setUser(session.user)
          // 2. Mark profile as loading so UI can show skeleton instead of wrong state
          setProfileLoading(true)
          // 3. Fetch profile in background
          fetchProfileById(session.user.id).then(prof => {
            setProfile(prof)
            setProfileLoading(false)
          })
        } else {
          setUser(null)
          setProfile(null)
          setProfileLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    setProfileLoading(true)
    const prof = await fetchProfileById(userId)
    setProfile(prof)
    setProfileLoading(false)
    return prof
  }

  const signOut = async () => {
    await supabase.auth.signOut().catch(() => {})
    setUser(null)
    setProfile(null)
    setProfileLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileLoading, signOut, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
