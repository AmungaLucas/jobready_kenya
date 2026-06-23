import Link from 'next/link';

export default function Hero() {
  return (
    <section className="section-bg py-12 md:py-16" style={{ marginTop: 0 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="space-y-5">
            <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">
              Stop Searching. Start Matching.
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800 leading-[1.15]">
              Find Jobs That Fit You, <br />
              <span className="text-emerald-600">Not Just Your Keywords</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed max-w-lg">
              Discover verified jobs, internships, and opportunities matched to your skills and experience.
              Get real-time alerts and apply directly to trusted employers across Kenya.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full max-w-2xl pt-1">
              <input
                type="text"
                placeholder="Job title, skill, or company"
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:border-emerald-600"
              />
              <button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg whitespace-nowrap text-sm transition">
                Find Matching Jobs
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
              <Link
                href="#"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-emerald-600 transition border border-gray-300 hover:border-emerald-500 px-4 py-1.5 rounded-full bg-white/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Your CV
              </Link>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                <span className="flex items-center"><span className="text-emerald-600 font-bold mr-1">✓</span> Verified employers</span>
                <span className="flex items-center"><span className="text-emerald-600 font-bold mr-1">✓</span> Daily updates</span>
                <span className="flex items-center"><span className="text-emerald-600 font-bold mr-1">✓</span> WhatsApp alerts</span>
                <span className="flex items-center"><span className="text-emerald-600 font-bold mr-1">✓</span> Free CV upload</span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between border-b border-gray-200/70 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recently Posted</h2>
              </div>
              <Link href="/jobs" className="text-xs font-medium text-gray-400 hover:text-emerald-600 transition">
                View all →
              </Link>
            </div>
            <ul className="divide-y divide-gray-200/50">
              {[
                { title: 'Senior Software Engineer', company: 'Safaricom', time: '2h' },
                { title: 'Public Health Officer', company: 'County Gov. Mombasa', time: '4h' },
                { title: 'IT Support Intern', company: 'Equity Bank', time: '1d' },
                { title: 'Project Coordinator', company: 'UNICEF', time: '2d' },
                { title: 'Retail Sales Assistant', company: 'Naivas', time: '3h' },
              ].map((job, idx) => (
                <li key={idx} className="py-2.5 flex items-center justify-between">
                  <div>
                    <Link href={`/jobs/${idx + 1}`} className="text-sm font-semibold text-gray-800 hover:text-emerald-600 transition">
                      {job.title}
                    </Link>
                    <span className="text-sm text-gray-400 ml-2">{job.company}</span>
                  </div>
                  <span className="text-xs text-gray-300">{job.time}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-1 border-t border-gray-200/50 flex justify-start">
              <Link href="/jobs" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition inline-flex items-center gap-1.5">
                Browse all latest jobs
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}