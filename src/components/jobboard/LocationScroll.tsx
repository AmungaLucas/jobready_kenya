'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

const locations = [
  { name: 'Nairobi', count: 234 },
  { name: 'Mombasa', count: 98 },
  { name: 'Kisumu', count: 76 },
  { name: 'Nakuru', count: 63 },
  { name: 'Eldoret', count: 52 },
  { name: 'Thika', count: 41 },
  { name: 'Malindi', count: 28 },
  { name: 'Kitale', count: 19 },
  { name: 'Nyeri', count: 22 },
  { name: 'Machakos', count: 33 },
];

export default function LocationScroll() {
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">📍 Browse by Location</h2>
            <p className="text-sm text-gray-500 font-light">Find jobs near you across Kenya&apos;s major towns and cities.</p>
          </div>
          <Link href="/jobs" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition whitespace-nowrap ml-4">
            All Locations →
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
            className="flex flex-nowrap gap-3 overflow-x-auto no-scrollbar py-4 px-8 sm:px-10 w-full"
          >
            {locations.map((loc) => (
              <Link
                key={loc.name}
                href={`/jobs?location=${loc.name.toLowerCase()}`}
                className="location-item flex-shrink-0 w-[140px] sm:w-[150px] bg-white/70 backdrop-blur-sm rounded-xl p-3.5 text-center border border-white/60 transition"
              >
                <p className="loc-name text-sm font-semibold text-gray-800 transition">{loc.name}</p>
                <span className="text-xs text-emerald-600 font-medium">{loc.count} jobs</span>
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