'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useMatches, useApplications, useSavedJobs } from '@/lib/use-dashboard-data';
import {
  LayoutDashboard,
  Target,
  User,
  FileUp,
  Send,
  Bookmark,
  Bell,
  Settings,
  Loader2,
} from 'lucide-react';

const navItems = [
  { href: '/account', label: 'Overview', icon: LayoutDashboard },
  { href: '/account/matches', label: 'My Matches', icon: Target },
  { href: '/account/profile', label: 'Profile', icon: User },
  { href: '/account/cv-upload', label: 'CV Upload', icon: FileUp },
  { href: '/account/applications', label: 'Applications', icon: Send },
  { href: '/account/saved', label: 'Saved Jobs', icon: Bookmark },
  { href: '/account/alerts', label: 'Alerts', icon: Bell },
  { href: '/account/preferences', label: 'Preferences', icon: Settings },
];

export default function AccountNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { matches } = useMatches();
  const { apps } = useApplications();
  const { jobs: savedJobs } = useSavedJobs();
  const [completionScore, setCompletionScore] = useState(0);

  // Fetch profile completion score from the API
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/candidates/me')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then((data) => {
        const candidate = data.candidate || data;
        setCompletionScore(candidate.profile?.profileCompletionScore ?? 0);
      })
      .catch(() => {
        // Keep default 0 if fetch fails
      });
  }, [status]);

  const unreadCount = matches.filter((m) => !m.isRead && m.verdict !== 'NOT_RECOMMENDED').length;

  const userSession = session?.user as Record<string, unknown> | undefined;
  const displayName = userSession?.name
    ? String(userSession.name)
    : (userSession?.email ?? 'User');
  const displayEmail = userSession?.email ?? '';

  // Extract initials from display name
  const nameParts = displayName.trim().split(/\s+/);
  const initials = nameParts.length >= 2
    ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
    : displayName.slice(0, 2).toUpperCase();

  // Profile completion — fetched from API above

  function isActive(href: string) {
    if (href === '/account') return pathname === '/account';
    return pathname.startsWith(href);
  }

  if (status === 'loading') {
    return (
      <>
        <nav className="mobile-dashboard-nav">
          <div className="mobile-nav-inner">
            {navItems.map((item) => (
              <div key={item.href} className="mobile-nav-item" style={{ opacity: 0.5 }}>
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </nav>

        <aside className="dashboard-sidebar">
          <div className="sidebar-user">
            <div className="dashboard-avatar">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div style={{ width: 120, height: 14, borderRadius: 4, background: '#e5e7eb', animation: 'pulse 2s infinite' }} />
              <div style={{ width: 160, height: 10, borderRadius: 4, background: '#e5e7eb', marginTop: 4, animation: 'pulse 2s infinite' }} />
            </div>
          </div>
        </aside>
      </>
    );
  }

  return (
    <>
      {/* Mobile horizontal nav */}
      <nav className="mobile-dashboard-nav">
        <div className="mobile-nav-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} className={`mobile-nav-item${active ? ' active' : ''}`}>
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-user">
          <div className="dashboard-avatar">
            {initials}
          </div>
          <div>
            <p className="sidebar-user-name">{displayName}</p>
            <p className="sidebar-user-email">{displayEmail}</p>
          </div>
          <div className="sidebar-completion">
            <div className="sidebar-completion-bar">
              <div className="sidebar-completion-fill" style={{ width: `${completionScore}%` }} />
            </div>
            <p className="sidebar-completion-text">{completionScore}%</p>
          </div>
        </div>

        <div className="dashboard-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const count =
              item.href === '/account/matches'
                ? unreadCount
                : item.href === '/account/applications'
                ? apps.length
                : item.href === '/account/saved'
                ? savedJobs.length
                : 0;
            return (
              <Link key={item.href} href={item.href} className={`nav-item${active ? ' active' : ''}`}>
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {count > 0 && <span className="dashboard-nav-count">{count}</span>}
              </Link>
            );
          })}
        </div>

        <div style={{ padding: '1rem 0.5rem', marginTop: '1rem' }}>
          <Link href="/cv-matching" className="btn-primary w-full justify-center">
            Smart Matching
          </Link>
        </div>
      </aside>
    </>
  );
}