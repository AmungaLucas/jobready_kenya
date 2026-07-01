'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Users, Copy, Check, Wallet, ArrowUpRight, ArrowDownRight,
  Loader2, Gift, TrendingUp, Clock, AlertCircle, Send,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────

interface ReferralItem {
  id: string;
  status: string;
  createdAt: string;
  referredName: string;
  referredAt: string | null;
  firstPaymentAt: string | null;
  commissions: Array<{
    amountPaid: number;
    commissionAmount: number;
    status: string;
    createdAt: string;
  }>;
}

interface WalletData {
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  minimumWithdrawal: number;
}

interface ReferralData {
  referralCode: string | null;
  referralLink: string | null;
  stats: {
    totalReferrals: number;
    activeReferrals: number;
    currentCommissionPercent: number;
    totalEarned: number;
    pendingCommission: number;
  };
  wallet: WalletData | null;
  referrals: ReferralItem[];
}

// ─── Component ───────────────────────────────────────────────

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const fetchReferrals = useCallback(async () => {
    try {
      const res = await fetch('/api/candidates/me/referrals');
      if (res.ok) setData(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchReferrals().finally(() => setLoading(false));
  }, [fetchReferrals]);

  const generateCode = async () => {
    try {
      const res = await fetch('/api/candidates/me/referrals', { method: 'POST' });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        fetchReferrals();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to generate code');
    }
  };

  const copyLink = () => {
    if (data?.referralLink) {
      navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (!withdrawPhone || withdrawPhone.length < 9) {
      toast.error('Enter a valid M-Pesa phone number');
      return;
    }
    if (!amount || amount < 1) {
      toast.error('Enter a valid amount');
      return;
    }

    setWithdrawLoading(true);
    try {
      const res = await fetch('/api/candidates/me/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: withdrawPhone, amount }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error);
        setWithdrawLoading(false);
        return;
      }
      toast.success(result.message);
      setWithdrawPhone('');
      setWithdrawAmount('');
      fetchReferrals();
    } catch {
      toast.error('Something went wrong');
    }
    setWithdrawLoading(false);
  };

  const statusColor: Record<string, string> = {
    PENDING: 'text-yellow-600 bg-yellow-50',
    ACTIVE: 'text-blue-600 bg-blue-50',
    REWARDED: 'text-emerald-600 bg-emerald-50',
    FRAUD_FLAGGED: 'text-red-600 bg-red-50',
    DISQUALIFIED: 'text-gray-500 bg-gray-50',
  };

  const statusLabel: Record<string, string> = {
    PENDING: 'Signed Up',
    ACTIVE: 'Paid Once',
    REWARDED: 'Earning',
    FRAUD_FLAGGED: 'Flagged',
    DISQUALIFIED: 'Disqualified',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#0b7e4a]" />
      </div>
    );
  }

  const hasCode = !!data?.referralCode;
  const wallet = data?.wallet;
  const minWithdraw = wallet?.minimumWithdrawal || 1000;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0C1D32]">Referral Program</h1>
        <p className="text-[#6b6b6b] mt-1">Earn commission when your referrals make payments on JobReady</p>
      </div>

      {/* Referral Code Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#0C1D32]">Your Referral Code</h2>
            {hasCode ? (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-3xl font-mono font-bold text-[#0b7e4a] tracking-widest">
                  {data!.referralCode}
                </span>
                <button
                  onClick={copyLink}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm text-[#6b6b6b] mb-3">Generate your unique referral code and share it with friends.</p>
                <button
                  onClick={generateCode}
                  className="px-4 py-2 bg-[#0b7e4a] hover:bg-[#065c36] text-white font-semibold rounded-lg text-sm transition"
                >
                  Generate Referral Code
                </button>
              </div>
            )}
          </div>

          {hasCode && (
            <div className="text-right">
              <p className="text-xs text-[#6b6b6b]">Your Commission Rate</p>
              <p className="text-2xl font-bold text-[#0b7e4a]">{data!.stats.currentCommissionPercent}%</p>
              <p className="text-xs text-[#6b6b6b]">on every referral payment</p>
            </div>
          )}
        </div>

        {hasCode && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Referrals" value={data!.stats.totalReferrals} icon={<Users className="w-4 h-4 text-blue-500" />} />
            <StatCard label="Active (Paid)" value={data!.stats.activeReferrals} icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} />
            <StatCard label="Total Earned" value={`KES ${data!.stats.totalEarned.toLocaleString()}`} icon={<Gift className="w-4 h-4 text-purple-500" />} />
            <StatCard label="Next Tier" value={data!.stats.currentCommissionPercent < 15 ? `${15 - data!.stats.activeReferrals > 0 ? 15 - data!.stats.activeReferrals : 0} more for 15%` : 'Max tier!'} icon={<TrendingUp className="w-4 h-4 text-amber-500" />} />
          </div>
        )}
      </div>

      {/* How It Works */}
      {!hasCode && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
          <h3 className="font-bold text-[#0C1D32] mb-3">How It Works</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2"><span className="font-bold text-[#0b7e4a]">1.</span> Generate your referral code</li>
            <li className="flex gap-2"><span className="font-bold text-[#0b7e4a]">2.</span> Share it with friends — they sign up using your code</li>
            <li className="flex gap-2"><span className="font-bold text-[#0b7e4a]">3.</span> When they pay for any service, you earn {data?.stats.currentCommissionPercent || 10}% commission</li>
            <li className="flex gap-2"><span className="font-bold text-[#0b7e4a]">4.</span> After 48 hours, commission credits to your wallet</li>
            <li className="flex gap-2"><span className="font-bold text-[#0b7e4a]">5.</span> Withdraw to M-Pesa once you reach KES {minWithdraw.toLocaleString()}</li>
          </ol>
          <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-200">
            <p className="text-xs font-semibold text-[#0C1D32] mb-1">Commission Tiers (by active referrals)</p>
            <div className="flex gap-4 text-xs">
              <span className="text-gray-600"><strong>0–4:</strong> 10%</span>
              <span className="text-gray-600"><strong>5–14:</strong> 12%</span>
              <span className="text-emerald-700 font-semibold"><strong>15+:</strong> 15%</span>
            </div>
          </div>
        </div>
      )}

      {/* Wallet + Withdraw */}
      {hasCode && wallet && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wallet Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-[#0b7e4a]" />
              <h3 className="font-bold text-[#0C1D32]">My Wallet</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-[#6b6b6b]">Available Balance</p>
                  <p className="text-2xl font-bold text-[#0C1D32]">KES {wallet.availableBalance.toLocaleString()}</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-xs text-[#6b6b6b]">Pending (48h cooldown)</p>
                  <p className="font-medium text-amber-600">KES {wallet.pendingBalance.toLocaleString()}</p>
                </div>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="border-t pt-3 flex justify-between text-sm text-[#6b6b6b]">
                <span>Total Earned: <strong className="text-[#0C1D32]">KES {wallet.totalEarned.toLocaleString()}</strong></span>
                <span>Withdrawn: <strong className="text-[#0C1D32]">KES {wallet.totalWithdrawn.toLocaleString()}</strong></span>
              </div>
              {wallet.pendingBalance > 0 && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Pending commissions will be available after the 48-hour cooldown
                </p>
              )}
            </div>
          </div>

          {/* Withdraw Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Send className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-[#0C1D32]">Withdraw to M-Pesa</h3>
            </div>

            {wallet.availableBalance < minWithdraw ? (
              <div className="text-center py-6">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-[#6b6b6b]">
                  You need at least <strong>KES {minWithdraw.toLocaleString()}</strong> to withdraw
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Current: KES {wallet.availableBalance.toLocaleString()} — KES {(minWithdraw - wallet.availableBalance).toLocaleString()} more to go
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">M-Pesa Phone Number</label>
                  <input
                    type="tel"
                    placeholder="0712 345 678"
                    value={withdrawPhone}
                    onChange={(e) => setWithdrawPhone(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Amount (KES) — max {wallet.availableBalance.toLocaleString()}
                  </label>
                  <input
                    type="number"
                    placeholder={`Min KES ${minWithdraw.toLocaleString()}`}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={wallet.availableBalance}
                    min={minWithdraw}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  {withdrawLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Withdraw to M-Pesa
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Referrals List */}
      {hasCode && data!.referrals.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-[#0C1D32] mb-4">Your Referrals</h2>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Person</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Referred</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {data!.referrals.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-[#0C1D32]">{r.referredName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[r.status] || 'bg-gray-100 text-gray-600'}`}>
                          {statusLabel[r.status] || r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {r.referredAt ? new Date(r.referredAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {r.commissions.length > 0 ? (
                          <div>
                            {r.commissions.map((c, i) => (
                              <div key={i} className="flex items-center justify-end gap-1 text-xs">
                                <ArrowDownRight className="w-3 h-3 text-emerald-500" />
                                <span className={c.status === 'CREDITED' ? 'text-emerald-600' : 'text-amber-600'}>
                                  KES {c.commissionAmount}
                                </span>
                                {c.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-400" />}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {hasCode && data!.referrals.length === 0 && (
        <div className="text-center py-12 text-[#6b6b6b]">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No referrals yet. Share your code to start earning!</p>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-xs text-[#6b6b6b]">{label}</p>
      </div>
      <p className="text-lg font-bold text-[#0C1D32]">{value}</p>
    </div>
  );
}