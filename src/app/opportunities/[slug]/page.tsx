import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getOpportunityBySlug, getAllOpportunitySlugs, OPP_TYPE_LABELS, formatFunding } from '@/lib/opportunities';
import { generateOpportunityJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import { getJobs } from '@/lib/jobs';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';

// Remote MySQL: force dynamic — no ISR caching to minimize connections on Vercel
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const opp = await getOpportunityBySlug(slug);
  if (!opp) return { title: 'Opportunity Not Found' };

  const typeLabel = OPP_TYPE_LABELS[opp.type] || opp.type;
  const title = opp.seoTitle || `${opp.title} - ${typeLabel} in Kenya | JobBoard Kenya`;
  const description = opp.seoDescription || `${opp.title} offered by ${opp.providerName}. ${opp.description.substring(0, 100).trim()}. Apply now on JobBoard Kenya.`;

  return {
    title,
    description: description.substring(0, 160),
    alternates: { canonical: `${SITE_URL}/opportunities/${opp.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: description.substring(0, 160),
      type: 'article',
      publishedTime: opp.datePosted.toISOString(),
      url: `${SITE_URL}/opportunities/${opp.slug}`,
      siteName: 'JobBoard Kenya',
      images: opp.providerOrg?.orgLogoUrl ? [{ url: opp.providerOrg.orgLogoUrl, width: 1200, height: 630, alt: opp.title }] : [],
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

export default async function OpportunityDetailPage({ params }: Props) {
  const { slug } = await params;
  const opp = await getOpportunityBySlug(slug);
  if (!opp || opp.status !== 'ACTIVE' || opp.deletedAt) notFound();

  const typeLabel = OPP_TYPE_LABELS[opp.type] || opp.type;

  // JSON-LD
  const oppLd = generateOpportunityJsonLd({
    title: opp.title,
    description: opp.description,
    slug: opp.slug,
    datePosted: opp.datePosted,
    deadline: opp.deadline,
    providerName: opp.providerOrg?.orgName || opp.providerName,
    providerLogoUrl: opp.providerOrg?.orgLogoUrl || opp.providerLogoUrl,
    providerWebsite: opp.providerOrg?.orgWebsite || opp.providerWebsite,
    locationCity: opp.locationCity,
    locationCounty: opp.locationCounty,
    isOnline: opp.isOnline,
    fundingAmount: opp.fundingAmount,
    fundingCurrency: opp.fundingCurrency,
  });

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Opportunities', url: '/opportunities' },
    { name: typeLabel, url: `/opportunities?type=${opp.type}` },
    { name: opp.title, url: `/opportunities/${opp.slug}` },
  ]);

  // Related jobs by county
  const { jobs: similarJobs } = await getJobs({ county: opp.locationCounty || undefined, perPage: 5 });

  const location = [opp.locationCity, opp.locationCounty].filter(Boolean).join(', ') || (opp.isOnline ? 'Online' : 'Kenya');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(oppLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />

      {/* Breadcrumb */}
      <section className="section-bg py-4 border-b border-gray-200/50" style={{ paddingTop: '88px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
            <span>/</span>
            <Link href="/opportunities" className="hover:text-emerald-600 transition">Opportunities</Link>
            <span>/</span>
            <Link href={`/opportunities?type=${opp.type}`} className="hover:text-emerald-600 transition">{typeLabel}</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">{opp.title}</span>
          </nav>
        </div>
      </section>

      <section className="section-bg py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Main content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Header */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {opp.featured && (
                    <span className="text-xs font-medium text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full">Featured</span>
                  )}
                  {opp.isOnline && (
                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">Online</span>
                  )}
                  {opp.isRemote && (
                    <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">Remote</span>
                  )}
                  {opp.openToInternational && (
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Open Internationally</span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 leading-tight">{opp.title}</h1>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="font-medium text-gray-700">{opp.providerOrg?.orgName || opp.providerName}</span>
                  <span className="text-gray-300 mx-2">&middot;</span>
                  <span>{location}</span>
                  {opp.duration && (
                    <>
                      <span className="text-gray-300 mx-2">&middot;</span>
                      <span>{opp.duration}</span>
                    </>
                  )}
                  {opp.deadline && (
                    <>
                      <span className="text-gray-300 mx-2">&middot;</span>
                      <span className="font-medium text-red-600">Deadline: {opp.deadline.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </>
                  )}
                </p>
              </div>

              {/* Combined Content Flow */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60 space-y-5">
                <div>
                  <h2 className="text-base font-bold text-gray-800">Description</h2>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mt-2">{opp.description}</div>
                </div>

                {opp.eligibilityCriteria && (
                  <div>
                    <h2 className="text-base font-bold text-gray-800">Eligibility Criteria</h2>
                    <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mt-2">{opp.eligibilityCriteria}</div>
                  </div>
                )}

                {opp.requirements && (
                  <div>
                    <h2 className="text-base font-bold text-gray-800">Requirements</h2>
                    <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mt-2">{opp.requirements}</div>
                  </div>
                )}

                {opp.benefits && (
                  <div>
                    <h2 className="text-base font-bold text-gray-800">Benefits</h2>
                    <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mt-2">{opp.benefits}</div>
                  </div>
                )}

                {opp.howToApply && (
                  <div>
                    <h2 className="text-base font-bold text-gray-800">How to Apply</h2>
                    <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mt-2">{opp.howToApply}</div>
                  </div>
                )}
              </div>

              {/* Apply CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-6 border border-emerald-200/60">
                {opp.applicationUrl ? (
                  <a
                    href={opp.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-lg transition text-sm shadow-md shadow-emerald-200"
                  >
                    Apply Now &rarr;
                  </a>
                ) : opp.applyEmail ? (
                  <a
                    href={`mailto:${opp.applyEmail}`}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-lg transition text-sm shadow-md shadow-emerald-200"
                  >
                    Apply via Email &rarr;
                  </a>
                ) : (
                  <button
                    type="button"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-lg transition text-sm shadow-md shadow-emerald-200"
                  >
                    Apply Now &rarr;
                  </button>
                )}
                {opp.providerWebsite && (
                  <a href={opp.providerWebsite} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-500 hover:text-gray-700 transition">
                    Visit provider website &rarr;
                  </a>
                )}
              </div>

              {/* Related Jobs — simple list */}
              {similarJobs.length > 0 && (
                <div>
                  <h2 className="text-base font-bold text-gray-800 mb-2">Related Jobs</h2>
                  <ul className="divide-y divide-gray-200/50">
                    {similarJobs.map((job) => (
                      <li key={job.id}>
                        <Link
                          href={`/jobs/${job.slug}`}
                          className="flex items-center justify-between py-2.5 px-1 hover:text-emerald-600 transition min-w-0 group"
                        >
                          <span className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 truncate">{job.title}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-3">{job.organization?.orgName} &middot; {job.locationCity || job.locationCounty}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick info */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Quick Info</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium text-gray-700">{typeLabel}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Funding</span><span className="font-medium text-gray-700">{formatFunding(opp)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium text-gray-700">{location}</span></div>
                  {opp.duration && <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="font-medium text-gray-700">{opp.duration}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Posted</span><span className="font-medium text-gray-700">{opp.datePosted.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
                  {opp.deadline && <div className="flex justify-between"><span className="text-gray-500">Deadline</span><span className="font-medium text-gray-700">{opp.deadline.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>}
                  {opp.targetDemographic && <div className="flex justify-between"><span className="text-gray-500">Target</span><span className="font-medium text-gray-700">{opp.targetDemographic}</span></div>}
                </div>
              </div>

              {/* Provider info */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Provider</h3>
                <p className="text-sm font-medium text-gray-800">{opp.providerOrg?.orgName || opp.providerName}</p>
                {opp.providerOrg?.orgWebsite && (
                  <a href={opp.providerOrg.orgWebsite} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline block mt-1">
                    Visit website
                  </a>
                )}
              </div>

              {/* Back links */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Browse</h3>
                <ul className="space-y-1">
                  <li>
                    <Link href={`/opportunities?type=${opp.type}`} className="text-sm text-gray-700 hover:text-emerald-600 transition p-2 block rounded-lg hover:bg-emerald-50/50">
                      All {typeLabel} &rarr;
                    </Link>
                  </li>
                  <li>
                    <Link href="/opportunities" className="text-sm text-gray-700 hover:text-emerald-600 transition p-2 block rounded-lg hover:bg-emerald-50/50">
                      All Opportunities &rarr;
                    </Link>
                  </li>
                  <li>
                    <Link href="/jobs" className="text-sm text-gray-700 hover:text-emerald-600 transition p-2 block rounded-lg hover:bg-emerald-50/50">
                      Browse Jobs &rarr;
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Alert CTA */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-5 border border-emerald-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">&#x1F4EC;</span>
                  <h4 className="text-sm font-bold text-gray-700">Get Similar Alerts</h4>
                </div>
                <p className="text-xs text-gray-600">Get notified about new {typeLabel.toLowerCase()}.</p>
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

