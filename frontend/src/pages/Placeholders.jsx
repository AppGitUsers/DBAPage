import { Link } from 'react-router-dom'

function ComingSoon({ title, icon }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
      <i className={`fas ${icon}`} style={{ fontSize: 64, color: 'var(--primary)', marginBottom: 20, opacity: 0.4 }} />
      <h2 style={{ fontSize: 28, marginBottom: 12 }}>{title}</h2>
      <p style={{ color: 'var(--gray)', marginBottom: 28 }}>This section is coming soon. Check back later!</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  )
}

export function Quiz()               { return <ComingSoon title="Quiz"               icon="fa-question-circle" /> }
export function Blogs()              { return <ComingSoon title="Blogs"              icon="fa-blog" /> }
export function Labs()               { return <ComingSoon title="Labs"               icon="fa-flask" /> }
export function InterviewQuestions() { return <ComingSoon title="Interview Questions" icon="fa-comments" /> }
