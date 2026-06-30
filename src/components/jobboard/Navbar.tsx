'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import MobileDrawer from './MobileDrawer';
import {
  ChevronDown,
  Briefcase,
  LayoutGrid,
  MapPin,
  Landmark,
  Building2,
  GraduationCap,
  Users,
  HeartHandshake,
  PlusCircle,
  UploadCloud,
  LogOut,
  User,
} from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const isLoggedIn = status === 'authenticated' && session?.user;
  const userName = (session?.user as Record<string, unknown>)?.name as string | undefined;
  const firstName = userName?.split(' ')[0];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [userMenuOpen]);

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            <img src="/logo.svg" alt="JobBoard Kenya" className="logo-img" />
          </Link>

          <ul className="navbar-links">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li className="group relative">
              <button type="button" className="flex items-center gap-1">
                Jobs
                <ChevronDown className="w-4 h-4 dropdown-arrow" />
              </button>
              <div className="dropdown-menu">
                <Link href="/jobs">
                  <Briefcase className="w-4 h-4" /> Browse All Jobs
                </Link>
                <Link href="/categories">
                  <LayoutGrid className="w-4 h-4" /> Jobs by Category
                </Link>
                <Link href="/locations">
                  <MapPin className="w-4 h-4" /> Jobs by Location
                </Link>
                <Link href="/government-jobs">
                  <Landmark className="w-4 h-4" /> Government Jobs
                </Link>
              </div>
            </li>
            <li className="group relative">
              <button type="button" className="flex items-center gap-1">
                More
                <ChevronDown className="w-4 h-4 dropdown-arrow" />
              </button>
              <div className="dropdown-menu">
                <Link href="/opportunities">
                  <HeartHandshake className="w-4 h-4" /> Opportunities
                </Link>
                <Link href="/blog">
                  <GraduationCap className="w-4 h-4" /> Resources
                </Link>
                <Link href="/cv-services">
                  <UploadCloud className="w-4 h-4" /> CV Services
                </Link>
                <Link href="/faq">
                  <Users className="w-4 h-4" /> FAQ
                </Link>
              </div>
            </li>
          </ul>

          <div className="navbar-actions">
            {isLoggedIn ? (
              <>
                <Link href="/account/cv-upload" className="btn-outline" style={{ display: 'none' }}>
                  <UploadCloud className="w-4 h-4 inline" /> <span>Upload CV</span>
                </Link>
                <div className="user-menu-container" style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="btn-icon avatar"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    title={userName}
                  >
                    {firstName?.[0] ?? 'U'}
                  </button>
                  {userMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.5rem',
                        background: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        minWidth: '200px',
                        zIndex: 100,
                        overflow: 'hidden',
                      }}
                    >
                      {userName && (
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f0eeeb', fontSize: '0.82rem', color: '#3d3d3d' }}>
                          Signed in as <strong>{firstName}</strong>
                        </div>
                      )}
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', fontSize: '0.85rem', color: '#1a1a1a', textDecoration: 'none' }}
                      >
                        <User className="w-4 h-4" /> Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', fontSize: '0.85rem', color: '#ef4444', width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-outline">
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary">
                  Create account
                </Link>
              </>
            )}
            <button
              type="button"
              className="navbar-toggle"
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-label="Toggle navigation"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}