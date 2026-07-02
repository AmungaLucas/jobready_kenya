'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { RefreshCw, Info, Shield, Server, Globe, Smartphone } from 'lucide-react';

export default function AdminSettingsPage() {
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState('');

  const checkBalance = async () => {
    setBalanceLoading(true);
    setBalanceError('');
    setBalance(null);
    try {
      const res = await fetch('/api/admin/mpesa/balance');
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance || data.accountBalance || JSON.stringify(data));
      } else {
        setBalanceError(data.error || 'Failed to fetch balance');
      }
    } catch {
      setBalanceError('Network error — please try again.');
    }
    setBalanceLoading(false);
  };

  return (
    <AdminSidebar>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D32]">Settings</h1>
          <p className="text-sm text-[#6b6b6b] mt-1">Admin panel settings & system info</p>
        </div>

        {/* M-Pesa Balance */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#0C1D32] flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                M-Pesa Account Balance
              </h2>
              <p className="text-sm text-[#6b6b6b] mt-1">
                Check the current M-Pesa business account balance via the Daraja API.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={checkBalance}
              disabled={balanceLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0b7e4a] text-white text-sm font-medium hover:bg-[#0a6d3f] disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${balanceLoading ? 'animate-spin' : ''}`} />
              {balanceLoading ? 'Checking...' : 'Check Balance'}
            </button>
          </div>

          {balance && (
            <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm font-semibold text-green-800">Balance</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{balance}</p>
            </div>
          )}

          {balanceError && (
            <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{balanceError}</p>
            </div>
          )}
        </div>

        {/* System Info */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-[#0C1D32] flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-[#6b6b6b]" />
            System Information
          </h2>
          <div className="divide-y divide-gray-100">
            {[
              { label: 'Application', value: 'JobReady Kenya', icon: Globe },
              { label: 'Panel', value: 'Admin Dashboard', icon: Shield },
              { label: 'Version', value: '1.0.0', icon: Info },
              { label: 'Environment', value: process.env.NODE_ENV || 'production', icon: Server },
              { label: 'Framework', value: 'Next.js 16 (App Router)', icon: Server },
              { label: 'Payment Provider', value: 'Safaricom M-Pesa (Daraja)', icon: Smartphone },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-[#6b6b6b]" />
                  <span className="text-sm text-[#6b6b6b]">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-[#0C1D32]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick info */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-[#0C1D32] flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-[#6b6b6b]" />
            Quick Info
          </h2>
          <ul className="space-y-2 text-sm text-[#6b6b6b]">
            <li>• Admin API routes are protected with server-side auth guards.</li>
            <li>• All revenue amounts are displayed in Kenya Shillings (KES).</li>
            <li>• Payment webhooks from M-Pesa are processed in real-time.</li>
            <li>• Referral commissions are credited after referred user completes onboarding.</li>
          </ul>
        </div>
      </div>
    </AdminSidebar>
  );
}