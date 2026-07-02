'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Loader2, Briefcase, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordValid = hasMinLength && hasUppercase && hasNumber;

  // Redirect if no token
  useEffect(() => {
    if (!token || !email) {
      router.push('/forgot-password');
    }
  }, [token, email, router]);

  if (!token || !email) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!passwordValid) {
      setError('Password must be at least 8 characters with an uppercase letter and a number');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
          <Check className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-lg font-bold text-[#0C1D32]">Password reset successful</h2>
        <p className="text-sm text-[#6b6b6b]">
          Your password has been updated. You can now sign in with your new password.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-[#0b7e4a] font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-[#3d3d3d]">
          New password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            autoComplete="new-password"
            required
            className="w-full pl-10 pr-11 py-2.5 border border-[#d0cdc7] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0b7e4a]/20 focus:border-[#0b7e4a] transition placeholder:text-[#bbb]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#555] transition"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {password.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            <span className={`text-xs flex items-center gap-1 ${hasMinLength ? 'text-green-600' : 'text-[#999]'}`}>
              <Check className="w-3 h-3" /> 8+ characters
            </span>
            <span className={`text-xs flex items-center gap-1 ${hasUppercase ? 'text-green-600' : 'text-[#999]'}`}>
              <Check className="w-3 h-3" /> Uppercase letter
            </span>
            <span className={`text-xs flex items-center gap-1 ${hasNumber ? 'text-green-600' : 'text-[#999]'}`}>
              <Check className="w-3 h-3" /> Number
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#3d3d3d]">
          Confirm new password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            required
            className="w-full pl-10 pr-4 py-2.5 border border-[#d0cdc7] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0b7e4a]/20 focus:border-[#0b7e4a] transition placeholder:text-[#bbb]"
          />
        </div>
        {confirmPassword.length > 0 && password !== confirmPassword && (
          <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !passwordValid}
        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-[#0b7e4a] hover:bg-[#067a40] focus:outline-none focus:ring-2 focus:ring-[#0b7e4a]/30 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Resetting...
          </>
        ) : (
          'Reset password'
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Briefcase className="w-7 h-7 text-[#0b7e4a]" />
            <span className="text-xl font-bold text-[#0C1D32]">JobBoard Kenya</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#0C1D32] mt-4">Reset your password</h1>
          <p className="text-sm text-[#6b6b6b] mt-1">Enter your new password below</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e8e5e0] shadow-sm p-8">
          <Suspense fallback={<div className="text-center text-sm text-[#6b6b6b]">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="text-center text-sm text-[#6b6b6b] mt-6">
          <Link href="/forgot-password" className="text-[#0b7e4a] font-semibold hover:underline">
            Need a new reset link?
          </Link>
        </p>
      </div>
    </div>
  );
}