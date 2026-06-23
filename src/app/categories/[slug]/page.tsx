import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug, getCategoryJobs, getCategorySubcategories, getAllCategorySlugs, getSiblingCategoryJobs, getPopularLocations, getAllCategories, getAllSubcategorySlugs } from '@/lib/categories';
import { generateCollectionPageJsonLd, generateBreadcrumbJsonLd } from '@/lib/jsonld';
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
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found' };

  const title = category.seoTitle || `${category.label} Jobs in Kenya - Find ${category.label} Vacancies | JobBoard Kenya`;
  const description = category.seoDescription || `Browse ${category._count.jobs}+ ${category.label.toLowerCase()} job vacancies in Kenya. Updated daily with the latest ${category.label.toLowerCase()} opportunities from top employers.`;

  return {
    title,
    description: description.substring(0, 160),
    alternates: { canonical: `/categories/${category.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: description.substring(0, 160),
      url: `/categories/${category.slug}`,
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
  // Warm the subcategory slug cache so nested route's generateStaticParams
  // can read it synchronously (avoids Next.js 16/Turbopack Prisma bug)
  await getAllSubcategorySlugs();
  const slugs = await getAllCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const page = 1;
  const perPage = 20;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [jobsData, subcategories, siblingJobs, locations, allCategories] = await Promise.all([
    getCategoryJobs(category.id, page, perPage),
    getCategorySubcategories(category.id, category.slug),
    getSiblingCategoryJobs(category.id, 6),
    getPopularLocations(8),
    getAllCategories(),
  ]);

  const { jobs, total } = jobsData;
  const totalPages = Math.ceil(total / perPage);

  // JSON-LD
  const collectionLd = generateCollectionPageJsonLd({
    name: `${category.label} Jobs in Kenya`,
    description: category.seoDescription || category.description || `${category.label} job listings in Kenya`,
    url: `/categories/${category.slug}`,
    itemCount: total,
  });

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Job Categories', url: '/categories' },
    { name: category.label, url: `/categories/${category.slug}` },
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
            <Link href="/categories" className="hover:text-emerald-600 transition">Job Categories</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">{category.label}</span>
          </nav>
        </div>
      </section>

      {/* Header */}
      <section className="section-bg py-8 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                {category.label} Jobs in Kenya
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-semibold text-emerald-600">{total}</span> active vacancies
                &middot; <span className="text-gray-400">{category._count.subcategories} specializations</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/jobs?category=${category.slug}`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition">
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
              {category.description && (
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60">
                  <p className="text-sm text-gray-600 leading-relaxed">{category.description}</p>
                </div>
              )}

              {/* LAYER 2: Subcategory grid */}
              {subcategories.length > 0 && (
                <div>
                  <h2 className="text-lg font-extrabold text-gray-800 mb-4">Browse by Specialization</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subcategories.map((sub) => (
                      <Link
                        key={sub.urlSlug}
                        href={`/categories/${category.slug}/${sub.urlSlug}`}
                        className="group flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 hover:border-emerald-300 hover:shadow-sm transition"
                      >
                        <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700 transition">{sub.label}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{sub.jobCount}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Job listings or empty fallback */}
              {jobs.length > 0 ? (
                <div>
                  <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                    Latest {category.label} Vacancies
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
                          href={`/categories/${category.slug}?page=${p}`}
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

                  {/* Layer 3: Sibling jobs from same category */}
                  {siblingJobs.length > 0 && (
                    <div>
                      <h2 className="text-lg font-extrabold text-gray-800 mb-4">Related {category.label} Opportunities</h2>
                      <div className="space-y-3">
                        {siblingJobs.slice(0, 6).map((job) => (
                          <JobCard key={job.id} job={job} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Layer 4: Browse by location */}
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-800 mb-4">Browse {category.label} Jobs by County</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {locations.map((loc) => (
                        <Link
                          key={loc.slug}
                          href={`/jobs?category=${category.slug}&county=${loc.slug}`}
                          className="text-center p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 hover:border-emerald-300 hover:shadow-sm transition"
                        >
                          <span className="text-sm font-medium text-gray-700">{loc.county}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Layer 5: Other categories + CTA */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-6 border border-emerald-200/60">
                    <h2 className="text-lg font-extrabold text-gray-800 mb-2">Explore Other Categories</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                      {allCategories
                        .filter((c) => c.slug !== category.slug)
                        .slice(0, 9)
                        .map((c) => (
                          <Link
                            key={c.slug}
                            href={`/categories/${c.slug}`}
                            className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-white/60 hover:border-emerald-300 transition text-sm"
                          >
                            <span className="text-gray-700 font-medium">{c.label}</span>
                            <span className="text-xs text-gray-400">{c.jobCount}</span>
                          </Link>
                        ))}
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                      <Link href="/jobs" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition text-sm shadow-md shadow-emerald-200">
                        Browse All Jobs &rarr;
                      </Link>
                      <p className="text-xs text-gray-500">
                        Set up job alerts to get notified when new {category.label.toLowerCase()} positions are posted.
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
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Category Overview</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Active Jobs</span><span className="font-medium text-emerald-600">{total}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Specializations</span><span className="font-medium text-gray-700">{category._count.subcategories}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-medium text-gray-700">{category.label}</span></div>
                </div>
              </div>

              {/* All categories */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">All Categories</h3>
                <ul className="space-y-1">
                  {allCategories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/categories/${c.slug}`}
                        className={`flex items-center justify-between text-sm p-2 rounded-lg hover:bg-emerald-50/50 transition ${
                          c.slug === category.slug ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        <span>{c.label}</span>
                        <span className="text-xs text-gray-400">{c.jobCount}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Job alerts CTA */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-5 border border-emerald-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📬</span>
                  <h4 className="text-sm font-bold text-gray-700">Get {category.label} Job Alerts</h4>
                </div>
                <p className="text-xs text-gray-600">Be the first to know when new {category.label.toLowerCase()} jobs are posted.</p>
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
      {job.subcategory && (
        <p className="text-xs text-gray-400 mt-1">{job.subcategory.label}</p>
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