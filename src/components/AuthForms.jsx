import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './AuthForms.css'

const COURSES = [
  'Oracle Developer',
  'Oracle DBA',
  'PostgreSQL Developer',
  'PostgreSQL DBA',
]

export default function AuthForms() {
  const [tab, setTab] = useState('login')
  // const { fetchProfile } = useAuth()

  /* ── LOGIN STATE ── */
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [loginStatus, setLoginStatus] = useState(null)

  /* ── REGISTER STATE ── */
  const [regData, setRegData] = useState({ name: '', email: '', password: '', course: '' })
  const [regStatus, setRegStatus] = useState(null)

  /* ─── LOGIN ─── */
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginStatus('loading')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })

      if (error) throw error
      if (!data?.user) throw new Error("Login failed.")

      // Check approval
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('approved')
        .eq('id', data.user.id)
        .single()

      if (profErr) throw profErr

      if (!profile?.approved) {
        await supabase.auth.signOut()
        setLoginStatus('Your account is pending admin approval. Please wait.')
        return
      }

      // Let AuthContext handle session/profile properly
      // await fetchProfile(data.user.id)

      setLoginStatus(null)

    } catch (err) {
      setLoginStatus(err.message || 'Login failed. Check your credentials.')
    }
  }

  /* ─── REGISTER ─── */
  const handleRegister = async (e) => {
    e.preventDefault()

    if (!regData.course) {
      setRegStatus('Please select a course.')
      return
    }

    setRegStatus('loading')

    try {
      // 1️⃣ Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: regData.email,
        password: regData.password,
      })

      if (error) throw error
      if (!data?.user?.id) {
        setRegStatus("User creation failed.")
        return
      }

      // 2️⃣ Insert profile row
      const { error: profErr } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          name: regData.name,
          email: regData.email,
          course: regData.course,
          approved: false,
        }])

      if (profErr) throw profErr

      // 3️⃣ Sign out (waiting for admin approval)
      await supabase.auth.signOut()

      setRegStatus('success')

    } catch (err) {
      setRegStatus(err.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="auth-forms">
      {/* Tab switcher */}
      <div className="auth-tabs">
        <button
          className={`auth-tab${tab === 'login' ? ' active' : ''}`}
          onClick={() => { setTab('login'); setLoginStatus(null) }}
        >
          <i className="fas fa-sign-in-alt" /> Login
        </button>

        <button
          className={`auth-tab${tab === 'register' ? ' active' : ''}`}
          onClick={() => { setTab('register'); setRegStatus(null) }}
        >
          <i className="fas fa-user-plus" /> Register
        </button>
      </div>

      {/* ── LOGIN ── */}
      {tab === 'login' && (
        <form className="auth-form animate-fadeIn" onSubmit={handleLogin}>
          <h3 className="auth-title">Welcome Back</h3>
          <p className="auth-sub">Sign in to access your course videos</p>

          {loginStatus && loginStatus !== 'loading' && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-circle" /> {loginStatus}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrap">
              <i className="fas fa-envelope input-icon" />
              <input
                type="email"
                className="form-control has-icon"
                placeholder="your@email.com"
                required
                value={loginData.email}
                onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <i className="fas fa-lock input-icon" />
              <input
                type="password"
                className="form-control has-icon"
                placeholder="••••••••"
                required
                value={loginData.password}
                onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loginStatus === 'loading'}>
            {loginStatus === 'loading'
              ? <><span className="spinner" /> Signing in…</>
              : 'Sign In'}
          </button>

          <p className="auth-switch">
            Don't have an account?{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => { setTab('register'); setLoginStatus(null) }}
            >
              Register here
            </button>
          </p>
        </form>
      )}

      {/* ── REGISTER ── */}
      {tab === 'register' && (
        <form className="auth-form animate-fadeIn" onSubmit={handleRegister}>
          <h3 className="auth-title">Create Account</h3>
          <p className="auth-sub">Register to join our training programs</p>

          {regStatus === 'success' ? (
            <div className="reg-success">
              <div className="reg-success-icon">
                <i className="fas fa-check-circle" />
              </div>
              <h4>Registration Successful!</h4>
              <p>
                Your account has been created. Please wait for admin approval
                before you can log in. You'll be notified once access is granted.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: 16, width: '100%' }}
                onClick={() => { setTab('login'); setRegStatus(null) }}
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              {regStatus && regStatus !== 'loading' && (
                <div className="alert alert-error">
                  <i className="fas fa-exclamation-circle" /> {regStatus}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrap">
                  <i className="fas fa-user input-icon" />
                  <input
                    type="text"
                    className="form-control has-icon"
                    placeholder="John Smith"
                    required
                    value={regData.name}
                    onChange={e => setRegData(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrap">
                  <i className="fas fa-envelope input-icon" />
                  <input
                    type="email"
                    className="form-control has-icon"
                    placeholder="your@email.com"
                    required
                    value={regData.email}
                    onChange={e => setRegData(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrap">
                  <i className="fas fa-lock input-icon" />
                  <input
                    type="password"
                    className="form-control has-icon"
                    placeholder="Min. 6 characters"
                    minLength={6}
                    required
                    value={regData.password}
                    onChange={e => setRegData(p => ({ ...p, password: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Select Course</label>
                <div className="input-wrap">
                  <i className="fas fa-graduation-cap input-icon" />
                  <select
                    className="form-control has-icon"
                    required
                    value={regData.course}
                    onChange={e => setRegData(p => ({ ...p, course: e.target.value }))}
                  >
                    <option value="">— Choose a course —</option>
                    {COURSES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={regStatus === 'loading'}>
                {regStatus === 'loading'
                  ? <><span className="spinner" /> Registering…</>
                  : 'Create Account'}
              </button>

              <p className="auth-switch">
                Already have an account?{' '}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => { setTab('login'); setRegStatus(null) }}
                >
                  Sign in
                </button>
              </p>
            </>
          )}
        </form>
      )}
    </div>
  )
}