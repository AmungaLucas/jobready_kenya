'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, SlidersHorizontal } from 'lucide-react';
import GoogleAd from '@/components/jobboard/GoogleAd';

interface Category {
  label: string;
  slug: string;
  _count: { jobs: number };
}

interface SidebarDrawerProps {
  categories: Category[];
}

export default function SidebarDrawer({ categories }: SidebarDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sidebarContent = (
    <div className="space-y-6">
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
        <Link
          href="/cv-services"
          className="mt-3 w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg transition shadow-md shadow-emerald-200 flex items-center justify-center gap-2 text-sm"
          onClick={() => setIsOpen(false)}
        >
          Upload CV &amp; Get Matched →
        </Link>
      </div>

      {/* Google Ad */}
      <GoogleAd slot="jobs-sidebar" format="rectangle" className="rounded-xl" style={{ minHeight: '250px' }} />

      {/* Browse by Category */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-5 border border-white/60">
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">
          Browse by Category
        </h4>
        <ul className="space-y-3">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/categories/${cat.slug}`}
                className="flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-emerald-600 transition"
                onClick={() => setIsOpen(false)}
              >
                <span>{cat.label}</span>
                <span className="text-xs text-gray-400 font-normal">({cat._count.jobs})</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/categories"
          className="mt-3 block text-center text-xs font-medium text-emerald-600 hover:text-emerald-700 transition"
          onClick={() => setIsOpen(false)}
        >
          View all categories →
        </Link>
      </div>

      {/* Trending Searches */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-5 border border-white/60">
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 border-b border-gray-200/60 pb-3 mb-4">
          <span>🔥</span> Trending Searches
        </h4>
        <ul className="space-y-2">
          {['Teaching', 'Nursing', 'IT & Software', 'Driving', 'Accounting'].map((term) => (
            <li key={term}>
              <Link
                href={`/jobs?search=${term}`}
                className="flex items-center justify-between text-sm text-gray-700 hover:text-emerald-600 transition group p-2 rounded-lg hover:bg-emerald-50/50"
                onClick={() => setIsOpen(false)}
              >
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
        <Link
          href="/cv-services"
          className="mt-4 w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg transition shadow-md shadow-emerald-200 flex items-center justify-center gap-2 text-sm"
          onClick={() => setIsOpen(false)}
        >
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
          <input
            type="email"
            placeholder="Your email"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-emerald-600"
          />
          <button
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition text-sm"
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: render inline as before */}
      <div className="hidden lg:block lg:col-span-1 sidebar-sticky">
        {sidebarContent}
      </div>

      {/* Mobile: floating filter button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-[998] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 rounded-full shadow-lg shadow-emerald-200/60 flex items-center gap-2 text-sm transition active:scale-95"
        aria-label="Open filters"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
      </button>

      {/* Mobile: backdrop overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[999] bg-black/25 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile: slide-out drawer from the right */}
      <div
        className={`lg:hidden fixed top-0 right-0 z-[1000] h-full w-[88%] max-w-[380px] bg-white shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/60 sticky top-0 bg-white z-10">
          <h3 className="text-base font-bold text-gray-800">Filters &amp; Explore</h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          {sidebarContent}
        </div>
      </div>
    </>
  );
}