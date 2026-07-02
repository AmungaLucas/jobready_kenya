'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Wallet, Clock, TrendingUp, ArrowDownCircle } from 'lucide-react';

const fmt = (n: number) => (n || 0).toLocaleString();
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

const refStatusColor: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  REWARDED: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  EXPIRED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminReferralsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/referrals?limit=20&offset=0')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b7e4a]" />
        </div>
      </AdminSidebar>
    );
  }

  const ws = data?.walletSummary || {};
  const pending = data?.pendingWithdrawals || [];
  const referrals = data?.referrals || [];

  const walletCards = [
    { label: 'Total Available', value: `KES ${fmt(ws.totalAvailable)}`, icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Pending', value: `KES ${fmt(ws.totalPending)}`, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Total Earned', value: `KES ${fmt(ws.totalEarned)}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Withdrawn', value: `KES ${fmt(ws.totalWithdrawn)}`, icon: ArrowDownCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D32]">Referrals</h1>
          <p className="text-sm text-[#6b6b6b] mt-1">Referral program management</p>
        </div>

        {/* Wallet summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {walletCards.map((c) => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6b6b6b]">{c.label}</p>
                <p className="text-xl font-bold text-[#0C1D32] mt-1">{c.value}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${c.bg}`}>
                <c.icon className={`w-5 h-5 ${c.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Pending withdrawals */}
        {pending.length > 0 && (
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-gray-200 bg-yellow-50/50">
              <h2 className="text-base font-semibold text-[#0C1D32]">
                Pending Withdrawals ({pending.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium">User</th>
                    <th className="text-right px-5 py-3 text-[#6b6b6b] font-medium">Amount (KES)</th>
                    <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium hidden md:table-cell">Phone</th>
                    <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium">Status</th>
                    <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((w: any) => (
                    <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="text-[#0C1D32] font-medium">
                          {w.candidate?.firstName} {w.candidate?.lastName}
                        </p>
                        <p className="text-xs text-[#6b6b6b]">{w.candidate?.email}</p>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-[#0C1D32]">
                        {fmt(w.amount)}
                      </td>
                      <td className="px-5 py-3 text-[#6b6b6b] hidden md:table-cell">
                        {w.candidate?.phone || '—'}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          w.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#6b6b6b] hidden lg:table-cell">
                        {fmtDate(w.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Referral list */}
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-[#0C1D32]">Referral List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium">Referrer</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium hidden md:table-cell">Referred User</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium">Status</th>
                  <th className="text-right px-5 py-3 text-[#6b6b6b] font-medium hidden lg:table-cell">Commission Earned</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium hidden lg:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-[#6b6b6b]">
                      No referrals yet.
                    </td>
                  </tr>
                ) : (
                  referrals.map((r: any) => {
                    const totalCommission = (r.commissions || []).reduce(
                      (s: number, c: any) => s + (c.amountPaid || 0),
                      0
                    );
                    return (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <p className="text-[#0C1D32] font-medium">
                            {r.referrer?.firstName} {r.referrer?.lastName}
                          </p>
                          <p className="text-xs text-[#6b6b6b]">
                            Code: {r.referrer?.referralCode || '—'}
                          </p>
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          <p className="text-[#0C1D32]">
                            {r.referred?.firstName} {r.referred?.lastName}
                          </p>
                          <p className="text-xs text-[#6b6b6b]">{r.referred?.email}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${refStatusColor[r.status] || 'bg-gray-100 text-gray-600'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-[#0C1D32] hidden lg:table-cell">
                          KES {fmt(totalCommission)}
                        </td>
                        <td className="px-5 py-3 text-[#6b6b6b] hidden lg:table-cell">
                          {fmtDate(r.createdAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}