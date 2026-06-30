'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { candidate, matchScores, applications, savedJobs } from '@/lib/demo-candidate';
import {
  LayoutDashboard,
  Target,
  User,
  FileUp,
  Send,
  Bookmark,
  Settings,
} from 'lucide-react';

const navItems = [
  { href: '/account', label: 'Overview', icon: LayoutDashboard },
  { href: '/account/matches', label: 'My Matches', icon: Target },
  { href: '/account/profile', label: 'Profile', icon: User },
  { href: '/account/cv-upload', label: 'CV Upload', icon: FileUp },
  { href: '/account/applications', label: 'Applications', icon: Send },
  { href: '/account/saved', label: 'Saved Jobs', icon: Bookmark },
  { href: '/account/preferences', label: 'Preferences', icon: Settings },
];

export default function AccountNav() {
  const pathname = usePathname();
  const unreadCount = matchScores.filter((m) => !m.isRead && m.verdict !== 'NOT_RECOMMENDED').length;

  function isActive(href: string) {
    if (href === '/account') return pathname === '/account';
    return pathname.startsWith(href);
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
            {candidate.firstName[0]}{candidate.lastName[0]}
          </div>
          <div>
            <p className="sidebar-user-name">{candidate.firstName} {candidate.lastName}</p>
            <p className="sidebar-user-email">{candidate.email}</p>
          </div>
          <div className="sidebar-completion">
            <div className="sidebar-completion-bar">
              <div className="sidebar-completion-fill" style={{ width: `${candidate.profileCompletionScore}%` }} />
            </div>
            <p className="sidebar-completion-text">{candidate.profileCompletionScore}%</p>
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
                ? applications.length
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