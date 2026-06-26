'use client';

import Link from 'next/link';
import { useState } from 'react';
import GoogleAd from '@/components/jobboard/GoogleAd';
import SmartApplyButton from '@/components/jobboard/SmartApplyButton';

interface FormattedJob {
  id: string;
  slug: string;
  title: string;
  company: string;
  companySlug: string | null;
  companyWebsite: string | null;
  companyDescription: string;
  location: string;
  locationCounty: string | null;
  type: string;
  salary: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  posted: string;
  deadline: string;
  deadlineDate: Date | null;
  datePosted: Date;
  category: string;
  categorySlug: string;
  subcategory: string;
  subcategorySlug: string;
  experienceLevel?: string | null;
  educationLevel?: string | null;
  description: string;
  isRemote: boolean;
  externalUrl?: string | null;
  applicationUrl?: string | null;
  applyEmail?: string | null;
  howToApply?: string | null;
  featured?: boolean;
  match: number;
  requirements: string[];
  responsibilities: string[];
}

interface JobDetailsContentProps {
  job: FormattedJob;
  similar: Partial<FormattedJob>[];
}

function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatExperienceLabel(level: string | null | undefined): string {
  if (!level) return 'Not specified';
  const map: Record<string, string> = {
    ENTRY: 'Entry level (0 years experience)',
    JUNIOR: 'Junior (1-2 years experience)',
    MID: 'Mid-level (3-5 years experience)',
    SENIOR: 'Senior (5-8 years experience)',
    LEAD: 'Lead (8-10 years experience)',
    EXECUTIVE: 'Executive (10+ years experience)',
  };
  return map[level] || level;
}

function formatEducationLabel(level: string | null | undefined): string {
  if (!level) return 'Not specified';
  const map: Record<string, string> = {
    NONE: 'No formal education requirement',
    HIGH_SCHOOL: 'Kenya Certificate of Secondary Education (KCSE)',
    CERTIFICATE: 'Professional Certificate',
    DIPLOMA: 'Diploma from a recognised institution',
    BACHELORS: 'Bachelor\'s degree',
    MASTERS: 'Master\'s degree',
    DOCTORATE: 'Doctorate (PhD)',
    PROFESSIONAL: 'Professional qualification or certification',
  };
  return map[level] || level;
}

function deriveResponsibilities(job: FormattedJob): string[] {
  if (job.responsibilities && job.responsibilities.length > 0) return job.responsibilities;
  const base = [
    `Execute core ${job.title} duties and deliver on key performance indicators set by ${job.company}`,
    `Collaborate with cross-functional teams across departments to drive ${job.category ? job.category.toLowerCase() : 'business'} objectives`,
    `Prepare regular reports, documentation, and presentations for management review and stakeholder communication`,
  ];
  if (job.experienceLevel === 'SENIOR' || job.experienceLevel === 'LEAD' || job.experienceLevel === 'EXECUTIVE') {
    base.push(
      `Provide strategic leadership and mentorship to junior team members within the ${job.category || 'department'}`,
      `Drive process improvements and best practices to enhance operational efficiency`
    );
  }
  if (job.isRemote) {
    base.push('Participate effectively in remote team meetings and maintain clear communication across distributed teams');
  }
  return base;
}

function deriveRequirements(job: FormattedJob): string[] {
  if (job.requirements && job.requirements.length > 0) return job.requirements;
  const base: string[] = [];
  if (job.educationLevel && job.educationLevel !== 'NONE') {
    base.push(`${formatEducationLabel(job.educationLevel)} in a relevant field${job.category ? ' such as ' + job.category.toLowerCase() : ''}`);
  } else {
    base.push(`Minimum of a Diploma or equivalent qualification in a relevant field`);
  }
  base.push(formatExperienceLabel(job.experienceLevel));
  if (job.category && (job.category.includes('Technology') || job.category.includes('IT') || job.category.includes('Software'))) {
    base.push('Proficiency in relevant programming languages, tools, and technologies');
    base.push('Strong problem-solving and analytical thinking abilities');
  }
  base.push('Excellent written and verbal communication skills in English and Kiswahili');
  base.push('Ability to work independently and collaboratively in a fast-paced environment');
  if (job.isRemote) {
    base.push('Reliable high-speed internet connection and a dedicated workspace for remote work');
  }
  if (job.locationCounty) {
    base.push(`Based in or willing to relocate to ${job.locationCounty}${job.isRemote ? ' (remote work available)' : ''}`);
  }
  return base;
}

