import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import AuthForms from '../components/AuthForms'
import './Home.css'

/* ── FAQ data ── */
const FAQS = [
  { q: 'What is Oracle DBA training?', a: 'Our Oracle DBA training covers database installation, configuration, performance tuning, backup & recovery, security, and cloud solutions. Suitable for beginners and experienced professionals.' },
  { q: 'How are the sessions conducted?', a: 'Sessions are conducted online via video conferencing with live demonstrations, hands-on labs, and real-world scenarios. Recordings are provided for review.' },
  { q: 'What certifications can I prepare for?', a: 'We prepare students for Oracle Database Administrator Certified Professional (OCP) and Oracle Certified Associate (OCA) certifications.' },
  { q: 'Do you offer PostgreSQL training?', a: 'Yes! We offer both PostgreSQL Developer and PostgreSQL DBA courses with the same rigorous hands-on approach.' },
  { q: 'Is there any prerequisite for joining?', a: 'Basic knowledge of SQL is helpful but not mandatory. Our trainers will guide you from fundamentals to advanced topics.' },
  { q: 'What is the duration of each course?', a: 'Course duration varies: Oracle Developer (8 weeks), Oracle DBA (12 weeks), PostgreSQL Developer (8 weeks), PostgreSQL DBA (10 weeks).' },
]

/* ── Testimonials ── */
const TESTIMONIALS = [
  { name: 'Saul Goodman', role: 'CEO & Founder', text: 'Proin iaculis purus consequat sem cure digni ssim donec porttitora entum suscipit rhoncus. Accusantium quam, ultricies eget id, aliquam eget nibh et. Maecen aliquam, risus at semper.', img: 'https://i.pravatar.cc/80?img=11' },
  { name: 'Sara Wilsson', role: 'Designer', text: 'Export tempor illum tamen malis malis eram quae irure esse labore quem cillum quid cillum eram malis quorum velit fore eram velit sunt aliqua noster fugiat irure amet legam anim culpa.', img: 'https://i.pravatar.cc/80?img=25' },
  { name: 'Jena Karlis', role: 'Store Owner', text: 'Enim nisi quem export duis labore cillum quae magna enim sint quorum nulla quem veniam duis minim tempor labore quem eram duis noster aute amet eram fore quis sint minim.', img: 'https://i.pravatar.cc/80?img=32' },
  { name: 'Matt Brandon', role: 'Freelancer', text: 'Fugiat enim eram quae cillum dolore dolor amet nulla culpa multos export minim fugiat minim velit minim dolor enim duis veniam ipsum anim magna sunt elit fore quem dolore labore illum veniam.', img: 'https://i.pravatar.cc/80?img=55' },
  { name: 'John Larson', role: 'Entrepreneur', text: 'Quis quorum aliqua sint quem legam fore sunt eram irure aliqua veniam tempor noster veniam enim culpa labore duis sunt culpa nulla illum cillum fugiat legam esse veniam culpa fore nisi.', img: 'https://i.pravatar.cc/80?img=61' },
]

/* ── Placeholder videos ── */
const HOME_VIDEOS = [
  { id: 1, title: 'Truncate and Delete', desc: 'This video explains about truncate and delete statements in Oracle', thumb: 'https://img.youtube.com/vi/LXb3EKWsInQ/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ' },
  { id: 2, title: 'Truncate and Delete', desc: 'This video explains about truncate and delete statements in Oracle', thumb: 'https://img.youtube.com/vi/LXb3EKWsInQ/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ' },
  { id: 3, title: 'Truncate and Delete', desc: 'This video explains about truncate and delete statements in Oracle', thumb: 'https://img.youtube.com/vi/LXb3EKWsInQ/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ' },
  { id: 4, title: 'Truncate and Delete', desc: 'This video explains about truncate and delete statements in Oracle', thumb: 'https://img.youtube.com/vi/LXb3EKWsInQ/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ' },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button className="faq-trigger" onClick={() => setOpen(!open)}>
        {q}
        <i className={`fas fa-${open ? 'minus' : 'plus'}`} />
      </button>
      {open && <div className="faq-body">{a}</div>}
    </div>
  )
}

