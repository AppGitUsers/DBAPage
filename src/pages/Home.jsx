import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import AuthForms from '../components/AuthForms'
import './Home.css'

const FAQS = [
  { q: 'What is Oracle DBA training?', a: 'Our Oracle DBA training covers database installation, configuration, performance tuning, backup & recovery, security, and cloud solutions. Suitable for beginners and experienced professionals.' },
  { q: 'How are the sessions conducted?', a: 'Sessions are conducted online via video conferencing with live demonstrations, hands-on labs, and real-world scenarios. Recordings are provided for review.' },
  { q: 'What certifications can I prepare for?', a: 'We prepare students for Oracle Database Administrator Certified Professional (OCP) and Oracle Certified Associate (OCA) certifications.' },
  { q: 'Do you offer PostgreSQL training?', a: 'Yes! We offer both PostgreSQL Developer and PostgreSQL DBA courses with the same rigorous hands-on approach.' },
  { q: 'Is there any prerequisite for joining?', a: 'Basic knowledge of SQL is helpful but not mandatory. Our trainers will guide you from fundamentals to advanced topics.' },
  { q: 'What is the duration of each course?', a: 'Course duration varies: Oracle Developer (8 weeks), Oracle DBA (12 weeks), PostgreSQL Developer (8 weeks), PostgreSQL DBA (10 weeks).' },
]

const TESTIMONIALS = [
  {
    name: 'Arjun Mehta',
    role: 'Full Stack Development Student',
    text: 'The structured video lessons and real-time projects helped me understand concepts clearly. The certification added real value to my resume, and I successfully secured an internship within 3 months of completing the course.',
    img: 'https://i.pravatar.cc/80?img=12'
  },
  {
    name: 'Priya Sharma',
    role: 'UI/UX Design Student',
    text: 'What I loved most was the practical assignments and portfolio guidance. The mentors were supportive, and the internship support gave me the confidence to apply for real design roles.',
    img: 'https://i.pravatar.cc/80?img=24'
  },
  {
    name: 'Rahul Verma',
    role: 'Data Science Student',
    text: 'The hands-on labs and real industry case studies made learning engaging and practical. The certification and career support sessions helped me crack my first job interview.',
    img: 'https://i.pravatar.cc/80?img=33'
  },
  {
    name: 'Sneha Iyer',
    role: 'Backend Development Student',
    text: 'Unlike other platforms, this course focused on real-world implementation. The internship opportunity after course completion was a game-changer for my career.',
    img: 'https://i.pravatar.cc/80?img=47'
  },
  {
    name: 'Karthik Reddy',
    role: 'Cloud & DevOps Student',
    text: 'The step-by-step learning path and live project experience helped me build strong technical confidence. The mentorship and placement guidance truly set this platform apart.',
    img: 'https://i.pravatar.cc/80?img=58'
  },
]
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

/* ── Auth panel shown in hero ───────────────────────────────────────────────
   Rules:
   - loading OR profileLoading  →  show skeleton (prevents flash of wrong state)
   - user + profile             →  show Welcome Back
   - no user                    →  show AuthForms
────────────────────────────────────────────────────────────────────────────── */
function HeroAuthPanel({ user, profile, loading, profileLoading }) {
  // While auth or profile is resolving, show a neutral skeleton
  // This prevents the 1-second flash of AuthForms before profile arrives

  const allCourseNames = profile
  ? [
      profile.course,
      ...(profile.student_courses?.map(sc => sc.courses.name) || [])
    ]
  : []
  if (loading || (user && profileLoading)) {
    return (
      <div className="hero-auth-skeleton">
        <div className="skeleton-line" style={{ width: '60%', height: 24, marginBottom: 12 }} />
        <div className="skeleton-line" style={{ width: '80%', height: 14, marginBottom: 8 }} />
        <div className="skeleton-line" style={{ width: '70%', height: 14, marginBottom: 24 }} />
        <div className="skeleton-line" style={{ width: '100%', height: 44, borderRadius: 8 }} />
      </div>
    )
  }

  if (user && profile) {
    return (
      <div className="hero-logged-in">
        <div className="hero-avatar">
          <i className="fas fa-user-circle" />
        </div>
        <h3>Welcome back, {profile.name?.split(' ')[0]}!</h3>
        <p>Enrolled in:   <strong>
            {allCourseNames.map((course, index) => (
              <span key={index}>
                {course}
                {index < allCourseNames.length - 1 && ', '}
              </span>
            ))}
          </strong>
        </p>
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
    )
  }

  return <AuthForms />
}

