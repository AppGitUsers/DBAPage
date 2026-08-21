import { useParams, Link } from 'react-router-dom'
import './CoursePage.css'

const COURSE_DATA = {
  'oracle-developer': {
    title: 'Oracle Developer',
    icon: 'fa-database',
    color: '#e74c3c',
    badge: 'Beginner to Advanced',
    duration: '8 Weeks',
    desc: 'Master Oracle SQL and PL/SQL development with hands-on exercises and real-world projects.',
    overview: 'Our Oracle Developer course takes you from SQL fundamentals to advanced PL/SQL programming. You will learn to write efficient queries, build stored procedures, functions, packages, and triggers.',
    syllabus: [
      { week: 'Week 1-2', title: 'SQL Fundamentals', topics: ['SELECT, WHERE, JOIN, GROUP BY', 'Subqueries and Set Operators', 'DML: INSERT, UPDATE, DELETE, MERGE', 'DDL: CREATE, ALTER, DROP'] },
      { week: 'Week 3-4', title: 'Advanced SQL', topics: ['Analytical Functions', 'Window Functions', 'Hierarchical Queries', 'Regular Expressions'] },
      { week: 'Week 5-6', title: 'PL/SQL Basics', topics: ['Anonymous Blocks', 'Variables and Control Structures', 'Cursors', 'Exception Handling'] },
      { week: 'Week 7-8', title: 'PL/SQL Advanced', topics: ['Stored Procedures & Functions', 'Packages', 'Triggers', 'Dynamic SQL'] },
    ],
    highlights: ['25+ years expert trainer', 'Hands-on labs', 'Real project experience', 'Certificate of completion'],
  },
  'oracle-dba': {
    title: 'Oracle DBA',
    icon: 'fa-server',
    color: '#3498db',
    badge: 'Intermediate to Expert',
    duration: '12 Weeks',
    desc: 'Become a certified Oracle DBA with comprehensive training in administration, performance tuning, and disaster recovery.',
    overview: 'This intensive Oracle DBA course covers all aspects of Oracle Database Administration from installation to advanced performance tuning and security.',
    syllabus: [
      { week: 'Week 1-2', title: 'Database Architecture', topics: ['Oracle Architecture & Memory', 'Database Installation & Configuration', 'Oracle Net Services', 'Database Creation'] },
      { week: 'Week 3-4', title: 'Storage Management', topics: ['Tablespaces & Datafiles', 'Undo Management', 'Redo Log Management', 'Oracle Managed Files'] },
      { week: 'Week 5-7', title: 'Backup & Recovery', topics: ['RMAN Configuration', 'Complete & Incomplete Recovery', 'Flashback Technologies', 'Data Pump & Export/Import'] },
      { week: 'Week 8-10', title: 'Performance Tuning', topics: ['AWR, ADDM, ASH Reports', 'SQL Tuning Advisor', 'Index Strategies', 'Partitioning'] },
      { week: 'Week 11-12', title: 'High Availability', topics: ['Data Guard', 'Oracle RAC Concepts', 'Oracle Cloud Migration', 'Security & Auditing'] },
    ],
    highlights: ['OCP certification prep', 'Live lab environment', 'Real DBA scenarios', 'Job placement support'],
  },
  'postgresql-developer': {
    title: 'PostgreSQL Developer',
    icon: 'fa-layer-group',
    color: '#27ae60',
    badge: 'Beginner to Advanced',
    duration: '8 Weeks',
    desc: 'Learn PostgreSQL from the ground up including advanced SQL features, stored procedures, and database design.',
    overview: 'Comprehensive PostgreSQL Developer course covering SQL fundamentals through advanced PL/pgSQL programming, indexing strategies, and performance optimization.',
    syllabus: [
      { week: 'Week 1-2', title: 'PostgreSQL Fundamentals', topics: ['PostgreSQL Architecture', 'Data Types & Constraints', 'SQL Queries & Joins', 'Indexes & EXPLAIN'] },
      { week: 'Week 3-4', title: 'Advanced SQL', topics: ['CTEs and Recursive Queries', 'Window Functions', 'JSON & JSONB', 'Full-Text Search'] },
      { week: 'Week 5-6', title: 'PL/pgSQL', topics: ['Functions & Procedures', 'Triggers', 'Exception Handling', 'Dynamic SQL'] },
      { week: 'Week 7-8', title: 'Advanced Features', topics: ['Partitioning', 'Foreign Data Wrappers', 'Extensions', 'Connection Pooling'] },
    ],
    highlights: ['Open source expertise', 'Cloud PostgreSQL (RDS, Azure)', 'Practical projects', 'Community support'],
  },
  'postgresql-dba': {
    title: 'PostgreSQL DBA',
    icon: 'fa-cogs',
    color: '#9b59b6',
    badge: 'Intermediate to Expert',
    duration: '10 Weeks',
    desc: 'Master PostgreSQL administration including high availability, replication, backup strategies, and performance tuning.',
    overview: 'Deep dive into PostgreSQL Database Administration covering installation, replication, monitoring, and enterprise configurations.',
    syllabus: [
      { week: 'Week 1-2', title: 'Administration Basics', topics: ['Installation & Configuration', 'User Management & Roles', 'Configuration Tuning', 'pg_hba.conf & SSL'] },
      { week: 'Week 3-4', title: 'Backup & Recovery', topics: ['pg_dump & pg_restore', 'PITR with WAL Archiving', 'Continuous Archiving', 'Barman & pgBackRest'] },
      { week: 'Week 5-7', title: 'Replication', topics: ['Streaming Replication', 'Logical Replication', 'Patroni & HA Setup', 'pgBouncer'] },
      { week: 'Week 8-10', title: 'Performance & Monitoring', topics: ['EXPLAIN ANALYZE', 'pg_stat_statements', 'Vacuum & Autovacuum', 'Partitioning Strategies'] },
    ],
    highlights: ['HA cluster setup', 'Cloud PostgreSQL admin', 'Monitoring with Prometheus', 'Production DBA skills'],
  },
}

