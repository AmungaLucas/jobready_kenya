'use client';

import Link from 'next/link';
import { useState } from 'react';
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
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const [jobsOpen, setJobsOpen] = useState(false);
  const [oppOpen, setOppOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-overlay open" onClick={onClose}></div>
      <div className="mobile-drawer open">
        <div className="mobile-drawer-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span className="logo-icon">JB</span>
            <span className="logo-badge">KE</span>
          </span>
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
          <Link href="/contact" className="btn-outline" onClick={onClose}>
            <PlusCircle className="w-4 h-4 inline" /> Post a Job
          </Link>
          <Link href="/cv-services" className="btn-primary" onClick={onClose}>
            <UploadCloud className="w-4 h-4 inline" /> Upload CV
          </Link>
        </div>
      </div>
    </>
  );
}