import { Metadata } from 'next';
import Link from 'next/link';
import { getGovernmentJobs, getGovernmentOrgs, getGovernmentJobCounts, getAllGovernmentCountySlugs, GOV_TYPE_LABELS } from '@/lib/government';
import { generateCollectionPageJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import { formatSalary, timeAgo, formatDate, employmentTypeLabels } from '@/lib/jobs';
import type { JobListItem } from '@/lib/jobs';
import { getAllCategories } from '@/lib/categories';
import { getPopularLocations } from '@/lib/locations';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';
import GoogleAd from '@/components/jobboard/GoogleAd';

export const revalidate = 60;

interface GovJobsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: GovJobsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const type = typeof params.type === 'string' ? params.type : undefined;
  const typeLabel = type && type !== 'all' ? (GOV_TYPE_LABELS[type] || '') : '';

  const title = type && type !== 'all'
    ? `${typeLabel} Jobs in Kenya - Government Vacancies | JobBoard Kenya`
    : 'Government Jobs in Kenya - Public Sector Vacancies & Careers | JobBoard Kenya';

  const description = type && type !== 'all'
    ? `Browse the latest ${typeLabel.toLowerCase()} job vacancies in Kenya. Apply for ${typeLabel.toLowerCase()} positions from ministries, agencies, and parastatals. Updated daily.`
    : 'Browse government jobs in Kenya including national government, county government, state corporations, and regulatory authorities. Updated daily with public sector vacancies from across Kenya.';

  return {
    title,
    description: description.substring(0, 160),
    alternates: { canonical: `${SITE_URL}${type ? `/government-jobs?type=${type}` : '/government-jobs'}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: description.substring(0, 160),
      url: `${SITE_URL}${type ? `/government-jobs?type=${type}` : '/government-jobs'}`,
      siteName: 'JobBoard Kenya',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.substring(0, 160),
    },
  };
}

export default async function GovernmentJobsPage({ searchParams }: GovJobsPageProps) {
  const params = await searchParams;
  const type = typeof params.type === 'string' ? params.type : 'all';
  const page = typeof params.page === 'string' ? Number(params.page) : 1;
  const perPage = 20;

  const [jobsData, orgs, counts, allCategories, locations, govCounties] = await Promise.all([
    getGovernmentJobs(type, page, perPage),
    getGovernmentOrgs(),
    getGovernmentJobCounts(),
    getAllCategories(),
    getPopularLocations(8),
    getAllGovernmentCountySlugs(),
  ]);

  const { jobs, total } = jobsData;

  // JSON-LD
  const typeLabel = type !== 'all' ? (GOV_TYPE_LABELS[type] || 'Government') : 'Government';
  const collectionLd = generateCollectionPageJsonLd({
    name: `${typeLabel} Jobs in Kenya`,
    description: `Browse ${total}+ ${typeLabel.toLowerCase()} job vacancies in Kenya from public sector employers.`,
    url: type ? `/government-jobs?type=${type}` : '/government-jobs',
    itemCount: total,
  });

  const breadcrumbItems: { name: string; url: string }[] = [
    { name: 'Home', url: '/' },
    { name: 'Jobs', url: '/jobs' },
    { name: 'Government Jobs', url: '/government-jobs' },
  ];
  if (type !== 'all') {
    breadcrumbItems.push({ name: typeLabel, url: `/government-jobs?type=${type}` });
  }

  const breadcrumbLd = generateBreadcrumbJsonLd(breadcrumbItems);

  // Tab definitions
  const tabs = [
    { key: 'all', label: `All Government (${counts.all || 0})` },
    { key: 'NATIONAL_GOVERNMENT', label: `National (${counts.NATIONAL_GOVERNMENT || 0})` },
    { key: 'COUNTY_GOVERNMENT', label: `County (${counts.COUNTY_GOVERNMENT || 0})` },
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
            {breadcrumbItems.map((item, i) => (
              <span key={item.url} className="flex items-center gap-2">
                {i > 0 && <span className="text-gray-300">/</span>}
                {i < breadcrumbItems.length - 1 ? (
                  <Link href={item.url} className="hover:text-emerald-600 transition">{item.name}</Link>
                ) : (
                  <span className="text-gray-700 font-medium">{item.name}</span>
                )}
              </span>
            ))}
          </nav>
        </div>
      </section>

      {/* Header */}
      <section className="section-bg py-8 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🏛️</span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                  {type !== 'all' ? `${typeLabel} Jobs in Kenya` : 'Government Jobs in Kenya'}
                </h1>
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-emerald-600">{total}</span> public sector vacancies
                &middot; <span className="text-gray-400">{orgs.length} government employers</span>
              </p>
            </div>
            <Link href="/jobs" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition whitespace-nowrap">
              &larr; All Jobs
            </Link>
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
                    href={tab.key === 'all' ? '/government-jobs' : `/government-jobs?type=${tab.key}`}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      type === tab.key
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                        : 'bg-white/70 text-gray-600 hover:bg-gray-100 border border-white/60'
                    }`}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>

              {/* SEO intro */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60">
                {type !== 'all' ? (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Browse the latest {GOV_TYPE_LABELS[type]?.toLowerCase() || 'government'} job vacancies in Kenya. 
                    These positions are offered by {GOV_TYPE_LABELS[type]?.toLowerCase() || 'government'} entities including 
                    ministries, departments, agencies, and parastatals. Government jobs in Kenya are highly sought after 
                    due to job security, competitive benefits, and opportunities for career advancement in the public service. 
                    Check this page regularly for new {GOV_TYPE_LABELS[type]?.toLowerCase() || 'government'} openings across 
                    all counties and sectors.
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Government jobs in Kenya span national government ministries, county governments, state corporations, 
                    and regulatory authorities. Public sector employment offers competitive salaries, pension benefits, 
                    job security, and structured career progression. The Government of Kenya is one of the largest employers 
                    in the country, with vacancies regularly advertised through official gazette notices, Public Service 
                    Commission (PSC) listings, and individual agency recruitment portals. Browse all current government 
                    vacancies below, filtered by organization type, or use the tabs to narrow your search to specific 
                    public sector categories.
                  </p>
                )}
              </div>

              {/* Job listings or empty fallback */}
              {jobs.length > 0 ? (
                <div>
                  <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                    Latest Government Vacancies
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
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                      Government Employers on JobBoard Kenya
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {orgs.map((org) => (
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

                  {/* Layer 3: Categories with government jobs */}
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                      Popular Categories for Government Jobs
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {allCategories.slice(0, 12).map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/categories/${cat.slug}`}
                          className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-white/60 hover:border-emerald-300 transition text-sm"
                        >
                          <span className="text-gray-700 font-medium truncate mr-2">{cat.label}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">{cat.jobCount}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Layer 4: Browse by county */}
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                      Government Jobs by County
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

                  {/* Layer 5: CTA + alert signup */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-6 border border-emerald-200/60">
                    <h2 className="text-lg font-extrabold text-gray-800 mb-2">
                      No {type !== 'all' ? GOV_TYPE_LABELS[type]?.toLowerCase() : 'government'} jobs right now
                    </h2>
                    <p className="text-sm text-gray-600">
                      Government vacancies are posted regularly, especially during recruitment drives. 
                      Set up an alert and be the first to apply when new public sector positions are listed.
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                      <Link href="/jobs" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition text-sm shadow-md shadow-emerald-200">
                        Browse All Jobs &rarr;
                      </Link>
                      <p className="text-xs text-gray-500">
                        Check back soon or set up a job alert for government vacancies.
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

              {/* Sidebar Ad */}
              <GoogleAd slot="gov-jobs-sidebar" format="rectangle" className="rounded-xl" style={{ minHeight: '250px' }} />

              {/* Quick stats */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Government Overview</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Total Vacancies</span><span className="font-medium text-emerald-600">{total}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">National</span><span className="font-medium text-gray-700">{counts.NATIONAL_GOVERNMENT || 0}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">County</span><span className="font-medium text-gray-700">{counts.COUNTY_GOVERNMENT || 0}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">State Corps</span><span className="font-medium text-gray-700">{counts.STATE_CORPORATION || 0}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Regulatory</span><span className="font-medium text-gray-700">{counts.REGULATORY_AUTHORITY || 0}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Employers</span><span className="font-medium text-gray-700">{orgs.length}</span></div>
                </div>
              </div>

              {/* Government organizations */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Government Employers</h3>
                <ul className="space-y-1">
                  {orgs.map((org) => (
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

              {/* Browse by County */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Gov Jobs by County</h3>
                <ul className="space-y-1 max-h-60 overflow-y-auto">
                  {govCounties.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/government-jobs/${c.slug}`}
                        className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-emerald-50/50 transition text-gray-700"
                      >
                        <span>{c.county}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Job alerts CTA */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-5 border border-emerald-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📬</span>
                  <h4 className="text-sm font-bold text-gray-700">Get Government Job Alerts</h4>
                </div>
                <p className="text-xs text-gray-600">New government vacancies sent to your inbox.</p>
                <div className="mt-3 flex flex-col gap-2">
                  <input type="email" placeholder="Your email" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-emerald-600" />
                  <button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition text-sm">Subscribe</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Bottom Ad */}
      <div className="section-bg pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GoogleAd slot="gov-jobs-bottom" format="horizontal" className="rounded-xl" style={{ minHeight: '90px' }} />
        </div>
      </div>
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