'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const filters = ['All Jobs', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Government'];

export default function FilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [active, setActive] = useState('All Jobs');

  const handleFilter = (filter: string) => {
    setActive(filter);
    const params = new URLSearchParams(searchParams.toString());
    if (filter === 'All Jobs') {
      params.delete('type');
    } else {
      params.set('type', filter.toLowerCase());
    }
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mr-1">Filters:</span>
      {filters.map((label) => (
        <button
          key={label}
          type="button"
          className={`filter-chip ${active === label ? 'active' : 'inactive'} px-4 py-1.5 rounded-full border text-sm font-medium`}
          onClick={() => handleFilter(label)}
        >
          {label}
        </button>
      ))}
      <select className="ml-2 px-3 py-1.5 rounded-full border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-emerald-600">
        <option>Sort by: Relevance</option>
        <option>Sort by: Newest</option>
        <option>Sort by: Deadline</option>
        <option>Sort by: Salary</option>
      </select>
    </div>
  );
}