'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

const typeFilters = [
  { label: 'All Jobs', value: '' },
  { label: 'Full-time', value: 'full-time' },
  { label: 'Part-time', value: 'part-time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Internship', value: 'internship' },
  { label: 'Remote', value: 'remote' },
  { label: 'Government', value: 'government' },
];

const sortOptions = [
  { label: 'Sort by: Relevance', value: '' },
  { label: 'Sort by: Newest', value: 'newest' },
  { label: 'Sort by: Deadline', value: 'deadline' },
  { label: 'Sort by: Salary', value: 'salary' },
];

export default function FilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeType = searchParams.get('type') || '';
  const activeSort = searchParams.get('sort') || '';

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset page when changing filters
      params.delete('page');
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams],
  );

  const hasFilters = useMemo(() => {
    return activeType || activeSort || searchParams.get('search') || searchParams.get('category') || searchParams.get('county');
  }, [activeType, activeSort, searchParams]);

  const clearAll = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mr-1">Filters:</span>
      {typeFilters.map((filter) => (
        <button
          key={filter.value || 'all'}
          type="button"
          className={
            activeType === filter.value
              ? 'text-emerald-700 font-semibold text-sm bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200'
              : 'text-gray-500 hover:text-gray-700 text-sm hover:bg-gray-50 px-2.5 py-1 rounded-full transition'
          }
          onClick={() => updateParam('type', filter.value)}
        >
          {filter.label}
        </button>
      ))}

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <select
        className="text-sm text-gray-500 focus:outline-none focus:text-emerald-700 bg-transparent cursor-pointer"
        value={activeSort}
        onChange={(e) => updateParam('sort', e.target.value)}
      >
        {sortOptions.map((opt) => (
          <option key={opt.value || 'relevance'} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-red-500 hover:text-red-700 font-medium ml-2 transition"
        >
          Clear all
        </button>
      )}
    </div>
  );
}