export default function JobDetailsContent({ job, similar }: JobDetailsContentProps) {
  const [saved, setSaved] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const daysLeft = daysUntil(job.deadlineDate);
  const responsibilities = deriveResponsibilities(job);
  const requirements = deriveRequirements(job);

  const relatedCategories = job.categorySlug
    ? [
        { label: job.category, slug: job.categorySlug },
        ...(job.subcategorySlug ? [{ label: job.subcategory, slug: `${job.categorySlug}/${job.subcategorySlug}` }] : []),
      ]
    : [];

  const faqs = [
    {
      q: `What does a ${job.title} do in Kenya?`,
      a: `A ${job.title} in Kenya is responsible for performing core ${job.category || 'professional'} duties within organisations operating in ${job.location || 'the country'}. This role typically involves ${responsibilities[0]?.toLowerCase() || 'executing day-to-day tasks that support business objectives'}. ${job.category ? `${job.category} professionals in Kenya are in steady demand, with opportunities across both the public and private sectors. Salaries for this type of role typically range from KSh 30,000 to KSh 300,000 per month depending on experience, employer size, and location.` : 'Professionals in this field are in steady demand across Kenya.'}`,
    },
    {
      q: `What is the salary range for ${job.category || 'this type of'} jobs in ${job.location || 'Kenya'}?`,
      a: `The salary for ${job.category ? job.category.toLowerCase() : 'this type of role'} positions in ${job.location || 'Kenya'} varies based on experience level, employer type, and specific qualifications. ${job.salary && job.salary !== 'Salary not disclosed' ? `This particular position offers ${job.salary}.` : 'Salary information for this specific position has not been disclosed.'} Generally, entry-level ${job.category ? job.category.toLowerCase() : 'professional'} roles in ${job.locationCounty || 'Kenya'} start around KSh 25,000-50,000 per month, mid-level positions range from KSh 50,000-150,000, and senior roles can exceed KSh 200,000 monthly. Government positions follow structured salary scales set by the Salaries and Remuneration Commission, while private sector and NGO roles often offer more competitive packages with additional benefits such as medical insurance, housing allowances, and performance bonuses.`,
    },
    {
      q: `What qualifications are needed for ${job.category || 'this type of'} roles?`,
      a: `To qualify for ${job.category ? job.category.toLowerCase() : 'this type of role'} positions in Kenya, employers typically require ${formatEducationLabel(job.experienceLevel) || 'a relevant educational qualification'}. ${formatExperienceLabel(job.experienceLevel)} is generally expected. Key qualifications include ${requirements.slice(0, 3).map(r => r.toLowerCase()).join(', ')}. Additional certifications, professional development courses, and demonstrated practical experience can significantly strengthen your application. For government positions, meeting the minimum requirements as stated in the job advertisement is essential, while private sector employers may be more flexible if you can demonstrate equivalent competency and relevant achievements.`,
    },
  ];

  return (
    <section className="section-bg py-4 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb with schema-friendly structure */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-emerald-600 transition">Browse Jobs</Link>
          {job.categorySlug && (
            <>
              <span>/</span>
              <Link href={`/categories/${job.categorySlug}`} className="hover:text-emerald-600 transition">{job.category}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-700 font-medium truncate max-w-[200px] sm:max-w-none">{job.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-lg sm:text-xl font-extrabold text-emerald-700 shadow-sm flex-shrink-0">
                      {job.company.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 leading-tight">{job.title}</h1>
                      <p className="text-sm text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                        {job.companyWebsite ? (
                          <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-700 hover:text-emerald-600 transition">{job.company}</a>
                        ) : (
                          <span className="font-semibold text-gray-700">{job.company}</span>
                        )}
                        <span className="text-gray-300">·</span>
                        <span>{job.location}</span>
                        {job.isRemote && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="text-emerald-600 font-medium">Remote</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {job.featured && (
                    <span className="text-xs font-medium text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full">Featured</span>
                  )}
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">{job.type}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-200/50 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">💰 <span className="font-medium text-gray-700">{job.salary}</span></span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1.5">📅 Posted <span className="font-medium text-gray-700">{job.posted}</span></span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1.5">⏳ Closes <span className="font-medium text-red-600">{job.deadline}</span></span>
              </div>
            </div>

            {/* Job Details — Combined Flow */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60 space-y-6">
              {/* Job Description */}
              <div>
                <h2 className="text-lg font-extrabold text-gray-800">Job Description</h2>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{job.description}</p>
              </div>

              {/* Key Responsibilities */}
              <div>
                <h2 className="text-lg font-extrabold text-gray-800">Key Responsibilities</h2>
                <p className="text-sm text-gray-500 mt-1 mb-3">
                  As a {job.title} at {job.company}, you will be expected to carry out the following key duties:
                </p>
                <ul className="space-y-2">
                  {responsibilities.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                      <span className="text-emerald-500 mt-1 flex-shrink-0">●</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements & Qualifications */}
              <div>
                <h2 className="text-lg font-extrabold text-gray-800">Requirements &amp; Qualifications</h2>
                <p className="text-sm text-gray-500 mt-1 mb-3">
                  To be considered for this {job.title} position at {job.company}, applicants should meet the following criteria:
                </p>
                <ul className="space-y-2">
                  {requirements.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                      <span className="text-emerald-500 mt-1 flex-shrink-0">●</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits & Perks */}
              <div>
                <h2 className="text-lg font-extrabold text-gray-800">Benefits &amp; Perks</h2>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                {job.type === 'Full-time' || job.type === 'FULL_TIME' ? (
                  <>As a {job.type.toLowerCase()} employee at {job.company}, you can expect a comprehensive benefits package that typically includes competitive monthly compensation{job.salary && job.salary !== 'Salary not disclosed' ? ` of ${job.salary}` : ''}, medical insurance coverage for you and your dependents, paid annual leave, and pension contributions under the NSSF framework. Many employers in Kenya also provide housing allowances, transport allowances, and meal subsidies. {job.category ? `Professionals in the ${job.category} sector often receive additional benefits such as professional development budgets, conference attendance, and certification sponsorship.` : ''} {job.isRemote ? 'As a remote position, you may also receive a home office setup allowance and flexible working hours.' : ''}</>
                ) : (
                  <>This {job.type.toLowerCase()} position at {job.company} offers {job.salary && job.salary !== 'Salary not disclosed' ? `compensation of ${job.salary}` : 'competitive compensation'}. {job.type === 'INTERNSHIP' || job.type === 'Internship' ? 'Internships provide invaluable hands-on experience, mentorship from industry professionals, and in many cases lead to full-time employment offers upon successful completion. You will gain practical skills and build your professional network within the ' + (job.category || 'industry') + ' sector.' : 'Contract and part-time roles in Kenya often come with prorated benefits including medical cover, flexible scheduling, and the opportunity to transition to permanent positions based on performance.'}</>
                )}
              </p>
              </div>

              {/* How to Apply */}
              <div>
                <h2 className="text-lg font-extrabold text-gray-800">How to Apply for This {job.type} Position</h2>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed mb-4">
                  Follow these steps to submit a strong application for the {job.title} role at {job.company}:
                </p>
                <ol className="space-y-3">
                  {[
                    `Review the requirements listed above carefully and ensure you meet the minimum qualifications for this ${job.title} position`,
                    `Prepare an up-to-date CV tailored to this role, highlighting relevant ${job.category ? job.category.toLowerCase() : 'professional'} experience and achievements with measurable metrics`,
                    `Write a concise cover letter explaining why you are interested in this role at ${job.company} and how your skills align with the responsibilities outlined`,
                    `Gather all required documents including academic certificates, professional certifications, and a copy of your national ID`,
                    `Submit your application before the deadline of ${job.deadline} — late applications are typically not considered by employers in Kenya`,
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                      <span className="bg-emerald-100 text-emerald-700 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                  For tips on writing a CV that passes Applicant Tracking Systems (ATS) used by Kenyan employers, visit our{' '}
                  <Link href="/cv-services" className="text-emerald-600 hover:text-emerald-700 font-medium transition">CV Writing Services</Link> page or read our{' '}
                  <Link href="/blog?category=How-To" className="text-emerald-600 hover:text-emerald-700 font-medium transition">career advice articles</Link>.
                </p>
              </div>
            </div>

            {/* Application */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-6 border border-emerald-200/60 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-800">Ready to apply?</h3>
                  <p className="text-sm text-gray-600">Submit your application before the deadline.</p>
                  {daysLeft !== null && daysLeft > 0 && (
                    <p className="text-xs text-red-600 font-medium mt-1">Closes in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <SmartApplyButton
                    applicationUrl={job.applicationUrl}
                    applyEmail={job.applyEmail}
                    howToApply={job.howToApply}
                    jobTitle={job.title}
                    companyName={job.company}
                    deadline={job.deadline}
                  />
                  <button
                    type="button"
                    className="bg-white/70 text-gray-700 hover:text-emerald-600 border border-gray-300 hover:border-emerald-400 font-medium px-4 py-2.5 rounded-lg transition text-sm flex items-center gap-2"
                    onClick={() => setSaved(!saved)}
                  >
                    <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {saved ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60">
              <h2 className="text-lg font-extrabold text-gray-800">About {job.company}</h2>
              <div className="flex items-start gap-4 mt-3">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-xl font-extrabold text-emerald-700 shadow-sm flex-shrink-0">
                  {job.company.charAt(0)}
                </div>
                <div>
                  <h3 className="text-md font-bold text-gray-800">
                    {job.companyWebsite ? (
                      <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition">{job.company}</a>
                    ) : job.company}
                  </h3>
                  <p className="text-sm text-gray-500">{job.location}, Kenya</p>
                  {job.companyDescription && (
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{job.companyDescription}</p>
                  )}
                  {!job.companyDescription && (
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {job.company} is an employer operating in {job.location || 'Kenya'}. {job.category ? `They are active in the ${job.category} sector, ` : ''}offering {job.type.toLowerCase()} employment opportunities. Visit their website or contact them directly to learn more about their organisational culture, values, and current openings. JobBoard Kenya verifies all employer listings to ensure legitimacy and protect job seekers from fraudulent postings.
                    </p>
                  )}
                  {job.companyWebsite && (
                    <Link href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700 transition">
                      Visit company website →
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Similar Jobs — right after company info */}
            {similar.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60">
                <h3 className="text-lg font-extrabold text-gray-800">
                  More {job.category ? `${job.category} ` : ''}Jobs{job.locationCounty ? ` in ${job.locationCounty}` : ''}
                </h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  Explore other {job.category ? `${job.category.toLowerCase()} ` : ''}vacancies{job.locationCounty ? ` in ${job.locationCounty}` : ' across Kenya'} that match your skills and experience.
                </p>
                <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 divide-y divide-gray-200/50">
                  {similar.map((s) => (
                    <Link
                      key={s.id || s.slug}
                      href={`/jobs/${s.slug}`}
                      className="similar-item flex items-center justify-between gap-2 py-3 px-5 hover:bg-emerald-50/30 transition min-w-0"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="similar-title text-sm font-semibold text-gray-800 transition block">{s.title}</span>
                        <span className="similar-company text-xs text-gray-400 block truncate mt-0.5">{s.company} · {s.location}</span>
                      </div>
                      <span className="text-xs text-gray-500">{s.salary}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Browse Related Categories */}
            {relatedCategories.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60">
                <h2 className="text-lg font-extrabold text-gray-800">Explore Related Categories</h2>
                <div className="flex flex-wrap gap-2 mt-3">
                  {relatedCategories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/categories/${cat.slug}`}
                      className="text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition"
                    >
                      {cat.label} →
                    </Link>
                  ))}
                  <Link
                    href="/categories"
                    className="text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition"
                  >
                    All 43 Categories →
                  </Link>
                </div>
              </div>
            )}

            {/* FAQ Section - AEO Optimized */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60">
              <h2 className="text-lg font-extrabold text-gray-800 mb-4">Frequently Asked Questions About This Role</h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="border border-gray-200/60 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50/50 transition"
                      onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    >
                      <h3 className="text-sm font-bold text-gray-800 pr-4">{faq.q}</h3>
                      <svg
                        className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {faqOpen === i && (
                      <div className="px-4 pb-4 -mt-1">
                        <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Why Work Here - Auto-generated enrichment */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60">
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">Why This Role Stands Out</h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  This {job.type.toLowerCase()} position at {job.company} offers a compelling opportunity
                  {job.locationCounty ? ` in ${job.locationCounty}` : ' in Kenya'}
                  {job.isRemote ? ', with the flexibility of remote work arrangements that let you contribute from anywhere.' : '.'}
                  {job.salary !== 'Salary not disclosed' ? ` The role comes with a competitive salary range of ${job.salary}, positioning it attractively within the ${job.category} sector.` : ''}
                </p>
                <p>
                  As a {job.experienceLevel ? formatExperienceLabel(job.experienceLevel).toLowerCase() : 'professional'} role
                  {job.subcategory ? ` within ${job.subcategory}` : ''}, this position is ideal for candidates
                  {job.educationLevel ? ` with a ${job.educationLevel.replace(/_/g, ' ').toLowerCase()} educational background` : ' looking to advance their career'}
                  {job.category ? ` in the ${job.category} industry` : ''}.
                  {job.companyDescription ? job.companyDescription.substring(0, 200) : 'Apply before the deadline to be considered for this opportunity.'}
                </p>
              </div>
            </div>

            {/* FAQ - Visible for SEO/AEO */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60">
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">Frequently Asked Questions</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-bold text-gray-700">What is the salary for this {job.category || 'position'}?</h3>
                  <p className="text-gray-600 mt-1">{job.salary !== 'Salary not disclosed' ? `The salary for this role is ${job.salary}.` : 'The salary is not publicly disclosed. Apply to learn more about compensation.'}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-700">Where is this job located?</h3>
                  <p className="text-gray-600 mt-1">{job.isRemote ? 'This is a remote position, allowing you to work from anywhere in Kenya.' : `This position is based in ${job.location}.`}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-700">When does the application close?</h3>
                  <p className="text-gray-600 mt-1">The deadline to apply is {job.deadline}.</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-700">What type of employment is this?</h3>
                  <p className="text-gray-600 mt-1">This is a {job.type} position{job.category ? ` in the ${job.category} sector` : ''}.</p>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-3">
                <span className="font-medium">Share:</span>
                <a
                  href={`mailto:?subject=${encodeURIComponent(job.title + ' - JobBoard Kenya')}&body=${encodeURIComponent(`Check out this job: ${job.title} at ${job.company} in ${job.location}. Apply before ${job.deadline}.\n\nhttps://jobboard.ke/jobs/${job.slug}`)}`}
                  className="hover:text-emerald-600 transition"
                  aria-label="Share via email"
                  title="Share via email"
                >📧</a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(job.title + ' - ' + job.company)}&url=${encodeURIComponent(`https://jobboard.ke/jobs/${job.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 transition"
                  aria-label="Share on Twitter"
                  title="Share on Twitter"
                >🐦</a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://jobboard.ke/jobs/${job.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 transition"
                  aria-label="Share on LinkedIn"
                  title="Share on LinkedIn"
                >💼</a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${job.title} - ${job.company}\nhttps://jobboard.ke/jobs/${job.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 transition"
                  aria-label="Share on WhatsApp"
                  title="Share on WhatsApp"
                >📱</a>
              </div>
              <a href={`/contact?subject=report&job=${job.slug}`} className="text-xs text-gray-400 hover:text-red-500 transition">Report this job</a>
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6 sidebar-sticky">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-5 border border-emerald-200/60 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧠</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">Premium</span>
              </div>
              <h4 className="text-base font-extrabold text-gray-800 mt-1">Smart Job Matching</h4>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">Upload your CV and let our AI find the perfect roles for you.</p>
              <Link href="/cv-matching" className="mt-3 w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg transition shadow-md shadow-emerald-200 flex items-center justify-center gap-2 text-sm">
                Upload CV &amp; Get Matched →
              </Link>
            </div>

            <GoogleAd slot="job-detail-sidebar" format="rectangle" className="rounded-xl" style={{ minHeight: '250px' }} />

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-5 border border-white/60">
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Job Summary</h4>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Experience</span><span className="font-medium text-gray-700">{formatExperienceLabel(job.experienceLevel)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Education</span><span className="font-medium text-gray-700">{formatEducationLabel(job.educationLevel)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Employment Type</span><span className="font-medium text-gray-700">{job.type}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium text-gray-700">{job.location}{job.isRemote ? ' (Remote)' : ''}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Salary</span><span className="font-medium text-emerald-600">{job.salary}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Deadline</span><span className="font-medium text-red-600">{job.deadline}</span></div>
                {job.category && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category</span>
                    <Link href={`/categories/${job.categorySlug}`} className="font-medium text-emerald-600 hover:text-emerald-700 transition">{job.category}</Link>
                  </div>
                )}
              </div>
            </div>

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

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-5 border border-emerald-200/60 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">📄</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">Internal Ad</span>
              </div>
              <h4 className="text-base font-extrabold text-gray-800">Your CV Opens Doors</h4>
              <p className="text-sm text-gray-600 mt-1">Professional CV writing, cover letters, and LinkedIn optimization. From <span className="font-bold text-emerald-600">KSh 1,500</span>.</p>
              <Link href="/cv-services" className="mt-4 w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg transition shadow-md shadow-emerald-200 flex items-center justify-center gap-2 text-sm">
                Improve My CV →
              </Link>
            </div>

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
        </div>
      </div>
    </section>
  );
}