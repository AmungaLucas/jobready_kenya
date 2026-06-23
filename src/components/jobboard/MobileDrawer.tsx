'use client';

import Link from 'next/link';
import { useState } from 'react';

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
            <i className="fas fa-times"></i>
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
              <i className={`fas fa-chevron-down sub-toggle ${jobsOpen ? 'open' : ''}`}></i>
            </button>
            <ul className={`mobile-sub ${jobsOpen ? 'open' : ''}`}>
              <li>
                <Link href="/jobs" onClick={onClose}>
                  <i className="fas fa-briefcase"></i> All Jobs
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=it" onClick={onClose}>
                  <i className="fas fa-th-large"></i> Browse by Category
                </Link>
              </li>
              <li>
                <Link href="/jobs?location=nairobi" onClick={onClose}>
                  <i className="fas fa-map-marker-alt"></i> Browse by Location
                </Link>
              </li>
              <li>
                <Link href="/government-jobs" onClick={onClose}>
                  <i className="fas fa-landmark"></i> Govt Jobs
                </Link>
              </li>
              <li>
                <Link href="/government-jobs?type=COUNTY_GOVERNMENT" onClick={onClose}>
                  <i className="fas fa-city"></i> County Jobs
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
              <i className={`fas fa-chevron-down sub-toggle ${oppOpen ? 'open' : ''}`}></i>
            </button>
            <ul className={`mobile-sub ${oppOpen ? 'open' : ''}`}>
              <li>
                <Link href="#" onClick={onClose}>
                  <i className="fas fa-graduation-cap"></i> Scholarships
                </Link>
              </li>
              <li>
                <Link href="#" onClick={onClose}>
                  <i className="fas fa-briefcase"></i> Internships
                </Link>
              </li>
              <li>
                <Link href="#" onClick={onClose}>
                  <i className="fas fa-users"></i> Fellowships
                </Link>
              </li>
              <li>
                <Link href="#" onClick={onClose}>
                  <i className="fas fa-hand-holding-heart"></i> Volunteering
                </Link>
              </li>
              <li style={{ marginTop: '0.3rem' }}>
                <Link href="#" onClick={onClose}>
                  <strong>All Opportunities →</strong>
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link href="#" onClick={onClose}>
              Resources
            </Link>
          </li>
          <li>
            <Link href="#" onClick={onClose}>
              Internships
            </Link>
          </li>
          <li>
            <Link href="#" onClick={onClose}>
              Updates
            </Link>
          </li>
        </ul>

        <div className="mobile-actions">
          <Link href="#" className="btn-outline" onClick={onClose}>
            <i className="fas fa-plus-circle"></i> Post a Job
          </Link>
          <Link href="#" className="btn-primary" onClick={onClose}>
            <i className="fas fa-cloud-upload-alt"></i> Upload CV
          </Link>
          <Link href="#" className="btn-outline" style={{ borderColor: 'transparent', background: 'rgba(0,0,0,0.03)' }}>
            <i className="fas fa-user-circle"></i> Sign In
          </Link>
        </div>
      </div>
    </>
  );
}