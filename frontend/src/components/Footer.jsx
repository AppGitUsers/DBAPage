import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-col footer-brand">
            <h3 className="footer-logo">DBA <span>Page</span></h3>
            <p>Yelahanka, Bangalore</p>
            <p><strong>Phone:</strong> +91 99805 88044</p>
            <p><strong>Email:</strong> gopi.orafly@gmail.com</p>
            <div className="footer-socials">
              <a href="https://twitter.com" target="_blank" rel="noreferrer"><i className="fab fa-twitter" /></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer"><i className="fab fa-facebook" /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer"><i className="fab fa-instagram" /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer"><i className="fab fa-linkedin" /></a>
            </div>
          </div>

          {/* Useful Links */}
          <div className="footer-col">
            <h4>Useful Links</h4>
            <ul>
              <li><i className="fas fa-chevron-right" /><button onClick={() => scrollTo('hero')}>Home</button></li>
              <li><i className="fas fa-chevron-right" /><button onClick={() => scrollTo('about')}>About Us</button></li>
              <li><i className="fas fa-chevron-right" /><button onClick={() => scrollTo('services')}>Services</button></li>
              <li><i className="fas fa-chevron-right" /><Link to="#">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Our Services */}
          <div className="footer-col">
            <h4>Our Services</h4>
            <ul>
              <li><i className="fas fa-chevron-right" /><Link to="/courses/oracle-developer">Oracle Developer</Link></li>
              <li><i className="fas fa-chevron-right" /><Link to="/courses/oracle-dba">Oracle DBA</Link></li>
              <li><i className="fas fa-chevron-right" /><Link to="/courses/postgresql-developer">PostgreSQL Developer</Link></li>
              <li><i className="fas fa-chevron-right" /><Link to="/courses/postgresql-dba">PostgreSQL DBA</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-col">
            <h4>Newsletter</h4>
            <p>Subscribe for latest updates on Oracle & PostgreSQL training.</p>
            <form className="footer-newsletter" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Your email" required />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© Copyright <strong>DBA Page</strong>. All Rights Reserved</p>
          <p>Designed by <a href="https://dbapage.com" target="_blank" rel="noreferrer">dbapage.com</a></p>
        </div>
      </div>
    </footer>
  )
}
