import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/jobs';

export default async function GovernmentJobs() {
  // National government jobs (orgType includes GOVERNMENT)
  const nationalJobs = await prisma.job.findMany({
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      organization: { orgType: { in: ['NATIONAL_GOVERNMENT', 'STATE_CORPORATION', 'REGULATORY_AUTHORITY'] } },
    },
    select: { slug: true, title: true, organization: { select: { orgName: true, orgType: true } }, deadline: true },
    orderBy: { datePosted: 'desc' },
    take: 4,
  });

  // County government jobs
  const countyJobs = await prisma.job.findMany({
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      organization: { orgType: 'COUNTY_GOVERNMENT' },
    },
    select: { slug: true, title: true, locationCounty: true, organization: { select: { orgName: true } }, deadline: true },
    orderBy: { datePosted: 'desc' },
    take: 4,
  });

  return (
    <section className="section-bg py-10 border-t border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">Public Sector Opportunities</h2>
            <p className="text-sm text-gray-500 font-light">
              National and county government vacancies, internships, shortlisting updates, and recruitment notices.
            </p>
          </div>
          <Link href="/government-jobs" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition whitespace-nowrap ml-4">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50/50 border-b border-blue-100/60">
              <span className="gov-badge national">National</span>
              <span className="text-sm font-semibold text-gray-800">Government of Kenya</span>
            </div>
            <ul className="divide-y divide-gray-200/50 px-4">
              {nationalJobs.map((job) => (
                <li key={job.slug} className="gov-item py-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link href={`/jobs/${job.slug}`} className="gov-title text-sm font-semibold text-gray-800 transition hover:text-emerald-600">
                      {job.title}
                    </Link>
                    <span className="gov-org text-sm text-gray-400 ml-2 transition">{job.organization?.orgName} · National</span>
                  </div>
                  <span className="text-xs text-gray-300">Closes {formatDate(job.deadline)}</span>
                </li>
              ))}
              {nationalJobs.length === 0 && (
                <li className="py-3 text-sm text-gray-400 text-center">No national government jobs currently listed</li>
              )}
            </ul>
            <div className="px-4 py-2 border-t border-gray-200/50 bg-white/30">
              <Link href="/government-jobs?type=NATIONAL_GOVERNMENT" className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition inline-flex items-center gap-1">
                View all national jobs
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-green-50/50 border-b border-green-100/60">
              <span className="gov-badge county">County</span>
              <span className="text-sm font-semibold text-gray-800">County Governments</span>
            </div>
            <ul className="divide-y divide-gray-200/50 px-4">
              {countyJobs.map((job) => (
                <li key={job.slug} className="gov-item py-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link href={`/jobs/${job.slug}`} className="gov-title text-sm font-semibold text-gray-800 transition hover:text-emerald-600">
                      {job.title}
                    </Link>
                    <span className="gov-org text-sm text-gray-400 ml-2 transition">{job.organization?.orgName || 'County Gov.'} · {job.locationCounty}</span>
                  </div>
                  <span className="text-xs text-gray-300">Closes {formatDate(job.deadline)}</span>
                </li>
              ))}
              {countyJobs.length === 0 && (
                <li className="py-3 text-sm text-gray-400 text-center">No county government jobs currently listed</li>
              )}
            </ul>
            <div className="px-4 py-2 border-t border-gray-200/50 bg-white/30">
              <Link href="/government-jobs?type=COUNTY_GOVERNMENT" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition inline-flex items-center gap-1">
                View all county jobs
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}