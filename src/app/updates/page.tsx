import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Latest Recruitment Updates & News | JobBoard Kenya',
  description: 'Stay updated with the latest recruitment news, shortlisting announcements, interview dates, deadline extensions, and official job updates from Kenyan employers.',
  alternates: { canonical: 'https://jobboard.ke/updates' },
};

/* ── Static updates data (same structure as OfficialUpdates component) ── */
const allUpdates = [
  { icon: '📢', title: 'KNEC announces shortlisted candidates for 2025 marking exercise', tag: 'Shortlisting', time: '2h ago', type: 'shortlisting' },
  { icon: '📅', title: 'KRA interviews for tax officers — dates released for July 2025', tag: 'Interview Date', time: '5h ago', type: 'interview' },
  { icon: '📋', title: 'County government of Nakuru opens 50 new positions across departments', tag: 'Recruitment', time: '1d ago', type: 'recruitment' },
  { icon: '⏳', title: 'TSC extends application deadline for teacher recruitment to 30 July 2025', tag: 'Deadline Extension', time: '2d ago', type: 'deadline' },
  { icon: '📢', title: 'Kenya Defence Forces releases shortlist for cadet recruitment 2025', tag: 'Shortlisting', time: '2d ago', type: 'shortlisting' },
  { icon: '📋', title: 'Kenyatta University Teaching Hospital announces 30 nursing positions', tag: 'Recruitment', time: '3d ago', type: 'recruitment' },
  { icon: '📅', title: 'Commission on Revenue Allocation schedules interviews for economists', tag: 'Interview Date', time: '3d ago', type: 'interview' },
  { icon: '⏳', title: 'Public Service Commission extends internship application deadline', tag: 'Deadline Extension', time: '4d ago', type: 'deadline' },
  { icon: '📢', title: 'National Police Service shortlists candidates for constable recruitment', tag: 'Shortlisting', time: '5d ago', type: 'shortlisting' },
  { icon: '📋', title: 'Ministry of Health opens recruitment for medical officers countrywide', tag: 'Recruitment', time: '5d ago', type: 'recruitment' },
  { icon: '📅', title: 'Central Bank of Kenya invites shortlisted candidates for graduate trainee interviews', tag: 'Interview Date', time: '1w ago', type: 'interview' },
  { icon: '⏳', title: 'Judicial Service Commission extends application window for court clerks', tag: 'Deadline Extension', time: '1w ago', type: 'deadline' },
];

const tagColors: Record<string, string> = {
  shortlisting: 'bg-blue-100 text-blue-700',
  interview: 'bg-purple-100 text-purple-700',
  recruitment: 'bg-emerald-100 text-emerald-700',
  deadline: 'bg-amber-100 text-amber-700',
};

export default function UpdatesPage() {
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

          {/* Updates List */}
          <div className="space-y-3">
            {allUpdates.map((update, idx) => (
              <div
                key={idx}
                className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 p-5 hover:shadow-md hover:border-emerald-200/50 transition"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{update.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 leading-relaxed">{update.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${tagColors[update.type] || 'bg-gray-100 text-gray-600'}`}>
                        {update.tag}
                      </span>
                      <span className="text-xs text-gray-400">{update.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Browse related */}
          <div className="mt-10 bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-6 border border-emerald-200/60">
            <h2 className="text-lg font-extrabold text-gray-800">Explore More</h2>
            <p className="text-sm text-gray-600 mt-1">Browse current job openings and application deadlines.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link href="/government-jobs" className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg transition shadow-md shadow-emerald-200">
                Government Jobs →
              </Link>
              <Link href="/jobs" className="text-sm font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg transition">
                All Jobs →
              </Link>
              <Link href="/opportunities" className="text-sm font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg transition">
                Opportunities →
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}