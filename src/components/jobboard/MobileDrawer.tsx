'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  X,
  ChevronDown,
  Briefcase,
  LayoutGrid,
  MapPin,
  Landmark,
  GraduationCap,
  Users,
  HeartHandshake,
  PlusCircle,
  UploadCloud,
  LogOut,
  User,
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const [jobsOpen, setJobsOpen] = useState(false);
  const [oppOpen, setOppOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && session?.user;
  const userName = (session?.user as Record<string, unknown>)?.name as string | undefined;

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-overlay open" onClick={onClose}></div>
      <div className="mobile-drawer open">
        <div className="mobile-drawer-header">
          <Link href="/" onClick={onClose}>
            <img src="/logo.svg" alt="JobBoard Kenya" className="logo-img logo-img-drawer" />
          </Link>
          <button type="button" className="mobile-drawer-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <ul className="mobile-nav-list">
          <li>
            <Link href="/" onClick={onClose}>
              Home
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setJobsOpen(!jobsOpen)}
              className="w-full flex justify-between items-center"
            >
              <span>Jobs</span>
              <ChevronDown className={`w-4 h-4 sub-toggle ${jobsOpen ? 'open' : ''}`} />
            </button>
            <ul className={`mobile-sub ${jobsOpen ? 'open' : ''}`}>
              <li>
                <Link href="/jobs" onClick={onClose}>
                  <Briefcase className="w-4 h-4 inline" /> All Jobs
                </Link>
              </li>
              <li>
                <Link href="/categories" onClick={onClose}>
                  <LayoutGrid className="w-4 h-4 inline" /> Browse by Category
                </Link>
              </li>
              <li>
                <Link href="/locations/nairobi" onClick={onClose}>
                  <MapPin className="w-4 h-4 inline" /> Browse by Location
                </Link>
              </li>
              <li>
                <Link href="/government-jobs" onClick={onClose}>
                  <Landmark className="w-4 h-4 inline" /> Govt Jobs
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setOppOpen(!oppOpen)}
              className="w-full flex justify-between items-center"
            >
              <span>Opportunities</span>
              <ChevronDown className={`w-4 h-4 sub-toggle ${oppOpen ? 'open' : ''}`} />
            </button>
            <ul className={`mobile-sub ${oppOpen ? 'open' : ''}`}>
              <li>
                <Link href="/opportunities?type=SCHOLARSHIP" onClick={onClose}>
                  <GraduationCap className="w-4 h-4 inline" /> Scholarships
                </Link>
              </li>
              <li>
                <Link href="/jobs?type=INTERNSHIP" onClick={onClose}>
                  <Briefcase className="w-4 h-4 inline" /> Internships
                </Link>
              </li>
              <li>
                <Link href="/opportunities?type=FELLOWSHIP" onClick={onClose}>
                  <Users className="w-4 h-4 inline" /> Fellowships
                </Link>
              </li>
              <li>
                <Link href="/opportunities?type=VOLUNTEER" onClick={onClose}>
                  <HeartHandshake className="w-4 h-4 inline" /> Volunteering
                </Link>
              </li>
              <li style={{ marginTop: '0.3rem' }}>
                <Link href="/opportunities" onClick={onClose}>
                  <strong>All Opportunities &rarr;</strong>
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link href="/blog" onClick={onClose}>
              Resources
            </Link>
          </li>
          <li>
            <Link href="/cv-services" onClick={onClose}>
              CV Services
            </Link>
          </li>
          <li>
            <Link href="/faq" onClick={onClose}>
              FAQ
            </Link>
          </li>
        </ul>

        <div className="mobile-actions">
          {isLoggedIn ? (
            <>
              <Link href="/account" className="btn-outline" onClick={onClose}>
                <User className="w-4 h-4 inline" /> Dashboard
              </Link>
              <Link href="/account/cv-upload" className="btn-primary" onClick={onClose}>
                <UploadCloud className="w-4 h-4 inline" /> Upload CV
              </Link>
              <button
                type="button"
                className="btn-outline"
                onClick={() => { onClose(); signOut({ callbackUrl: '/' }); }}
                style={{ width: '100%' }}
              >
                <LogOut className="w-4 h-4 inline" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-outline" onClick={onClose}>
                Sign in
              </Link>
              <Link href="/register" className="btn-primary" onClick={onClose}>
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}