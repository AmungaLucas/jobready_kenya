import Link from 'next/link';

const flexibleJobs = [
  { icon: '🛍️', title: 'Retail Sales Assistant', location: 'Nairobi', type: 'Part-time', salary: 'KSh 15k/mo' },
  { icon: '✍️', title: 'Freelance Writer', location: 'Remote', type: 'Freelance', salary: 'KSh 2k/article' },
  { icon: '🎪', title: 'Event Staff', location: 'Mombasa', type: 'Casual', salary: 'KSh 1.5k/day' },
  { icon: '📋', title: 'Temporary Admin', location: 'Kisumu', type: 'Temporary', salary: 'KSh 25k/mo' },
];

const locations = [
  { name: 'Nairobi', count: 234 },
  { name: 'Mombasa', count: 98 },
  { name: 'Kisumu', count: 76 },
  { name: 'Nakuru', count: 63 },
  { name: 'Eldoret', count: 52 },
  { name: 'Thika', count: 41 },
  { name: 'Kakamega', count: 29 },
  { name: 'Machakos', count: 33 },
];

export default function FlexibleJobs() {
  const typeColors: Record<string, string> = {
    'Part-time': 'bg-blue-50 text-blue-700',
    Freelance: 'bg-purple-50 text-purple-700',
    Casual: 'bg-orange-50 text-orange-700',
    Temporary: 'bg-yellow-50 text-yellow-700',
  };

  return (
    <section className="section-bg py-10 border-t border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-800">🧩 Flexible Work Opportunities</h2>
                <p className="text-sm text-gray-500 font-light">Browse casual, temporary, freelance, and part-time jobs.</p>
              </div>
              <Link href="/jobs?type=flexible" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition whitespace-nowrap ml-4">
                Browse All →
              </Link>
            </div>
            <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 divide-y divide-gray-200/50">
              {flexibleJobs.map((job, idx) => (
                <div key={idx} className="flex flex-wrap items-center justify-between py-4 px-5 hover:bg-emerald-50/30 transition rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{job.icon}</span>
                    <div>
                      <Link href={`/jobs/${idx + 20}`} className="text-sm font-semibold text-gray-800 hover:text-emerald-600 transition">
                        {job.title}
                      </Link>
                      <p className="text-xs text-gray-500">{job.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1 sm:mt-0">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${typeColors[job.type] || 'bg-gray-50 text-gray-700'}`}>
                      {job.type}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{job.salary}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
                <span>📍</span> Across Kenya
              </h3>
              <Link href="/jobs" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition">
                View All →
              </Link>
            </div>
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/60">
              <div className="space-y-1">
                {locations.map((loc) => (
                  <Link
                    key={loc.name}
                    href={`/jobs?location=${loc.name.toLowerCase()}`}
                    className="location-item flex items-center justify-between p-2.5 rounded-lg transition"
                  >
                    <span className="loc-name text-sm font-medium text-gray-700 transition">{loc.name}</span>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                      {loc.count} jobs
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}