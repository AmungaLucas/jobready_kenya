import Link from 'next/link';
import { Linkedin, Facebook, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/">
              <img src="/logo.svg" alt="JobBoard Kenya" className="logo-img logo-img-footer" />
            </Link>
            <p className="brand-tagline">Helping Kenyans discover verified jobs, internships, and opportunities every day.</p>
            <div className="footer-social">
              <a href="https://twitter.com/jobboardke" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
              <a href="https://linkedin.com/company/jobboard-kenya" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin className="w-4 h-4" /></a>
              <a href="https://facebook.com/jobboardkenya" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook className="w-4 h-4" /></a>
              <a href="https://youtube.com/@jobboardkenya" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube className="w-4 h-4" /></a>
              <a href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
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