'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
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
} from 'lucide-react';

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
            <Image src="/logo.svg" alt="JobBoard Kenya" width={120} height={92} priority style={{ height: 'auto', maxWidth: '130px', width: 'auto' }} />
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
                  <Briefcase className="w-4 h-4 inline" /> All Jobs
                </Link>
                <Link href="/categories">
                  <LayoutGrid className="w-4 h-4 inline" /> Browse by Category
                </Link>
                <Link href="/locations/nairobi">
                  <MapPin className="w-4 h-4 inline" /> Browse by Location
                </Link>
                <Link href="/government-jobs">
                  <Landmark className="w-4 h-4 inline" /> Govt Jobs
                </Link>
                <Link href="/government-jobs?type=COUNTY_GOVERNMENT">
                  <Building2 className="w-4 h-4 inline" /> County Jobs
                </Link>
              </div>
            </li>
            <li className="group relative">
              <button type="button" className="flex items-center gap-1">
                Opportunities
                <ChevronDown className="w-4 h-4 dropdown-arrow" />
              </button>
              <div className="dropdown-menu">
                <div className="dropdown-label">Explore</div>
                <Link href="/opportunities?type=SCHOLARSHIP">
                  <GraduationCap className="w-4 h-4 inline" /> Scholarships
                </Link>
                <Link href="/jobs?type=INTERNSHIP">
                  <Briefcase className="w-4 h-4 inline" /> Internships
                </Link>
                <Link href="/opportunities?type=FELLOWSHIP">
                  <Users className="w-4 h-4 inline" /> Fellowships
                </Link>
                <Link href="/opportunities?type=VOLUNTEER">
                  <HeartHandshake className="w-4 h-4 inline" /> Volunteering
                </Link>
                <div className="dropdown-divider"></div>
                <Link href="/opportunities">
                  <LayoutGrid className="w-4 h-4 inline" /> <strong>All Opportunities &rarr;</strong>
                </Link>
              </div>
            </li>
            <li>
              <Link href="/blog">Resources</Link>
            </li>
            <li>
              <Link href="/cv-services">CV Services</Link>
            </li>
            <li>
              <Link href="/faq">FAQ</Link>
            </li>
          </ul>

          <div className="navbar-actions">
            <Link href="/contact" className="btn-outline">
              <PlusCircle className="w-4 h-4 inline" /> <span>Post a Job</span>
            </Link>
            <Link href="/cv-services" className="btn-primary">
              <UploadCloud className="w-4 h-4 inline" /> <span>Upload CV</span>
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