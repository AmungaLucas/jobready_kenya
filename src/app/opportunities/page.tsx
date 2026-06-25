import { Metadata } from 'next';
import Link from 'next/link';
import { getOpportunities, getOpportunityCounts, OPP_TYPE_LABELS, OPP_TYPES, OPP_TYPE_DESCRIPTIONS, formatFunding } from '@/lib/opportunities';
import { generateCollectionPageJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import { timeAgo } from '@/lib/jobs';
import type { OpportunityListItem } from '@/lib/opportunities';
import { getAllCategories } from '@/lib/categories';
import { getPopularLocations } from '@/lib/locations';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';
import AdBanner from '@/components/jobboard/AdBanner';

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const type = typeof params.type === 'string' ? params.type : undefined;
  const typeLabel = type && type !== 'all' ? (OPP_TYPE_LABELS[type] || '') : '';

  const title = type && type !== 'all'
    ? `${typeLabel} in Kenya - Find ${typeLabel.toLowerCase()} | JobBoard Kenya`
    : 'Opportunities in Kenya - Scholarships, Grants, Fellowships & More | JobBoard Kenya';

  const description = type && type !== 'all'
    ? `Browse the latest ${typeLabel.toLowerCase()} in Kenya. ${OPP_TYPE_DESCRIPTIONS[type]?.substring(0, 100) || ''} Updated daily.`.substring(0, 160)
    : 'Browse scholarships, grants, fellowships, sponsorships, competitions, training, and volunteer opportunities in Kenya. Updated daily.';

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${type ? `/opportunities?type=${type}` : '/opportunities'}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${type ? `/opportunities?type=${type}` : '/opportunities'}`,
      siteName: 'JobBoard Kenya',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function OpportunitiesPage({ searchParams }: Props) {
  const params = await searchParams;
  const type = typeof params.type === 'string' ? params.type : 'all';

  const [oppData, counts, allCategories, locations] = await Promise.all([
    getOpportunities(type, 1, 20),
    getOpportunityCounts(),
    getAllCategories(),
    getPopularLocations(8),
  ]);

  const { opportunities, total } = oppData;
  const typeLabel = type !== 'all' ? (OPP_TYPE_LABELS[type] || 'Opportunities') : 'Opportunities';

  // JSON-LD
  const collectionLd = generateCollectionPageJsonLd({
    name: `${typeLabel} in Kenya`,
    description: `Browse ${total}+ ${typeLabel.toLowerCase()} in Kenya.`,
    url: type ? `/opportunities?type=${type}` : '/opportunities',
    itemCount: total,
  });

  const breadcrumbItems: { name: string; url: string }[] = [
    { name: 'Home', url: '/' },
    { name: 'Opportunities', url: '/opportunities' },
  ];
  if (type !== 'all') {
    breadcrumbItems.push({ name: typeLabel, url: `/opportunities?type=${type}` });
  }

  const breadcrumbLd = generateBreadcrumbJsonLd(breadcrumbItems);

  // Tabs
  const tabs = [
    { key: 'all', label: `All (${counts.all || 0})` },
    ...OPP_TYPES.map(t => ({
      key: t,
      label: `${OPP_TYPE_LABELS[t] || t} (${counts[t] || 0})`,
    })),
  ];

  // SEO description for the active type
  const seoDescription = type !== 'all' && OPP_TYPE_DESCRIPTIONS[type]
    ? OPP_TYPE_DESCRIPTIONS[type]
    : 'Explore a wide range of opportunities in Kenya including scholarships, grants, fellowships, sponsorships, mentorship programs, competitions, conferences, professional training, and volunteer positions. Whether you are a student, professional, entrepreneur, or community member, there are opportunities available to support your growth and development. Browse all current opportunities below, or use the tabs to filter by type and find the perfect opportunity for your goals.';

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
                <span className="text-lg">&#x1F680;</span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                  {type !== 'all' ? `${typeLabel} in Kenya` : 'Opportunities in Kenya'}
                </h1>
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-emerald-600">{total}</span> opportunities available
                &middot; <span className="text-gray-400">Scholarships, Grants, Fellowships &amp; more</span>
              </p>
            </div>
            <Link href="/jobs" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition whitespace-nowrap">
              &larr; Browse Jobs
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
                    href={tab.key === 'all' ? '/opportunities' : `/opportunities?type=${tab.key}`}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      type === tab.key
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                        : 'bg-white/70 text-gray-600 hover:bg-gray-100 border border-white/60'
                    }`}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>

              {/* LAYER 1: SEO Description */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60">
                <p className="text-sm text-gray-600 leading-relaxed">{seoDescription}</p>
              </div>

              <AdBanner slot="2222222222" className="my-6" />

              {/* Opportunity listings or empty fallback */}
              <AdBanner slot="1111111111" className="mb-6" />
              {opportunities.length > 0 ? (
                <div>
                  <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                    Latest {type !== 'all' ? typeLabel : 'Opportunities'}
                  </h2>
                  <div className="space-y-3">
                    {opportunities.map((opp) => (
                      <OppCard key={opp.id} opp={opp} />
                    ))}
                  </div>
                </div>
              ) : (
                /* 5-LAYER EMPTY FALLBACK */
                <div className="space-y-6">

                  {/* Layer 2: Opportunity type descriptions */}
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                      {type !== 'all' ? `About ${typeLabel} in Kenya` : 'Explore All Opportunity Types'}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(type !== 'all' ? [type] : OPP_TYPES).map((t) => (
                        <Link
                          key={t}
                          href={`/opportunities?type=${t}`}
                          className={`group p-4 bg-white/70 backdrop-blur-sm rounded-xl border transition ${
                            t === type ? 'border-emerald-400 bg-emerald-50/50' : 'border-white/60 hover:border-emerald-300 hover:shadow-sm'
                          }`}
                        >
                          <span className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition block">
                            {OPP_TYPE_LABELS[t] || t}
                          </span>
                          <span className="text-xs text-gray-500 line-clamp-2 mt-1 block">
                            {OPP_TYPE_DESCRIPTIONS[t]?.substring(0, 120)}...
                          </span>
                          <span className="text-xs text-emerald-600 font-medium mt-2 block">
                            {counts[t] || 0} listed
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Layer 3: Popular categories (cross-link) */}
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                      Related Job Categories
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
                      Opportunities by Location
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
                      {type !== 'all' ? `No ${typeLabel.toLowerCase()} listed right now` : 'No opportunities listed right now'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Opportunities are posted regularly by universities, foundations, government agencies, and international
                      organizations. Set up an alert and be the first to know when new {type !== 'all' ? typeLabel.toLowerCase() : 'opportunities'} are listed.
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                      <Link href="/jobs" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition text-sm shadow-md shadow-emerald-200">
                        Browse Jobs &rarr;
                      </Link>
                      <Link href="/government-jobs" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition">
                        Government Jobs &rarr;
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
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Opportunities Overview</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-medium text-emerald-600">{total}</span></div>
                  {OPP_TYPES.filter(t => (counts[t] || 0) > 0).map(t => (
                    <div key={t} className="flex justify-between">
                      <span className="text-gray-500">{OPP_TYPE_LABELS[t]}</span>
                      <span className="font-medium text-gray-700">{counts[t]}</span>
                    </div>
                  ))}
                  {OPP_TYPES.filter(t => (counts[t] || 0) === 0).length === OPP_TYPES.length && (
                    <p className="text-xs text-gray-400 pt-1">No opportunities posted yet. Check back soon.</p>
                  )}
                </div>
              </div>

              {/* All opportunity types */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">All Types</h3>
                <ul className="space-y-1">
                  {OPP_TYPES.map(t => (
                    <li key={t}>
                      <Link
                        href={`/opportunities?type=${t}`}
                        className={`flex items-center justify-between text-sm p-2 rounded-lg hover:bg-emerald-50/50 transition ${
                          type === t ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        <span>{OPP_TYPE_LABELS[t]}</span>
                        <span className="text-xs text-gray-400">{counts[t] || 0}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Job alerts CTA */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-5 border border-emerald-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">&#x1F4EC;</span>
                  <h4 className="text-sm font-bold text-gray-700">Get Opportunity Alerts</h4>
                </div>
                <p className="text-xs text-gray-600">New scholarships, grants, and opportunities sent to your inbox.</p>
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

function OppCard({ opp }: { opp: OpportunityListItem }) {
  return (
    <Link
      href={`/opportunities/${opp.slug}`}
      className="job-card block bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60 transition hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="job-title text-lg font-extrabold text-gray-800 transition">{opp.title}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
            <span className="font-medium text-gray-700">{opp.providerName}</span>
            <span className="text-gray-300">&middot;</span>
            <span>{opp.locationCity || opp.locationCounty || (opp.isOnline ? 'Online' : 'Kenya')}</span>
            {opp.isRemote && (
              <>
                <span className="text-gray-300">&middot;</span>
                <span className="text-emerald-600 font-medium">Remote</span>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {opp.featured && (
            <span className="text-xs font-medium text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full">Featured</span>
          )}
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {OPP_TYPE_LABELS[opp.type] || opp.type}
          </span>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            {formatFunding(opp)}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{opp.description}</p>
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400">
        {opp.duration && <span>{opp.duration}</span>}
        {opp.duration && <span>&middot;</span>}
        <span>{timeAgo(opp.datePosted)}</span>
        {opp.deadline && (
          <>
            <span>&middot;</span>
            <span>Closes {opp.deadline.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</span>
          </>
        )}
      </div>
    </Link>
  );
}