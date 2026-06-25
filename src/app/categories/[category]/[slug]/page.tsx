import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSubcategoryBySlug, getSubcategoryJobs, getCategorySubcategories, getAllSubcategorySlugs, getSiblingCategoryJobs, getPopularLocations, getAllCategories, getCategoryBySlug, getCachedSubcategorySlugs } from '@/lib/categories';
import { generateCollectionPageJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import { formatSalary, timeAgo, formatDate, employmentTypeLabels } from '@/lib/jobs';
import type { JobListItem } from '@/lib/jobs';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';

// Remote MySQL: force dynamic — no ISR caching to minimize connections on Vercel
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug, slug } = await params;
  const sub = await getSubcategoryBySlug(categorySlug, slug);
  if (!sub) return { title: 'Subcategory Not Found' };

  const title = sub.seoTitle || `${sub.label} Jobs in Kenya - ${sub.category.label} | JobBoard Kenya`;
  const description = sub.seoDescription || `Browse ${sub._count.jobs}+ ${sub.label.toLowerCase()} job vacancies in Kenya. Find the latest ${sub.label.toLowerCase()} opportunities in ${sub.category.label}. Updated daily.`;

  return {
    title,
    description: description.substring(0, 160),
    alternates: { canonical: `${SITE_URL}/categories/${categorySlug}/${slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: description.substring(0, 160),
      url: `${SITE_URL}/categories/${categorySlug}/${slug}`,
      siteName: 'JobBoard Kenya',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.substring(0, 160),
    },
  };
}

// ISR-only: shared MySQL cannot handle bulk SSG queries at build time.
export async function generateStaticParams() {
  return [];
}

export default async function SubcategoryPage({ params }: Props) {
  const { category: categorySlug, slug } = await params;

  const subcategory = await getSubcategoryBySlug(categorySlug, slug);
  if (!subcategory) notFound();

  // Get parent category for sidebar and context
  const category = await getCategoryBySlug(categorySlug);

  const page = 1;
  const perPage = 20;

  const [jobsData, subcategories, siblingJobs, locations, allCategories] = await Promise.all([
    getSubcategoryJobs(subcategory.id, page, perPage),
    category ? getCategorySubcategories(category.id, categorySlug) : [],
    category ? getSiblingCategoryJobs(category.id, 6) : [],
    getPopularLocations(8),
    getAllCategories(),
  ]);

  const { jobs, total } = jobsData;
  const totalPages = Math.ceil(total / perPage);

  // JSON-LD
  const collectionLd = generateCollectionPageJsonLd({
    name: `${subcategory.label} Jobs in Kenya`,
    description: subcategory.seoDescription || subcategory.description || `${subcategory.label} job listings in Kenya`,
    url: `/categories/${categorySlug}/${slug}`,
    itemCount: total,
  });

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Job Categories', url: '/categories' },
    { name: subcategory.category.label, url: `/categories/${categorySlug}` },
    { name: subcategory.label, url: `/categories/${categorySlug}/${slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />

      {/* Breadcrumb */}
      <section className="section-bg py-4 border-b border-gray-200/50" style={{ paddingTop: '88px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-emerald-600 transition">Job Categories</Link>
            <span>/</span>
            <Link href={`/categories/${categorySlug}`} className="hover:text-emerald-600 transition">{subcategory.category.label}</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">{subcategory.label}</span>
          </nav>
        </div>
      </section>

      {/* Header */}
      <section className="section-bg py-8 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-emerald-600 font-medium mb-1">{subcategory.category.label}</p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                {subcategory.label} Jobs in Kenya
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-semibold text-emerald-600">{total}</span> active vacancies
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/categories/${categorySlug}`} className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition">
                &larr; All {subcategory.category.label}
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
              {(subcategory.description || category?.description) && (
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {subcategory.description || category?.description}
                  </p>
                </div>
              )}

              {/* Job listings or empty fallback */}
              {jobs.length > 0 ? (
                <div>
                  <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                    Latest {subcategory.label} Vacancies
                  </h2>
                  <div className="space-y-3">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <Link
                          key={p}
                          href={`/categories/${categorySlug}/${slug}?page=${p}`}
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

                  {/* Layer 2: Sibling jobs from same category — jobs first */}
                  {siblingJobs.length > 0 && (
                    <div>
                      <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                        Related {subcategory.category.label} Opportunities
                      </h2>
                      <div className="space-y-3">
                        {siblingJobs.slice(0, 6).map((job) => (
                          <JobCard key={job.id} job={job} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Layer 4: Other specializations in parent — compact list */}
                  {subcategories.length > 0 && (
                    <div>
                      <h2 className="text-lg font-extrabold text-gray-800 mb-3">
                        Other {subcategory.category.label} Specializations
                      </h2>
                      <ul className="divide-y divide-gray-200/50 bg-white/40 backdrop-blur-sm rounded-xl border border-white/60">
                        {subcategories
                          .filter((s) => s.urlSlug !== slug)
                          .slice(0, 9)
                          .map((sub) => (
                            <li key={sub.urlSlug}>
                              <Link
                                href={`/categories/${categorySlug}/${sub.urlSlug}`}
                                className="flex items-center justify-between py-2.5 px-4 hover:bg-emerald-50/30 transition"
                              >
                                <span className="text-sm text-gray-700 hover:text-emerald-700">{sub.label}</span>
                                <span className="text-xs text-gray-400">{sub.jobCount}</span>
                              </Link>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {/* Layer 5: Browse by location */}
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                      Browse {subcategory.label} Jobs by County
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {locations.map((loc) => (
                        <Link
                          key={loc.slug}
                          href={`/locations/${loc.slug}`}
                          className="text-center p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 hover:border-emerald-300 hover:shadow-sm transition"
                        >
                          <span className="text-sm font-medium text-gray-700">{loc.county}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Layer 5: CTA + explore */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-6 border border-emerald-200/60">
                    <h2 className="text-lg font-extrabold text-gray-800 mb-2">
                      No {subcategory.label} jobs right now
                    </h2>
                    <p className="text-sm text-gray-600">
                      New {subcategory.label.toLowerCase()} positions are posted regularly. Set up an alert and be the first to apply.
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                      <Link href={`/categories/${categorySlug}`} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition text-sm shadow-md shadow-emerald-200">
                        View All {subcategory.category.label} Jobs &rarr;
                      </Link>
                      <Link href="/jobs" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition">
                        Browse All Jobs &rarr;
                      </Link>
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
              {/* Subcategory nav */}
              {subcategories.length > 0 && (
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">
                    {subcategory.category.label}
                  </h3>
                  <ul className="space-y-1 max-h-80 overflow-y-auto">
                    {subcategories.map((sub) => (
                      <li key={sub.urlSlug}>
                        <Link
                          href={`/categories/${categorySlug}/${sub.urlSlug}`}
                          className={`flex items-center justify-between text-sm p-2 rounded-lg hover:bg-emerald-50/50 transition ${
                            sub.urlSlug === slug ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          <span className="truncate mr-2">{sub.label}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">{sub.jobCount}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* All categories */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">All Categories</h3>
                <ul className="space-y-1 max-h-60 overflow-y-auto">
                  {allCategories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/categories/${c.slug}`}
                        className={`flex items-center justify-between text-sm p-2 rounded-lg hover:bg-emerald-50/50 transition ${
                          c.slug === categorySlug ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        <span className="truncate mr-2">{c.label}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{c.jobCount}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Job alerts CTA */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-5 border border-emerald-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📬</span>
                  <h4 className="text-sm font-bold text-gray-700">Get {subcategory.label} Alerts</h4>
                </div>
                <p className="text-xs text-gray-600">New {subcategory.label.toLowerCase()} jobs sent to your inbox.</p>
                <div className="mt-3 flex flex-col gap-2">
                  <input type="email" placeholder="Your email" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-emerald-600" />
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