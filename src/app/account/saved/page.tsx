'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSavedJobs } from '@/lib/use-dashboard-data';
import { ExternalLink, Trash2, MapPin, Briefcase } from 'lucide-react';

function formatSavedDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SavedJobsPage() {
  const { jobs, removeJob, loading } = useSavedJobs();
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  function handleRemove(jobId: string) {
    removeJob(jobId);
    setConfirmRemove(null);
  }

  if (loading) {
    return (
      <div className="dashboard-header">
        <div className="dashboard-breadcrumb">
          <Link href="/">Home</Link>
          <span className="separator">/</span>
          <Link href="/account">Dashboard</Link>
          <span className="separator">/</span>
          <span>Saved Jobs</span>
        </div>
        <h1>Saved jobs</h1>
        <p>Loading your saved jobs...</p>
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
          <span>Saved Jobs</span>
        </div>
        <h1>Saved jobs</h1>
        <p>Jobs you have bookmarked for later. {jobs.length} job{jobs.length !== 1 ? 's' : ''} saved.</p>
      </div>

      {jobs.length > 0 ? (
        jobs.map((job) => (
          <div key={job.jobId} className="saved-job-card">
            <div style={{ flex: 1, minWidth: 0 }}>
              <Link href={`/jobs/${job.jobSlug}`} className="match-title">
                {job.jobTitle}
              </Link>
              <p className="match-company">{job.company}</p>
              <div className="match-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin style={{ width: '0.8rem', height: '0.8rem' }} /> {job.location}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Briefcase style={{ width: '0.8rem', height: '0.8rem' }} /> {job.employmentType.replace('_', ' ')}
                </span>
                {job.salaryRange && <span>{job.salaryRange}</span>}
              </div>
              <p style={{ fontSize: '0.72rem', color: '#a0a0a0', marginTop: '0.3rem' }}>
                Saved {formatSavedDate(job.savedAt)}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
              <Link
                href={`/jobs/${job.jobSlug}`}
                className="btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}
              >
                <ExternalLink className="w-3 h-3" /> View
              </Link>
              {confirmRemove === job.jobId ? (
                <button
                  onClick={() => handleRemove(job.jobId)}
                  className="btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem', color: '#ef4444', borderColor: '#ef4444' }}
                >
                  Confirm
                </button>
              ) : (
                <button
                  onClick={() => setConfirmRemove(job.jobId)}
                  className="btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}
                  title="Remove from saved"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <p>You have not saved any jobs yet. Browse your matches and bookmark jobs you are interested in.</p>
          <Link href="/account/matches" className="btn-primary" style={{ display: 'inline-flex', marginTop: '1rem' }}>
            Browse matches
          </Link>
        </div>
      )}
    </>
  );
}