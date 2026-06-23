import Link from 'next/link';
import Image from 'next/image';

export default function CareerResources() {
  return (
    <section className="section-bg py-10 border-t border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">📖 Career Advice &amp; Resources</h2>
            <p className="text-sm text-gray-500 font-light">
              Practical guides to help you write better CVs, prepare for interviews, and negotiate salaries.
            </p>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition whitespace-nowrap ml-4">
            Read All Articles →
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Link href="/blog" className="group relative overflow-hidden rounded-xl border border-white/60 hover:border-emerald-400 transition block">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop&crop=center"
                alt="Team collaboration"
                width={800}
                height={400}
                className="w-full h-64 md:h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 md:p-8">
                <span className="inline-block text-xs font-bold text-emerald-300 bg-black/30 px-3 py-1 rounded-full mb-3">⭐ Featured</span>
                <h3 className="text-xl md:text-2xl font-extrabold text-white leading-snug group-hover:text-emerald-200 transition">
                  The Ultimate CV Checklist for 2026
                </h3>
                <p className="text-sm text-white/80 mt-2 max-w-md">
                  From formatting to keywords – everything you need to get past ATS filters and land interviews.
                </p>
                <div className="flex items-center gap-4 mt-4 text-xs text-white/60">
                  <span>📅 15 Jun 2026</span>
                  <span>⏱️ 8 min read</span>
                </div>
              </div>
            </Link>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop&crop=center', label: 'Writing Tips', title: 'Cover Letter Secrets', desc: 'How to make yours stand out.', time: '5 min read' },
                { img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=200&fit=crop&crop=center', label: 'Interview Tips', title: 'Ace Your Virtual Interview', desc: 'Prepare with confidence.', time: '4 min read' },
                { img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop&crop=center', label: 'Salary Guide', title: 'Salary Negotiation in Kenya', desc: 'Tactics that work.', time: '6 min read' },
              ].map((article, idx) => (
                <Link key={idx} href="#" className="group bg-white/40 backdrop-blur-sm rounded-xl overflow-hidden border border-white/60 hover:border-emerald-400 hover:bg-emerald-50/30 transition">
                  <Image src={article.img} alt={article.title} width={400} height={200} className="w-full h-32 object-cover" />
                  <div className="p-4">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">{article.label}</span>
                    <h4 className="text-sm font-semibold text-gray-800 group-hover:text-emerald-600 transition">{article.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{article.desc}</p>
                    <span className="text-[10px] text-gray-400">{article.time}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-sm">
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 border-b border-gray-200/60 pb-3 mb-4">
                <span>🔥</span> Trending Topics
              </h4>
              <ul className="space-y-3">
                {['CV Writing Tips', 'Interview Questions', 'Salary Trends 2026', 'Remote Work Guide', 'Reskilling for 2026'].map((topic) => (
                  <li key={topic}>
                    <Link href="/blog" className="flex items-center justify-between text-sm text-gray-700 hover:text-emerald-600 transition group p-2 rounded-lg hover:bg-emerald-50/50">
                      <span>{topic}</span>
                      <span className="text-xs text-gray-400 group-hover:text-emerald-600">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-gray-200/60">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/70 rounded-lg p-4 text-center">
                  <p className="text-xs font-semibold text-gray-600">Get weekly career tips</p>
                  <button type="button" className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-full transition">
                    Subscribe →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}