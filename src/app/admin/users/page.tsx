'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Search, ChevronDown, ChevronUp, Eye } from 'lucide-react';

const fmt = (n: number) => (n || 0).toLocaleString();
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

const tierLabel: Record<string, string> = {
  FREE: 'Free',
  BASIC_PREMIUM: 'Basic',
  PRO_PREMIUM: 'Pro',
};

const tierColor: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-600',
  BASIC_PREMIUM: 'bg-blue-100 text-blue-700',
  PRO_PREMIUM: 'bg-purple-100 text-purple-700',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subFilter, setSubFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '20', offset: '0', search, status: '' });
    if (subFilter) params.set('subscription', subFilter);
    try {
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  }, [search, subFilter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D32]">Users</h1>
          <p className="text-sm text-[#6b6b6b] mt-1">Manage registered users</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b6b]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[#0C1D32] placeholder:text-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-[#0b7e4a]/30 focus:border-[#0b7e4a]"
            />
          </div>
          <select
            value={subFilter}
            onChange={(e) => setSubFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[#0C1D32] bg-white focus:outline-none focus:ring-2 focus:ring-[#0b7e4a]/30 focus:border-[#0b7e4a]"
          >
            <option value="">All Tiers</option>
            <option value="FREE">Free</option>
            <option value="BASIC_PREMIUM">Basic Premium</option>
            <option value="PRO_PREMIUM">Pro Premium</option>
          </select>
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium">Name</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium">Email</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium hidden md:table-cell">Phone</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium hidden lg:table-cell">Tier</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium hidden lg:table-cell">Score</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium hidden xl:table-cell">Payments</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium hidden xl:table-cell">Referrals</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium hidden lg:table-cell">Joined</th>
                  <th className="text-left px-5 py-3 text-[#6b6b6b] font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0b7e4a] mx-auto" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-[#6b6b6b]">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const expanded = expandedId === u.id;
                    return (
                      <>
                        <tr
                          key={u.id}
                          onClick={() => setExpandedId(expanded ? null : u.id)}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-5 py-3">
                            <span className="font-medium text-[#0C1D32]">
                              {u.firstName} {u.lastName}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-[#6b6b6b]">{u.email}</td>
                          <td className="px-5 py-3 text-[#6b6b6b] hidden md:table-cell">{u.phone || '—'}</td>
                          <td className="px-5 py-3 hidden lg:table-cell">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${tierColor[u.subscription?.tier] || 'bg-gray-100 text-gray-600'}`}>
                              {tierLabel[u.subscription?.tier] || u.subscription?.tier || 'Free'}
                            </span>
                          </td>
                          <td className="px-5 py-3 hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#0b7e4a] rounded-full"
                                  style={{ width: `${u.profile?.profileCompletionScore || 0}%` }}
                                />
                              </div>
                              <span className="text-xs text-[#6b6b6b]">{u.profile?.profileCompletionScore || 0}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-[#0C1D32] hidden xl:table-cell">{u._count?.payments || 0}</td>
                          <td className="px-5 py-3 text-[#0C1D32] hidden xl:table-cell">{u._count?.referralsMade || 0}</td>
                          <td className="px-5 py-3 text-[#6b6b6b] hidden lg:table-cell">{fmtDate(u.createdAt)}</td>
                          <td className="px-5 py-3">
                            {expanded ? (
                              <ChevronUp className="w-4 h-4 text-[#6b6b6b]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#6b6b6b]" />
                            )}
                          </td>
                        </tr>
                        {expanded && (
                          <tr key={`${u.id}-detail`} className="bg-gray-50/50">
                            <td colSpan={9} className="px-5 py-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-[#6b6b6b] text-xs mb-1">User ID</p>
                                  <p className="text-[#0C1D32] font-mono text-xs">{u.id}</p>
                                </div>
                                <div>
                                  <p className="text-[#6b6b6b] text-xs mb-1">Phone</p>
                                  <p className="text-[#0C1D32]">{u.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                  <p className="text-[#6b6b6b] text-xs mb-1">Subscription</p>
                                  <p className="text-[#0C1D32]">
                                    {tierLabel[u.subscription?.tier] || 'Free'}
                                    {u.subscription?.expiresAt && (
                                      <span className="text-[#6b6b6b] ml-1">
                                        (exp. {fmtDate(u.subscription.expiresAt)})
                                      </span>
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[#6b6b6b] text-xs mb-1">Referral Code</p>
                                  <p className="text-[#0C1D32] font-mono">{u.referralCode || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[#6b6b6b] text-xs mb-1">Role</p>
                                  <p className="text-[#0C1D32]">{u.role || 'CANDIDATE'}</p>
                                </div>
                                <div>
                                  <p className="text-[#6b6b6b] text-xs mb-1">Onboarding</p>
                                  <p className="text-[#0C1D32]">{u.onboardingStatus || 'NOT_STARTED'}</p>
                                </div>
                                <div>
                                  <p className="text-[#6b6b6b] text-xs mb-1">Profile Score</p>
                                  <p className="text-[#0C1D32]">{u.profile?.profileCompletionScore || 0}%</p>
                                </div>
                                <div>
                                  <p className="text-[#6b6b6b] text-xs mb-1">Sub Amount</p>
                                  <p className="text-[#0C1D32]">
                                    {u.subscription?.amount ? `KES ${fmt(u.subscription.amount)}` : '—'}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
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