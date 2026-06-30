'use client';

import { useState } from 'react';
import Link from 'next/link';
import { candidate, type CandidatePreferences } from '@/lib/demo-candidate';
import { DEMO_MODE, useCandidateId, updatePreferences, type ApiPreferences } from '@/lib/api-client';
import { Save, RotateCcw, Check } from 'lucide-react';

const KENYAN_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Uasin Gishu', 'Kiambu',
  'Machakos', 'Kakamega', 'Meru', 'Embu', 'Nyeri', 'Kirinyaga',
  'Nyandarua', 'Laikipia', 'Murang\'a', 'Kilifi', 'Kwale', 'Taita Taveta',
  'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Samburu',
  'Baringo', 'Elgeyo Marakwet', 'West Pokot', 'Trans Nzoia', 'Bungoma',
  'Busia', 'Siaya', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira',
  'Narok', 'Kajiado', 'Tana River', 'Lamu', 'Turkana', 'Vihiga',
  'Kitui', 'Makueni', 'Tharaka Nithi', 'Nyamira', 'Bomet', 'Kericho',
];

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY', 'GRADUATE_TRAINEE'];

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  TEMPORARY: 'Temporary',
  GRADUATE_TRAINEE: 'Graduate trainee',
};

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<CandidatePreferences>({ ...candidate.preferences });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const candidateId = useCandidateId();

  async function handleSave() {
    setSaving(true);
    try {
      if (!DEMO_MODE) {
        const apiPrefs: Partial<ApiPreferences> = {
          preferredLocations: prefs.preferredLocations,
          remotePreference: prefs.remotePreference,
          expectedSalaryMin: prefs.expectedSalaryMin,
          expectedSalaryMax: prefs.expectedSalaryMax,
          salaryCurrency: prefs.salaryCurrency,
          availabilityStatus: prefs.availabilityStatus,
          noticePeriodDays: prefs.noticePeriodDays,
          willingToRelocate: prefs.willingToRelocate,
          preferredJobTypes: prefs.preferredJobTypes,
        };
        const result = await updatePreferences(candidateId, apiPrefs);
        if (result) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      } else {
        // Demo mode — optimistic save
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // Silently fail in demo mode
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setPrefs({ ...candidate.preferences });
    setSaved(false);
  }

  function toggleLocation(county: string) {
    setPrefs((prev) => {
      const locs = prev.preferredLocations.includes(county)
        ? prev.preferredLocations.filter((l) => l !== county)
        : [...prev.preferredLocations, county];
      return { ...prev, preferredLocations: locs };
    });
    setSaved(false);
  }

  function toggleJobType(type: string) {
    setPrefs((prev) => {
      const types = prev.preferredJobTypes.includes(type)
        ? prev.preferredJobTypes.filter((t) => t !== type)
        : [...prev.preferredJobTypes, type];
      return { ...prev, preferredJobTypes: types };
    });
    setSaved(false);
  }

  return (
    <>
      <div className="dashboard-header">
        <div className="dashboard-breadcrumb">
          <Link href="/">Home</Link>
          <span className="separator">/</span>
          <Link href="/account">Dashboard</Link>
          <span className="separator">/</span>
          <span>Preferences</span>
        </div>
        <h1>Job preferences</h1>
        <p>Set your preferred work conditions to improve match relevance.</p>
      </div>

      <div className="preferences-form">
        {/* Locations */}
        <div className="form-section">
          <h3>Preferred locations</h3>
          <p style={{ fontSize: '0.82rem', color: '#8a8a8a', margin: '-0.5rem 0 1rem' }}>
            Select the counties where you would like to work. Your matches will prioritize jobs in these locations.
          </p>
          <div className="location-chips">
            {KENYAN_COUNTIES.map((county) => (
              <button
                key={county}
                type="button"
                className={`location-chip${prefs.preferredLocations.includes(county) ? ' active' : ''}`}
                onClick={() => toggleLocation(county)}
              >
                {county}
              </button>
            ))}
          </div>
        </div>

        {/* Work mode */}
        <div className="form-section">
          <h3>Work arrangement</h3>
          <div className="radio-group">
            {(['ONSITE', 'HYBRID', 'REMOTE', 'ANY'] as const).map((mode) => (
              <label key={mode} className="radio-option">
                <input
                  type="radio"
                  name="remotePreference"
                  value={mode}
                  checked={prefs.remotePreference === mode}
                  onChange={() => { setPrefs((p) => ({ ...p, remotePreference: mode })); setSaved(false); }}
                />
                {mode === 'ONSITE' ? 'On-site' : mode === 'HYBRID' ? 'Hybrid' : mode === 'REMOTE' ? 'Remote' : 'Any'}
              </label>
            ))}
          </div>
        </div>

        {/* Job types */}
        <div className="form-section">
          <h3>Job types</h3>
          <p style={{ fontSize: '0.82rem', color: '#8a8a8a', margin: '-0.5rem 0 1rem' }}>
            Select all employment types you are open to.
          </p>
          <div className="location-chips">
            {JOB_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`location-chip${prefs.preferredJobTypes.includes(type) ? ' active' : ''}`}
                onClick={() => toggleJobType(type)}
              >
                {JOB_TYPE_LABELS[type] || type}
              </button>
            ))}
          </div>
        </div>

        {/* Salary expectations */}
        <div className="form-section">
          <h3>Salary expectations</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Minimum salary (KES)</label>
              <input
                type="number"
                value={prefs.expectedSalaryMin || ''}
                onChange={(e) => { setPrefs((p) => ({ ...p, expectedSalaryMin: Number(e.target.value) })); setSaved(false); }}
                placeholder="e.g. 40000"
              />
            </div>
            <div className="form-group">
              <label>Maximum salary (KES)</label>
              <input
                type="number"
                value={prefs.expectedSalaryMax || ''}
                onChange={(e) => { setPrefs((p) => ({ ...p, expectedSalaryMax: Number(e.target.value) })); setSaved(false); }}
                placeholder="e.g. 80000"
              />
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="form-section">
          <h3>Availability</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Availability status</label>
              <select
                value={prefs.availabilityStatus}
                onChange={(e) => { setPrefs((p) => ({ ...p, availabilityStatus: e.target.value as CandidatePreferences['availabilityStatus'] })); setSaved(false); }}
              >
                <option value="IMMEDIATE">Available immediately</option>
                <option value="NOTICE_PERIOD">Serving notice period</option>
                <option value="UNAVAILABLE">Not currently available</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notice period (days)</label>
              <input
                type="number"
                value={prefs.noticePeriodDays || ''}
                onChange={(e) => { setPrefs((p) => ({ ...p, noticePeriodDays: Number(e.target.value) })); setSaved(false); }}
                placeholder="e.g. 30"
                min={0}
              />
            </div>
          </div>
          <div className="toggle-wrapper" style={{ marginTop: '0.5rem' }}>
            <label>
              <input
                type="checkbox"
                checked={prefs.willingToRelocate}
                onChange={(e) => { setPrefs((p) => ({ ...p, willingToRelocate: e.target.checked })); setSaved(false); }}
                style={{ accentColor: '#0b7e4a', width: '15px', height: '15px', marginRight: '0.3rem' }}
              />
              Willing to relocate for the right opportunity
            </label>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save preferences'}
          </button>
          <button type="button" className="btn-outline" onClick={handleReset} disabled={saving}>
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>
    </>
  );
}