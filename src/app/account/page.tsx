'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMatches, useApplications, useSavedJobs } from '@/lib/use-dashboard-data';
import { ArrowRight, FileUp, User, Target, Send, Bookmark, Loader2 } from 'lucide-react';

export default function AccountOverviewPage() {
  const router = useRouter();
  const { matches, loading: matchesLoading } = useMatches();
  const { apps, loading: appsLoading } = useApplications();
  const { jobs: savedJobs, loading: savedLoading } = useSavedJobs();
  const [redirecting, setRedirecting] = useState(true);
  const [profileData, setProfileData] = useState<{
    firstName: string | null;
    lastName: string | null;
    onboardingStatus: string | null;
    profileCompletionScore: number | null;
  } | null>(null);

  // Fetch candidate profile to check onboarding status
  useEffect(() => {
    fetch('/api/candidates/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        const candidate = data.candidate || data;
        setProfileData({
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          onboardingStatus: candidate.onboardingStatus,
          profileCompletionScore: candidate.profile?.profileCompletionScore ?? 0,
        });

        // Redirect to onboarding if status is STARTED
        if (candidate.onboardingStatus === 'STARTED') {
          router.push('/account/onboarding');
          return;
        }
        setRedirecting(false);
      })
      .catch(() => {
        setRedirecting(false);
      });
  }, [router]);

  const loading = matchesLoading || appsLoading || savedLoading || redirecting;

  const displayName = profileData?.firstName
    ? `${profileData.firstName}${profileData.lastName ? ` ${profileData.lastName}` : ''}`
    : 'User';

  const completionScore = profileData?.profileCompletionScore ?? 0;
  const scoreDeg = (completionScore / 100) * 360;

  const topMatches = matches.filter(m => m.verdict !== 'NOT_RECOMMENDED').slice(0, 5);

  if (redirecting) {
    return (
      <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#0b7e4a' }} />
        <span style={{ color: '#6b6b6b' }}>Loading your dashboard...</span>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-header">
        <div className="dashboard-breadcrumb">
          <Link href="/">Home</Link>
          <span className="separator">/</span>
          <span>Dashboard</span>
        </div>
        <h1>Welcome back, {displayName}</h1>
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
          <div className="stat-number">{completionScore}%</div>
          <div className="stat-label">Profile complete</div>
        </div>
      </div>

      {/* Profile completion + Quick actions */}
      <div className="dashboard-completion-row">
        <div>
          <div className="score-ring" style={{ '--score-deg': `${scoreDeg}deg` } as React.CSSProperties}>
            <span className="score-ring-value">{completionScore}%</span>
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

      {/* Recent applications */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem', letterSpacing: '-0.01em' }}>Recent applications</h2>
      {apps.length === 0 ? (
        <div className="empty-state">
          <p>No applications yet. Browse jobs and start applying.</p>
          <Link href="/jobs" className="btn-outline" style={{ display: 'inline-flex', marginTop: '1rem' }}>
            <ArrowRight className="w-4 h-4" /> Browse Jobs
          </Link>
        </div>
      ) : (
        <div>
          {apps.slice(0, 5).map((app) => (
            <Link key={app.id} href={`/jobs/${app.jobSlug}`} className="match-card" style={{ display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{app.jobTitle}</p>
                  <p className="match-company">{app.company} &middot; {app.location}</p>
                </div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  background: app.status === 'APPLIED' ? '#dcfce7' : '#fef3c7',
                  color: app.status === 'APPLIED' ? '#166534' : '#92400e',
                }}>
                  {app.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}