function TestimonialSlider() {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(t)
  }, [])
  const t = TESTIMONIALS[active]
  return (
    <div className="testimonial-slider">
      <div className="testimonial-card animate-fadeIn" key={active}>
        <p className="testimonial-text">"{t.text}"</p>
        <div className="testimonial-author">
          <img src={t.img} alt={t.name} />
          <div>
            <h5>{t.name}</h5>
            <span>{t.role}</span>
          </div>
        </div>
      </div>
      <div className="testimonial-dots">
        {TESTIMONIALS.map((_, i) => (
          <button key={i} className={`dot${i === active ? ' active' : ''}`} onClick={() => setActive(i)} />
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const { user, profile } = useAuth()
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [contactStatus, setContactStatus] = useState(null)

  // Back to top
  useEffect(() => {
    const btn = document.querySelector('.back-to-top')
    const onScroll = () => {
      if (btn) btn.classList.toggle('visible', window.scrollY > 300)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleContact = async (e) => {
    e.preventDefault()
    setContactStatus('sending')
    try {
      const { error } = await supabase.from('contact_messages').insert([contactForm])
      if (error) throw error
      setContactStatus('success')
      setContactForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      setContactStatus('error')
    }
  }

  return (
    <div className="home">

      {/* ─── HERO + LOGIN ─────────────────────────────── */}
      <section className="hero" id="hero">
        <div className="hero-overlay" />
        <div className="container hero-inner">
          {/* Left: Welcome text */}
          <div className="hero-content animate-fadeInUp">
            <h1>Welcome to DBA Page</h1>
            <p>We are a team of talented trainers teaching you niche skill sets in Oracle & PostgreSQL database technologies.</p>
            <div className="hero-btns">
              <a href="#about" className="btn btn-primary" onClick={e => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) }}>
                Get Started
              </a>
              <a href="https://www.youtube.com/watch?v=LXb3EKWsInQ" target="_blank" rel="noreferrer" className="btn btn-outline">
                <i className="fas fa-play-circle" /> Watch Video
              </a>
            </div>

            {/* Feature icons */}
            <div className="hero-features">
              <div className="hero-feature">
                <i className="fas fa-database" />
                <div>
                  <h4>Expert Training</h4>
                  <p>25+ years of Oracle & PostgreSQL expertise</p>
                </div>
              </div>
              <div className="hero-feature">
                <i className="fas fa-laptop-code" />
                <div>
                  <h4>Hands-On Labs</h4>
                  <p>Practical exercises with real-time scenarios</p>
                </div>
              </div>
              <div className="hero-feature">
                <i className="fas fa-certificate" />
                <div>
                  <h4>Certification Ready</h4>
                  <p>Tailored coaching for Oracle certifications</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Auth form */}
          <div className="hero-auth animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
            {user && profile ? (
              <div className="hero-logged-in">
                <div className="hero-avatar">
                  <i className="fas fa-user-circle" />
                </div>
                <h3>Welcome back, {profile.name?.split(' ')[0]}!</h3>
                <p>Enrolled in: <strong>{profile.course}</strong></p>
                {profile.approved ? (
                  <Link to="/dashboard" className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}>
                    <i className="fas fa-play" /> Go to My Videos
                  </Link>
                ) : (
                  <div className="alert alert-warning" style={{ marginTop: 16 }}>
                    <i className="fas fa-clock" />
                    Your account is pending admin approval. You'll receive access once approved.
                  </div>
                )}
              </div>
            ) : (
              <AuthForms />
            )}
          </div>
        </div>
      </section>

      {/* ─── ABOUT ───────────────────────────────────── */}
      <section className="section" id="about">
        <div className="container">
          <div className="section-title">
            <h2>About</h2>
            <p>Find Out More About Us</p>
          </div>
          <div className="about-grid">
            <div className="about-img">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80" alt="About DBA Page" />
            </div>
            <div className="about-content">
              <h3>Expert Oracle / PostgreSQL DBA cum Trainer — 25 Years of Experience.</h3>
              <p>Team of talents, a seasoned Oracle/PostgreSQL Database Architects cum trainers with 25 years of expertise in database management, optimization, and security. Having trained hundreds of professionals globally, and brings a deep understanding of database architecture, performance tuning, and real-world problem-solving.</p>

              <div className="about-lists">
                <div>
                  <h4><i className="fas fa-check-circle" /> Key Expertise</h4>
                  <ul>
                    <li>✔ Database Administration — Mastering Oracle database installation, configuration, and management.</li>
                    <li>✔ Performance Optimization — Advanced tuning techniques for high-speed and efficient database operations.</li>
                    <li>✔ Backup & Recovery Strategies — Ensuring data protection and disaster recovery readiness.</li>
                    <li>✔ Security Best Practices — Implementing robust security protocols.</li>
                    <li>✔ Cloud & Enterprise Solutions — Oracle Cloud, on-premise, and hybrid infrastructure.</li>
                  </ul>
                </div>
                <div>
                  <h4><i className="fas fa-graduation-cap" /> Training Highlights</h4>
                  <ul>
                    <li>✔ Interactive Learning — Engaging sessions with real-world case studies.</li>
                    <li>✔ Hands-On Labs — Practical exercises in real-time database scenarios.</li>
                    <li>✔ Personalized Mentorship — One-on-one guidance for individual challenges.</li>
                    <li>✔ Certification Preparation — Tailored coaching for Oracle DBA exams.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES (4 boxes) ──────────────────────── */}
      <section className="features-section section section-bg" id="features">
        <div className="container">
          <div className="features-grid">
            {[
              { icon: 'fa-database', title: 'Lorem Ipsum', desc: 'Voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi' },
              { icon: 'fa-server', title: 'Sed ut perspici', desc: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore' },
              { icon: 'fa-shield-alt', title: 'Magni Dolores', desc: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia' },
              { icon: 'fa-user-graduate', title: 'Nemo Enim', desc: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis' },
            ].map((f, i) => (
              <div className="feature-card card" key={i}>
                <div className="feature-icon"><i className={`fas ${f.icon}`} /></div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ────────────────────────────────── */}
      <section className="section" id="services">
        <div className="container">
          <div className="section-title">
            <h2>Services</h2>
            <p>What We Offer</p>
          </div>
          <div className="services-grid">
            {[
              { icon: 'fa-database', title: 'Oracle Developer', link: '/courses/oracle-developer', desc: 'Learn Oracle SQL, PL/SQL, stored procedures, functions, packages, and triggers for application development.' },
              { icon: 'fa-server', title: 'Oracle DBA', link: '/courses/oracle-dba', desc: 'Master Oracle database administration, performance tuning, backup & recovery, and security best practices.' },
              { icon: 'fa-layer-group', title: 'PostgreSQL Developer', link: '/courses/postgresql-developer', desc: 'Comprehensive PostgreSQL training covering advanced SQL, stored procedures, and database design.' },
              { icon: 'fa-cogs', title: 'PostgreSQL DBA', link: '/courses/postgresql-dba', desc: 'Learn PostgreSQL administration, replication, performance tuning, and high availability configurations.' },
              { icon: 'fa-cloud', title: 'Cloud DBA', link: '#', desc: 'Oracle and PostgreSQL on cloud platforms — AWS RDS, Oracle Cloud, Azure Database services.' },
              { icon: 'fa-headset', title: 'Mentorship', link: '#', desc: 'One-on-one personalized sessions for career growth, interview prep, and certification guidance.' },
            ].map((s, i) => (
              <div className="service-card card" key={i}>
                <div className="service-icon"><i className={`fas ${s.icon}`} /></div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
                <Link to={s.link} className="service-link">Learn More <i className="fas fa-arrow-right" /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────────── */}
      <section className="testimonials-section" id="testimonials">
        <div className="testimonials-bg-overlay" />
        <div className="container">
          <div className="section-title" style={{ color: '#fff' }}>
            <h2 style={{ color: '#fff' }}>Testimonials</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>What Our Students Say</p>
          </div>
          <TestimonialSlider />
        </div>
      </section>

      {/* ─── VIDEOS ──────────────────────────────────── */}
      <section className="section section-bg" id="videos">
        <div className="container">
          <div className="section-title">
            <h2>Videos</h2>
            <p>Our Videos</p>
          </div>
          <div className="videos-grid">
            {HOME_VIDEOS.map(v => (
              <a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="video-card card">
                <div className="video-thumb">
                  <img src={v.thumb} alt={v.title} />
                  <div className="video-play"><i className="fas fa-play" /></div>
                </div>
                <div className="video-info">
                  <h5>{v.title}</h5>
                  <p>{v.desc}</p>
                </div>
              </a>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/videos" className="btn btn-primary">View All Videos</Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────── */}
      <section className="section" id="faq">
        <div className="container">
          <div className="section-title">
            <h2>F.A.Q</h2>
            <p>Frequently Asked Questions</p>
          </div>
          <div className="faq-grid">
            {FAQS.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─────────────────────────────────── */}
      <section className="section section-bg" id="contact">
        <div className="container">
          <div className="section-title">
            <h2>Contact</h2>
            <p>Need Help? Contact Us</p>
          </div>
          <div className="contact-grid">
            {/* Info */}
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon"><i className="fas fa-map-marker-alt" /></div>
                <div>
                  <h4>Address</h4>
                  <p>Yelahanka, Bangalore</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon"><i className="fas fa-phone" /></div>
                <div>
                  <h4>Call Me</h4>
                  <p>+91 9980588044</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon"><i className="fas fa-envelope" /></div>
                <div>
                  <h4>Email Us</h4>
                  <p>gopi.orafly@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form className="contact-form" onSubmit={handleContact}>
              {contactStatus === 'success' && <div className="alert alert-success"><i className="fas fa-check" /> Message sent successfully!</div>}
              {contactStatus === 'error'   && <div className="alert alert-error"><i className="fas fa-times" /> Something went wrong. Try again.</div>}

              <div className="form-row">
                <div className="form-group">
                  <input className="form-control" placeholder="Your Name" required value={contactForm.name} onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <input className="form-control" type="email" placeholder="Your Email" required value={contactForm.email} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <input className="form-control" placeholder="Subject" required value={contactForm.subject} onChange={e => setContactForm(p => ({ ...p, subject: e.target.value }))} />
              </div>
              <div className="form-group">
                <textarea className="form-control" rows={5} placeholder="Message" required value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={contactStatus === 'sending'}>
                {contactStatus === 'sending' ? <><span className="spinner" /> Sending…</> : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Back to top */}
      <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <i className="fas fa-arrow-up" />
      </button>
    </div>
  )
}
