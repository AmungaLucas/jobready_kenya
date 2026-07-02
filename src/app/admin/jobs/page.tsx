'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Search, CheckCircle, XCircle, PauseCircle } from 'lucide-react';

const fmt = (n: number) => (n || 0).toLocaleString();
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

const statusColor: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-red-100 text-red-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  DRAFT: 'bg-gray-100 text-gray-600',
  CLOSED: 'bg-gray-100 text-gray-600',
};

const statusFilters = ['ALL', 'ACTIVE', 'EXPIRED', 'PAUSED', 'DRAFT'];

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '25', offset: '0', search });
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    try {
      const res = await fetch(`/api/admin/jobs?${params}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch {
      setJobs([]);
    }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchJobs, 300);
    return () => clearTimeout(t);
  }, [fetchJobs]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === jobs.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(jobs.map((j) => j.id)));
    }
  };

  const bulkAction = async (status: 'ACTIVE' | 'EXPIRED' | 'PAUSED') => {
    if (selected.size === 0) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulkStatus', jobIds: Array.from(selected), status }),
      });
      if (res.ok) {
        setSelected(new Set());
        fetchJobs();
      }
    } catch {
      // silent fail
    }
    setUpdating(false);
  };

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D32]">Jobs</h1>
          <p className="text-sm text-[#6b6b6b] mt-1">Manage job listings</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b6b]" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[#0C1D32] placeholder:text-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-[#0b7e4a]/30 focus:border-[#0b7e4a]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                  statusFilter === s
                    ? 'bg-[#0b7e4a] text-white border-[#0b7e4a]'
                    : 'bg-white text-[#6b6b6b] border-gray-200 hover:border-gray-300'
                }`}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0b7e4a]/5 border border-[#0b7e4a]/20">
            <span className="text-sm text-[#0C1D32] font-medium">{selected.size} selected</span>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => bulkAction('ACTIVE')}
                disabled={updating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Set Active
              </button>
              <button
                onClick={() => bulkAction('EXPIRED')}
                disabled={updating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" /> Set Expired
              </button>
              <button
                onClick={() => bulkAction('PAUSED')}
                disabled={updating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500 text-white text-xs font-medium hover:bg-yellow-600 disabled:opacity-50 transition-colors"
              >
                <PauseCircle className="w-3.5 h-3.5" /> Set Paused
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={jobs.length > 0 && selected.size === jobs.length}
                      onChange={toggleAll}
                      className="rounded border-gray-300 text-[#0b7e4a] focus:ring-[#0b7e4a]"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-[#6b6b6b] font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-[#6b6b6b] font-medium hidden lg:table-cell">Organization</th>
                  <th className="text-left px-4 py-3 text-[#6b6b6b] font-medium hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-[#6b6b6b] font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-[#6b6b6b] font-medium hidden xl:table-cell">Location</th>
                  <th className="text-right px-4 py-3 text-[#6b6b6b] font-medium hidden lg:table-cell">Apps</th>
                  <th className="text-right px-4 py-3 text-[#6b6b6b] font-medium hidden lg:table-cell">Views</th>
                  <th className="text-left px-4 py-3 text-[#6b6b6b] font-medium hidden xl:table-cell">Deadline</th>
                  <th className="text-left px-4 py-3 text-[#6b6b6b] font-medium hidden xl:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0b7e4a] mx-auto" />
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center text-[#6b6b6b]">
                      No jobs found.
                    </td>
                  </tr>
                ) : (
                  jobs.map((j) => (
                    <tr key={j.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(j.id)}
                          onChange={() => toggleSelect(j.id)}
                          className="rounded border-gray-300 text-[#0b7e4a] focus:ring-[#0b7e4a]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-[#0C1D32]">{j.title}</span>
                        {j.source && (
                          <span className="text-xs text-[#6b6b6b] ml-1">({j.source})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#6b6b6b] hidden lg:table-cell">
                        {j.organization?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-[#6b6b6b] hidden md:table-cell">
                        {j.employmentType || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[j.status] || 'bg-gray-100 text-gray-600'}`}>
                          {j.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#6b6b6b] hidden xl:table-cell">
                        {j.location?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-[#0C1D32] hidden lg:table-cell">
                        {fmt(j._count?.applications)}
                      </td>
                      <td className="px-4 py-3 text-right text-[#0C1D32] hidden lg:table-cell">
                        {fmt(j._count?.jobViews)}
                      </td>
                      <td className="px-4 py-3 text-[#6b6b6b] hidden xl:table-cell">
                        {j.applicationDeadline ? fmtDate(j.applicationDeadline) : '—'}
                      </td>
                      <td className="px-4 py-3 text-[#6b6b6b] hidden xl:table-cell">
                        {fmtDate(j.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}