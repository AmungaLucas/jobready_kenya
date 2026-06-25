import { Metadata } from 'next';
import Link from 'next/link';
import { generateWebPageJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';
import { Mail, Phone, MapPin, Clock, Linkedin, Facebook } from 'lucide-react';

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
                      <Mail className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div className="font-medium text-gray-700">Email</div>
                      <div className="text-gray-500">info@jobboard.ke</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                      <Phone className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div className="font-medium text-gray-700">Phone</div>
                      <div className="text-gray-500">+254 700 000 000</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div className="font-medium text-gray-700">Location</div>
                      <div className="text-gray-500">Nairobi, Kenya</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                      <Clock className="w-3.5 h-3.5" />
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
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="https://linkedin.com/company/jobboard-kenya" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-lg bg-white/70 border border-white/60 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-300 transition">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="https://facebook.com/jobboardkenya" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-lg bg-white/70 border border-white/60 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-300 transition">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-9 h-9 rounded-lg bg-white/70 border border-white/60 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-300 transition">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
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