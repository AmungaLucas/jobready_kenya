'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Registration failed');
      return;
    }

    // Auto sign in after registration
    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.ok) {
      router.push('/account');
      router.refresh();
    } else {
      router.push('/login');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f7f6f3',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#fff',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0b7e4a', textDecoration: 'none' }}>
            JobReady Kenya
          </Link>
          <p style={{ fontSize: '0.85rem', color: '#8a8a8a', marginTop: '0.5rem' }}>
            Create your jobseeker account
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            color: '#991b1b',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.82rem',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3d3d3d', marginBottom: '0.3rem' }}>
                First name
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#a0a0a0' }} />
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  required
                  placeholder="James"
                  style={{
                    width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.5rem',
                    border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '0.9rem',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3d3d3d', marginBottom: '0.3rem' }}>
                Last name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                required
                placeholder="Mito"
                style={{
                  width: '100%', padding: '0.6rem 0.75rem',
                  border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '0.9rem',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3d3d3d', marginBottom: '0.3rem' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#a0a0a0' }} />
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.5rem',
                  border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '0.9rem',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3d3d3d', marginBottom: '0.3rem' }}>
              Phone (optional)
            </label>
            <div style={{ position: 'relative' }}>
              <Phone style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#a0a0a0' }} />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+254 712 345 678"
                style={{
                  width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.5rem',
                  border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '0.9rem',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3d3d3d', marginBottom: '0.3rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#a0a0a0' }} />
              <input
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                required
                placeholder="Min 8 characters"
                style={{
                  width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.5rem',
                  border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '0.9rem',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3d3d3d', marginBottom: '0.3rem' }}>
              Confirm password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#a0a0a0' }} />
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                required
                placeholder="Re-enter password"
                style={{
                  width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.5rem',
                  border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '0.9rem',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.7rem',
              background: loading ? '#d1fae5' : '#0b7e4a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {loading ? 'Creating account...' : <><UserPlus style={{ width: '1rem', height: '1rem' }} /> Create account</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#8a8a8a', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#0b7e4a', fontWeight: 600 }}>
            Sign in
            <ArrowRight style={{ width: '0.7rem', height: '0.7rem', verticalAlign: 'middle', marginLeft: '0.2rem' }} />
          </Link>
        </p>
      </div>
    </div>
  );
}