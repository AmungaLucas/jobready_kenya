import Link from 'next/link';

const nationalJobs = [
  { title: 'Tax Officer', org: 'KRA · Nairobi', closes: 'Closes 30 Jun' },
  { title: 'ICT Officer', org: 'ICT Authority · Nairobi', closes: 'Closes 5 Jul' },
  { title: 'Customs Officer', org: 'KRA · Mombasa', closes: 'Closes 15 Jul' },
  { title: 'Public Health Officer', org: 'MOH · Nairobi', closes: 'Closes 20 Jul' },
];

const countyJobs = [
  { title: 'Agricultural Officer', org: 'County Gov. Nakuru', closes: 'Closes 25 Jun' },
  { title: 'Public Health Officer', org: 'County Gov. Mombasa', closes: 'Closes 2 Jul' },
  { title: 'Water Engineer', org: 'County Gov. Kisumu', closes: 'Closes 10 Jul' },
  { title: 'Community Development Officer', org: 'County Gov. Machakos', closes: 'Closes 18 Jul' },
];

export default function GovernmentJobs() {
  return (
    <section className="section-bg py-10 border-t border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">🏛️ Public Sector Opportunities</h2>
            <p className="text-sm text-gray-500 font-light">
              National and county government vacancies, internships, shortlisting updates, and recruitment notices.
            </p>
          </div>
          <Link href="/jobs?type=government" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition whitespace-nowrap ml-4">
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
              {nationalJobs.map((job, idx) => (
                <li key={idx} className="gov-item py-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link href={`/jobs/${idx + 1}`} className="gov-title text-sm font-semibold text-gray-800 transition hover:text-emerald-600">
                      {job.title}
                    </Link>
                    <span className="gov-org text-sm text-gray-400 ml-2 transition">{job.org}</span>
                  </div>
                  <span className="text-xs text-gray-300">{job.closes}</span>
                </li>
              ))}
            </ul>
            <div className="px-4 py-2 border-t border-gray-200/50 bg-white/30">
              <Link href="/jobs?type=government" className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition inline-flex items-center gap-1">
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
              {countyJobs.map((job, idx) => (
                <li key={idx} className="gov-item py-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link href={`/jobs/${idx + 10}`} className="gov-title text-sm font-semibold text-gray-800 transition hover:text-emerald-600">
                      {job.title}
                    </Link>
                    <span className="gov-org text-sm text-gray-400 ml-2 transition">{job.org}</span>
                  </div>
                  <span className="text-xs text-gray-300">{job.closes}</span>
                </li>
              ))}
            </ul>
            <div className="px-4 py-2 border-t border-gray-200/50 bg-white/30">
              <Link href="/jobs?type=county" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition inline-flex items-center gap-1">
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