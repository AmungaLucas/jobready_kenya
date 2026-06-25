import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  getGovernmentJobsByCounty,
  getGovernmentJobCountsByCounty,
  getAllGovernmentCountySlugs,
  getGovernmentOrgs,
  GOV_TYPE_LABELS,
} from '@/lib/government';
import { generateCollectionPageJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import { formatSalary, timeAgo, formatDate, employmentTypeLabels } from '@/lib/jobs';
import type { JobListItem } from '@/lib/jobs';
import { getAllCategories } from '@/lib/categories';
import { getPopularLocations } from '@/lib/locations';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';

// Remote MySQL: force dynamic — no ISR caching to minimize connections on Vercel
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface Props {
  params: Promise<{ county: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { county: slug } = await params;
  const location = await prisma.location.findUnique({ where: { slug } });
  if (!location) return { title: 'County Not Found' };

  const county = location.county;
  const title = `Government Jobs in ${county} County - Public Sector Vacancies | JobBoard Kenya`;
  const description = `Browse government job vacancies in ${county} County, Kenya. Find county government, national government, state corporation, and regulatory authority positions in ${county}. Updated daily.`;

  return {
    title,
    description: description.substring(0, 160),
    alternates: { canonical: `${SITE_URL}/government-jobs/${slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: description.substring(0, 160),
      url: `${SITE_URL}/government-jobs/${slug}`,
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

export default async function GovernmentJobsCountyPage({ params }: Props) {
  const { county: slug } = await params;
  const location = await prisma.location.findUnique({ where: { slug } });
  if (!location) notFound();

  const county = location.county;
  const perPage = 20;

  const [jobsData, counts, orgs, allCategories, popularLocations] = await Promise.all([
    getGovernmentJobsByCounty(county, 'all', 1, perPage),
    getGovernmentJobCountsByCounty(county),
    getGovernmentOrgs(),
    getAllCategories(),
    getPopularLocations(8),
  ]);

  const { jobs, total } = jobsData;

  // JSON-LD
  const collectionLd = generateCollectionPageJsonLd({
    name: `Government Jobs in ${county} County`,
    description: `Browse ${total}+ government job vacancies in ${county} County, Kenya from public sector employers.`,
    url: `/government-jobs/${slug}`,
    itemCount: total,
  });

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Jobs', url: '/jobs' },
    { name: 'Government Jobs', url: '/government-jobs' },
    { name: county, url: `/government-jobs/${slug}` },
  ]);

  // Other counties for fallback
  const otherCounties = await prisma.location.findMany({
    where: { slug: { not: slug } },
    select: { slug: true, county: true },
    orderBy: { county: 'asc' },
    take: 12,
  });

  // Filter gov orgs: match by org name containing county name
  const countyOrgs = orgs.filter(o => {
    const countyLower = county.toLowerCase();
    const orgLower = o.orgName.toLowerCase();
    return orgLower.includes(countyLower) || o.orgType === 'COUNTY_GOVERNMENT';
  }).slice(0, 10);

  // Fallback: if no matching orgs, don't show the section
  const showOrgs = countyOrgs.length > 0;

  // Tabs
  const tabs = [
    { key: 'all', label: `All (${counts.all || 0})` },
    { key: 'NATIONAL_GOVERNMENT', label: `National (${counts.NATIONAL_GOVERNMENT || 0})` },
    { key: 'COUNTY_GOVERNMENT', label: `County Gov (${counts.COUNTY_GOVERNMENT || 0})` },
    { key: 'STATE_CORPORATION', label: `State Corps (${counts.STATE_CORPORATION || 0})` },
    { key: 'REGULATORY_AUTHORITY', label: `Regulatory (${counts.REGULATORY_AUTHORITY || 0})` },
  ];

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
            <Link href="/jobs" className="hover:text-emerald-600 transition">Jobs</Link>
            <span>/</span>
            <Link href="/government-jobs" className="hover:text-emerald-600 transition">Government Jobs</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">{county}</span>
          </nav>
        </div>
      </section>

      {/* Header */}
      <section className="section-bg py-8 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">&#x1F3DB;</span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                  Government Jobs in {county} County
                </h1>
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-emerald-600">{total}</span> public sector vacancies in {county}
                &middot; <span className="text-gray-400">National, County &amp; State Corporation</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/government-jobs" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition">
                &larr; All Government Jobs
              </Link>
              <Link href={`/locations/${slug}`} className="text-sm font-medium text-gray-500 hover:text-gray-700 transition">
                All Jobs in {county} &rarr;
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

              {/* Filter tabs */}
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <Link
                    key={tab.key}
                    href={tab.key === 'all' ? `/government-jobs/${slug}` : `/government-jobs/${slug}?type=${tab.key}`}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      tab.key === 'all'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                        : 'bg-white/70 text-gray-600 hover:bg-gray-100 border border-white/60'
                    }`}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>

              {/* LAYER 1: SEO Description */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60 space-y-3">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Government jobs in {county} County include positions from the {county} County Government,
                  national government ministries and agencies operating in {county}, state corporations with offices
                  in the region, and regulatory authorities. Public sector employment in {county} offers competitive
                  salaries, pension benefits, job security, and structured career progression under the Commission
                  for Public Service and the County Public Service Board. Browse all current government vacancies
                  in {county} below, or use the tabs to filter by organization type.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The {county} County Government, established under the 2010 Constitution, employs professionals across departments including health, education, infrastructure, agriculture, finance, and administration. National government agencies such as the Teachers Service Commission (TSC), Kenya Revenue Authority (KRA), and National Police Service also recruit for positions based in {county}. To apply for government jobs in {county}, you will typically need to create an account on the Public Service Commission portal or the respective county&apos;s recruitment platform, and ensure your application is submitted before the stated deadline with all required documents including your CV, academic certificates, and national ID.
                </p>
              </div>

              {/* Job listings or empty fallback */}
              {jobs.length > 0 ? (
                <div>
                  <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                    Latest Government Vacancies in {county}
                  </h2>
                  <div className="space-y-3">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                </div>
              ) : (
                /* 5-LAYER EMPTY FALLBACK */
                <div className="space-y-6">

                  {/* Layer 2: Government organizations */}
                  {showOrgs && (
                    <div>
                      <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                        Government Employers in {county}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {countyOrgs.map((org) => (
                          <Link
                            key={org.orgSlug}
                            href={`/jobs?search=${encodeURIComponent(org.orgName)}`}
                            className="group flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 hover:border-emerald-300 hover:shadow-sm transition"
                          >
                            <div>
                              <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700 transition block">{org.orgName}</span>
                              <span className="text-xs text-gray-400">{GOV_TYPE_LABELS[org.orgType] || org.orgType}</span>
                            </div>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{org.jobCount}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Layer 3: Popular categories */}
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                      Popular Categories for Government Jobs in {county}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {allCategories.slice(0, 12).map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/categories/${cat.slug}?county=${slug}`}
                          className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-white/60 hover:border-emerald-300 transition text-sm"
                        >
                          <span className="text-gray-700 font-medium truncate mr-2">{cat.label}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">{cat.jobCount}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Layer 4: Other counties */}
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                      Government Jobs in Other Counties
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {otherCounties.map((loc) => (
                        <Link
                          key={loc.slug}
                          href={`/government-jobs/${loc.slug}`}
                          className="text-center p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 hover:border-emerald-300 hover:shadow-sm transition"
                        >
                          <span className="text-sm font-medium text-gray-700">{loc.county}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Layer 5: CTA + alert signup */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-6 border border-emerald-200/60">
                    <h2 className="text-lg font-extrabold text-gray-800 mb-2">
                      No government jobs in {county} right now
                    </h2>
                    <p className="text-sm text-gray-600">
                      Government vacancies in {county} are posted regularly, especially during annual recruitment
                      drives by the {county} County Public Service Board and national agencies. Set up an alert
                      and be the first to apply when new public sector positions are listed.
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                      <Link href="/government-jobs" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition text-sm shadow-md shadow-emerald-200">
                        All Government Jobs &rarr;
                      </Link>
                      <Link href={`/locations/${slug}`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition">
                        View all jobs in {county} &rarr;
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

              {/* Quick stats */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">
                  {county} County Overview
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Gov Vacancies</span><span className="font-medium text-emerald-600">{total}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">National</span><span className="font-medium text-gray-700">{counts.NATIONAL_GOVERNMENT || 0}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">County Gov</span><span className="font-medium text-gray-700">{counts.COUNTY_GOVERNMENT || 0}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">State Corps</span><span className="font-medium text-gray-700">{counts.STATE_CORPORATION || 0}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Regulatory</span><span className="font-medium text-gray-700">{counts.REGULATORY_AUTHORITY || 0}</span></div>
                </div>
              </div>

              {/* Gov counties sidebar */}
              {showOrgs && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Government Employers in {county}</h3>
                <ul className="space-y-1 max-h-48 overflow-y-auto">
                  {countyOrgs.map((org) => (
                    <li key={org.orgSlug}>
                      <Link
                        href={`/jobs?search=${encodeURIComponent(org.orgName)}`}
                        className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-emerald-50/50 transition text-gray-700"
                      >
                        <span className="truncate mr-2">{org.orgName}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{org.jobCount}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              )}

              {/* Other counties */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Other Counties</h3>
                <ul className="space-y-1 max-h-60 overflow-y-auto">
                  {otherCounties.map((loc) => (
                    <li key={loc.slug}>
                      <Link
                        href={`/government-jobs/${loc.slug}`}
                        className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-emerald-50/50 transition text-gray-700"
                      >
                        <span>{loc.county}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Job alerts CTA */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-5 border border-emerald-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">&#x1F4EC;</span>
                  <h4 className="text-sm font-bold text-gray-700">Get {county} Gov Job Alerts</h4>
                </div>
                <p className="text-xs text-gray-600">New government vacancies in {county} sent to your inbox.</p>
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