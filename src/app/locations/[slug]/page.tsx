import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLocationBySlug, getLocationJobs, getLocationCategories, getOtherLocations, getAllLocationSlugs, getPopularLocations } from '@/lib/locations';
import { getAllCategories } from '@/lib/categories';
import { generateCollectionPageJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import { formatSalary, timeAgo, formatDate, employmentTypeLabels } from '@/lib/jobs';
import type { JobListItem } from '@/lib/jobs';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);
  if (!location) return { title: 'Location Not Found' };

  const title = location.seoTitle || `Jobs in ${location.county} - Latest Vacancies & Career Opportunities | JobBoard Kenya`;
  const description = location.seoDescription || `Browse ${location.jobCount}+ job vacancies in ${location.county}, Kenya. Find the latest jobs from top employers in ${location.county}. Updated daily.`;

  return {
    title,
    description: description.substring(0, 160),
    alternates: { canonical: `${SITE_URL}/locations/${location.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: description.substring(0, 160),
      url: `${SITE_URL}/locations/${location.slug}`,
      siteName: 'JobBoard Kenya',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.substring(0, 160),
    },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllLocationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const page = 1;
  const perPage = 20;

  const location = await getLocationBySlug(slug);
  if (!location) notFound();

  const [jobsData, categories, otherLocations, popularLocations, allCategories] = await Promise.all([
    getLocationJobs(location.county, page, perPage),
    getLocationCategories(location.county),
    getOtherLocations(slug, 12),
    getPopularLocations(8),
    getAllCategories(),
  ]);

  const { jobs, total } = jobsData;
  const totalPages = Math.ceil(total / perPage);

  // JSON-LD
  const collectionLd = generateCollectionPageJsonLd({
    name: `Jobs in ${location.county}, Kenya`,
    description: location.seoDescription || location.description || `Job listings in ${location.county}, Kenya`,
    url: `/locations/${location.slug}`,
    itemCount: total,
  });

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Jobs', url: '/jobs' },
    { name: location.county, url: `/locations/${location.slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />

      {/* Breadcrumb */}
      <section className="section-bg py-4 border-b border-gray-200/50" style={{ paddingTop: '88px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
            <span>/</span>
            <Link href="/jobs" className="hover:text-emerald-600 transition">Jobs</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">{location.county}</span>
          </nav>
        </div>
      </section>

      {/* Header */}
      <section className="section-bg py-8 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                Jobs in {location.county}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-semibold text-emerald-600">{total}</span> active vacancies in {location.county} County
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/jobs?county=${location.slug}`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition">
                View as list &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-bg py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Main content */}
            <div className="lg:col-span-3 space-y-8">

              {/* LAYER 1: SEO Description */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60">
                <p className="text-sm text-gray-600 leading-relaxed">{location.description}</p>
              </div>

              {/* Job listings or empty fallback */}
              {jobs.length > 0 ? (
                <div>
                  <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                    Latest Jobs in {location.county}
                  </h2>
                  <div className="space-y-3">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                        <Link
                          key={p}
                          href={`/locations/${location.slug}?page=${p}`}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            p === page
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white/70 text-gray-600 hover:bg-gray-100 border border-white/60'
                          }`}
                        >
                          {p}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* 5-LAYER EMPTY PAGE FALLBACK */
                <div className="space-y-6">

                  {/* Layer 2: Categories available in this county */}
                  {categories.length > 0 && (
                    <div>
                      <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                        Popular Job Categories in {location.county}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categories.map((cat) => (
                          <Link
                            key={cat.categorySlug}
                            href={`/categories/${cat.categorySlug}?county=${location.slug}`}
                            className="group flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 hover:border-emerald-300 hover:shadow-sm transition"
                          >
                            <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700 transition">{cat.categoryLabel}</span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{cat.jobCount}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Layer 3: All categories for this county (cross-link) */}
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                      Browse All Categories in {location.county}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {allCategories.slice(0, 12).map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/categories/${cat.slug}?county=${location.slug}`}
                          className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-white/60 hover:border-emerald-300 transition text-sm"
                        >
                          <span className="text-gray-700 font-medium truncate mr-2">{cat.label}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">{cat.jobCount}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Layer 4: Other locations */}
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                      Browse Jobs in Other Counties
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {otherLocations.map((loc) => (
                        <Link
                          key={loc.slug}
                          href={`/locations/${loc.slug}`}
                          className="text-center p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 hover:border-emerald-300 hover:shadow-sm transition"
                        >
                          <span className="text-sm font-medium text-gray-700">{loc.county}</span>
                          {loc.jobCount > 0 && (
                            <span className="block text-xs text-emerald-600 mt-0.5">{loc.jobCount} jobs</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Layer 5: CTA + Job alert signup */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-6 border border-emerald-200/60">
                    <h2 className="text-lg font-extrabold text-gray-800 mb-2">
                      No jobs in {location.county} right now
                    </h2>
                    <p className="text-sm text-gray-600">
                      New positions in {location.county} are posted regularly. Set up an alert and be the first to apply when they appear.
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                      <Link href="/jobs" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition text-sm shadow-md shadow-emerald-200">
                        Browse All Jobs &rarr;
                      </Link>
                      <p className="text-xs text-gray-500">
                        Get notified when new {location.county} jobs are posted.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <input type="email" placeholder="Your email address" className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-emerald-600" />
                      <button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-5 rounded-lg transition text-sm whitespace-nowrap">
                        Get Alerts
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">

              {/* Quick stats */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Location Overview</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Active Jobs</span><span className="font-medium text-emerald-600">{total}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">County</span><span className="font-medium text-gray-700">{location.county}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Categories</span><span className="font-medium text-gray-700">{categories.length}</span></div>
                </div>
              </div>

              {/* Popular locations */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Popular Locations</h3>
                <ul className="space-y-1">
                  {popularLocations.map((loc) => (
                    <li key={loc.slug}>
                      <Link
                        href={`/locations/${loc.slug}`}
                        className={`flex items-center justify-between text-sm p-2 rounded-lg hover:bg-emerald-50/50 transition ${
                          loc.slug === location.slug ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        <span>{loc.county}</span>
                        <span className="text-xs text-gray-400">{loc.jobCount}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Categories in this location */}
              {categories.length > 0 && (
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Top Categories</h3>
                  <ul className="space-y-1">
                    {categories.slice(0, 6).map((cat) => (
                      <li key={cat.categorySlug}>
                        <Link
                          href={`/categories/${cat.categorySlug}?county=${location.slug}`}
                          className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-emerald-50/50 transition text-gray-700"
                        >
                          <span className="truncate mr-2">{cat.categoryLabel}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">{cat.jobCount}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Job alerts CTA */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-5 border border-emerald-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📬</span>
                  <h4 className="text-sm font-bold text-gray-700">Get {location.county} Job Alerts</h4>
                </div>
                <p className="text-xs text-gray-600">Be the first to know when new jobs in {location.county} are posted.</p>
                <div className="mt-3 flex flex-col gap-2">
                  <input type="email" placeholder="Your email" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-emerald-600" />
                  <button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition text-sm">Subscribe</button>
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

// Shared job card component
function JobCard({ job }: { job: JobListItem }) {
  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="job-card block bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60 transition hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="job-title text-lg font-extrabold text-gray-800 transition">{job.title}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
            <span className="font-medium text-gray-700">{job.organization?.orgName || 'Confidential'}</span>
            <span className="text-gray-300">&middot;</span>
            <span>{job.locationCity || job.locationCounty}</span>
            {job.isRemote && (
              <>
                <span className="text-gray-300">&middot;</span>
                <span className="text-emerald-600 font-medium">Remote</span>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {job.featured && (
            <span className="text-xs font-medium text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full">Featured</span>
          )}
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            {employmentTypeLabels[job.employmentType || ''] || job.employmentType}
          </span>
        </div>
      </div>
      {job.category && (
        <p className="text-xs text-gray-400 mt-1">{job.category.label}</p>
      )}
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400">
        <span>{formatSalary(job)}</span>
        <span>&middot;</span>
        <span>{timeAgo(job.datePosted)}</span>
        <span>&middot;</span>
        <span>Closes {formatDate(job.deadline)}</span>
      </div>
    </Link>
  );
}