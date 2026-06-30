import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatSalary } from '@/lib/jobs';

export default async function FlexibleJobs() {
  let flexibleJobs: Awaited<ReturnType<typeof prisma.job.findMany>> = [];
  let countyData: Awaited<ReturnType<typeof prisma.job.groupBy>> = [];
  let slugMap: Record<string, string> = {};
  try {
    // Fetch flexible work jobs
    flexibleJobs = await prisma.job.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        employmentType: { in: ['PART_TIME', 'FREELANCE', 'TEMPORARY', 'CASUAL'] },
      },
      select: {
        slug: true, title: true, locationCity: true, locationCounty: true,
        employmentType: true, salaryMin: true, salaryMax: true, salaryDisclosure: true,
        organization: { select: { orgName: true } },
      },
      orderBy: { datePosted: 'desc' },
      take: 4,
    });

    // Get job counts per county for sidebar
    countyData = await prisma.job.groupBy({
      by: ['locationCounty'],
      where: { status: 'ACTIVE', deletedAt: null, locationCounty: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 8,
    });

    // Resolve county names to slugs via location table
    const countySlugs = await prisma.location.findMany({
      where: { county: { in: countyData.map(c => c.locationCounty!) } },
      select: { county: true, slug: true },
    });
    slugMap = Object.fromEntries(countySlugs.map(l => [l.county, l.slug]));
  } catch {
    // Fallback: render empty sections if DB is unavailable
  }

  const icons = ['🛍️', '✍️', '🎪', '📋'];

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
              <Link href="/jobs?type=part-time" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition whitespace-nowrap ml-4">
                Browse All →
              </Link>
            </div>
            <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 divide-y divide-gray-200/50">
              {flexibleJobs.map((job, idx) => {
                return (
                  <div key={job.slug} className="flex flex-wrap items-center justify-between py-4 px-5 hover:bg-emerald-50/30 transition">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{icons[idx % icons.length]}</span>
                      <div>
                        <Link href={`/jobs/${job.slug}`} className="text-sm font-semibold text-gray-800 hover:text-emerald-600 transition">
                          {job.title}
                        </Link>
                        <p className="text-xs text-gray-500">{job.locationCity || job.locationCounty || 'Kenya'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1 sm:mt-0">
                      <span className="text-sm font-medium text-gray-700">{formatSalary(job as any)}</span>
                    </div>
                  </div>
                );
              })}
              {flexibleJobs.length === 0 && (
                <div className="py-8 text-center text-sm text-gray-400">No flexible jobs currently listed</div>
              )}
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
                {countyData.map((loc) => (
                  <Link
                    key={loc.locationCounty}
                    href={`/locations/${slugMap[loc.locationCounty!] || loc.locationCounty!.toLowerCase().replace(/\s+/g, '-')}`}
                    className="location-item flex items-center justify-between p-2.5 rounded-lg transition"
                  >
                    <span className="loc-name text-sm font-medium text-gray-700 transition">{loc.locationCounty}</span>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                      {loc._count.id} jobs
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