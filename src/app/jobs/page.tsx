import { jobs } from '@/data/jobs';
import JobCard from '@/components/jobboard/JobCard';
import Sidebar from '@/components/jobboard/Sidebar';
import FilterChips from '@/components/jobboard/FilterChips';
import Pagination from '@/components/jobboard/Pagination';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';

interface JobsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const category = typeof params.category === 'string' ? params.category : undefined;
  const location = typeof params.location === 'string' ? params.location : undefined;
  const type = typeof params.type === 'string' ? params.type : undefined;
  const page = typeof params.page === 'string' ? Number(params.page) : 1;
  const perPage = 20;

  let filtered = [...jobs];
  if (category) filtered = filtered.filter(j => j.category === category);
  if (location) filtered = filtered.filter(j => j.location.toLowerCase() === location);
  if (type) filtered = filtered.filter(j => j.type.toLowerCase() === type || (type === 'government' && j.company.includes('Gov')));

  const total = filtered.length;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const paginated = filtered.slice(start, end);

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
                  placeholder="Search jobs, companies, or keywords"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>
              <button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg whitespace-nowrap text-sm transition">
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
              {paginated.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
              <Pagination total={total} perPage={perPage} currentPage={page} />
            </div>
            <Sidebar />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}