import Link from 'next/link';

export default function MatchingCard() {
  return (
    <section className="section-bg py-10 border-t border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="matching-card p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-200/30 rounded-full blur-3xl"></div>
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🧠</span>
                <span className="premium-badge">⭐ Premium</span>
                <span className="highlight">AI-Powered</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">Smart Job Matching</h2>
              <p className="text-sm text-gray-600 mt-1 max-w-xl leading-relaxed">
                Upload your CV — our AI extracts your skills, experience, and preferences, then matches you to the most relevant jobs. No more endless scrolling.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <div className="feature-item"><span className="check">✓</span> CV parsing &amp; skill extraction</div>
                <div className="feature-item"><span className="check">✓</span> AI-powered job matching</div>
                <div className="feature-item"><span className="check">✓</span> Real-time match scores</div>
                <div className="feature-item"><span className="check">✓</span> Personalized job alerts</div>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
              <Link href="/cv-services" className="cta-btn text-sm md:text-base w-full md:w-auto text-center">
                Upload CV &amp; Get Matched →
              </Link>
              <p className="text-[10px] text-gray-400 text-center md:text-right">Free trial · No credit card required</p>
              <div className="w-full md:w-64 mt-2 space-y-1.5">
                <div className="match-result flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-800">Senior Software Engineer</span>
                    <span className="text-[10px] text-gray-400 ml-1">Safaricom</span>
                  </div>
                  <span className="match-score high">92% Match</span>
                </div>
                <div className="match-result flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-800">Data Analyst</span>
                    <span className="text-[10px] text-gray-400 ml-1">KRA</span>
                  </div>
                  <span className="match-score medium">78% Match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}