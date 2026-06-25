import { Metadata } from 'next';
import Link from 'next/link';
import { getAllLocationSlugs, getPopularLocations } from '@/lib/locations';
import { prisma } from '@/lib/prisma';
import { generateCollectionPageJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';
import AdBanner from '@/components/jobboard/AdBanner';

// Remote MySQL: force dynamic to avoid build-time connection exhaustion
export const dynamic = 'force-dynamic';

const title = 'Browse Jobs by Location in Kenya - All 47 Counties | JobBoard Kenya';
const description = 'Explore job vacancies across all 47 Kenyan counties. Find jobs in Nairobi, Mombasa, Kisumu, Nakuru, and every county in Kenya. Filter by location to discover opportunities near you.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/locations` },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/locations`,
    siteName: 'JobBoard Kenya',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title, description },
};

export default async function LocationsIndexPage() {
  // Get all locations with job counts
  const locations = await prisma.location.findMany({
    select: { county: true, slug: true, description: true },
    orderBy: { county: 'asc' },
  });

  // Batch count jobs per county
  const counties = locations.map(l => l.county);
  const jobCounts = counties.length > 0
    ? await prisma.job.groupBy({
        by: ['locationCounty'],
        where: { status: 'ACTIVE', deletedAt: null, locationCounty: { in: counties } },
        _count: { id: true },
      })
    : [];

  const countMap = new Map(jobCounts.map(j => [j.locationCounty, j._count.id]));

  const locationsWithCounts = locations
    .map(l => ({ ...l, jobCount: countMap.get(l.county) || 0 }))
    .sort((a, b) => b.jobCount - a.jobCount);

  const topLocations = locationsWithCounts.slice(0, 8);
  const allLocations = locationsWithCounts;
  const totalJobs = allLocations.reduce((sum, l) => sum + l.jobCount, 0);

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Locations', url: '/locations' },
  ]);

  const collectionLd = generateCollectionPageJsonLd({
    name: 'Jobs by Location in Kenya',
    description: `Browse job vacancies across all 47 Kenyan counties with ${totalJobs}+ active listings.`,
    url: '/locations',
    itemCount: allLocations.length,
  });

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
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-medium">Locations</span>
          </nav>
        </div>
      </section>

      {/* Hero */}
      <section className="section-bg py-12 md:py-16 border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            Browse Jobs by Location
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Explore job vacancies across all 47 Kenyan counties. Whether you are looking for opportunities in Nairobi, Mombasa, Kisumu, or any other county, we have listings from employers in every region of Kenya.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span><span className="font-semibold text-emerald-600">{allLocations.length}</span> counties</span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span><span className="font-semibold text-blue-600">{totalJobs}</span> active jobs</span>
            </span>
          </div>
        </div>
      </section>

      <section className="section-bg py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Top Locations */}
          <div className="mb-12">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Top Hiring Locations</h2>
            <p className="text-sm text-gray-500 mb-6">
              These counties have the most active job listings right now. Click any location to see all available positions.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {topLocations.map((loc) => (
                <Link
                  key={loc.slug}
                  href={`/locations/${loc.slug}`}
                  className="group bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60 hover:border-emerald-300 hover:shadow-md transition text-center"
                >
                  <span className="block text-lg font-extrabold text-gray-800 group-hover:text-emerald-600 transition">{loc.county}</span>
                  <span className="block text-xs text-gray-400 mt-1">{loc.jobCount} jobs</span>
                </Link>
              ))}
            </div>
          </div>

          <AdBanner slot="1111111111" className="mb-8" />

          {/* SEO Content */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/60 mb-12">
            <h2 className="text-xl font-extrabold text-gray-800 mb-3">Find Jobs in Every Kenyan County</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              JobBoard Kenya aggregates verified job listings from employers across all 47 counties, making it easy to find opportunities no matter where you are located or where you want to work. From the bustling metropolitan area of Nairobi, which hosts the headquarters of major corporations, international organisations, and government agencies, to growing economic hubs like Mombasa, Kisumu, Nakuru, and Eldoret, our platform ensures you have access to every corner of the Kenyan job market.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              County governments are among the largest employers in Kenya, with regular recruitment drives for professionals in healthcare, education, engineering, ICT, agriculture, and administration. Additionally, the devolution of government functions under the 2010 Constitution has created significant employment opportunities at the county level, with each of the 47 counties maintaining its own workforce across various departments and agencies.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Whether you are a fresh graduate starting your career, an experienced professional seeking new challenges, or someone looking to relocate to a different part of Kenya, browsing jobs by location helps you focus your search on the areas that matter most to you. Use the county listing below to explore all available positions in your preferred location.
            </p>
          </div>

          <AdBanner slot="3333333333" className="mb-8" />

          {/* All Locations Grid */}
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">All 47 Counties</h2>
            <p className="text-sm text-gray-500 mb-6">
              Browse every Kenyan county to find jobs near you. Counties with active listings are highlighted.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {allLocations.map((loc) => (
                <Link
                  key={loc.slug}
                  href={`/locations/${loc.slug}`}
                  className={`group flex items-center justify-between p-3 rounded-lg border transition text-sm ${
                    loc.jobCount > 0
                      ? 'bg-white/70 border-white/60 hover:border-emerald-300 hover:shadow-sm'
                      : 'bg-gray-50/70 border-gray-200/40 hover:border-gray-300'
                  }`}
                >
                  <span className={`font-medium truncate mr-2 ${loc.jobCount > 0 ? 'text-gray-700 group-hover:text-emerald-600' : 'text-gray-400'}`}>
                    {loc.county}
                  </span>
                  <span className={`text-xs flex-shrink-0 ${loc.jobCount > 0 ? 'text-emerald-600 font-medium' : 'text-gray-300'}`}>
                    {loc.jobCount}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-8 border border-emerald-200/60 text-center">
            <h2 className="text-xl font-extrabold text-gray-800 mb-2">Cannot Find Your Location?</h2>
            <p className="text-sm text-gray-600 max-w-lg mx-auto mb-6">
              We list jobs from all 47 Kenyan counties. If you are looking for remote positions or jobs that accept applicants from anywhere in Kenya, try browsing all jobs or setting up alerts for your preferred locations.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/jobs" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition text-sm shadow-md shadow-emerald-200">
                Browse All Jobs
              </Link>
              <Link href="/government-jobs" className="border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold px-6 py-3 rounded-lg transition text-sm">
                Government Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}