import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';
import UpdateList from '@/components/jobboard/UpdateList';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Latest Recruitment Updates & News | JobBoard Kenya',
  description: 'Stay updated with the latest recruitment news, shortlisting announcements, interview dates, deadline extensions, and official job updates from Kenyan employers.',
  alternates: { canonical: 'https://jobboard.ke/updates' },
};

const allUpdates = [
  {
    icon: '📢', title: 'KNEC announces shortlisted candidates for 2025 marking exercise', tag: 'Shortlisting', time: '2h ago', type: 'shortlisting', slug: 'knec-shortlisted-candidates-2026',
    body: 'The Kenya National Examinations Council has published the list of shortlisted candidates for the 2025 marking exercise. Successful applicants are required to report to their designated marking centres on the dates indicated in their invitation letters. Candidates who do not report within the stipulated timeframe will be automatically disqualified. The council encourages all shortlisted persons to carry original academic certificates, national ID, and a copy of their application confirmation.',
  },
  {
    icon: '📅', title: 'KRA interviews for tax officers — dates released for July 2025', tag: 'Interview Date', time: '5h ago', type: 'interview', slug: 'kra-tax-officer-interviews-june',
    body: 'The Kenya Revenue Authority has released interview schedules for the Tax Officer II position. Interviews will be conducted from 7th to 18th July 2025 at KRA Training School, Nairobi. Shortlisted candidates will receive individual invitation letters via email with specific reporting times and required documents. Candidates are advised to carry their original academic certificates, professional certificates, national identity card, and two recent passport-size photographs.',
  },
  {
    icon: '📋', title: 'County government of Nakuru opens 50 new positions across departments', tag: 'Recruitment', time: '1d ago', type: 'recruitment', slug: 'nakuru-county-50-positions',
    body: 'The County Government of Nakuru has announced 50 new job vacancies across multiple departments including Health, Education, Infrastructure, and Public Service Management. Interested candidates must be residents of Nakuru County and should submit their applications through the county public service portal before the stated deadline. Requirements vary by position but generally include a minimum diploma qualification and relevant work experience.',
  },
  {
    icon: '⏳', title: 'TSC extends application deadline for teacher recruitment to 30 July 2025', tag: 'Deadline Extension', time: '2d ago', type: 'deadline', slug: 'tsc-deadline-extended-june',
    body: 'The Teachers Service Commission has extended the application deadline for the ongoing teacher recruitment exercise. The new deadline is now 30th July 2025, giving prospective applicants additional time to prepare and submit their applications. The extension applies to both primary and secondary school teaching positions. Applicants are reminded to ensure all required documents are uploaded before the new deadline.',
  },
  {
    icon: '📢', title: 'Kenya Defence Forces releases shortlist for cadet recruitment 2025', tag: 'Shortlisting', time: '2d ago', type: 'shortlisting', slug: 'kdf-cadet-shortlist-2025',
    body: 'The Kenya Defence Forces has published the shortlist of candidates selected for the 2025 cadet recruitment programme. Shortlisted candidates are required to report to the designated recruitment centres on the dates specified. Candidates must carry original academic certificates, national identity card, birth certificate, and valid medical fitness certificates from a recognised government hospital.',
  },
  {
    icon: '📋', title: 'Kenyatta University Teaching Hospital announces 30 nursing positions', tag: 'Recruitment', time: '3d ago', type: 'recruitment', slug: 'kuth-nursing-positions',
    body: 'Kenyatta University Teaching, Referral and Research Hospital (KUTRRH) has announced 30 nursing positions across various departments including critical care, paediatrics, and surgical nursing. Applicants must hold a valid Nursing Council of Kenya licence and have at least two years of post-qualification experience. Applications should be submitted online through the KUTRRH careers portal.',
  },
  {
    icon: '📅', title: 'Commission on Revenue Allocation schedules interviews for economists', tag: 'Interview Date', time: '3d ago', type: 'interview', slug: 'cra-economist-interviews',
    body: 'The Commission on Revenue Allocation (CRA) has scheduled interviews for Economist positions for the week of 14th July 2025. Shortlisted candidates will be notified via email and are required to appear in person at the CRA headquarters in Nairobi. Candidates should come prepared with academic certificates, curriculum vitae, and a brief presentation on public finance management in Kenya.',
  },
  {
    icon: '⏳', title: 'Public Service Commission extends internship application deadline', tag: 'Deadline Extension', time: '4d ago', type: 'deadline', slug: 'psc-internship-deadline',
    body: 'The Public Service Commission (PSC) has extended the application deadline for its graduate internship programme. The new closing date is 15th August 2025. The internship programme targets recent graduates from recognised universities with a minimum of a bachelor\'s degree. Interested applicants should submit their applications through the PSC online portal with certified copies of their academic certificates.',
  },
  {
    icon: '📢', title: 'National Police Service shortlists candidates for constable recruitment', tag: 'Shortlisting', time: '5d ago', type: 'shortlisting', slug: 'nps-constable-shortlist',
    body: 'The National Police Service has released the shortlist of candidates for the constable recruitment exercise. Shortlisted candidates are required to report to their respective county recruitment centres on the dates indicated. All candidates must carry their national identity card, academic certificates, and birth certificate. Physical fitness tests and document verification will be conducted during the reporting period.',
  },
  {
    icon: '📋', title: 'Ministry of Health opens recruitment for medical officers countrywide', tag: 'Recruitment', time: '5d ago', type: 'recruitment', slug: 'moh-medical-officers',
    body: 'The Ministry of Health has announced vacancies for Medical Officers to be deployed across various county hospitals and sub-county health facilities. Applicants must be registered with the Kenya Medical Practitioners and Dentists Council (KMPDC) and hold a bachelor of medicine and surgery degree. Preference will be given to candidates willing to serve in rural and underserved areas.',
  },
  {
    icon: '📅', title: 'Central Bank of Kenya invites shortlisted candidates for graduate trainee interviews', tag: 'Interview Date', time: '1w ago', type: 'interview', slug: 'cbk-graduate-interviews',
    body: 'The Central Bank of Kenya (CBK) has invited shortlisted candidates for the Graduate Trainee Programme interviews scheduled for July 2025. The programme targets recent graduates with degrees in economics, finance, statistics, information technology, and related fields. Interviews will be conducted at the CBK headquarters in Nairobi. Shortlisted candidates will receive detailed instructions via email.',
  },
  {
    icon: '⏳', title: 'Judicial Service Commission extends application window for court clerks', tag: 'Deadline Extension', time: '1w ago', type: 'deadline', slug: 'jsc-court-clerks-deadline',
    body: 'The Judicial Service Commission (JSC) has extended the application deadline for Court Clerk positions across various courts in Kenya. The new closing date is 25th July 2025. Applicants must have a minimum diploma in law, public administration, or related field from a recognised institution. Applications should be submitted through the JSC online recruitment portal with all required supporting documents.',
  },
];

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
          <UpdateList updates={allUpdates} />

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