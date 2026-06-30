'use client';

import Link from 'next/link';
import { candidate, getVerdictBarColor, profileCompletionChecklist } from '@/lib/demo-candidate';
import { useMatches, useApplications, useSavedJobs } from '@/lib/use-dashboard-data';
import { ArrowRight, FileUp, User, Target, Send, Bookmark } from 'lucide-react';

export default function AccountOverviewPage() {
  const { matches } = useMatches();
  const { apps } = useApplications();
  const { jobs: savedJobs } = useSavedJobs();

  const topMatches = matches.filter(m => m.verdict !== 'NOT_RECOMMENDED').slice(0, 5);
  const scoreDeg = (candidate.profileCompletionScore / 100) * 360;

  return (
    <>
      <div className="dashboard-header">
        <div className="dashboard-breadcrumb">
          <Link href="/">Home</Link>
          <span className="separator">/</span>
          <span>Dashboard</span>
        </div>
        <h1>Welcome back, {candidate.firstName}</h1>
        <p>Here is your job matching summary and recent activity.</p>
      </div>

      {/* Stats row */}
      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <div className="stat-number">{matches.filter(m => m.verdict !== 'NOT_RECOMMENDED').length}</div>
          <div className="stat-label">Jobs matched</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{apps.length}</div>
          <div className="stat-label">Applications sent</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{savedJobs.length}</div>
          <div className="stat-label">Saved jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">24</div>
          <div className="stat-label">Profile views</div>
        </div>
      </div>

      {/* Profile completion + Quick actions */}
      <div className="dashboard-completion-row">
        <div>
          <div className="score-ring" style={{ '--score-deg': `${scoreDeg}deg` } as React.CSSProperties}>
            <span className="score-ring-value">{candidate.profileCompletionScore}%</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#8a8a8a', textAlign: 'center', marginTop: '0.5rem' }}>Profile completion</p>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>Quick actions</h2>
          <div className="quick-actions">
            <Link href="/account/cv-upload" className="btn-primary"><FileUp className="w-4 h-4" /> Upload CV</Link>
            <Link href="/account/profile" className="btn-outline"><User className="w-4 h-4" /> Update profile</Link>
            <Link href="/account/matches" className="btn-outline"><Target className="w-4 h-4" /> Browse matches</Link>
          </div>
        </div>
      </div>

      <div className="dashboard-divider" />

      {/* Top matches */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>Top matches for you</h2>
      <p style={{ fontSize: '0.82rem', color: '#8a8a8a', marginBottom: '1rem' }}>Based on your skills, qualifications, and experience profile.</p>

      {topMatches.length === 0 ? (
        <div className="empty-state">
          <p>No matches yet. Upload your CV to get started.</p>
          <Link href="/account/cv-upload" className="btn-primary" style={{ display: 'inline-flex', marginTop: '1rem' }}>
            Upload CV
          </Link>
        </div>
      ) : (
        topMatches.map((match) => {
          const barClass = match.verdict === 'EXCELLENT' || match.verdict === 'STRONG' ? 'excellent'
            : match.verdict === 'MODERATE' ? 'moderate' : 'weak';
          return (
            <div key={match.jobId} className="match-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/jobs/${match.jobSlug}`} className="match-title">{match.jobTitle}</Link>
                  <p className="match-company">{match.company} &middot; {match.location}</p>
                  <div className="match-meta">
                    <span>{match.employmentType.replace('_', ' ')}</span>
                    <span>&middot;</span>
                    <span>{match.matchedSkillCount}/{match.totalRequiredSkills} skills matched</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className={`match-score-number ${barClass}`}>{match.finalScore}%</div>
                  <div className="score-bar" style={{ marginLeft: 'auto', width: '100px' }}>
                    <div className={`score-bar-fill ${barClass}`} style={{ width: `${match.finalScore}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      <div className="dashboard-divider" />

      {/* Recent activity */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem', letterSpacing: '-0.01em' }}>Recent activity</h2>
      <div>
        <div className="activity-item">
          <div className="activity-dot" style={{ background: '#0b7e4a' }} />
          <div>
            <p className="activity-text">You were <strong>shortlisted</strong> for Accounts Payable Officer at Safaricom PLC</p>
            <p className="activity-time">2 days ago</p>
          </div>
        </div>
        <div className="activity-item">
          <div className="activity-dot" style={{ background: '#d97706' }} />
          <div>
            <p className="activity-text"><strong>Interview scheduled</strong> for Junior Accountant at Equity Bank — June 30, 2026</p>
            <p className="activity-time">1 day ago</p>
          </div>
        </div>
        <div className="activity-item">
          <div className="activity-dot" />
          <div>
            <p className="activity-text">New matches found: 3 strong matches in Finance &amp; Accounting</p>
            <p className="activity-time">3 days ago</p>
          </div>
        </div>
        <div className="activity-item">
          <div className="activity-dot" />
          <div>
            <p className="activity-text">You applied to Finance Assistant at UNDP Kenya</p>
            <p className="activity-time">4 days ago</p>
          </div>
        </div>
        <div className="activity-item">
          <div className="activity-dot" />
          <div>
            <p className="activity-text">Profile updated: CPA Section 2 certification added</p>
            <p className="activity-time">1 week ago</p>
          </div>
        </div>
      </div>
    </>
  );
}