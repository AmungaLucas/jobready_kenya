import Link from 'next/link';
import { getClosingSoonJobs, timeAgo } from '@/lib/jobs';

function daysUntil(date: Date | null): string {
  if (!date) return 'Open';
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Closed';
  if (days === 1) return '1 day';
  return `${days} days`;
}

export default async function ClosingSoon() {
  let jobs: Awaited<ReturnType<typeof getClosingSoonJobs>> = [];
  try {
    jobs = await getClosingSoonJobs(14, 6);
  } catch {
    // Fallback: render empty section if DB is unavailable
  }

  return (
    <section className="section-bg py-10 border-t border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800">
                  ⏳ Don&apos;t Miss These Deadlines
                </h2>
                <p className="text-sm text-gray-500 font-light">
                  Applications closing soon. Submit your application before time runs out.
                </p>
              </div>
              <Link href="/jobs" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition">
                View All Deadlines →
              </Link>
            </div>
            <ul className="divide-y divide-gray-200/50 bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 px-4">
              {jobs.map((job) => (
                <li key={job.id} className="closing-item py-3 flex flex-wrap items-center justify-between gap-1">
                  <div className="job-meta-inline flex items-center gap-2 min-w-0">
                    <Link href={`/jobs/${job.slug}`} className="closing-title text-sm font-semibold text-gray-800 transition hover:text-emerald-600 truncate">
                      {job.title}
                    </Link>
                    <span className="meta-secondary closing-company text-xs text-gray-400 ml-2 transition whitespace-nowrap">{job.organization?.orgName || 'Confidential'}</span>
                  </div>
                  <span className="text-xs font-medium text-red-600 ml-auto">{daysUntil(job.deadline)}</span>
                </li>
              ))}
              {jobs.length === 0 && (
                <li className="py-6 text-sm text-gray-400 text-center">No deadlines closing soon</li>
              )}
            </ul>
            <div className="mt-6 pt-2 flex justify-center">
              <Link href="/jobs" className="text-sm font-medium text-gray-400 hover:text-emerald-600 transition inline-flex items-center gap-1.5">
                View all urgent deadlines
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-emerald-100/60 shadow-sm">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="text-xl font-extrabold text-gray-800">Professional CV &amp; Cover Letter</h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Stand out to Kenyan employers with a professionally written CV and cover letter tailored to your industry.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> ATS-friendly formatting</li>
                <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> Industry-specific keywords</li>
                <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> Cover letter included</li>
              </ul>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-sm font-medium text-gray-500">From</span>
                <span className="text-2xl font-extrabold text-emerald-600">KSh 1,500</span>
              </div>
              <Link href="/cv-services" className="mt-4 inline-block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-md shadow-emerald-200">
                Improve My CV →
              </Link>
              <p className="mt-3 text-xs text-gray-400 text-center">100% satisfaction guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}