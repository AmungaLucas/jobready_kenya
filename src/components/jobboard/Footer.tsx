import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo-icon">JB</div>
            <div className="brand-name">
              Job<span>Board</span> <span style={{ fontWeight: 400, color: '#6a6a6a', fontSize: '0.8rem' }}>KE</span>
            </div>
            <p className="brand-tagline">Helping Kenyans discover verified jobs, internships, and opportunities every day.</p>
            <div className="footer-social">
              <a href="https://twitter.com/jobboardke" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="https://linkedin.com/company/jobboard-kenya" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
              <a href="https://facebook.com/jobboardkenya" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="https://youtube.com/@jobboardkenya" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
              <a href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i className="fab fa-whatsapp"></i></a>
            </div>
          </div>

          <div>
            <h4>Jobs</h4>
            <ul>
              <li><Link href="/jobs">Browse Jobs</Link></li>
              <li><Link href="/government-jobs">Government Jobs</Link></li>
              <li><Link href="/jobs?type=INTERNSHIP">Internships</Link></li>
              <li><Link href="/jobs?type=PART_TIME">Part-time Jobs</Link></li>
              <li><Link href="/jobs?type=FREELANCE">Freelance Jobs</Link></li>
            </ul>
          </div>

          <div>
            <h4>Resources</h4>
            <ul>
              <li><Link href="/blog?category=Career Advice">Career Advice</Link></li>
              <li><Link href="/cv-services">CV Writing Services</Link></li>
              <li><Link href="/blog?category=How-To">Interview Tips</Link></li>
              <li><Link href="/blog?category=Kenya Job Market">Salary Guide</Link></li>
              <li><Link href="/blog">All Articles</Link></li>
            </ul>
          </div>

          <div className="footer-newsletter">
            <h4>Stay Updated</h4>
            <p>Get new jobs, deadlines, and career opportunities delivered to your inbox.</p>
            <form action="/api/subscribe" method="POST">
              <input type="email" placeholder="Your email address" required />
              <button type="submit">Subscribe</button>
            </form>
            <p style={{ fontSize: '0.65rem', color: '#5a5a5a', marginTop: '0.6rem' }}>No spam, unsubscribe anytime.</p>
          </div>
        </div>

        <div className="footer-middle">
          <div className="footer-middle-col">
            <h4>Popular Locations</h4>
            <ul>
              <li><Link href="/jobs?location=nairobi">Nairobi</Link></li>
              <li><Link href="/jobs?location=mombasa">Mombasa</Link></li>
              <li><Link href="/jobs?location=kisumu">Kisumu</Link></li>
              <li><Link href="/jobs?location=nakuru">Nakuru</Link></li>
              <li><Link href="/jobs?location=eldoret">Eldoret</Link></li>
              <li><Link href="/jobs?location=thika">Thika</Link></li>
              <li><Link href="/jobs?location=malindi">Malindi</Link></li>
              <li><Link href="/jobs?location=kitale">Kitale</Link></li>
              <li><Link href="/jobs?location=nyeri">Nyeri</Link></li>
              <li><Link href="/jobs?location=machakos">Machakos</Link></li>
            </ul>
          </div>
          <div className="footer-middle-col">
            <h4>Popular Categories</h4>
            <ul>
              <li><Link href="/categories/technology">Technology &amp; IT</Link></li>
              <li><Link href="/categories/healthcare">Healthcare &amp; Medical</Link></li>
              <li><Link href="/categories/finance">Finance &amp; Accounting</Link></li>
              <li><Link href="/categories/engineering">Engineering</Link></li>
              <li><Link href="/categories/education">Education &amp; Training</Link></li>
              <li><Link href="/categories/marketing">Marketing &amp; Sales</Link></li>
              <li><Link href="/categories/legal">Legal &amp; Compliance</Link></li>
              <li><Link href="/categories/hospitality-tourism">Hospitality &amp; Tourism</Link></li>
              <li><Link href="/categories/agriculture">Agriculture</Link></li>
              <li><Link href="/categories/logistics">Logistics &amp; Supply Chain</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; 2026 JobBoard Kenya. All rights reserved.</span>
          <div className="footer-bottom-links">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-of-service">Terms of Service</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/about">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}