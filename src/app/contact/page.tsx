import { Metadata } from 'next';
import Link from 'next/link';
import { generateWebPageJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';

export const revalidate = 86400;

const title = 'Contact JobBoard Kenya - Get in Touch with Our Team | JobBoard Kenya';
const description = 'Contact the JobBoard Kenya team for support, partnerships, job posting inquiries, or general questions. We respond within 24 hours on business days.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/contact` },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/contact`,
    siteName: 'JobBoard Kenya',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title, description },
};

export default function ContactPage() {
  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Contact', url: '/contact' },
  ]);

  const webPageLd = generateWebPageJsonLd({
    name: 'Contact JobBoard Kenya',
    description,
    url: '/contact',
    dateModified: '2026-01-15',
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />

      {/* Breadcrumb */}
      <section className="section-bg py-4 border-b border-gray-200/50" style={{ paddingTop: '88px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-medium">Contact</span>
          </nav>
        </div>
      </section>

      {/* Hero */}
      <section className="section-bg py-12 border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Have a question, partnership inquiry, or need support? We would love to hear from you. Our team responds to all inquiries within 24 hours on business days.
          </p>
        </div>
      </section>

      {/* SEO Content Block */}
      <section className="section-bg py-8 border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
              <h3 className="text-sm font-bold text-gray-800 mb-2">For Job Seekers</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Whether you need help finding the right job category, understanding how to apply for government positions, have questions about our CV writing service, or want to report an issue with a listing, our support team is here to assist. We can also help you set up job alerts and navigate our platform features to make your job search more effective.
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
              <h3 className="text-sm font-bold text-gray-800 mb-2">For Employers</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Looking to post job vacancies and reach thousands of qualified Kenyan professionals? Contact us for employer account setup, bulk job posting options, featured listing packages, and partnership opportunities. We work with government agencies, multinational corporations, NGOs, startups, and SMEs across all 47 counties.
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
              <h3 className="text-sm font-bold text-gray-800 mb-2">Partnerships &amp; Advertising</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Interested in partnering with JobBoard Kenya or advertising to our audience of active job seekers? We offer targeted advertising solutions, content sponsorship, branded job alerts, and co-marketing opportunities. Reach us through this form or email us directly at info@jobboard.ke and our partnerships team will respond within one business day.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-bg py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-white/60">
                <h2 className="text-lg font-extrabold text-gray-800 mb-6">Send Us a Message</h2>
                <form className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input type="text" id="name" name="name" required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-emerald-600" placeholder="John Doe" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input type="email" id="email" name="email" required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-emerald-600" placeholder="john@example.com" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select id="subject" name="subject" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-emerald-600">
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership &amp; Advertising</option>
                      <option value="employer">Employer / Post a Job</option>
                      <option value="report">Report an Issue</option>
                      <option value="feedback">Feedback &amp; Suggestions</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea id="message" name="message" rows={6} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-emerald-600 resize-y" placeholder="Tell us how we can help you..." />
                  </div>
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition text-sm shadow-md shadow-emerald-200">
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Info */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-4">Contact Information</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                      <i className="fas fa-envelope text-xs" />
                    </span>
                    <div>
                      <div className="font-medium text-gray-700">Email</div>
                      <div className="text-gray-500">info@jobboard.ke</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                      <i className="fas fa-phone text-xs" />
                    </span>
                    <div>
                      <div className="font-medium text-gray-700">Phone</div>
                      <div className="text-gray-500">+254 700 000 000</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                      <i className="fas fa-map-marker-alt text-xs" />
                    </span>
                    <div>
                      <div className="font-medium text-gray-700">Location</div>
                      <div className="text-gray-500">Nairobi, Kenya</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                      <i className="fas fa-clock text-xs" />
                    </span>
                    <div>
                      <div className="font-medium text-gray-700">Business Hours</div>
                      <div className="text-gray-500">Mon-Fri: 8:00 AM - 6:00 PM EAT</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/about" className="text-emerald-600 hover:text-emerald-700 transition">About JobBoard Kenya</Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy" className="text-emerald-600 hover:text-emerald-700 transition">Privacy Policy</Link>
                  </li>
                  <li>
                    <Link href="/terms-of-service" className="text-emerald-600 hover:text-emerald-700 transition">Terms of Service</Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-emerald-600 hover:text-emerald-700 transition">Career Blog</Link>
                  </li>
                </ul>
              </div>

              {/* Social */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-6 border border-emerald-200/60">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Follow Us</h3>
                <p className="text-xs text-gray-600 mb-4">Stay connected for the latest job alerts, career tips, and platform updates.</p>
                <div className="flex gap-3">
                  <a href="https://twitter.com/jobboardke" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-9 h-9 rounded-lg bg-white/70 border border-white/60 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-300 transition">
                    <i className="fab fa-twitter text-sm" />
                  </a>
                  <a href="https://linkedin.com/company/jobboard-kenya" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-lg bg-white/70 border border-white/60 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-300 transition">
                    <i className="fab fa-linkedin-in text-sm" />
                  </a>
                  <a href="https://facebook.com/jobboardkenya" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-lg bg-white/70 border border-white/60 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-300 transition">
                    <i className="fab fa-facebook-f text-sm" />
                  </a>
                  <a href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-9 h-9 rounded-lg bg-white/70 border border-white/60 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-300 transition">
                    <i className="fab fa-whatsapp text-sm" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}