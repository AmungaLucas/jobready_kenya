'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, Briefcase, ArrowLeft, Check } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Briefcase className="w-7 h-7 text-[#0b7e4a]" />
            <span className="text-xl font-bold text-[#0C1D32]">JobBoard Kenya</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#0C1D32] mt-4">Forgot your password?</h1>
          <p className="text-sm text-[#6b6b6b] mt-1">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e8e5e0] shadow-sm p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-[#0C1D32]">Check your email</h2>
              <p className="text-sm text-[#6b6b6b]">
                If an account with <strong>{email}</strong> exists, a reset link has been sent.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-[#0b7e4a] font-semibold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-[#3d3d3d]">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-[#d0cdc7] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0b7e4a]/20 focus:border-[#0b7e4a] transition placeholder:text-[#bbb]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-[#0b7e4a] hover:bg-[#067a40] focus:outline-none focus:ring-2 focus:ring-[#0b7e4a]/30 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-[#6b6b6b] mt-6">
          Remember your password?{' '}
          <Link href="/login" className="text-[#0b7e4a] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}