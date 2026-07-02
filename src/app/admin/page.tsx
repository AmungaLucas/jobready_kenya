'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  DollarSign,
  TrendingUp,
  Briefcase,
  Users,
  Clock,
  Crown,
  ArrowRight,
} from 'lucide-react';

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
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

  if (!stats) {
    return (
      <AdminSidebar>
        <div className="text-center py-20">
          <p className="text-[#6b6b6b]">Failed to load dashboard data.</p>
        </div>
      </AdminSidebar>
    );
  }

  const { payments, users, jobs, subscriptions, withdrawals } = stats;

  const activeSubscribers = subscriptions?.reduce((s: number, sub: any) => s + sub.count, 0) || 0;

  const cards = [
    {
      label: "Month Revenue",
      value: `KES ${fmt(payments?.month)}`,
      icon: DollarSign,
      color: 'text-[#0b7e4a]',
      bg: 'bg-[#0b7e4a]/10',
    },
    {
      label: "Today's Revenue",
      value: `KES ${fmt(payments?.today)}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Active Jobs',
      value: fmt(jobs?.active),
      icon: Briefcase,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Total Users',
      value: fmt(users?.total),
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Pending Withdrawals',
      value: `${withdrawals?.pending || 0} (${fmt(withdrawals?.pendingAmount)})`,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Active Subscribers',
      value: fmt(activeSubscribers),
      icon: Crown,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
  ];

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D32]">Dashboard</h1>
          <p className="text-sm text-[#6b6b6b] mt-1">Overview of JobReady Kenya</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-gray-200 bg-white p-5 flex items-start justify-between"
            >
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

        {/* Revenue breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by payment type */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-[#0C1D32] mb-4">Revenue by Type</h2>
            {payments?.byType?.length > 0 ? (
              <div className="space-y-3">
                {payments.byType.map((pt: any) => (
                  <div key={pt.itemType} className="flex items-center justify-between">
                    <span className="text-sm text-[#6b6b6b]">{typeLabels[pt.itemType] || pt.itemType}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-[#0C1D32]">KES {fmt(pt.revenue)}</span>
                      <span className="text-xs text-[#6b6b6b] ml-2">({pt.count} txns)</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6b6b6b]">No revenue data yet.</p>
            )}
          </div>

          {/* Subscription tier breakdown */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-[#0C1D32] mb-4">Subscription Tiers</h2>
            {subscriptions?.length > 0 ? (
              <div className="space-y-3">
                {subscriptions.map((s: any) => (
                  <div key={s.tier} className="flex items-center justify-between">
                    <span className="text-sm text-[#6b6b6b]">
                      {s.tier === 'FREE' ? 'Free' : s.tier === 'BASIC_PREMIUM' ? 'Basic Premium' : s.tier === 'PRO_PREMIUM' ? 'Pro Premium' : s.tier}
                    </span>
                    <span className="text-sm font-semibold text-[#0C1D32]">{fmt(s.count)} active</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6b6b6b]">No subscription data.</p>
            )}
          </div>
        </div>

        {/* Recent payments */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-[#0C1D32]">Recent Payments</h2>
            <Link
              href="/admin/payments"
              className="text-sm text-[#0b7e4a] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium">Date</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium">Type</th>
                  <th className="text-right px-5 py-3 text-[#6b6b6b] font-medium">Amount (KES)</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium">Status</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium">Phone</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPayments?.length > 0 ? (
                  stats.recentPayments.map((p: any) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3 text-[#0C1D32]">{fmtDate(p.createdAt)}</td>
                      <td className="px-5 py-3 text-[#0C1D32]">{typeLabels[p.itemType] || p.itemType}</td>
                      <td className="px-5 py-3 text-right font-semibold text-[#0C1D32]">{fmt(p.amount)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#6b6b6b]">{p.phoneNumber || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-[#6b6b6b]">
                      No recent payments.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { href: '/admin/users', label: 'Manage Users' },
            { href: '/admin/jobs', label: 'Manage Jobs' },
            { href: '/admin/payments', label: 'Payment Audit' },
            { href: '/admin/referrals', label: 'Referrals' },
            { href: '/admin/settings', label: 'Settings' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-xl border border-gray-200 bg-white p-4 text-center text-sm font-medium text-[#0C1D32] hover:border-[#0b7e4a] hover:text-[#0b7e4a] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </AdminSidebar>
  );
}