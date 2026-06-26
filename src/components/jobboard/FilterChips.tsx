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
          className={active === label ? 'text-emerald-700 font-semibold text-sm' : 'text-gray-500 hover:text-gray-700 text-sm'}
          onClick={() => handleFilter(label)}
        >
          {label}
        </button>
      ))}
      <select className="ml-2 text-sm text-gray-500 focus:outline-none focus:text-emerald-700 bg-transparent">
        <option>Sort by: Relevance</option>
        <option>Sort by: Newest</option>
        <option>Sort by: Deadline</option>
        <option>Sort by: Salary</option>
      </select>
    </div>
  );
}