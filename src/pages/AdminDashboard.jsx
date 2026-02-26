import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AdminDashboard.css'

const ADMIN_EMAIL    = 'admin@dbapage.com'
const ADMIN_PASSWORD = 'DBAadmin@2024'

const COURSES = ['Oracle Developer', 'Oracle DBA', 'PostgreSQL Developer', 'PostgreSQL DBA']

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false)
  const [tab,    setTab]    = useState('candidates')
  const navigate = useNavigate()

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />

  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <i className="fas fa-database" />
          <span>DBA<b>Admin</b></span>
        </div>

        <nav className="admin-nav">
          <button className={`admin-nav-btn${tab === 'candidates' ? ' active' : ''}`} onClick={() => setTab('candidates')}>
            <i className="fas fa-users" /> Candidates
          </button>
          <button className={`admin-nav-btn${tab === 'videos' ? ' active' : ''}`} onClick={() => setTab('videos')}>
            <i className="fas fa-video" /> Videos
          </button>
          <button className={`admin-nav-btn${tab === 'messages' ? ' active' : ''}`} onClick={() => setTab('messages')}>
            <i className="fas fa-envelope" /> Messages
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout" onClick={() => { setAuthed(false); navigate('/') }}>
            <i className="fas fa-sign-out-alt" /> Exit Admin
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {tab === 'candidates' && <CandidatesPanel />}
        {tab === 'videos'     && <VideosPanel />}
        {tab === 'messages'   && <MessagesPanel />}
      </main>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   LOGIN GATE
