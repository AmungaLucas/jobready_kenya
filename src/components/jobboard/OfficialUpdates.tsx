import Link from 'next/link';
import { getRecentUpdates, UPDATE_TYPE_ICONS, UPDATE_TYPE_LABELS, UPDATE_TAG_COLORS } from '@/lib/updates';

export default async function OfficialUpdates() {
  let updates: Awaited<ReturnType<typeof getRecentUpdates>> = [];

  try {
    updates = await getRecentUpdates(4);
  } catch {
    // Fallback: render empty section if DB is unavailable
  }

  if (updates.length === 0) return null;

  return (
    <section className="section-bg py-10 border-t border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800">Official Updates</h2>
                <p className="text-sm text-gray-500 font-light">
                  Stay informed with recruitment notices, shortlisting updates, and application announcements.
                </p>
              </div>
              <Link href="/updates" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition whitespace-nowrap ml-4">
                View all &rarr;
              </Link>
            </div>
            <div className="divide-y divide-gray-200/60">
              {updates.map((item) => (
                <Link
                  key={item.id}
                  href={`/updates/${item.slug}`}
                  className="flex items-start gap-4 py-3.5 px-1 hover:text-emerald-600 transition group"
                >
                  <span className="text-xl mt-0.5 flex-shrink-0">{UPDATE_TYPE_ICONS[item.updateType] || '\uD83D\uDCE1'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition">{item.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className={`text-xs font-medium ${UPDATE_TAG_COLORS[item.updateType] || 'text-gray-600'}`}>
                        {UPDATE_TYPE_LABELS[item.updateType] || item.updateType}
                      </span>
                      <span className="text-xs text-gray-300">&middot;</span>
                      <span className="text-xs text-gray-400">{item.sourceName}</span>
                      {item.hasPdf && (
                        <>
                          <span className="text-xs text-gray-300">&middot;</span>
                          <span className="text-xs text-red-500 font-medium">PDF</span>
                        </>
                      )}
                      {item.imageUrl && (
                        <>
                          <span className="text-xs text-gray-300">&middot;</span>
                          <span className="text-xs text-gray-400">Image</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-100 rounded-xl flex items-center justify-center h-64 border border-gray-200 text-gray-400 text-sm">
              📢 Google Ad (300x250)
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100/60">
              <div className="flex items-center gap-2">
                <span className="text-xl">📬</span>
                <h3 className="text-sm font-bold text-gray-800">Get alerts</h3>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">Receive WhatsApp notifications for new jobs.</p>
              <Link href="/cv-matching" className="mt-2 inline-block bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition">
                Subscribe
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}