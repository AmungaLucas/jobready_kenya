import { Metadata } from 'next';
import Link from 'next/link';
import { generateWebPageJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';

export const revalidate = 86400;

const title = 'About JobBoard Kenya - Our Mission to Connect Kenyans with Opportunities | JobBoard Kenya';
const description = 'JobBoard Kenya is the leading job search platform connecting Kenyan job seekers with verified employment opportunities across all 47 counties. Learn about our mission, team, and commitment to transparency.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/about` },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/about`,
    siteName: 'JobBoard Kenya',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title, description },
};

export default function AboutPage() {
  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about' },
  ]);

  const webPageLd = generateWebPageJsonLd({
    name: 'About JobBoard Kenya',
    description,
    url: '/about',
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
            <span className="text-gray-700 font-medium">About</span>
          </nav>
        </div>
      </section>

      {/* Hero */}
      <section className="section-bg py-12 border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">About JobBoard Kenya</h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Kenya&apos;s most trusted platform for verified job listings, career resources, and professional opportunities across all 47 counties.
          </p>
        </div>
      </section>

      <section className="section-bg py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* Our Mission */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-white/60">
            <h2 className="text-xl font-extrabold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              JobBoard Kenya was founded with a clear mission: to make the Kenyan job market more accessible, transparent, and efficient for both job seekers and employers. We believe that every Kenyan deserves access to verified, up-to-date employment information, regardless of their location, background, or experience level.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Kenya&apos;s labour market is dynamic and rapidly evolving, driven by a growing technology sector, expanding county governments, and increasing foreign investment. However, job seekers often face significant challenges including scattered listings across multiple platforms, unverified job postings that lead to scams, and a lack of structured information about salaries, requirements, and application processes. JobBoard Kenya addresses each of these pain points directly by aggregating verified listings from hundreds of employers and presenting them in a clean, searchable interface.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              We cover the full spectrum of employment: from entry-level positions for fresh graduates to senior executive roles, from government vacancies across national and county levels to private sector opportunities in industries ranging from banking and healthcare to agriculture and information technology. Our platform also extends beyond traditional employment to include scholarships, grants, fellowships, and other growth opportunities that help Kenyans advance their careers.
            </p>
          </div>

          {/* What We Offer */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-white/60">
            <h2 className="text-xl font-extrabold text-gray-800 mb-6">What We Offer</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">1</span>
                  <h3 className="text-sm font-bold text-gray-800">Verified Job Listings</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Every job posting on our platform undergoes verification to ensure authenticity. We check employer details, confirm application channels, and remove expired listings promptly. Our verification process covers organizations ranging from government ministries and state corporations to private companies, NGOs, and startups across Kenya.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">2</span>
                  <h3 className="text-sm font-bold text-gray-800">Comprehensive Coverage</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We aggregate opportunities from over 43 job categories and 468 subcategories, covering every major industry in Kenya. Our listings span all 47 counties, ensuring that job seekers in both urban centres and rural areas can find relevant opportunities close to home or explore remote positions that offer location flexibility.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">3</span>
                  <h3 className="text-sm font-bold text-gray-800">Career Resources &amp; Insights</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Our blog provides expert career advice, salary guides, interview preparation tips, and in-depth analysis of the Kenyan job market. Written by industry professionals and recruitment experts, these resources help job seekers at every stage of their career make informed decisions and present themselves more effectively to potential employers.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">4</span>
                  <h3 className="text-sm font-bold text-gray-800">Opportunities Beyond Jobs</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We list scholarships, grants, fellowships, mentorship programmes, competitions, training opportunities, and volunteer positions. These opportunities are especially valuable for students, early-career professionals, and individuals looking to develop new skills or access funding for education and community projects across Kenya.
                </p>
              </div>
            </div>
          </div>

          {/* Our Reach */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-white/60">
            <h2 className="text-xl font-extrabold text-gray-800 mb-6">Our Reach</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-extrabold text-emerald-600">47</div>
                <div className="text-xs text-gray-500 mt-1">Counties Covered</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-emerald-600">43+</div>
                <div className="text-xs text-gray-500 mt-1">Job Categories</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-emerald-600">468</div>
                <div className="text-xs text-gray-500 mt-1">Subcategories</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-emerald-600">Daily</div>
                <div className="text-xs text-gray-500 mt-1">Updated Listings</div>
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-white/60">
            <h2 className="text-xl font-extrabold text-gray-800 mb-6">Our Values</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Transparency</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We believe job seekers deserve complete and honest information. Every listing includes clear details about the role, requirements, salary range where available, application deadlines, and how to apply. We never hide critical information behind paywalls or require users to create accounts just to view basic job details. Our commitment to transparency extends to our data practices, which are outlined in our Privacy Policy.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Accessibility</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  JobBoard Kenya is designed to be accessible to everyone. Our platform works on any device, loads quickly even on slower connections, and is structured to be navigable by screen readers and assistive technologies. We use clear, simple language and organize information logically so that job seekers of all literacy levels and technical abilities can find what they need.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Accuracy</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Inaccurate or outdated job information wastes time and can even cause harm, such as when job seekers travel long distances based on listings that no longer exist. Our team and automated systems work continuously to verify postings, remove expired opportunities, and ensure that the information on our platform is as current and accurate as possible. We encourage users to report any suspicious or outdated listings.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Inclusivity</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Kenya&apos;s strength lies in its diversity. We are committed to serving all Kenyans regardless of age, gender, disability status, ethnicity, or geographical location. Our platform features opportunities from every county, and we actively work to ensure that our listings represent the full breadth of Kenya&apos;s labour market, including positions in underserved regions and emerging sectors of the economy.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-8 border border-emerald-200/60 text-center">
            <h2 className="text-xl font-extrabold text-gray-800 mb-3">Ready to Find Your Next Opportunity?</h2>
            <p className="text-sm text-gray-600 mb-6 max-w-lg mx-auto">
              Whether you are a fresh graduate, an experienced professional, or someone looking for a career change, JobBoard Kenya has something for you. Browse thousands of verified listings or explore our career resources to get started.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/jobs" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-lg transition text-sm shadow-md shadow-emerald-200">
                Browse Jobs
              </Link>
              <Link href="/blog" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition">
                Read Career Advice &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}