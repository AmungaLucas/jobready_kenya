'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useCandidateId, DEMO_MODE } from '@/lib/api-client';
import {
  Bell,
  BellOff,
  Plus,
  Trash2,
  Save,
  X,
  Search,
  MapPin,
  FolderOpen,
  Clock,
  Loader2,
} from 'lucide-react';

/* ──────────────────── Types ──────────────────── */

interface JobAlert {
  id: string;
  name: string;
  keywords: string | null;
  locationSlugs: string[] | null;
  categorySlug: string | null;
  frequency: 'INSTANT' | 'DAILY' | 'WEEKLY';
  isActive: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const FREQUENCY_LABELS: Record<string, string> = {
  INSTANT: 'Instant',
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
};

const POPULAR_CATEGORIES = [
  'information-technology',
  'finance-accounting',
  'engineering',
  'healthcare',
  'education',
  'marketing',
  'human-resources',
  'logistics',
  'government',
  'legal',
];

const CATEGORY_LABELS: Record<string, string> = {
  'information-technology': 'IT & Technology',
  'finance-accounting': 'Finance & Accounting',
  'engineering': 'Engineering',
  'healthcare': 'Healthcare',
  'education': 'Education',
  'marketing': 'Marketing & Advertising',
  'human-resources': 'Human Resources',
  'logistics': 'Logistics & Supply Chain',
  'government': 'Government & Public Admin',
  'legal': 'Legal',
};

const POPULAR_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu',
  'Machakos', 'Uasin Gishu', 'Kakamega', 'Kilifi', 'Kajiado',
];

/* ──────────────────── Component ──────────────────── */