───────────────────────────────────────────────────────────────────────────── */
function AdminLogin({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        onLogin()
      } else {
        setError('Invalid admin credentials.')
      }
      setLoading(false)
    }, 400)
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-icon"><i className="fas fa-shield-alt" /></div>
        <h2>Admin Access</h2>
        <p>DBA Page Administration Panel</p>
        {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle" /> {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <div className="input-wrap">
              <i className="fas fa-envelope input-icon" />
              <input type="email" className="form-control has-icon" placeholder="admin@dbapage.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <i className="fas fa-lock input-icon" />
              <input type="password" className="form-control has-icon" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Verifying…</> : 'Enter Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   CANDIDATES PANEL
───────────────────────────────────────────────────────────────────────────── */
function CandidatesPanel() {
  const [candidates, setCandidates] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('all')
  const [search,     setSearch]     = useState('')
  const [toast,      setToast]      = useState(null)
  const [deleting,   setDeleting]   = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (!error) setCandidates(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchCandidates() }, [fetchCandidates])

  const toggleApproval = async (candidate) => {
    const newVal = !candidate.approved
    const { error } = await supabase.from('profiles').update({ approved: newVal }).eq('id', candidate.id)
    if (error) {
      showToast('Failed to update approval status.', 'error')
    } else {
      setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, approved: newVal } : c))
      showToast(newVal ? `✓ ${candidate.name} approved.` : `${candidate.name} revoked.`, newVal ? 'success' : 'warning')
    }
  }

  const deleteCandidate = async (id) => {
    setDeleting(id)
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) {
      showToast('Failed to delete candidate.', 'error')
    } else {
      setCandidates(prev => prev.filter(c => c.id !== id))
      showToast('Candidate removed successfully.')
    }
    setDeleting(null)
    setConfirmDel(null)
  }

  const filtered = candidates.filter(c => {
    const matchF = filter === 'all' || (filter === 'pending' && !c.approved) || (filter === 'approved' && c.approved)
     const q = search.toLowerCase()
    const matchS = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || (c.contact || '').toLowerCase().includes(q) || c.course.toLowerCase().includes(search.toLowerCase())
    return matchF && matchS
  })

  const pending  = candidates.filter(c => !c.approved).length
  const approved = candidates.filter(c =>  c.approved).length

  return (
    <div className="admin-panel">
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          <i className={`fas fa-${toast.type === 'success' ? 'check-circle' : toast.type === 'warning' ? 'exclamation-triangle' : 'times-circle'}`} />
          {toast.msg}
        </div>
      )}

      <div className="admin-panel-header">
        <div><h1>Candidates</h1><p>Manage student registrations and approvals</p></div>
        <button className="btn btn-primary" onClick={fetchCandidates}><i className="fas fa-sync-alt" /> Refresh</button>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card"><i className="fas fa-users" /><div><span className="asn">{candidates.length}</span><span className="asl">Total Registered</span></div></div>
        <div className="admin-stat-card admin-stat-card--warning"><i className="fas fa-clock" /><div><span className="asn">{pending}</span><span className="asl">Pending Approval</span></div></div>
        <div className="admin-stat-card admin-stat-card--success"><i className="fas fa-check-circle" /><div><span className="asn">{approved}</span><span className="asl">Approved</span></div></div>
      </div>

      <div className="admin-controls">
        <div className="admin-search">
          <i className="fas fa-search" />
          <input placeholder="Search by name, email or course…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="admin-filters">
          {['all', 'pending', 'approved'].map(f => (
            <button key={f} className={`filter-chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'pending' ? `Pending (${pending})` : `Approved (${approved})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="admin-loading"><span className="spinner spinner-dark" /> Loading candidates…</div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty"><i className="fas fa-user-slash" /><p>No candidates found</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Contact</th><th>Course</th><th>Registered</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="candidate-name">
                      <div className="candidate-avatar">{c.name.charAt(0).toUpperCase()}</div>
                      {c.name}
                    </div>
                  </td>
                  <td className="td-email">{c.email}</td>
                  <td>{c.contact || '—'}</td> 
                  <td><span className="course-tag">{c.course}</span></td>
                  <td className="td-date">{new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <span className={`status-badge ${c.approved ? 'status-approved' : 'status-pending'}`}>
                      <i className={`fas fa-${c.approved ? 'check' : 'clock'}`} />
                      {c.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className={`action-btn ${c.approved ? 'action-btn--revoke' : 'action-btn--approve'}`} onClick={() => toggleApproval(c)}>
                        <i className={`fas fa-${c.approved ? 'ban' : 'check'}`} />
                        {c.approved ? 'Revoke' : 'Approve'}
                      </button>
                      <button className="action-btn action-btn--delete" onClick={() => setConfirmDel(c)}><i className="fas fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDel && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-icon admin-modal-icon--danger"><i className="fas fa-trash" /></div>
            <h3>Delete Candidate?</h3>
            <p>Remove <strong>{confirmDel.name}</strong>? This cannot be undone.</p>
            <div className="admin-modal-btns">
              <button className="btn btn-outline" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="btn admin-btn-danger" disabled={deleting === confirmDel.id} onClick={() => deleteCandidate(confirmDel.id)}>
                {deleting === confirmDel.id ? <><span className="spinner" /> Deleting…</> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   VIDEOS PANEL
───────────────────────────────────────────────────────────────────────────── */
function VideosPanel() {
  const [videos,     setVideos]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('All')
  const [search,     setSearch]     = useState('')
  const [showForm,   setShowForm]   = useState(false)
  const [editVideo,  setEditVideo]  = useState(null)
  const [toast,      setToast]      = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [deleting,   setDeleting]   = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500) }

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false })
    if (!error) setVideos(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchVideos() }, [fetchVideos])

  const deleteVideo = async (id) => {
    setDeleting(id)
    const { error } = await supabase.from('videos').delete().eq('id', id)
    if (error) { showToast('Failed to delete video.', 'error') }
    else { setVideos(prev => prev.filter(v => v.id !== id)); showToast('Video deleted successfully.') }
    setDeleting(null); setConfirmDel(null)
  }

  const togglePublic = async (video) => {
    const { error } = await supabase.from('videos').update({ is_public: !video.is_public }).eq('id', video.id)
    if (!error) {
      setVideos(prev => prev.map(v => v.id === video.id ? { ...v, is_public: !v.is_public } : v))
      showToast(!video.is_public ? 'Video is now public.' : 'Video is now private.')
    }
  }

  const handleSaved = (video) => {
    setVideos(prev => {
      const exists = prev.find(v => v.id === video.id)
      return exists ? prev.map(v => v.id === video.id ? video : v) : [video, ...prev]
    })
    setShowForm(false); setEditVideo(null)
    showToast(editVideo ? 'Video updated!' : 'Video added!')
  }

  const filtered = videos.filter(v => {
    const matchC = filter === 'All' || v.course === filter
    const matchS = v.title.toLowerCase().includes(search.toLowerCase())
    return matchC && matchS
  })

  return (
    <div className="admin-panel">
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          <i className={`fas fa-${toast.type === 'success' ? 'check-circle' : 'times-circle'}`} />
          {toast.msg}
        </div>
      )}

      <div className="admin-panel-header">
        <div><h1>Videos</h1><p>Manage training video links for all courses</p></div>
        <button className="btn btn-primary" onClick={() => { setEditVideo(null); setShowForm(true) }}><i className="fas fa-plus" /> Add Video</button>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card"><i className="fas fa-video" /><div><span className="asn">{videos.length}</span><span className="asl">Total Videos</span></div></div>
        <div className="admin-stat-card admin-stat-card--success"><i className="fas fa-globe" /><div><span className="asn">{videos.filter(v => v.is_public).length}</span><span className="asl">Public</span></div></div>
        <div className="admin-stat-card admin-stat-card--info"><i className="fas fa-lock" /><div><span className="asn">{videos.filter(v => !v.is_public).length}</span><span className="asl">Private (course-only)</span></div></div>
      </div>

      <div className="admin-controls">
        <div className="admin-search">
          <i className="fas fa-search" />
          <input placeholder="Search videos…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="admin-filters">
          {['All', ...COURSES].map(c => (
            <button key={c} className={`filter-chip${filter === c ? ' active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="admin-loading"><span className="spinner spinner-dark" /> Loading videos…</div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty"><i className="fas fa-video-slash" /><p>No videos found</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Course</th><th>Visibility</th><th>Duration</th><th>Added</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(v => {
                const ytId = v.video_url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1]
                return (
                  <tr key={v.id}>
                    <td>
                      <div className="video-row-title">
                        {ytId && <img src={`https://img.youtube.com/vi/${ytId}/default.jpg`} alt="" className="video-thumb-sm" />}
                        <div>
                          <div className="video-row-name">{v.title}</div>
                          {v.description && <div className="video-row-desc">{v.description.slice(0, 60)}{v.description.length > 60 ? '…' : ''}</div>}
                        </div>
                      </div>
                    </td>
                    <td><span className="course-tag">{v.course}</span></td>
                    <td>
                      <button className={`visibility-toggle ${v.is_public ? 'vis-public' : 'vis-private'}`} onClick={() => togglePublic(v)}>
                        <i className={`fas fa-${v.is_public ? 'globe' : 'lock'}`} />
                        {v.is_public ? 'Public' : 'Private'}
                      </button>
                    </td>
                    <td className="td-date">{v.duration || '—'}</td>
                    <td className="td-date">{new Date(v.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <div className="action-btns">
                        <a href={v.video_url} target="_blank" rel="noreferrer" className="action-btn action-btn--view"><i className="fas fa-external-link-alt" /></a>
                        <button className="action-btn action-btn--approve" onClick={() => { setEditVideo(v); setShowForm(true) }}><i className="fas fa-pen" /></button>
                        <button className="action-btn action-btn--delete" onClick={() => setConfirmDel(v)}><i className="fas fa-trash" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <VideoFormModal video={editVideo} onClose={() => { setShowForm(false); setEditVideo(null) }} onSaved={handleSaved} />}

      {confirmDel && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-icon admin-modal-icon--danger"><i className="fas fa-trash" /></div>
            <h3>Delete Video?</h3>
            <p>Remove <strong>{confirmDel.title}</strong>? This cannot be undone.</p>
            <div className="admin-modal-btns">
              <button className="btn btn-outline" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="btn admin-btn-danger" disabled={deleting === confirmDel.id} onClick={() => deleteVideo(confirmDel.id)}>
                {deleting === confirmDel.id ? <><span className="spinner" /> Deleting…</> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   VIDEO FORM MODAL
───────────────────────────────────────────────────────────────────────────── */
function VideoFormModal({ video, onClose, onSaved }) {
  const isEdit = !!video
  const [form, setForm] = useState({
    title:         video?.title         || '',
    description:   video?.description   || '',
    video_url:     video?.video_url     || '',
    course:        video?.course        || '',
    duration:      video?.duration      || '',
    is_public:     video?.is_public     ?? false,
    thumbnail_url: video?.thumbnail_url || '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState(null)

  const ytId = form.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null); setSaving(true)
    const payload = {
      title:         form.title.trim(),
      description:   form.description.trim() || null,
      video_url:     form.video_url.trim(),
      course:        form.course,
      duration:      form.duration.trim() || null,
      is_public:     form.is_public,
      thumbnail_url: form.thumbnail_url.trim() || null,
    }
    try {
      if (isEdit) {
        const { data, error } = await supabase.from('videos').update(payload).eq('id', video.id).select().single()
        if (error) throw error
        onSaved(data)
      } else {
        const { data, error } = await supabase.from('videos').insert([payload]).select().single()
        if (error) throw error
        onSaved(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal--wide" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3><i className="fas fa-video" /> {isEdit ? 'Edit Video' : 'Add New Video'}</h3>
          <button className="modal-close" onClick={onClose}><i className="fas fa-times" /></button>
        </div>
        {error && <div className="alert alert-error" style={{ margin: '0 0 16px' }}><i className="fas fa-exclamation-circle" /> {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Video Title *</label>
              <input className="form-control" placeholder="e.g. Oracle Architecture Overview" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Course *</label>
              <select className="form-control" required value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))}>
                <option value="">— Select Course —</option>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">YouTube / Video URL *</label>
            <input className="form-control" type="url" placeholder="https://www.youtube.com/watch?v=..." required value={form.video_url} onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))} />
          </div>
          {ytId && (
            <div className="yt-preview">
              <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="thumbnail" />
              <div><p className="yt-preview-label">YouTube thumbnail detected</p><p className="yt-preview-id">Video ID: {ytId}</p></div>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={3} placeholder="Brief description…" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Duration (optional)</label>
              <input className="form-control" placeholder="e.g. 45:30" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Custom Thumbnail URL (optional)</label>
              <input className="form-control" type="url" placeholder="Leave blank for YouTube auto-thumbnail" value={form.thumbnail_url} onChange={e => setForm(p => ({ ...p, thumbnail_url: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="visibility-label">
              <div className="toggle-switch">
                <input type="checkbox" checked={form.is_public} onChange={e => setForm(p => ({ ...p, is_public: e.target.checked }))} />
                <span className="toggle-track" />
              </div>
              <div>
                <span className="form-label" style={{ marginBottom: 0 }}>{form.is_public ? 'Public' : 'Private'}</span>
                <p className="visibility-hint">{form.is_public ? 'Visible on the public /videos page to everyone.' : 'Only accessible to approved students of this course.'}</p>
              </div>
            </label>
          </div>
          <div className="admin-modal-btns">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" /> Saving…</> : <><i className={`fas fa-${isEdit ? 'save' : 'plus'}`} /> {isEdit ? 'Save Changes' : 'Add Video'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   MESSAGES PANEL
───────────────────────────────────────────────────────────────────────────── */
function MessagesPanel() {
  const [messages,   setMessages]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState('all')  // 'all' | 'unread' | 'read'
  const [selected,   setSelected]   = useState(null)   // message open in detail view
  const [confirmDel, setConfirmDel] = useState(null)
  const [deleting,   setDeleting]   = useState(null)
  const [toast,      setToast]      = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500) }

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setMessages(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  // Mark as read when opening a message
  const openMessage = async (msg) => {
    setSelected(msg)
    if (!msg.is_read) {
      const { error } = await supabase.from('contact_messages').update({ is_read: true }).eq('id', msg.id)
      if (!error) {
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m))
        setSelected(prev => prev ? { ...prev, is_read: true } : prev)
      }
    }
  }

  const markUnread = async (msg) => {
    const { error } = await supabase.from('contact_messages').update({ is_read: false }).eq('id', msg.id)
    if (!error) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: false } : m))
      setSelected(null)
      showToast('Marked as unread.')
    }
  }

  const deleteMessage = async (id) => {
    setDeleting(id)
    const { error } = await supabase.from('contact_messages').delete().eq('id', id)
    if (error) {
      showToast('Failed to delete message.', 'error')
    } else {
      setMessages(prev => prev.filter(m => m.id !== id))
      if (selected?.id === id) setSelected(null)
      showToast('Message deleted.')
    }
    setDeleting(null)
    setConfirmDel(null)
  }

  const filtered = messages.filter(m => {
    const matchF = filter === 'all' || (filter === 'unread' && !m.is_read) || (filter === 'read' && m.is_read)
    const q = search.toLowerCase()
    const matchS = m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || (m.subject || '').toLowerCase().includes(q) || m.message.toLowerCase().includes(q)
    return matchF && matchS
  })

  const unreadCount = messages.filter(m => !m.is_read).length
  const readCount   = messages.filter(m =>  m.is_read).length

  return (
    <div className="admin-panel">
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          <i className={`fas fa-${toast.type === 'success' ? 'check-circle' : 'times-circle'}`} />
          {toast.msg}
        </div>
      )}

      <div className="admin-panel-header">
        <div>
          <h1>Contact Messages</h1>
          <p>Messages sent via the contact form</p>
        </div>
        <button className="btn btn-primary" onClick={fetchMessages}><i className="fas fa-sync-alt" /> Refresh</button>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <i className="fas fa-envelope" />
          <div><span className="asn">{messages.length}</span><span className="asl">Total Messages</span></div>
        </div>
        <div className="admin-stat-card admin-stat-card--warning">
          <i className="fas fa-envelope-open" />
          <div><span className="asn">{unreadCount}</span><span className="asl">Unread</span></div>
        </div>
        <div className="admin-stat-card admin-stat-card--success">
          <i className="fas fa-check-double" />
          <div><span className="asn">{readCount}</span><span className="asl">Read</span></div>
        </div>
      </div>

      {/* Controls */}
      <div className="admin-controls">
        <div className="admin-search">
          <i className="fas fa-search" />
          <input placeholder="Search by name, email, subject…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="admin-filters">
          {['all', 'unread', 'read'].map(f => (
            <button key={f} className={`filter-chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'unread' ? `Unread (${unreadCount})` : `Read (${readCount})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="admin-loading"><span className="spinner spinner-dark" /> Loading messages…</div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty"><i className="fas fa-inbox" /><p>No messages found</p></div>
      ) : (
        <div className="messages-layout">
          {/* Message list */}
          <div className="msg-list">
            {filtered.map(m => (
              <div
                key={m.id}
                className={`msg-item${!m.is_read ? ' msg-item--unread' : ''}${selected?.id === m.id ? ' msg-item--active' : ''}`}
                onClick={() => openMessage(m)}
              >
                <div className="msg-item-top">
                  <div className="msg-avatar">{m.name.charAt(0).toUpperCase()}</div>
                  <div className="msg-item-meta">
                    <div className="msg-item-name">
                      {!m.is_read && <span className="unread-dot" />}
                      {m.name}
                    </div>
                    <div className="msg-item-email">{m.email}</div>
                    <div className="msg-item-contact">{m.contact}</div>
                  </div>
                  <div className="msg-item-date">
                    {new Date(m.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
                <div className="msg-item-subject">{m.subject || '(No subject)'}</div>
                <div className="msg-item-preview">{m.message.slice(0, 80)}{m.message.length > 80 ? '…' : ''}</div>
              </div>
            ))}
          </div>

          {/* Detail pane */}
          <div className="msg-detail">
            {selected ? (
              <>
                <div className="msg-detail-header">
                  <div>
                    <h2 className="msg-detail-subject">{selected.subject || '(No subject)'}</h2>
                    <div className="msg-detail-from">
                      <strong>{selected.name}</strong>
                      <span className="msg-detail-email">&lt;{selected.email}&gt;</span>
                      <div className="msg-item-contact">{selected.contact}</div>
                    </div>
                    <div className="msg-detail-time">
                      {new Date(selected.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="msg-detail-actions">
                    <a
                      href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || '')}&body=${encodeURIComponent('\n\n---\nOriginal message:\n' + selected.message)}`}
                      className="action-btn action-btn--approve"
                      title="Reply via email"
                    >
                      <i className="fas fa-reply" /> Reply
                    </a>
                    <button
                      className="action-btn action-btn--view"
                      onClick={() => markUnread(selected)}
                      title="Mark as unread"
                    >
                      <i className="fas fa-envelope" /> Mark Unread
                    </button>
                    <button
                      className="action-btn action-btn--delete"
                      onClick={() => setConfirmDel(selected)}
                      title="Delete"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </div>

                <div className="msg-detail-body">
                  {selected.message.split('\n').map((line, i) => (
                    <p key={i}>{line || <br />}</p>
                  ))}
                </div>
              </>
            ) : (
              <div className="msg-detail-empty">
                <i className="fas fa-envelope-open-text" />
                <p>Select a message to read it</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDel && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-icon admin-modal-icon--danger"><i className="fas fa-trash" /></div>
            <h3>Delete Message?</h3>
            <p>Remove the message from <strong>{confirmDel.name}</strong>? This cannot be undone.</p>
            <div className="admin-modal-btns">
              <button className="btn btn-outline" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="btn admin-btn-danger" disabled={deleting === confirmDel.id} onClick={() => deleteMessage(confirmDel.id)}>
                {deleting === confirmDel.id ? <><span className="spinner" /> Deleting…</> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
