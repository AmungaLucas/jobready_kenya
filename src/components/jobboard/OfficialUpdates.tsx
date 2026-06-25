import Link from 'next/link';

export default function OfficialUpdates() {
  const updates = [
    { icon: '📢', title: 'KNEC announces shortlisted candidates for 2026 recruitment', tag: 'Shortlisting', time: '2h ago' },
    { icon: '📅', title: 'KRA interviews for tax officers scheduled for 28 June', tag: 'Interview Date', time: '5h ago' },
    { icon: '📋', title: 'County government of Nakuru opens 50 new positions', tag: 'Recruitment', time: '1d ago' },
    { icon: '⏳', title: 'TSC extends application deadline to 30 June', tag: 'Deadline Extension', time: '2d ago' },
  ];

  return (
    <section className="section-bg py-10 border-t border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-800">Official Updates</h2>
                <p className="text-sm text-gray-500 font-light">
                  Stay informed with recruitment notices, shortlisting updates, and application announcements.
                </p>
              </div>
              <Link href="/updates" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition whitespace-nowrap ml-4">
                View all →
              </Link>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl divide-y divide-gray-200/60 border border-white/60">
              {updates.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 py-3.5 px-4 rounded-xl hover:bg-white/40 transition">
                  <span className="text-xl mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400">{item.tag}</span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-300">{item.time}</span>
                    </div>
                  </div>
                </div>
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