export default function CoursePage() {
  const { slug } = useParams()
  const course = COURSE_DATA[slug]

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>Course not found</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>Go Home</Link>
      </div>
    )
  }

  return (
    <div className="course-page">
      {/* Hero */}
      <div className="course-hero" style={{ '--course-color': course.color }}>
        <div className="container course-hero-inner">
          <div className="course-hero-icon">
            <i className={`fas ${course.icon}`} />
          </div>
          <div>
            <span className="course-badge">{course.badge}</span>
            <h1>{course.title}</h1>
            <p>{course.desc}</p>
            <div className="course-hero-meta">
              <span><i className="fas fa-clock" /> {course.duration}</span>
              <span><i className="fas fa-video" /> Live + Recorded</span>
              <span><i className="fas fa-certificate" /> Certificate</span>
            </div>
            <button
              className="btn btn-primary course-enroll-btn"
              onClick={() => { window.scrollTo(0, 0); document.querySelector('.hero')?.scrollIntoView(); }}
            >
              <i className="fas fa-user-plus" /> Enroll Now
            </button>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="course-layout">
            {/* Main content */}
            <div className="course-main">
              {/* Overview */}
              <div className="course-block">
                <h2>Course Overview</h2>
                <p>{course.overview}</p>
              </div>

              {/* Syllabus */}
              <div className="course-block">
                <h2>Syllabus</h2>
                <div className="syllabus-list">
                  {course.syllabus.map((s, i) => (
                    <div className="syllabus-item" key={i}>
                      <div className="syllabus-header">
                        <span className="syllabus-week">{s.week}</span>
                        <h4>{s.title}</h4>
                      </div>
                      <ul>
                        {s.topics.map((t, j) => (
                          <li key={j}><i className="fas fa-check-circle" /> {t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="course-sidebar">
              <div className="course-card card">
                <h3>Course Highlights</h3>
                <ul className="highlight-list">
                  {course.highlights.map((h, i) => (
                    <li key={i}><i className="fas fa-star" /> {h}</li>
                  ))}
                </ul>
                <hr />
                <div className="course-info-row"><span>Duration:</span><strong>{course.duration}</strong></div>
                <div className="course-info-row"><span>Format:</span><strong>Online Live</strong></div>
                <div className="course-info-row"><span>Language:</span><strong>English</strong></div>
                <Link to="/#login" className="btn btn-primary" style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}>
                  <i className="fas fa-envelope" /> Register for this Course
                </Link>
              </div>

              <div className="course-card card" style={{ marginTop: 20 }}>
                <h3>Contact Us</h3>
                <p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 14 }}>Have questions? Reach out directly.</p>
                <a href="mailto:gopi.orafly@gmail.com" className="contact-link"><i className="fas fa-envelope" /> gopi.orafly@gmail.com</a>
                <a href="tel:+919980588044" className="contact-link"><i className="fas fa-phone" /> +91 99805 88044</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
