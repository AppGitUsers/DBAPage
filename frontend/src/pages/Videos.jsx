import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './Videos.css'

const DEMO_VIDEOS = [
  { id: 1, title: 'Truncate and Delete in Oracle', description: 'This video explains about truncate and delete statements in Oracle', video_url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ', course: 'Oracle DBA' },
  { id: 2, title: 'Oracle Database Architecture', description: 'Deep dive into Oracle database architecture and memory structures', video_url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ', course: 'Oracle DBA' },
  { id: 3, title: 'PostgreSQL Installation', description: 'Step by step PostgreSQL installation and configuration guide', video_url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ', course: 'PostgreSQL DBA' },
  { id: 4, title: 'Oracle PL/SQL Basics', description: 'Introduction to PL/SQL programming in Oracle', video_url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ', course: 'Oracle Developer' },
  { id: 5, title: 'PostgreSQL Advanced Queries', description: 'Advanced query techniques in PostgreSQL', video_url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ', course: 'PostgreSQL Developer' },
  { id: 6, title: 'Oracle Backup & Recovery', description: 'RMAN backup and recovery strategies in Oracle', video_url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ', course: 'Oracle DBA' },
]

const CATEGORIES = ['All', 'Oracle DBA', 'Oracle Developer', 'PostgreSQL DBA', 'PostgreSQL Developer']

export default function Videos() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPublicVideos()
  }, [])

  const fetchPublicVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      setVideos(data?.length ? data : DEMO_VIDEOS)
    } catch {
      setVideos(DEMO_VIDEOS)
    } finally {
      setLoading(false)
    }
  }

  const getThumb = (url) => {
    const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null
  }

  const filtered = videos.filter(v => {
    const matchCat = filter === 'All' || v.course === filter
    const matchS   = v.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchS
  })

  return (
    <div className="videos-page">
      <div className="videos-hero">
        <div className="container">
          <h1>Training Videos</h1>
          <p>Watch our free Oracle & PostgreSQL training videos</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {/* Controls */}
          <div className="videos-controls">
            <div className="videos-search">
              <i className="fas fa-search" />
              <input placeholder="Search videos…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="video-filters">
              {CATEGORIES.map(c => (
                <button key={c} className={`filter-btn${filter === c ? ' active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <span className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray)' }}>
              <i className="fas fa-video-slash" style={{ fontSize: 48, display: 'block', marginBottom: 14, opacity: 0.3 }} />
              <p>No videos found</p>
            </div>
          ) : (
            <div className="vpage-grid">
              {filtered.map(v => (
                <a key={v.id} href={v.video_url} target="_blank" rel="noreferrer" className="vpage-card card">
                  <div className="vpage-thumb">
                    <img src={v.thumbnail_url || getThumb(v.video_url) || '/placeholder.jpg'} alt={v.title} />
                    <div className="vpage-overlay"><i className="fas fa-play" /></div>
                    <span className="vpage-badge">{v.course}</span>
                  </div>
                  <div className="vpage-body">
                    <h4>{v.title}</h4>
                    <p>{v.description}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
