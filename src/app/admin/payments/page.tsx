'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Search } from 'lucide-react';

const fmt = (n: number) => (n || 0).toLocaleString();
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

const statusColor: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  FAILED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

const typeLabels: Record<string, string> = {
  SUBSCRIPTION: 'Subscription',
  PRIORITY_APPLICATION: 'Priority App',
  CV_REVIEW: 'CV Review',
  REFERRAL_PAYOUT: 'Referral Payout',
};

const statusFilters = ['ALL', 'COMPLETED', 'PENDING', 'FAILED', 'CANCELLED'];
const itemTypeFilters = ['ALL', 'SUBSCRIPTION', 'PRIORITY_APPLICATION', 'CV_REVIEW', 'REFERRAL_PAYOUT'];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [itemTypeFilter, setItemTypeFilter] = useState('ALL');

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '30', offset: '0' });
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (itemTypeFilter !== 'ALL') params.set('itemType', itemTypeFilter);
    try {
      const res = await fetch(`/api/admin/payments?${params}`);
      const data = await res.json();
      setPayments(data.payments || []);
    } catch {
      setPayments([]);
    }
    setLoading(false);
  }, [statusFilter, itemTypeFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filtered = payments.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.candidate?.firstName?.toLowerCase().includes(q) ||
      p.candidate?.lastName?.toLowerCase().includes(q) ||
      p.candidate?.email?.toLowerCase().includes(q) ||
      p.phoneNumber?.includes(q) ||
      p.providerTxId?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D32]">Payments</h1>
          <p className="text-sm text-[#6b6b6b] mt-1">Payment audit log</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b6b]" />
            <input
              type="text"
              placeholder="Search by user, phone, receipt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[#0C1D32] placeholder:text-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-[#0b7e4a]/30 focus:border-[#0b7e4a]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[#0C1D32] bg-white focus:outline-none focus:ring-2 focus:ring-[#0b7e4a]/30 focus:border-[#0b7e4a]"
          >
            {statusFilters.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Statuses' : s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <select
            value={itemTypeFilter}
            onChange={(e) => setItemTypeFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[#0C1D32] bg-white focus:outline-none focus:ring-2 focus:ring-[#0b7e4a]/30 focus:border-[#0b7e4a]"
          >
            {itemTypeFilters.map((t) => (
              <option key={t} value={t}>
                {t === 'ALL' ? 'All Types' : typeLabels[t] || t}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium">Date</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium">User</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium hidden md:table-cell">Phone</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium hidden lg:table-cell">Type</th>
                  <th className="text-right px-5 py-3 text-[#6b6b6b] font-medium">Amount (KES)</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium">Status</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium hidden xl:table-cell">Receipt #</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium hidden xl:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0b7e4a] mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-[#6b6b6b]">
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3 text-[#0C1D32]">
                        {p.completedAt ? fmtDate(p.completedAt) : fmtDate(p.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-[#0C1D32] font-medium">
                          {p.candidate?.firstName} {p.candidate?.lastName}
                        </p>
                        <p className="text-xs text-[#6b6b6b]">{p.candidate?.email}</p>
                      </td>
                      <td className="px-5 py-3 text-[#6b6b6b] hidden md:table-cell">
                        {p.phoneNumber || '—'}
                      </td>
                      <td className="px-5 py-3 text-[#6b6b6b] hidden lg:table-cell">
                        {typeLabels[p.itemType] || p.itemType}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-[#0C1D32]">
                        {fmt(p.amount)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#6b6b6b] font-mono text-xs hidden xl:table-cell">
                        {p.providerTxId || '—'}
                      </td>
                      <td className="px-5 py-3 text-[#6b6b6b] hidden xl:table-cell">
                        {fmtDate(p.createdAt)}
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