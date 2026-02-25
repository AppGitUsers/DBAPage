import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './Dashboard.css'

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [videos, setVideos] = useState([])
  const [fetching, setFetching] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      navigate('/')
    }
    if (!loading && profile && !profile.approved) {
      navigate('/')
    }
  }, [user, profile, loading, navigate])

  useEffect(() => {
    if (profile?.approved) fetchVideos()
  }, [profile])

  const fetchVideos = async () => {
    setFetching(true)
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('course', profile.course)
        .order('created_at', { ascending: false })
      if (error) throw error
      setVideos(data || [])
    } catch (err) {
      console.error('Error fetching videos:', err)
    } finally {
      setFetching(false)
    }
  }

  const filtered = videos.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    (v.description || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading || !profile) {
    return (
      <div className="dash-loading">
        <span className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
        <p>Loading your dashboard…</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
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
            <button className="btn btn-outline dash-signout" onClick={async () => { await signOut(); navigate('/') }}>
              <i className="fas fa-sign-out-alt" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="dash-stats">
        <div className="container">
          <div className="stats-row">
            <div className="stat-item">
              <i className="fas fa-play-circle" />
              <div>
                <span className="stat-num">{videos.length}</span>
                <span className="stat-label">Videos Available</span>
              </div>
            </div>
            <div className="stat-item">
              <i className="fas fa-graduation-cap" />
              <div>
                <span className="stat-num">{profile.course}</span>
                <span className="stat-label">Your Course</span>
              </div>
            </div>
            <div className="stat-item">
              <i className="fas fa-check-circle" />
              <div>
                <span className="stat-num" style={{ color: 'var(--green)' }}>Active</span>
                <span className="stat-label">Account Status</span>
              </div>
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
              <input
                type="text"
                placeholder="Search videos…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {fetching ? (
            <div className="dash-fetching">
              <span className="spinner spinner-dark" />
              <p>Loading videos…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="dash-empty">
              <i className="fas fa-video-slash" />
              <h3>{search ? 'No videos match your search' : 'No videos yet'}</h3>
              <p>{search ? 'Try different keywords.' : 'Videos for your course will appear here soon.'}</p>
            </div>
          ) : (
            <div className="dash-videos-grid">
              {filtered.map(v => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function VideoCard({ video }) {
  // Extract YouTube ID
  const getThumb = (url) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null
  }
  const thumb = video.thumbnail_url || getThumb(video.video_url)

  return (
    <a href={video.video_url} target="_blank" rel="noreferrer" className="dash-video-card card">
      <div className="dash-video-thumb">
        {thumb ? (
          <img src={thumb} alt={video.title} />
        ) : (
          <div className="dash-video-placeholder">
            <i className="fas fa-play-circle" />
          </div>
        )}
        <div className="dash-video-overlay"><i className="fas fa-play" /></div>
        <span className="dash-video-badge">{video.course}</span>
      </div>
      <div className="dash-video-info">
        <h4>{video.title}</h4>
        {video.description && <p>{video.description}</p>}
        {video.duration && <span className="dash-video-duration"><i className="fas fa-clock" /> {video.duration}</span>}
      </div>
    </a>
  )
}
