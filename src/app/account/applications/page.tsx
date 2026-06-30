import Link from 'next/link';
import { MapPin, Briefcase } from 'lucide-react';
import { applications as demoApplications } from '@/lib/demo-candidate';

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

      {demoApplications.length > 0 ? (
        demoApplications.map((app) => (
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
                <Briefcase style={{ width: '0.8rem', height: '0.8rem' }} /> {app.employmentType}
              </span>
              <span>Applied {formatDate(app.appliedAt)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <span className={`match-score-number excellent`} style={{ fontSize: '0.82rem' }}>
                {app.matchScore}% match
              </span>
              <span className={`status-text ${getStatusClass(app.status)}`}>
                {app.status}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <p>You haven't applied to any jobs yet.</p>
        </div>
      )}
    </>
  );
}