import { Metadata } from 'next';
import { getJobs } from '@/lib/jobs';
import { employmentTypeLabels, formatSalary, timeAgo, formatDate } from '@/lib/jobs';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';
import Sidebar from '@/components/jobboard/Sidebar';
import FilterChips from '@/components/jobboard/FilterChips';
import Pagination from '@/components/jobboard/Pagination';
import Link from 'next/link';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Jobs in Kenya - Latest Vacancies & Career Opportunities | JobBoard Kenya',
  description: 'Browse the latest job vacancies in Kenya across all industries. Find full-time, part-time, contract, and internship opportunities from top employers. Updated daily.',
  alternates: { canonical: '/jobs' },
  openGraph: {
    title: 'Jobs in Kenya - Latest Vacancies | JobBoard Kenya',
    description: 'Browse the latest job vacancies in Kenya across all industries. Updated daily.',
    url: '/jobs',
    siteName: 'JobBoard Kenya',
  },
};

interface JobsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const category = typeof params.category === 'string' ? params.category : undefined;
  const location = typeof params.location === 'string' ? params.location : undefined;
  const type = typeof params.type === 'string' ? params.type : undefined;
  const county = typeof params.county === 'string' ? params.county : undefined;
  const search = typeof params.search === 'string' ? params.search : undefined;
  const page = typeof params.page === 'string' ? Number(params.page) : 1;
  const perPage = 20;

  const { jobs, total } = await getJobs({ category, location, type, county, search, page, perPage });

  return (
    <>
      <Navbar />
      <section className="section-bg py-8 border-b border-gray-200/50" style={{ paddingTop: '88px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800">Browse Jobs</h1>
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-emerald-600">{total}</span> opportunities
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search jobs, companies, or keywords"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>
              <button type="submit" form="search-form" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg whitespace-nowrap text-sm transition">
                Search
              </button>
            </div>
          </div>
          <FilterChips />
        </div>
      </section>

      <section className="section-bg py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {jobs.length === 0 ? (
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-10 border border-white/60 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="text-lg font-bold text-gray-800">No jobs found</h3>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your search filters or browse all categories.</p>
                  <Link href="/jobs" className="inline-block mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition">View all jobs →</Link>
                </div>
              ) : (
                jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.slug}`}
                    className="job-card block bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60 transition hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="job-title text-lg font-extrabold text-gray-800 transition">{job.title}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                          <span className="font-medium text-gray-700">{job.organization?.orgName || 'Confidential'}</span>
                          <span className="text-gray-300">•</span>
                          <span>{job.locationCity || job.locationCounty}</span>
                          {job.isRemote && (
                            <>
                              <span className="text-gray-300">•</span>
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
                      <span>💰 {formatSalary(job)}</span>
                      <span>•</span>
                      <span>📅 {timeAgo(job.datePosted)}</span>
                      <span>•</span>
                      <span>⏳ Closes {formatDate(job.deadline)}</span>
                    </div>
                  </Link>
                ))
              )}
              {total > perPage && (
                <Pagination total={total} perPage={perPage} currentPage={page} />
              )}
            </div>
            <Sidebar />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}