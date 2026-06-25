'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

const categories = [
  { name: 'IT & Software', icon: '💻', count: 124, slug: 'it' },
  { name: 'Health & Medical', icon: '🏥', count: 87, slug: 'health' },
  { name: 'Finance & Accounting', icon: '📊', count: 63, slug: 'finance' },
  { name: 'Engineering', icon: '🏗️', count: 52, slug: 'engineering' },
  { name: 'Education', icon: '📚', count: 41, slug: 'education' },
  { name: 'Administration', icon: '🏢', count: 38, slug: 'administration' },
  { name: 'Legal', icon: '⚖️', count: 24, slug: 'legal' },
  { name: 'Logistics', icon: '🚛', count: 19, slug: 'logistics' },
  { name: 'Creative & Design', icon: '🎨', count: 16, slug: 'creative' },
  { name: 'NGO & Social Work', icon: '🤝', count: 28, slug: 'ngo' },
];

export default function CategoryScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateButtons = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  const scroll = (dir: number) => {
    containerRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);
    updateButtons();
    return () => {
      el.removeEventListener('scroll', updateButtons);
      window.removeEventListener('resize', updateButtons);
    };
  }, []);

  return (
    <section className="section-bg py-10 border-t border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800">Browse by Category</h2>
            <p className="text-sm text-gray-500 font-light">Explore opportunities based on your field, interests, and experience.</p>
          </div>
          <Link href="/jobs" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition">
            View All Categories →
          </Link>
        </div>
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => scroll(-1)}
            className={`scroll-btn absolute left-0 ml-1 z-10 hidden md:flex ${!canScrollLeft ? 'disabled' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div
            ref={containerRef}
            className="flex flex-nowrap gap-4 overflow-x-auto no-scrollbar py-4 px-8 sm:px-10 w-full"
          >
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/jobs?category=${cat.slug}`}
                className="category-item flex-shrink-0 w-[160px] sm:w-[170px] bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center border border-white/60 hover:border-emerald-400 transition"
              >
                <div className="cat-icon text-3xl sm:text-4xl mb-2">{cat.icon}</div>
                <p className="text-sm font-semibold text-gray-800">{cat.name}</p>
                <span className="text-xs text-gray-400">{cat.count} jobs</span>
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scroll(1)}
            className={`scroll-btn absolute right-0 mr-1 z-10 hidden md:flex ${!canScrollRight ? 'disabled' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}