'use client';

import { useState } from 'react';
import Link from 'next/link';
import { matchScores, getVerdictColor, getVerdictLabel, type Verdict, matchWeights } from '@/lib/demo-candidate';
import { ExternalLink, Bookmark, ChevronDown, ChevronUp } from 'lucide-react';

type FilterVerdict = 'ALL' | Verdict;
type SortBy = 'score' | 'date';

const filterOptions: { value: FilterVerdict; label: string; count: number }[] = [
  { value: 'ALL', label: 'All matches', count: 0 },
  { value: 'EXCELLENT', label: 'Excellent', count: 0 },
  { value: 'STRONG', label: 'Strong', count: 0 },
  { value: 'MODERATE', label: 'Moderate', count: 0 },
  { value: 'WEAK', label: 'Weak', count: 0 },
  { value: 'NOT_RECOMMENDED', label: 'Not recommended', count: 0 },
];

export default function MatchesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterVerdict>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('score');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Compute counts
  const counts = filterOptions.map((opt) => ({
    ...opt,
    count: opt.value === 'ALL'
      ? matchScores.length
      : matchScores.filter((m) => m.verdict === opt.value).length,
  }));

  // Filter and sort
  let filtered = activeFilter === 'ALL'
    ? [...matchScores]
    : matchScores.filter((m) => m.verdict === activeFilter);

  if (sortBy === 'score') {
    filtered.sort((a, b) => b.finalScore - a.finalScore);
  } else {
    filtered.sort((a, b) => new Date(b.computedAt).getTime() - new Date(a.computedAt).getTime());
  }

  return (
    <>
      <div className="dashboard-header">
        <div className="dashboard-breadcrumb">
          <Link href="/">Home</Link>
          <span className="separator">/</span>
          <Link href="/account">Dashboard</Link>
          <span className="separator">/</span>
          <span>My Matches</span>
        </div>
        <h1>My matches</h1>
        <p>Jobs ranked by how well they match your profile. Scores are calculated from category, skills, qualifications, and experience.</p>
      </div>

      {/* Filter tabs */}
      <div className="dashboard-filter-tabs">
        {counts.map((opt) => (
          <button
            key={opt.value}
            className={`dashboard-filter-tab ${activeFilter === opt.value ? 'active' : ''}`}
            onClick={() => setActiveFilter(opt.value)}
          >
            {opt.label} ({opt.count})
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="dashboard-sort">
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
          <option value="score">Match score</option>
          <option value="date">Date computed</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#8a8a8a' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Match list */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No matches found for this filter.</p>
        </div>
      ) : (
        filtered.map((match) => {
          const barClass = match.verdict === 'EXCELLENT' || match.verdict === 'STRONG' ? 'excellent'
            : match.verdict === 'MODERATE' ? 'moderate' : 'weak';
          const isExpanded = expandedId === match.jobId;

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
                    <span>&middot;</span>
                    <span>{match.matchedQualificationCount}/{match.totalRequiredQualifications} qualifications</span>
                  </div>
                  <div className="match-score-row">
                    <span className={`match-score-number ${barClass}`}>{match.finalScore}%</span>
                    <div className="score-bar">
                      <div className={`score-bar-fill ${barClass}`} style={{ width: `${match.finalScore}%` }} />
                    </div>
                    <span className={`match-verdict ${barClass}`}>{getVerdictLabel(match.verdict)}</span>
                  </div>
                  <p className="match-explanation">{match.explanation}</p>
                  <div className="match-actions">
                    <Link href={`/jobs/${match.jobSlug}`} className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>
                      <ExternalLink className="w-3 h-3" /> View job
                    </Link>
                    <button className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>
                      <Bookmark className="w-3 h-3" /> {match.isSaved ? 'Saved' : 'Save'}
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : match.jobId)}
                      className="btn-outline"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {isExpanded ? 'Hide' : 'Score breakdown'}
                    </button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="score-breakdown">
                  <div className="score-breakdown-row">
                    <span className="label">Category match (weight {matchWeights.category}%)</span>
                    <span className="value">{match.categoryScore}%</span>
                  </div>
                  <div className="score-breakdown-row">
                    <span className="label">Subcategory match (weight {matchWeights.subcategory}%)</span>
                    <span className="value">{match.subcategoryScore}%</span>
                  </div>
                  <div className="score-breakdown-row">
                    <span className="label">Skills match (weight {matchWeights.skills}%)</span>
                    <span className="value">{match.skillsScore}%</span>
                  </div>
                  <div className="score-breakdown-row">
                    <span className="label">Qualifications match (weight {matchWeights.qualifications}%)</span>
                    <span className="value">{match.qualificationsScore}%</span>
                  </div>
                  <div className="score-breakdown-row">
                    <span className="label">Experience match (weight {matchWeights.experience}%)</span>
                    <span className="value">{match.experienceScore}%</span>
                  </div>
                  <div className="score-breakdown-row">
                    <span className="label">Industry familiarity (weight {matchWeights.industry}%)</span>
                    <span className="value">{match.industryScore}%</span>
                  </div>
                  <div className="score-breakdown-row" style={{ borderTop: '1px solid #f0eeeb', marginTop: '0.35rem', paddingTop: '0.35rem' }}>
                    <span className="label" style={{ fontWeight: 600, color: '#3d3d3d' }}>Final weighted score</span>
                    <span className="value" style={{ color: '#0b7e4a', fontWeight: 700 }}>{match.finalScore}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </>
  );
}