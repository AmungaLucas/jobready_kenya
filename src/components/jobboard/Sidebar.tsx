import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="lg:col-span-1 space-y-6 sidebar-sticky">
      {/* Smart Job Matching */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-5 border border-emerald-200/60 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">Premium</span>
        </div>
        <h4 className="text-base font-extrabold text-gray-800 mt-1">Smart Job Matching</h4>
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
          Upload your CV and let our AI find the perfect roles for you, tailored to your skills and experience.
        </p>
        <Link href="#" className="mt-3 w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg transition shadow-md shadow-emerald-200 flex items-center justify-center gap-2 text-sm">
          Upload CV &amp; Get Matched →
        </Link>
      </div>

      {/* Google Ad */}
      <div className="bg-gray-100 rounded-xl flex items-center justify-center h-64 border border-gray-200 text-gray-400 text-sm">
        <div className="text-center">
          <div>📢 Google Ad</div>
          <div className="text-xs">(300x250)</div>
        </div>
      </div>

      {/* Browse by Category */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-5 border border-white/60">
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">
          Browse by Category
        </h4>
        <ul className="space-y-3">
          {[
            { name: '💻 IT & Software', count: 124, slug: 'it' },
            { name: '🏥 Health & Medical', count: 87, slug: 'health' },
            { name: '📊 Finance & Accounting', count: 63, slug: 'finance' },
            { name: '🏗️ Engineering', count: 52, slug: 'engineering' },
          ].map((cat) => (
            <li key={cat.slug}>
              <Link href={`/jobs?category=${cat.slug}`} className="flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-emerald-600 transition">
                <span>{cat.name}</span>
                <span className="text-xs text-gray-400 font-normal">({cat.count})</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Trending Searches */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-5 border border-white/60">
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 border-b border-gray-200/60 pb-3 mb-4">
          <span>🔥</span> Trending Searches
        </h4>
        <ul className="space-y-2">
          {['Teaching', 'Nursing', 'IT & Software', 'Driving', 'Accounting'].map((term) => (
            <li key={term}>
              <Link href={`/jobs?search=${term}`} className="flex items-center justify-between text-sm text-gray-700 hover:text-emerald-600 transition group p-2 rounded-lg hover:bg-emerald-50/50">
                <span>{term}</span>
                <span className="text-xs text-gray-400">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* CV Ad */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-5 border border-emerald-200/60 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">📄</span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">Internal Ad</span>
        </div>
        <h4 className="text-base font-extrabold text-gray-800">Your CV Opens Doors</h4>
        <p className="text-sm text-gray-600 mt-1">
          Professional CV writing, cover letters, and LinkedIn optimization. From <span className="font-bold text-emerald-600">KSh 1,500</span>.
        </p>
        <Link href="#" className="mt-4 w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg transition shadow-md shadow-emerald-200 flex items-center justify-center gap-2 text-sm">
          Improve My CV →
        </Link>
      </div>

      {/* Job Alerts */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-5 border border-white/60">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">📬</span>
          <h4 className="text-sm font-bold text-gray-700">Get Job Alerts</h4>
        </div>
        <p className="text-xs text-gray-600">Get new jobs matching your profile delivered to your inbox.</p>
        <div className="mt-3 flex flex-col gap-2">
          <input type="email" placeholder="Your email" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-emerald-600" />
          <button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition text-sm">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}