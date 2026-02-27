import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './Dashboard.css'

/* ── Extract YouTube video ID from any YT url format ── */
function getYtId(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

/* ── Video Player Modal ───────────────────────────────────────────────────── */
function VideoModal({ video, onClose }) {
  const iframeRef  = useRef(null)
  const overlayRef = useRef(null)
  const ytId = getYtId(video.video_url)

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'   // lock scroll while open
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleFullscreen = () => {
    const el = iframeRef.current
    if (!el) return
    if (el.requestFullscreen)       el.requestFullscreen()
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
    else if (el.mozRequestFullScreen)    el.mozRequestFullScreen()
  }

  // Click overlay backdrop to close
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div className="video-modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      
      <div className="video-modal">
        {/* Header bar */}
        <div className="video-modal-header">
          <div className="video-modal-title">
            <span className="video-modal-badge">{video.course}</span>
            <h3>{video.title}</h3>
            {video.duration && (
              <span className="video-modal-dur"><i className="fas fa-clock" /> {video.duration}</span>
            )}
          </div>
          <div className="video-modal-controls">
            <button className="vmc-btn" onClick={handleFullscreen} title="Fullscreen">
              <i className="fas fa-expand" />
            </button>
            {/* <a
              href={video.video_url}
              target="_blank"
              rel="noreferrer"
              className="vmc-btn"
              title="Open in YouTube"
            >
              <i className="fab fa-youtube" />
            </a> */}
            <button className="vmc-btn vmc-close" onClick={onClose} title="Close">
              <i className="fas fa-times" />
            </button>
          </div>
        </div>

        {/* Player */}
        <div className="video-modal-player">
          {ytId ? (
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="video-modal-noyt">
              <i className="fas fa-video-slash" />
              <p>Cannot embed this video.</p>
              <a href={video.video_url} target="_blank" rel="noreferrer" className="btn btn-primary">
                Open Video Link
              </a>
            </div>
          )}
        </div>

        {/* Description */}
        {video.description && (
          <div className="video-modal-desc">
            <p>{video.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Video Card ── */
function VideoCard({ video, onClick }) {
  const ytId = getYtId(video.video_url)
  const thumb = video.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null)

  return (
    <div className="dash-video-card card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div className="dash-video-thumb">
        {thumb
          ? <img src={thumb} alt={video.title} />
          : <div className="dash-video-placeholder"><i className="fas fa-play-circle" /></div>
        }
        <div className="dash-video-overlay">
          <div className="dash-play-btn"><i className="fas fa-play" /></div>
        </div>
        <span className="dash-video-badge">{video.course}</span>
      </div>
      <div className="dash-video-info">
        <h4>{video.title}</h4>
        {video.description && <p>{video.description}</p>}
        {video.duration && (
          <span className="dash-video-duration"><i className="fas fa-clock" /> {video.duration}</span>
        )}
      </div>
    </div>
  )
}

/* ── Dashboard ── */
export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth()
  const navigate   = useNavigate()
  const [videos,   setVideos]   = useState([])
  const [fetching, setFetching] = useState(false)
  const [fetchErr, setFetchErr] = useState(null)
  const [search,   setSearch]   = useState('')
  const [playing,  setPlaying]  = useState(null)   // video object currently in modal
  const hasFetched = useRef(false)

  useEffect(() => {
    if (loading) return
    if (user === null) { navigate('/'); return }
    if (user && profile === null) return
    if (profile && !profile.approved) { navigate('/'); return }
  }, [loading, user, profile, navigate])

  useEffect(() => {
    if (!profile?.approved || hasFetched.current) return
    hasFetched.current = true
    loadVideos(profile.course)
  }, [profile])

  const loadVideos = async (course) => {
    setFetching(true)
    setFetchErr(null)
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('course', course)
        .order('created_at', { ascending: false })
      if (error) throw error
      setVideos(data || [])
    } catch (err) {
      setFetchErr(err.message || 'Failed to load videos.')
    } finally {
      setFetching(false)
    }
  }

  const filtered = videos.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    (v.description || '').toLowerCase().includes(search.toLowerCase())
  )

  const closeModal = useCallback(() => setPlaying(null), [])

  if (loading || (user && profile === null)) {
    return (
      <div className="dash-loading">
        <span className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
        <p>Loading your dashboard…</p>
      </div>
    )
  }

  if (!user || !profile || !profile.approved) return null

  return (
    <div className="dashboard">
      {/* Video Modal */}
      {playing && <VideoModal video={playing} onClose={closeModal} />}

      {/* Header */}
      <div className="dash-header">
        <div className="container dash-header-inner">
          <div>
            <h1>My Dashboard</h1>
            <p>Enrolled in: <strong>{profile.course}</strong></p>
          </div>
          <div className="dash-user">
            <div className="dash-avatar"><i className="fas fa-user-circle" /></div>
            <div>
              <p className="dash-name">{profile.name}</p>
              <p className="dash-email">{profile.email}</p>
            </div>
            <button className="btn btn-outline dash-signout"
              onClick={async () => { await signOut(); navigate('/') }}>
              <i className="fas fa-sign-out-alt" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        <div className="container">
          <div className="stats-row">
            <div className="stat-item">
              <i className="fas fa-play-circle" />
              <div><span className="stat-num">{videos.length}</span><span className="stat-label">Videos Available</span></div>
            </div>
            <div className="stat-item">
              <i className="fas fa-graduation-cap" />
              <div><span className="stat-num">{profile.course}</span><span className="stat-label">Your Course</span></div>
            </div>
            <div className="stat-item">
              <i className="fas fa-check-circle" />
              <div><span className="stat-num" style={{ color: 'var(--green)' }}>Active</span><span className="stat-label">Account Status</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos */}
      <div className="dash-body">
        <div className="container">
          <div className="dash-videos-header">
            <h2><i className="fas fa-play-circle" /> {profile.course} Videos</h2>
            <div className="dash-search">
              <i className="fas fa-search" />
              <input type="text" placeholder="Search videos…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {fetching && (
            <div className="dash-fetching"><span className="spinner spinner-dark" /><p>Loading videos…</p></div>
          )}

          {!fetching && fetchErr && (
            <div className="dash-error">
              <i className="fas fa-exclamation-triangle" />
              <h3>Couldn't load videos</h3>
              <p>{fetchErr}</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }}
                onClick={() => { hasFetched.current = false; loadVideos(profile.course) }}>
                <i className="fas fa-sync-alt" /> Retry
              </button>
            </div>
          )}

          {!fetching && !fetchErr && filtered.length === 0 && (
            <div className="dash-empty">
              <i className="fas fa-video-slash" />
              <h3>{search ? 'No videos match your search' : 'No videos yet'}</h3>
              <p>{search ? 'Try different keywords.' : 'Videos for your course will appear here soon.'}</p>
            </div>
          )}

          {!fetching && !fetchErr && filtered.length > 0 && (
            <div className="dash-videos-grid">
              {filtered.map(v => (
                <VideoCard key={v.id} video={v} onClick={() => setPlaying(v)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
