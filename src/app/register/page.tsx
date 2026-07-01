'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Loader2, Eye, EyeOff, Briefcase, Check } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordValid = hasMinLength && hasUppercase && hasNumber;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      // Auto sign in after successful registration
      setSuccess(true);
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/account');
        router.refresh();
      } else {
        // Registration succeeded but auto-login failed — redirect to login
        router.push('/login?registered=1');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Briefcase className="w-7 h-7 text-[#0b7e4a]" />
            <span className="text-xl font-bold text-[#0C1D32]">JobBoard Kenya</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#0C1D32] mt-4">Create your account</h1>
          <p className="text-sm text-[#6b6b6b] mt-1">Start finding jobs that match your skills</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#e8e5e0] shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                Account created! Signing you in...
              </div>
            )}

            {/* First Name */}
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="block text-sm font-medium text-[#3d3d3d]">
                First name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                  autoComplete="given-name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-[#d0cdc7] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0b7e4a]/20 focus:border-[#0b7e4a] transition placeholder:text-[#bbb]"
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <label htmlFor="lastName" className="block text-sm font-medium text-[#3d3d3d]">
                Last name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Kamau"
                  autoComplete="family-name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-[#d0cdc7] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0b7e4a]/20 focus:border-[#0b7e4a] transition placeholder:text-[#bbb]"
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-[#3d3d3d]">
                Password
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
              {/* Password strength indicators */}
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#3d3d3d]">
                Confirm password
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-[#0b7e4a] hover:bg-[#067a40] focus:outline-none focus:ring-2 focus:ring-[#0b7e4a]/30 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-[#6b6b6b] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#0b7e4a] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}