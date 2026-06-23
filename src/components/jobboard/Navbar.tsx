'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import MobileDrawer from './MobileDrawer';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            <span className="logo-icon">JB</span>
            <span className="logo-badge">KE</span>
          </Link>

          <ul className="navbar-links">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li className="group relative">
              <button type="button" className="flex items-center gap-1">
                Jobs
                <i className="fas fa-chevron-down dropdown-arrow"></i>
              </button>
              <div className="dropdown-menu">
                <Link href="/jobs">
                  <i className="fas fa-briefcase"></i> All Jobs
                </Link>
                <Link href="/jobs?category=it">
                  <i className="fas fa-th-large"></i> Browse by Category
                </Link>
                <Link href="/jobs?location=nairobi">
                  <i className="fas fa-map-marker-alt"></i> Browse by Location
                </Link>
                <Link href="/jobs?type=government">
                  <i className="fas fa-landmark"></i> Govt Jobs
                </Link>
                <Link href="/jobs?type=county">
                  <i className="fas fa-city"></i> County Jobs
                </Link>
              </div>
            </li>
            <li className="group relative">
              <button type="button" className="flex items-center gap-1">
                Opportunities
                <i className="fas fa-chevron-down dropdown-arrow"></i>
              </button>
              <div className="dropdown-menu">
                <div className="dropdown-label">Explore</div>
                <Link href="#">
                  <i className="fas fa-graduation-cap"></i> Scholarships
                </Link>
                <Link href="#">
                  <i className="fas fa-briefcase"></i> Internships
                </Link>
                <Link href="#">
                  <i className="fas fa-users"></i> Fellowships
                </Link>
                <Link href="#">
                  <i className="fas fa-hand-holding-heart"></i> Volunteering
                </Link>
                <div className="dropdown-divider"></div>
                <Link href="#">
                  <i className="fas fa-th-large"></i> <strong>All Opportunities →</strong>
                </Link>
              </div>
            </li>
            <li>
              <Link href="#">Resources</Link>
            </li>
            <li>
              <Link href="#">Internships</Link>
            </li>
            <li>
              <Link href="#">Updates</Link>
            </li>
          </ul>

          <div className="navbar-actions">
            <Link href="#" className="btn-outline">
              <i className="fas fa-plus-circle"></i> <span>Post a Job</span>
            </Link>
            <Link href="#" className="btn-primary">
              <i className="fas fa-cloud-upload-alt"></i> <span>Upload CV</span>
            </Link>
            <button type="button" className="btn-icon avatar">JD</button>
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