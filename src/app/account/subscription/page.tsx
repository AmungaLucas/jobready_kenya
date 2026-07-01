'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Crown, Lock, Check, X, Loader2, ChevronRight,
  Sparkles, Zap, FileText, Send, CreditCard, Clock, AlertCircle,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────

interface SubscriptionData {
  tier: string;
  status: string;
  isActive: boolean;
  startsAt: string;
  expiresAt: string | null;
  autoRenew: boolean;
  amount: number;
}

interface Features {
  aiMatching: boolean;
  matchExplanations: boolean;
  priorityApplications: number;
  cvReviewPurchased: boolean;
  cvReviewResult: unknown;
  jobAlerts: boolean;
}

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: string;
  itemType: string;
  description: string;
  providerTxId: string | null;
  failureReason: string | null;
  completedAt: string | null;
  createdAt: string;
}

// ─── Component ───────────────────────────────────────────────

export default function SubscriptionPage() {
  const [sub, setSub] = useState<SubscriptionData | null>(null);
  const [features, setFeatures] = useState<Features | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);
  const [pollInterval, setPollInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await fetch('/api/candidates/me/subscription');
      if (res.ok) {
        const data = await res.json();
        setSub(data.subscription);
        setFeatures(data.features);
      }
    } catch {}
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch('/api/candidates/me/purchases?limit=10');
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments);
      }
    } catch {}
  }, []);

  useEffect(() => {
    Promise.all([fetchSubscription(), fetchPayments()]).finally(() => setLoading(false));
  }, [fetchSubscription, fetchPayments]);

  // Poll payment status when pending
  const startPolling = (paymentId: string) => {
    setPendingPaymentId(paymentId);
    const interval = setInterval(async () => {
      const res = await fetch(`/api/payments/status?paymentId=${paymentId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'COMPLETED') {
          clearInterval(interval);
          setPollInterval(null);
          setPendingPaymentId(null);
          toast.success('Payment successful! Your premium features are now active.');
          fetchSubscription();
          fetchPayments();
        } else if (data.status === 'FAILED' || data.status === 'CANCELLED' || data.status === 'EXPIRED') {
          clearInterval(interval);
          setPollInterval(null);
          setPendingPaymentId(null);
          toast.error(data.failureReason || 'Payment failed. Please try again.');
          fetchPayments();
        }
      }
    }, 3000);
    setPollInterval(interval);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [pollInterval]);

  const handleSubscribe = async (tier: 'BASIC_PREMIUM' | 'PRO_PREMIUM') => {
    if (!paymentPhone || paymentPhone.length < 9) {
      toast.error('Please enter a valid M-Pesa phone number');
      return;
    }
    setPaymentLoading(true);
    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: paymentPhone,
          itemType: 'SUBSCRIPTION',
          tier,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Payment failed');
        setPaymentLoading(false);
        return;
      }
      toast.success(data.message || 'Check your phone for the M-Pesa prompt');
      if (data.paymentId) startPolling(data.paymentId);
      setPaymentLoading(false);
    } catch {
      toast.error('Something went wrong');
      setPaymentLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const res = await fetch('/api/candidates/me/subscription', { method: 'POST' });
      if (res.ok) {
        toast.success('Auto-renewal disabled. Your premium will remain active until expiry.');
        fetchSubscription();
      }
    } catch {}
  };

  const formatDate = (d: string | null) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const statusLabel: Record<string, string> = {
    COMPLETED: 'Paid',
    PENDING: 'Processing',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
    EXPIRED: 'Expired',
    REFUNDED: 'Refunded',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#0b7e4a]" />
      </div>
    );
  }

  const isPremium = sub?.isActive && sub?.tier !== 'FREE';
  const isPro = sub?.isActive && sub?.tier === 'PRO_PREMIUM';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0C1D32]">Subscription & Payments</h1>
        <p className="text-[#6b6b6b] mt-1">Manage your premium features and view payment history</p>
      </div>

      {/* Current Plan Card */}
      <div className={`rounded-2xl border p-6 ${isPremium ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200' : 'bg-white border-gray-200'}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              {isPremium ? <Crown className="w-5 h-5 text-amber-500" /> : <Lock className="w-5 h-5 text-gray-400" />}
              <h2 className="text-lg font-bold text-[#0C1D32]">
                {sub?.tier === 'FREE' ? 'Free Plan' : sub?.tier === 'PRO_PREMIUM' ? 'Pro Premium' : 'Basic Premium'}
              </h2>
            </div>
            <p className="text-sm text-[#6b6b6b] mt-1">
              {isPremium
                ? `Active until ${formatDate(sub?.expiresAt)}`
                : 'Upgrade to unlock AI matching and premium features'}
            </p>
          </div>
          {isPremium && (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
              Active
            </span>
          )}
        </div>

        {/* Feature list */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <FeatureItem label="AI Job Match Scores" active={features?.aiMatching ?? false} />
          <FeatureItem label="Match Explanations (AI)" active={features?.matchExplanations ?? false} />
          <FeatureItem label={`Priority Applications (${features?.priorityApplications ?? 0} available)`} active={(features?.priorityApplications ?? 0) > 0} />
          <FeatureItem label="Job Alerts" active={features?.jobAlerts ?? false} />
          <FeatureItem label="CV Review" active={features?.cvReviewPurchased ?? false} />
          <FeatureItem label="Full Profile Access" active={true} />
        </div>

        {isPremium && sub?.autoRenew && (
          <button
            onClick={handleCancelSubscription}
            className="mt-4 text-sm text-red-500 hover:text-red-700 transition"
          >
            Disable auto-renewal
          </button>
        )}
      </div>

      {/* Pending Payment Modal */}
      {pendingPaymentId && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">Waiting for M-Pesa confirmation...</p>
            <p className="text-xs text-blue-600 mt-0.5">Check your phone and enter your PIN. This page will update automatically.</p>
          </div>
        </div>
      )}

      {/* Upgrade Section (hidden if already premium) */}
      {!isPremium && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Premium */}
          <div className="border-2 border-gray-200 rounded-2xl p-6 hover:border-emerald-300 transition">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-[#0C1D32]">Basic Premium</h3>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-[#0C1D32]">KES 100</span>
              <span className="text-sm text-[#6b6b6b]">/month</span>
            </div>
            <ul className="space-y-2 mb-6">
              <CheckItem label="View all match scores" />
              <CheckItem label="Top 10 matches ranked" />
              <CheckItem label="WhatsApp job alerts" />
              <CheckItem label="Priority applications (KES 50 each)" />
              <NoItem label="AI match explanations" />
              <NoItem label="CV review" />
            </ul>

            <div className="space-y-2">
              <input
                type="tel"
                placeholder="0712 345 678 (M-Pesa)"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
              <button
                onClick={() => handleSubscribe('BASIC_PREMIUM')}
                disabled={paymentLoading || !paymentPhone}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 text-sm disabled:cursor-not-allowed"
              >
                {paymentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Subscribe KES 100/mo
              </button>
            </div>
          </div>

          {/* Pro Premium */}
          <div className="border-2 border-emerald-400 rounded-2xl p-6 relative bg-emerald-50/30">
            <span className="absolute -top-3 left-6 px-3 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded-full">
              BEST VALUE
            </span>
            <div className="flex items-center gap-2 mb-3 mt-1">
              <Zap className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-[#0C1D32]">Pro Premium</h3>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-[#0C1D32]">KES 200</span>
              <span className="text-sm text-[#6b6b6b]">/month</span>
            </div>
            <ul className="space-y-2 mb-6">
              <CheckItem label="View all match scores" />
              <CheckItem label="Unlimited matches ranked" />
              <CheckItem label="AI explanations for each match" />
              <CheckItem label="WhatsApp job alerts" />
              <CheckItem label="Priority applications (KES 50 each)" />
              <NoItem label="CV review (KES 300 one-time)" />
            </ul>

            <div className="space-y-2">
              <input
                type="tel"
                placeholder="0712 345 678 (M-Pesa)"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
              <button
                onClick={() => handleSubscribe('PRO_PREMIUM')}
                disabled={paymentLoading || !paymentPhone}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 text-sm disabled:cursor-not-allowed"
              >
                {paymentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Subscribe KES 200/mo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* One-time purchases */}
      {isPremium && (
        <div>
          <h2 className="text-lg font-bold text-[#0C1D32] mb-4">One-Time Purchases</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority Application */}
            <div className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Send className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-[#0C1D32]">Priority Application</h3>
              </div>
              <p className="text-xs text-[#6b6b6b] mb-3">Your application gets highlighted to recruiters. Available: {features?.priorityApplications ?? 0}</p>
              <div className="space-y-2">
                <input
                  type="tel"
                  placeholder="0712 345 678"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
                <button
                  onClick={async () => {
                    if (!paymentPhone) { toast.error('Enter phone number'); return; }
                    setPaymentLoading(true);
                    // Priority app is triggered from the apply flow, this is a top-up
                    toast.info('Priority applications are purchased when applying to a job.');
                    setPaymentLoading(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition"
                >
                  Buy Priority App — KES 50
                </button>
              </div>
            </div>

            {/* CV Review */}
            <div className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-sm text-[#0C1D32]">AI CV Review</h3>
              </div>
              <p className="text-xs text-[#6b6b6b] mb-3">
                {features?.cvReviewPurchased ? 'Purchased! Check your review results.' : 'Get actionable feedback to improve your CV for Kenyan employers.'}
              </p>
              {!features?.cvReviewPurchased && (
                <div className="space-y-2">
                  <input
                    type="tel"
                    placeholder="0712 345 678"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                  />
                  <button
                    onClick={async () => {
                      if (!paymentPhone) { toast.error('Enter phone number'); return; }
                      setPaymentLoading(true);
                      try {
                        const res = await fetch('/api/payments/initiate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ phoneNumber: paymentPhone, itemType: 'CV_REVIEW' }),
                        });
                        const data = await res.json();
                        if (!res.ok) { toast.error(data.error); setPaymentLoading(false); return; }
                        toast.success(data.message);
                        if (data.paymentId) startPolling(data.paymentId);
                      } catch { toast.error('Something went wrong'); }
                      setPaymentLoading(false);
                    }}
                    disabled={paymentLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-semibold py-2 rounded-lg text-sm transition disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {paymentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Buy CV Review — KES 300
                  </button>
                </div>
              )}
              {features?.cvReviewPurchased && (
                <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium">
                  <Check className="w-4 h-4" /> Purchased
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div>
        <h2 className="text-lg font-bold text-[#0C1D32] mb-4">Payment History</h2>
        {payments.length === 0 ? (
          <div className="text-center py-10 text-[#6b6b6b]">
            <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No payments yet</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 text-gray-600">{formatDate(p.createdAt)}</td>
                      <td className="px-4 py-3 font-medium text-[#0C1D32]">{p.description || p.itemType}</td>
                      <td className="px-4 py-3 text-right font-medium">KES {p.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {p.status === 'PENDING' && <Loader2 className="w-3 h-3 animate-spin" />}
                          {p.status === 'FAILED' && <AlertCircle className="w-3 h-3" />}
                          {statusLabel[p.status] || p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{p.providerTxId || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function CheckItem({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-gray-700">
      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      {label}
    </li>
  );
}

function NoItem({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-gray-400">
      <X className="w-4 h-4 flex-shrink-0" />
      {label}
    </li>
  );
}

function FeatureItem({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {active ? (
        <Check className="w-4 h-4 text-emerald-500" />
      ) : (
        <Lock className="w-4 h-4 text-gray-300" />
      )}
      <span className={active ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
    </div>
  );
}