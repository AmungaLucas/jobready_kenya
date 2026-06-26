import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';
import UpdateList from '@/components/jobboard/UpdateList';
import { getUpdates, getUpdateTypeCounts, UPDATE_TYPE_LABELS, UPDATE_TYPES } from '@/lib/updates';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Latest Recruitment Updates & News | JobBoard Kenya',
  description: 'Stay updated with the latest recruitment news, shortlisting announcements, interview dates, deadline extensions, and official job updates from Kenyan employers.',
  alternates: { canonical: 'https://jobboard.ke/updates' },
};

export default async function UpdatesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const updateType = type && type !== 'all' ? type : undefined;

  let updates: Awaited<ReturnType<typeof getUpdates>>['updates'] = [];
  let total = 0;
  let counts: Record<string, number> = {};

  try {
    const [data, typeCounts] = await Promise.all([
      getUpdates(updateType, 1, 50),
      getUpdateTypeCounts(),
    ]);
    updates = data.updates;
    total = data.total;
    counts = typeCounts;
  } catch {
    // Fallback: show empty state if DB is unavailable
  }

  const tabs = [
    { key: 'all', label: 'All Updates' },
    ...UPDATE_TYPES.map((t) => ({ key: t, label: UPDATE_TYPE_LABELS[t] || t })),
  ];

  return (
    <>
      <Navbar />
      <section className="min-h-screen bg-[#faf9f6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-800">Latest Updates</h1>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              Recruitment news, shortlisting announcements, interview schedules, deadline changes, and official employment updates from government bodies and major employers across Kenya.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-4 flex-wrap mb-8">
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                href={tab.key === 'all' ? '/updates' : `/updates?type=${tab.key}`}
                className={`text-sm whitespace-nowrap transition ${
                  (updateType || 'all') === tab.key
                    ? 'text-emerald-700 font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {counts[tab.key] !== undefined && (
                  <span className="text-xs text-gray-400 ml-1">({counts[tab.key]})</span>
                )}
              </Link>
            ))}
          </div>

          {/* Updates List */}
          {updates.length > 0 ? (
            <>
              <UpdateList updates={updates} />
              <p className="text-xs text-gray-400 mt-4">{total} update{total !== 1 ? 's' : ''}</p>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">&#x1F4ED;</div>
              <p className="text-sm text-gray-500">No updates found. Check back soon for the latest recruitment news.</p>
            </div>
          )}

          {/* Browse related */}
          <div className="mt-10 bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-6 border border-emerald-200/60">
            <h2 className="text-lg font-extrabold text-gray-800">Explore More</h2>
            <p className="text-sm text-gray-600 mt-1">Browse current job openings and application deadlines.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link href="/government-jobs" className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg transition shadow-md shadow-emerald-200">
                Government Jobs &rarr;
              </Link>
              <Link href="/jobs" className="text-sm font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg transition">
                All Jobs &rarr;
              </Link>
              <Link href="/opportunities" className="text-sm font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg transition">
                Opportunities &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}