export default function Home() {
  const { user, profile, loading, profileLoading } = useAuth()
  const [contactForm,   setContactForm]   = useState({ name: '', email: '',contact:'', subject: '', message: '' })
  const [contactStatus, setContactStatus] = useState(null)


  useEffect(() => {
    const btn = document.querySelector('.back-to-top')
    const onScroll = () => { if (btn) btn.classList.toggle('visible', window.scrollY > 300) }
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
      setContactForm({ name: '', email: '',contact:'', subject: '', message: '' })
    } catch {
      setContactStatus('error')
    }
  }

  return (
    <div className="home">

      {/* ─── HERO + AUTH ── */}
      <section className="hero" id="hero">
        <div className="hero-overlay" />
        <div className="container hero-inner">

          <div className="hero-content animate-fadeInUp">
            <h1>Welcome to DBA Page</h1>
            <p>We are a team of talented trainers teaching you niche skill sets in Oracle & PostgreSQL database technologies.</p>
            <div className="hero-btns">
              <a href="#contact" className="btn btn-primary" onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }}>
                Get Started
              </a>
              <a href="https://www.youtube.com/watch?v=LXb3EKWsInQ" target="_blank" rel="noreferrer" className="btn btn-outline">
                <i className="fas fa-play-circle" /> Watch Video
              </a>
            </div>
            <div className="hero-features">
              <div className="hero-feature">
                <i className="fas fa-database" />
                <div><h4>Expert Training</h4><p>25+ years of Oracle & PostgreSQL expertise</p></div>
              </div>
              <div className="hero-feature">
                <i className="fas fa-laptop-code" />
                <div><h4>Hands-On Labs</h4><p>Practical exercises with real-time scenarios</p></div>
              </div>
              <div className="hero-feature">
                <i className="fas fa-certificate" />
                <div><h4>Certification Ready</h4><p>Tailored coaching for Oracle certifications</p></div>
              </div>
            </div>
          </div>

          {/* Right panel — no flash, no layout shift */}
          <div className="hero-auth animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
            <HeroAuthPanel
              user={user}
              profile={profile}
              loading={loading}
              profileLoading={profileLoading}
            />
          </div>
        </div>
      </section>

      {/* ─── ABOUT ── */}
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

      {/* ─── FEATURES ── */}
      <section className="features-section section section-bg" id="features">
        <div className="container">
          <div className="features-grid">
            {[
                        {
              icon: 'fa-database',
              title: 'Industry-Focused Curriculum',
              desc: 'Learn through structured video modules designed by industry experts. Our courses focus on real-world skills, live projects, and practical implementation to make you job-ready.'
            },
            {
              icon: 'fa-server',
              title: 'Hands-On Projects & Labs',
              desc: 'Gain practical experience with guided projects, coding exercises, and real-time assignments. Build a strong portfolio that showcases your technical expertise to employers.'
            },
            {
              icon: 'fa-shield-alt',
              title: 'Verified Certification',
              desc: 'Earn recognized certificates upon successful completion of courses and assessments. Showcase your achievements on LinkedIn and strengthen your professional profile.'
            },
            {
              icon: 'fa-user-graduate',
              title: 'Internship & Career Support',
              desc: 'Top-performing learners get internship opportunities, career guidance, resume reviews, and interview preparation support to confidently step into the job market.'
            }
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

      {/* ─── SERVICES ── */}
      <section className="section" id="services">
        <div className="container">
          <div className="section-title">
            <h2>Services</h2>
            <p>What We Offer</p>
          </div>
          <div className="services-grid">
            {[
              { icon: 'fa-database',    title: 'Oracle Developer',      link: '/courses/oracle-developer',      desc: 'Learn Oracle SQL, PL/SQL, stored procedures, functions, packages, and triggers for application development.' },
              { icon: 'fa-server',      title: 'Oracle DBA',            link: '/courses/oracle-dba',            desc: 'Master Oracle database administration, performance tuning, backup & recovery, and security best practices.' },
              { icon: 'fa-layer-group', title: 'PostgreSQL Developer',  link: '/courses/postgresql-developer',  desc: 'Comprehensive PostgreSQL training covering advanced SQL, stored procedures, and database design.' },
              { icon: 'fa-cogs',        title: 'PostgreSQL DBA',        link: '/courses/postgresql-dba',        desc: 'Learn PostgreSQL administration, replication, performance tuning, and high availability configurations.' },
              { icon: 'fa-cloud',       title: 'Cloud DBA',             link: '#',                              desc: 'Oracle and PostgreSQL on cloud platforms — AWS RDS, Oracle Cloud, Azure Database services.' },
              { icon: 'fa-headset',     title: 'Mentorship',            link: '#',                              desc: 'One-on-one personalized sessions for career growth, interview prep, and certification guidance.' },
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

      {/* ─── TESTIMONIALS ── */}
      <section className="testimonials-section" id="testimonials">
        <div className="testimonials-bg-overlay" />
        <div className="container">
          <div className="section-title">
            <h2 style={{ color: '#fff' }}>Testimonials</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>What Our Students Say</p>
          </div>
          <TestimonialSlider />
        </div>
      </section>

      {/* ─── VIDEOS ── */}
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

      {/* ─── FAQ ── */}
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

      {/* ─── CONTACT ── */}
      <section className="section section-bg" id="contact">
        <div className="container">
          <div className="section-title">
            <h2>Contact</h2>
            <p>Need Help? Contact Us</p>
          </div>
          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon"><i className="fas fa-map-marker-alt" /></div>
                <div><h4>Address</h4><p>Ambattur, Chennai</p></div>
              </div>
              <div className="contact-item">
                <div className="contact-icon"><i className="fas fa-phone" /></div>
                <div><h4>Call Me</h4><p>+91 9980588044</p></div>
              </div>
              <div className="contact-item">
                <div className="contact-icon"><i className="fas fa-envelope" /></div>
                <div><h4>Email Us</h4><p>hamsad@tesdbacademy.com</p></div>
              </div>
            </div>
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
                <div className="form-group">
                  <input className="form-control" placeholder="Your contact" required value={contactForm.contact} onChange={e => setContactForm(p => ({ ...p, contact: e.target.value }))} />
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

      <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <i className="fas fa-arrow-up" />
      </button>
    </div>
  )
}
