'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationProps {
  total: number;
  perPage: number;
  currentPage: number;
}

export default function Pagination({ total, perPage, currentPage }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / perPage);

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/jobs?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1));

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200/50">
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">{(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, total)}</span> of <span className="font-medium text-gray-700">{total}</span> jobs
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="per-page" className="text-sm text-gray-500">Show:</label>
          <select id="per-page" className="px-2 py-1.5 rounded-lg border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-emerald-600">
            <option value="20" defaultValue="20">20</option>
            <option value="30">30</option>
            <option value="40">40</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="page-btn inactive px-3 py-1.5 rounded-lg border text-sm font-medium"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ←
        </button>
        {visible.map(p => (
          <button
            key={p}
            type="button"
            className={`page-btn ${p === currentPage ? 'active' : 'inactive'} px-3 py-1.5 rounded-lg border text-sm font-medium`}
            onClick={() => goToPage(p)}
          >
            {p}
          </button>
        ))}
        {totalPages > 3 && currentPage < totalPages - 1 && <span className="text-sm text-gray-400">…</span>}
        {currentPage < totalPages - 1 && (
          <button type="button" className="page-btn inactive px-3 py-1.5 rounded-lg border text-sm font-medium" onClick={() => goToPage(totalPages)}>
            {totalPages}
          </button>
        )}
        <button
          type="button"
          className="page-btn inactive px-3 py-1.5 rounded-lg border text-sm font-medium"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          →
        </button>
      </div>
    </div>
  );
}