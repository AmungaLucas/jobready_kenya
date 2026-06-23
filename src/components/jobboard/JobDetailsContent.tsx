'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Job } from '@/data/jobs';

interface JobDetailsContentProps {
  job: Job;
  similar: Job[];
}

export default function JobDetailsContent({ job, similar }: JobDetailsContentProps) {
  const [saved, setSaved] = useState(false);

  return (
    <section className="section-bg py-4 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-emerald-600 transition">Browse Jobs</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{job.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-xl font-extrabold text-emerald-700 shadow-sm">
                      {job.company.charAt(0)}
                    </div>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">{job.title}</h1>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-gray-700">{job.company}</span>
                        <span className="text-gray-300">•</span>
                        <span>{job.location}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> {job.match}% Match
                  </span>
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

            {/* Description */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60">
              <h2 className="text-lg font-extrabold text-gray-800">Job Description</h2>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{job.description}</p>
              <h3 className="text-md font-extrabold text-gray-800 mt-5">Key Responsibilities</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-gray-600 list-disc list-inside">
                {job.responsibilities.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <h3 className="text-md font-extrabold text-gray-800 mt-5">Requirements</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-gray-600 list-disc list-inside">
                {job.requirements.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Application */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-6 border border-emerald-200/60 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-800">Ready to apply?</h3>
                  <p className="text-sm text-gray-600">Submit your application before the deadline.</p>
                  <p className="text-xs text-red-600 font-medium mt-1">⏳ Closes in 10 days</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="#" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-lg transition shadow-md shadow-emerald-200 flex items-center gap-2 text-sm">
                    Apply Now
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
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
              <h2 className="text-lg font-extrabold text-gray-800">About the Company</h2>
              <div className="flex items-start gap-4 mt-3">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-xl font-extrabold text-emerald-700 shadow-sm flex-shrink-0">
                  {job.company.charAt(0)}
                </div>
                <div>
                  <h3 className="text-md font-bold text-gray-800">{job.company}</h3>
                  <p className="text-sm text-gray-500">Telecommunications · Nairobi, Kenya</p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{job.companyDescription}</p>
                  <Link href="#" className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700 transition">
                    Visit company website →
                  </Link>
                </div>
              </div>
            </div>

            {/* Share & Report */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-3">
                <span className="font-medium">Share:</span>
                <a href="#" className="hover:text-emerald-600 transition">📧</a>
                <a href="#" className="hover:text-emerald-600 transition">🐦</a>
                <a href="#" className="hover:text-emerald-600 transition">💼</a>
                <a href="#" className="hover:text-emerald-600 transition">📱</a>
              </div>
              <a href="#" className="text-xs text-gray-400 hover:text-red-500 transition">Report this job</a>
            </div>

            {/* Similar Jobs */}
            {similar.length > 0 && (
              <div className="pt-4 border-t border-gray-200/50">
                <h3 className="text-lg font-extrabold text-gray-800">Similar Jobs</h3>
                <div className="mt-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 divide-y divide-gray-200/50">
                  {similar.map((s) => (
                    <Link
                      key={s.id}
                      href={`/jobs/${s.id}`}
                      className="similar-item flex flex-wrap items-center justify-between gap-2 py-3 px-5 hover:bg-emerald-50/30 transition rounded-t-xl"
                    >
                      <div>
                        <span className="similar-title text-sm font-semibold text-gray-800 transition">{s.title}</span>
                        <span className="similar-company text-sm text-gray-400 ml-2 transition">{s.company} · {s.location}</span>
                      </div>
                      <span className="text-xs text-gray-500">{s.salary}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
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
              <Link href="#" className="mt-3 w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg transition shadow-md shadow-emerald-200 flex items-center justify-center gap-2 text-sm">
                Upload CV &amp; Get Matched →
              </Link>
            </div>

            <div className="bg-gray-100 rounded-xl flex items-center justify-center h-64 border border-gray-200 text-gray-400 text-sm">
              <div className="text-center">
                <div>📢 Google Ad</div>
                <div className="text-xs">(300x250)</div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-5 border border-white/60">
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Job Summary</h4>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Experience</span><span className="font-medium text-gray-700">5+ years</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Employment Type</span><span className="font-medium text-gray-700">{job.type}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium text-gray-700">{job.location}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Remote</span><span className="font-medium text-gray-700">Hybrid</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Salary</span><span className="font-medium text-emerald-600">{job.salary}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Deadline</span><span className="font-medium text-red-600">{job.deadline}</span></div>
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
                <span className="text-xl">📄</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">Internal Ad</span>
              </div>
              <h4 className="text-base font-extrabold text-gray-800">Your CV Opens Doors</h4>
              <p className="text-sm text-gray-600 mt-1">Professional CV writing, cover letters, and LinkedIn optimization. From <span className="font-bold text-emerald-600">KSh 1,500</span>.</p>
              <Link href="#" className="mt-4 w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg transition shadow-md shadow-emerald-200 flex items-center justify-center gap-2 text-sm">
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