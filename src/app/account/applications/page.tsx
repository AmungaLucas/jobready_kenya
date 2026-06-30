'use client';

import Link from 'next/link';
import { MapPin, Briefcase } from 'lucide-react';
import { useApplications } from '@/lib/use-dashboard-data';
import { getStatusLabel } from '@/lib/demo-candidate';

function getStatusClass(status: string) {
  return status.toLowerCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ApplicationsPage() {
  const { apps, loading } = useApplications();

  if (loading) {
    return (
      <div className="dashboard-header">
        <div className="dashboard-breadcrumb">
          <Link href="/">Home</Link>
          <span className="separator">/</span>
          <Link href="/account">Dashboard</Link>
          <span className="separator">/</span>
          <span>Applications</span>
        </div>
        <h1>Applications</h1>
        <p>Loading your applications...</p>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-header">
        <div className="dashboard-breadcrumb">
          <Link href="/">Home</Link>
          <span className="separator">/</span>
          <Link href="/account">Dashboard</Link>
          <span className="separator">/</span>
          <span>Applications</span>
        </div>
        <h1>Applications</h1>
        <p>Track your job applications and their status</p>
      </div>

      {apps.length > 0 ? (
        apps.map((app) => (
          <div key={app.id} className="match-card">
            <Link href={`/jobs/${app.jobSlug}`} className="match-title">
              {app.jobTitle}
            </Link>
            <div className="match-company">{app.company}</div>
            <div className="match-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin style={{ width: '0.8rem', height: '0.8rem' }} /> {app.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Briefcase style={{ width: '0.8rem', height: '0.8rem' }} /> {app.employmentType || 'Full-time'}
              </span>
              <span>Applied {formatDate(app.appliedAt)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              {app.matchScoreAtApplication !== null && (
                <span className="match-score-number excellent" style={{ fontSize: '0.82rem' }}>
                  {app.matchScoreAtApplication}% match
                </span>
              )}
              <span className={`status-text ${getStatusClass(app.status)}`}>
                {getStatusLabel(app.status)}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <p>You haven&apos;t applied to any jobs yet.</p>
        </div>
      )}
    </>
  );
}