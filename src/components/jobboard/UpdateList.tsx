'use client';

import { useState } from 'react';

interface Update {
  icon: string;
  title: string;
  tag: string;
  time: string;
  type: string;
  slug: string;
  body: string;
}

const tagColors: Record<string, string> = {
  shortlisting: 'text-blue-700',
  interview: 'text-purple-700',
  recruitment: 'text-emerald-700',
  deadline: 'text-amber-700',
};

export default function UpdateList({ updates }: { updates: Update[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="divide-y divide-gray-200/60">
      {updates.map((update, idx) => (
        <div
          key={idx}
          id={update.slug}
          className="py-4 cursor-pointer group"
          onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0 mt-0.5">{update.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-800 leading-relaxed group-hover:text-emerald-700 transition">{update.title}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-xs font-medium ${tagColors[update.type] || 'text-gray-600'}`}>
                  {update.tag}
                </span>
                <span className="text-xs text-gray-400">{update.time}</span>
              </div>
              {openIdx === idx && (
                <p className="text-sm text-gray-600 leading-relaxed mt-3">{update.body}</p>
              )}
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-1 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}