import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const [scrolled,      setScrolled]      = useState(false)
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [coursesOpen,   setCoursesOpen]   = useState(false)
  const [studentsOpen,  setStudentsOpen]  = useState(false)
  const [userMenuOpen,  setUserMenuOpen]  = useState(false) // ← dedicated state for user dropdown
  const { user, profile, loading, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const userMenuRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location])

  // Close user menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    setUserMenuOpen(false)
    await signOut()
    navigate('/')
  }

  const scrollTo = (id) => {
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileOpen(false)
  }

  return (
    <>
      {/* Top bar */}
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-left">
            <span><i className="fas fa-envelope" /> gopi.orafly@gmail.com</span>
            <span><i className="fas fa-phone" /> +91 99805 88044</span>
          </div>
          <div className="topbar-right">
            <a href="https://twitter.com" target="_blank" rel="noreferrer"><i className="fab fa-twitter" /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer"><i className="fab fa-facebook" /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><i className="fab fa-instagram" /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer"><i className="fab fa-linkedin" /></a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container nav-inner">
          <Link to="/" className="nav-logo">
            <span className="logo-text">DBA <span className="logo-accent">Page</span></span>
          </Link>

          {/* Desktop nav */}
          <ul className="nav-links">
            <li><button className="nav-link" onClick={() => scrollTo('hero')}>Home</button></li>
            <li><button className="nav-link" onClick={() => scrollTo('about')}>About</button></li>

            {/* Courses dropdown */}
            <li
              className="dropdown"
              onMouseEnter={() => setCoursesOpen(true)}
              onMouseLeave={() => setCoursesOpen(false)}
            >
              <button className="nav-link">
                Courses <i className="fas fa-chevron-down small-icon" />
              </button>
              {coursesOpen && (
                <ul className="dropdown-menu">
                  <li><Link to="/courses/oracle-developer">Oracle Developer</Link></li>
                  <li><Link to="/courses/oracle-dba">Oracle DBA</Link></li>
                  <li><Link to="/courses/postgresql-developer">PostgreSQL Developer</Link></li>
                  <li><Link to="/courses/postgresql-dba">PostgreSQL DBA</Link></li>
                </ul>
              )}
            </li>

            <li><button className="nav-link" onClick={() => scrollTo('services')}>Services</button></li>
            <li><Link to="/videos" className="nav-link">Videos</Link></li>

            {/* Students dropdown */}
            <li
              className="dropdown"
              onMouseEnter={() => setStudentsOpen(true)}
              onMouseLeave={() => setStudentsOpen(false)}
            >
              <button className="nav-link">
                Students <i className="fas fa-chevron-down small-icon" />
              </button>
              {studentsOpen && (
                <ul className="dropdown-menu">
                  <li><Link to="/quiz">Quiz</Link></li>
                  <li><Link to="/blogs">Blogs</Link></li>
                  <li><Link to="/labs">Labs</Link></li>
                  <li><Link to="/interview-questions">Interview Questions</Link></li>
                </ul>
              )}
            </li>

            <li><button className="nav-link" onClick={() => scrollTo('contact')}>Contact</button></li>

            {/* Auth area — show nothing while loading, then correct state */}
            {!loading && (
              user && profile ? (
                /* ── Logged-in user menu ── */
                <li className="dropdown user-dropdown" ref={userMenuRef}>
                  <button
                    className="nav-link nav-user"
                    onClick={() => setUserMenuOpen(o => !o)}
                  >
                    <i className="fas fa-user-circle" />
                    {profile.name?.split(' ')[0]}
                    <i className="fas fa-chevron-down small-icon" />
                  </button>
                  {userMenuOpen && (
                    <ul className="dropdown-menu dropdown-right user-dropdown-menu">
                      <li className="dropdown-header">
                        <span className="badge badge-primary">{profile.course}</span>
                      </li>
                      <li>
                        <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}>
                          <i className="fas fa-play-circle" /> My Dashboard
                        </Link>
                      </li>
                      <li>
                        <button onClick={handleSignOut}>
                          <i className="fas fa-sign-out-alt" /> Sign Out
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
              ) : (
                /* ── Not logged in ── */
                <li>
                  <button className="btn btn-primary nav-cta" onClick={() => scrollTo('hero')}>
                    Login / Register
                  </button>
                </li>
              )
            )}
          </ul>

          {/* Mobile hamburger */}
          <button className="hamburger" onClick={() => setMobileOpen(o => !o)}>
            <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="mobile-menu animate-fadeIn">
            <ul>
              <li><button onClick={() => scrollTo('hero')}>Home</button></li>
              <li><button onClick={() => scrollTo('about')}>About</button></li>
              <li className="mobile-group-label">Courses</li>
              <li><Link to="/courses/oracle-developer">Oracle Developer</Link></li>
              <li><Link to="/courses/oracle-dba">Oracle DBA</Link></li>
              <li><Link to="/courses/postgresql-developer">PostgreSQL Developer</Link></li>
              <li><Link to="/courses/postgresql-dba">PostgreSQL DBA</Link></li>
              <li><button onClick={() => scrollTo('services')}>Services</button></li>
              <li><Link to="/videos">Videos</Link></li>
              <li className="mobile-group-label">Students</li>
              <li><Link to="/quiz">Quiz</Link></li>
              <li><Link to="/blogs">Blogs</Link></li>
              <li><Link to="/labs">Labs</Link></li>
              <li><Link to="/interview-questions">Interview Questions</Link></li>
              <li><button onClick={() => scrollTo('contact')}>Contact</button></li>
              {user && profile ? (
                <>
                  <li><Link to="/dashboard">My Dashboard</Link></li>
                  <li><button onClick={handleSignOut}>Sign Out</button></li>
                </>
              ) : (
                <li>
                  <button onClick={() => scrollTo('hero')} className="mobile-login-btn">
                    Login / Register
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </nav>
    </>
  )
}