export default function AlertsPage() {
  const candidateId = useCandidateId();
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formKeywords, setFormKeywords] = useState('');
  const [formLocations, setFormLocations] = useState<string[]>([]);
  const [formCategory, setFormCategory] = useState('');
  const [formFrequency, setFormFrequency] = useState<'INSTANT' | 'DAILY' | 'WEEKLY'>('DAILY');

  /* ── Fetch alerts ── */
  const loadAlerts = useCallback(async () => {
    if (!candidateId) return;
    try {
      const res = await fetch('/api/candidates/me/alerts', {
        headers: { 'x-candidate-id': candidateId },
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    if (DEMO_MODE) {
      setAlerts([]);
      setLoading(false);
      return;
    }
    loadAlerts();
  }, [candidateId, loadAlerts]);

  /* ── Toggle alert active ── */
  async function toggleAlert(id: string, currentActive: boolean) {
    if (!candidateId) return;
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !currentActive } : a)));
    try {
      await fetch(`/api/candidates/me/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-candidate-id': candidateId },
        body: JSON.stringify({ isActive: !currentActive }),
      });
    } catch {
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: currentActive } : a)));
    }
  }

  /* ── Delete alert ── */
  async function deleteAlert(id: string) {
    if (!candidateId) return;
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    try {
      await fetch(`/api/candidates/me/alerts/${id}`, {
        method: 'DELETE',
        headers: { 'x-candidate-id': candidateId },
      });
    } catch {
      loadAlerts();
    }
  }

  /* ── Create alert ── */
  async function handleCreate() {
    if (!candidateId || !formName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/candidates/me/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-candidate-id': candidateId },
        body: JSON.stringify({
          name: formName.trim(),
          keywords: formKeywords.trim() || null,
          locationSlugs: formLocations.length > 0 ? formLocations : null,
          categorySlug: formCategory || null,
          frequency: formFrequency,
        }),
      });
      if (res.ok) {
        const newAlert = await res.json();
        setAlerts((prev) => [newAlert, ...prev]);
        resetForm();
        setShowForm(false);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  /* ── Form helpers ── */
  function resetForm() {
    setFormName('');
    setFormKeywords('');
    setFormLocations([]);
    setFormCategory('');
    setFormFrequency('DAILY');
  }

  function toggleLocation(county: string) {
    setFormLocations((prev) =>
      prev.includes(county)
        ? prev.filter((c) => c !== county)
        : [...prev, county],
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
          <span>Job Alerts</span>
        </div>
        <h1>Job Alerts</h1>
        <p>
          Get notified when new jobs match your criteria. Create custom alerts based on
          keywords, locations, and categories.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#0b7e4a' }} />
        </div>
      ) : (
        <>
          {/* Empty state + create button */}
          {alerts.length === 0 && !showForm && (
            <div className="empty-state" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Bell style={{ width: 48, height: 48, color: '#d1d5db', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                No job alerts yet
              </h3>
              <p style={{ color: '#8a8a8a', maxWidth: 400, margin: '0 auto 1.5rem' }}>
                Create your first alert to receive notifications when jobs matching your
                preferences are posted. You can set multiple alerts with different criteria.
              </p>
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4" /> Create first alert
              </button>
            </div>
          )}

          {/* Alert list */}
          {alerts.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <p style={{ color: '#8a8a8a', fontSize: '0.85rem' }}>
                  {alerts.filter((a) => a.isActive).length} of {alerts.length} alerts active
                </p>
                <button className="btn-primary" onClick={() => setShowForm(true)} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                  <Plus className="w-3.5 h-3.5" /> New alert
                </button>
              </div>

              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="dashboard-card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    opacity: alert.isActive ? 1 : 0.55,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{alert.name}</h4>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          background: alert.isActive ? '#dcfce7' : '#f3f4f6',
                          color: alert.isActive ? '#166534' : '#6b7280',
                          fontWeight: 500,
                        }}
                      >
                        {alert.isActive ? 'Active' : 'Paused'}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          background: '#f0fdf4',
                          color: '#0b7e4a',
                          fontWeight: 500,
                        }}
                      >
                        {FREQUENCY_LABELS[alert.frequency] || alert.frequency}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                      {alert.keywords && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Search className="w-3 h-3" /> {alert.keywords}
                        </span>
                      )}
                      {alert.locationSlugs && Array.isArray(alert.locationSlugs) && alert.locationSlugs.length > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin className="w-3 h-3" /> {alert.locationSlugs.join(', ')}
                        </span>
                      )}
                      {alert.categorySlug && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <FolderOpen className="w-3 h-3" /> {CATEGORY_LABELS[alert.categorySlug] || alert.categorySlug}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '0.35rem' }}>
                      Created {new Date(alert.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {alert.lastTriggeredAt && (
                        <> &middot; Last triggered {new Date(alert.lastTriggeredAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</>
                      )}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button
                      onClick={() => toggleAlert(alert.id, alert.isActive)}
                      className="btn-outline"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                      title={alert.isActive ? 'Pause alert' : 'Resume alert'}
                    >
                      {alert.isActive ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="btn-outline"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem', color: '#dc2626', borderColor: '#fecaca' }}
                      title="Delete alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create / edit form */}
          {showForm && (
            <div
              className="dashboard-card"
              style={{
                padding: '1.5rem',
                marginTop: alerts.length > 0 ? '1.5rem' : '0',
                border: '2px solid #0b7e4a',
                borderRadius: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Create new alert</h3>
                <button
                  onClick={() => { resetForm(); setShowForm(false); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                >
                  <X className="w-5 h-5" style={{ color: '#6b7280' }} />
                </button>
              </div>

              {/* Alert name */}
              <div className="form-section">
                <div className="form-group">
                  <label>Alert name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder='e.g. "Nairobi Tech Jobs"'
                    maxLength={100}
                  />
                </div>
              </div>

              {/* Keywords */}
              <div className="form-section">
                <div className="form-group">
                  <label>
                    <Search className="w-3.5 h-3.5" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={formKeywords}
                    onChange={(e) => setFormKeywords(e.target.value)}
                    placeholder='e.g. software engineer, data analyst, accountant'
                  />
                  <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.25rem' }}>
                    Separate multiple keywords with commas. Jobs containing any of these words will trigger the alert.
                  </p>
                </div>
              </div>

              {/* Location filter */}
              <div className="form-section">
                <h3>
                  <MapPin className="w-3.5 h-3.5" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
                  Locations (optional)
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#8a8a8a', margin: '-0.5rem 0 0.75rem' }}>
                  Select counties to narrow down alerts. Leave empty for all locations.
                </p>
                <div className="location-chips">
                  {POPULAR_COUNTIES.map((county) => (
                    <button
                      key={county}
                      type="button"
                      className={`location-chip${formLocations.includes(county) ? ' active' : ''}`}
                      onClick={() => toggleLocation(county)}
                    >
                      {county}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category filter */}
              <div className="form-section">
                <div className="form-group">
                  <label>
                    <FolderOpen className="w-3.5 h-3.5" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
                    Job category (optional)
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value="">All categories</option>
                    {POPULAR_CATEGORIES.map((slug) => (
                      <option key={slug} value={slug}>
                        {CATEGORY_LABELS[slug] || slug}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Frequency */}
              <div className="form-section">
                <h3>
                  <Clock className="w-3.5 h-3.5" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
                  Notification frequency
                </h3>
                <div className="radio-group">
                  {(['INSTANT', 'DAILY', 'WEEKLY'] as const).map((freq) => (
                    <label key={freq} className="radio-option">
                      <input
                        type="radio"
                        name="frequency"
                        value={freq}
                        checked={formFrequency === freq}
                        onChange={() => setFormFrequency(freq)}
                      />
                      {freq === 'INSTANT'
                        ? 'Instant (as jobs are posted)'
                        : freq === 'DAILY'
                        ? 'Daily digest'
                        : 'Weekly digest'}
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleCreate}
                  disabled={saving || !formName.trim()}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Creating...' : 'Create alert'}
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => { resetForm(); setShowForm(false); }}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* How it works info box */}
          {alerts.length === 0 && !showForm && (
            <div
              className="dashboard-card"
              style={{ marginTop: '2rem', padding: '1.25rem', background: '#f8fafc' }}
            >
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>How job alerts work</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: '#6b7280' }}>
                <p>
                  <strong style={{ color: '#374151' }}>1. Create an alert</strong> — Set your preferred keywords, locations, and job categories.
                </p>
                <p>
                  <strong style={{ color: '#374151' }}>2. We scan for matches</strong> — New jobs posted on JobReady Kenya are checked against your alert criteria.
                </p>
                <p>
                  <strong style={{ color: '#374151' }}>3. Get notified</strong> — Receive a digest (daily or weekly) or instant notifications with matching jobs.
                </p>
                <p>
                  <strong style={{ color: '#374151' }}>4. Apply early</strong> — Be among the first to apply and increase your chances of landing the job.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}