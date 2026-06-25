'use client';

import { useState } from 'react';
import Link from 'next/link';

const tabData: Record<string, { label: string; items: { title: string; company: string; time: string }[] }> = {
  entry: {
    label: 'Entry Level',
    items: [
      { title: 'Graduate Trainee', company: 'Safaricom · Nairobi', time: '5d ago' },
      { title: 'Assistant Accountant', company: 'KPMG · Nairobi', time: '2d ago' },
      { title: 'Field Officer', company: 'World Food Programme · Kisumu', time: '1w ago' },
      { title: 'Sales Representative', company: 'Twiga Foods · Mombasa', time: '3d ago' },
    ],
  },
  internships: {
    label: 'Internships',
    items: [
      { title: 'Software Dev Intern', company: 'Google · Remote', time: '4d ago' },
      { title: 'Data Science Intern', company: 'UN Habitat · Nairobi', time: '1d ago' },
      { title: 'Audit Intern', company: 'EY · Nairobi', time: '2w ago' },
      { title: 'Communications Intern', company: 'Red Cross · Nairobi', time: '5d ago' },
    ],
  },
  scholarships: {
    label: 'Scholarships',
    items: [
      { title: 'Mastercard Foundation Scholars Program', company: 'Full Tuition', time: 'Closes 15 Jun' },
      { title: 'DAAD Kenya Scholarships', company: 'Partial Tuition', time: 'Closes 30 Jun' },
      { title: 'KCB Foundation Scholarships', company: 'Full Tuition', time: 'Closes 10 Jul' },
      { title: 'Equity Group Wings to Fly', company: 'Full Tuition', time: 'Closes 25 Jun' },
    ],
  },
};

export default function OpportunitiesTabs() {
  const [activeTab, setActiveTab] = useState('entry');

  return (
    <section className="section-bg py-10 border-t border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800">🚀 Opportunities Hub</h2>
            <p className="text-sm text-gray-500 font-light">
              Discover internships, scholarships, graduate programs, and career opportunities.
            </p>
          </div>
          <Link href="/opportunities" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition whitespace-nowrap ml-4">
            View All Opportunities →
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200/60 pb-3 mb-6">
          {Object.entries(tabData).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              className={`tab-btn px-5 py-2 text-sm font-semibold rounded-full shadow-sm ${activeTab === key ? 'active' : 'inactive'}`}
              onClick={() => setActiveTab(key)}
            >
              {label}{' '}
              <span className={`tab-count ${activeTab === key ? 'text-emerald-200' : 'text-gray-400'}`}>
                ({tabData[key].items.length})
              </span>
            </button>
          ))}
        </div>
        <div>
          {Object.entries(tabData).map(([key, { items }]) => (
            <div key={key} className={`tab-content ${activeTab === key ? 'active' : ''}`}>
              <ul className="divide-y divide-gray-200/50 bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 px-4">
                {items.map((item, idx) => (
                  <li key={idx} className="py-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-sm font-semibold text-gray-800 block">{item.title}</span>
                      <span className="text-xs text-gray-400">{item.company}</span>
                    </div>
                    <span className="text-xs text-gray-300">{item.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}