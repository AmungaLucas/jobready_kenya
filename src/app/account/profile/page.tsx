'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Pencil, Check, MapPin, Building2, GraduationCap, Briefcase, Award, Wrench, Heart, Loader2, X, Plus, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

/* ──────────────────── Types ──────────────────── */

interface ApiSkill {
  id: string;
  skillId: string;
  rawText: string | null;
  proficiency: string | null;
  yearsExperience: number | null;
  skill: { id: string; label: string; value: string } | null;
}

interface ApiEducation {
  id: string;
  institution: string | null;
  fieldOfStudy: string | null;
  level: string | null;
  status: string;
  startYear: number | null;
  endYear: number | null;
}

interface ApiWorkExperience {
  id: string;
  employerName: string | null;
  roleTitle: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  normalizedRole: { label: string } | null;
  organizationIndustry: { label: string } | null;
}

interface ApiCertification {
  id: string;
  certification: { label: string } | null;
  issuingBody: string | null;
  status: string;
  yearAwarded: number | null;
}

interface ApiInterest {
  id: string;
  category: { label: string } | null;
  interestRank: number | null;
}

interface ApiTool {
  id: string;
  tool: { label: string } | null;
}

interface CandidateProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  locationCounty: string | null;
  country: string;
  onboardingStatus: string;
  profile: {
    id: string;
    primaryCategoryId: string | null;
    primaryCategory: { label: string; value: string } | null;
    primarySubcategoryId: string | null;
    primarySubcategory: { label: string; value: string } | null;
    totalExperienceYears: number;
    seniorityLevel: string | null;
    profileCompletionScore: number;
  } | null;
  preferences: Record<string, unknown> | null;
  skills: ApiSkill[];
  educations: ApiEducation[];
  workExperiences: ApiWorkExperience[];
  certifications: ApiCertification[];
  interests: ApiInterest[];
  tools: ApiTool[];
}

/* ──────────────────── Edit form types ──────────────────── */

interface EditFormData {
  firstName: string;
  lastName: string;
  phone: string;
  locationCounty: string;
  primaryCategoryId: string;
  seniorityLevel: string;
  totalExperienceYears: string;
  workExperiences: ApiWorkExperience[];
  educations: ApiEducation[];
  skills: ApiSkill[];
  deleteSkillIds: string[];
}

const PROFICIENCY_OPTIONS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
const SENIORITY_OPTIONS = ['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'EXECUTIVE'];
const EDUCATION_LEVEL_OPTIONS = ['CERTIFICATE', 'DIPLOMA', 'BACHELOR', 'MASTER', 'PHD', 'OTHER'];

const profileCompletionChecklist = [
  { label: 'Personal information', complete: true },
  { label: 'CV uploaded and processed', complete: true },
  { label: 'Work experience', complete: true },
  { label: 'Education history', complete: true },
  { label: 'Skills and tools', complete: true },
  { label: 'Certifications', complete: true },
  { label: 'Career domain confirmed', complete: true },
  { label: 'Interest categories selected', complete: true },
  { label: 'Job preferences set', complete: true },
  { label: 'Profile photo', complete: false },
  { label: 'Professional summary', complete: false },
  { label: 'References added', complete: false },
];

/* ──────────────────── Component ──────────────────── */

export default function ProfilePage() {
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<EditFormData | null>(null);

  /* ── Fetch candidate on mount ── */
  const fetchCandidate = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/candidates/me');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setCandidate(data.candidate);
    } catch {
      toast.error('Failed to load your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidate();
  }, [fetchCandidate]);

  /* ── Enter edit mode ── */
  const startEditing = () => {
    if (!candidate) return;
    setFormData({
      firstName: candidate.firstName || '',
      lastName: candidate.lastName || '',
      phone: candidate.phone || '',
      locationCounty: candidate.locationCounty || '',
      primaryCategoryId: candidate.profile?.primaryCategoryId || '',
      seniorityLevel: candidate.profile?.seniorityLevel || '',
      totalExperienceYears: String(candidate.profile?.totalExperienceYears || ''),
      workExperiences: [...candidate.workExperiences],
      educations: [...candidate.educations],
      skills: [...candidate.skills],
      deleteSkillIds: [],
    });
    setEditing(true);
  };

  /* ── Cancel editing ── */
  const cancelEditing = () => {
    setEditing(false);
    setFormData(null);
  };

  /* ── Save profile ── */
  const handleSave = async () => {
    if (!formData) return;
    try {
      setSaving(true);

      const payload: Record<string, unknown> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        locationCounty: formData.locationCounty,
      };

      // Profile fields
      if (formData.primaryCategoryId) payload.primaryCategoryId = formData.primaryCategoryId;
      if (formData.seniorityLevel) payload.seniorityLevel = formData.seniorityLevel;
      if (formData.totalExperienceYears) payload.totalExperienceYears = parseFloat(formData.totalExperienceYears);

      // Work experiences
      payload.workExperiences = formData.workExperiences.map((we) => ({
        id: we.id,
        employerName: we.employerName,
        roleTitle: we.roleTitle,
        startDate: we.startDate,
        endDate: we.isCurrent ? null : we.endDate,
        isCurrent: we.isCurrent,
        description: we.description,
      }));

      // Educations
      payload.educations = formData.educations.map((edu) => ({
        id: edu.id,
        institution: edu.institution,
        fieldOfStudy: edu.fieldOfStudy,
        level: edu.level,
        status: edu.status,
        startYear: edu.startYear,
        endYear: edu.endYear,
      }));

      // Skills
      payload.skills = formData.skills.map((sk) => ({
        id: sk.id,
        name: sk.skill?.label || sk.rawText || '',
        proficiency: sk.proficiency,
        yearsExperience: sk.yearsExperience,
      }));
      payload.deleteSkillIds = formData.deleteSkillIds;

      const res = await fetch('/api/candidates/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Save failed' }));
        throw new Error(err.error || 'Save failed');
      }

      toast.success('Profile updated successfully!');
      setEditing(false);
      setFormData(null);
      await fetchCandidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  /* ── Helpers for nested lists ── */

  const addWorkExperience = () => {
    if (!formData) return;
    const newWe: ApiWorkExperience = {
      id: '',
      employerName: '',
      roleTitle: '',
      startDate: null,
      endDate: null,
      isCurrent: false,
      description: '',
      normalizedRole: null,
      organizationIndustry: null,
    };
    setFormData({ ...formData, workExperiences: [newWe, ...formData.workExperiences] });
  };

  const updateWorkExperience = (index: number, field: string, value: unknown) => {
    if (!formData) return;
    const updated = [...formData.workExperiences];
    (updated[index] as Record<string, unknown>)[field] = value;
    setFormData({ ...formData, workExperiences: updated });
  };

  const removeWorkExperience = (index: number) => {
    if (!formData) return;
    const updated = formData.workExperiences.filter((_, i) => i !== index);
    setFormData({ ...formData, workExperiences: updated });
  };

  const addEducation = () => {
    if (!formData) return;
    const newEdu: ApiEducation = {
      id: '',
      institution: '',
      fieldOfStudy: '',
      level: 'BACHELOR',
      status: 'COMPLETED',
      startYear: null,
      endYear: null,
    };
    setFormData({ ...formData, educations: [newEdu, ...formData.educations] });
  };

  const updateEducation = (index: number, field: string, value: unknown) => {
    if (!formData) return;
    const updated = [...formData.educations];
    (updated[index] as Record<string, unknown>)[field] = value;
    setFormData({ ...formData, educations: updated });
  };

  const removeEducation = (index: number) => {
    if (!formData) return;
    const updated = formData.educations.filter((_, i) => i !== index);
    setFormData({ ...formData, educations: updated });
  };

  const addSkill = () => {
    if (!formData) return;
    const newSk: ApiSkill = {
      id: '',
      skillId: '',
      rawText: '',
      proficiency: 'INTERMEDIATE',
      yearsExperience: null,
      skill: null,
    };
    setFormData({ ...formData, skills: [...formData.skills, newSk] });
  };

  const updateSkill = (index: number, field: string, value: unknown) => {
    if (!formData) return;
    const updated = [...formData.skills];
    if (field === 'name') {
      (updated[index] as Record<string, unknown>)['rawText'] = value;
    } else {
      (updated[index] as Record<string, unknown>)[field] = value;
    }
    setFormData({ ...formData, skills: updated });
  };

  const removeSkill = (index: number) => {
    if (!formData) return;
    const sk = formData.skills[index];
    const newDeleteIds = sk.id ? [...formData.deleteSkillIds, sk.id] : formData.deleteSkillIds;
    const updated = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: updated, deleteSkillIds: newDeleteIds });
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <>
        <div className="dashboard-header">
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-7 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="profile-section">
            <Skeleton className="h-5 w-36 mb-4" />
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-4 w-full mb-3" />
            ))}
          </div>
        ))}
      </>
    );
  }

  if (!candidate) {
    return (
      <div className="dashboard-header">
        <h1>Your profile</h1>
        <p className="text-gray-500 mt-2">Unable to load profile data.</p>
      </div>
    );
  }

  const isNewItem = (id: string) => !id || id === '';

  /* ── Edit Mode ── */
  if (editing && formData) {
    return (
      <>
        <div className="dashboard-header">
          <div className="dashboard-breadcrumb">
            <Link href="/">Home</Link>
            <span className="separator">/</span>
            <Link href="/account">Dashboard</Link>
            <span className="separator">/</span>
            <span>Profile</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1>Edit your profile</h1>
              <p>Update your information below and save when ready.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-outline" onClick={cancelEditing} disabled={saving}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Personal Information ── */}
        <div className="profile-section">
          <h3>Personal information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b6b6b', display: 'block', marginBottom: '0.3rem' }}>First name</label>
              <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b6b6b', display: 'block', marginBottom: '0.3rem' }}>Last name</label>
              <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b6b6b', display: 'block', marginBottom: '0.3rem' }}>Phone</label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b6b6b', display: 'block', marginBottom: '0.3rem' }}>Location (County)</label>
              <Input value={formData.locationCounty} onChange={(e) => setFormData({ ...formData, locationCounty: e.target.value })} />
            </div>
          </div>
        </div>

        {/* ── Profile ── */}
        <div className="profile-section">
          <h3>Career profile</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b6b6b', display: 'block', marginBottom: '0.3rem' }}>Seniority level</label>
              <select
                value={formData.seniorityLevel}
                onChange={(e) => setFormData({ ...formData, seniorityLevel: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="">Select level</option>
                {SENIORITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt.charAt(0) + opt.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b6b6b', display: 'block', marginBottom: '0.3rem' }}>Total experience (years)</label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={formData.totalExperienceYears}
                onChange={(e) => setFormData({ ...formData, totalExperienceYears: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* ── Work Experience ── */}
        <div className="profile-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>
              <Briefcase className="w-4 h-4 inline" style={{ marginRight: '0.4rem', verticalAlign: '-2px' }} />
              Work experience
            </h3>
            <button
              onClick={addWorkExperience}
              className="btn-outline"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {formData.workExperiences.length === 0 && (
            <p style={{ fontSize: '0.82rem', color: '#8a8a8a' }}>No work experience added yet.</p>
          )}
          {formData.workExperiences.map((we, index) => (
            <div key={isNewItem(we.id) ? `new-${index}` : we.id} style={{
              background: '#fafafa',
              border: '1px solid #f0eeeb',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '0.75rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3d3d3d' }}>
                  {isNewItem(we.id) ? 'New entry' : we.roleTitle || 'Untitled'}
                </span>
                <button
                  onClick={() => removeWorkExperience(index)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem' }}
                  aria-label="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <Input placeholder="Job title" value={we.roleTitle || ''} onChange={(e) => updateWorkExperience(index, 'roleTitle', e.target.value)} />
                <Input placeholder="Company / Employer" value={we.employerName || ''} onChange={(e) => updateWorkExperience(index, 'employerName', e.target.value)} />
                <Input
                  type="month"
                  placeholder="Start date"
                  value={we.startDate ? we.startDate.slice(0, 7) : ''}
                  onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value || null)}
                />
                {!we.isCurrent && (
                  <Input
                    type="month"
                    placeholder="End date"
                    value={we.endDate ? we.endDate.slice(0, 7) : ''}
                    onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value || null)}
                  />
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id={`current-${index}`}
                  checked={we.isCurrent}
                  onChange={(e) => updateWorkExperience(index, 'isCurrent', e.target.checked)}
                  style={{ accentColor: '#0b7e4a' }}
                />
                <label htmlFor={`current-${index}`} style={{ fontSize: '0.8rem', color: '#6b6b6b' }}>This is my current role</label>
              </div>
              <Textarea
                placeholder="Description of responsibilities and achievements..."
                value={we.description || ''}
                onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                style={{ marginTop: '0.5rem', minHeight: '4rem' }}
              />
            </div>
          ))}
        </div>

        {/* ── Education ── */}
        <div className="profile-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>
              <GraduationCap className="w-4 h-4 inline" style={{ marginRight: '0.4rem', verticalAlign: '-2px' }} />
              Education
            </h3>
            <button
              onClick={addEducation}
              className="btn-outline"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {formData.educations.length === 0 && (
            <p style={{ fontSize: '0.82rem', color: '#8a8a8a' }}>No education added yet.</p>
          )}
          {formData.educations.map((edu, index) => (
            <div key={isNewItem(edu.id) ? `new-edu-${index}` : edu.id} style={{
              background: '#fafafa',
              border: '1px solid #f0eeeb',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '0.75rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3d3d3d' }}>
                  {isNewItem(edu.id) ? 'New entry' : edu.fieldOfStudy || 'Untitled'}
                </span>
                <button
                  onClick={() => removeEducation(index)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem' }}
                  aria-label="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <Input placeholder="Institution" value={edu.institution || ''} onChange={(e) => updateEducation(index, 'institution', e.target.value)} />
                <Input placeholder="Field of study" value={edu.fieldOfStudy || ''} onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)} />
                <select
                  value={edu.level || ''}
                  onChange={(e) => updateEducation(index, 'level', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                >
                  <option value="">Select level</option>
                  {EDUCATION_LEVEL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt.charAt(0) + opt.slice(1).toLowerCase()}</option>
                  ))}
                </select>
                <select
                  value={edu.status}
                  onChange={(e) => updateEducation(index, 'status', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                >
                  <option value="COMPLETED">Completed</option>
                  <option value="ONGOING">Ongoing</option>
                </select>
                <Input
                  type="number"
                  placeholder="Start year"
                  value={edu.startYear ?? ''}
                  onChange={(e) => updateEducation(index, 'startYear', e.target.value ? parseInt(e.target.value, 10) : null)}
                />
                {edu.status !== 'ONGOING' && (
                  <Input
                    type="number"
                    placeholder="End year"
                    value={edu.endYear ?? ''}
                    onChange={(e) => updateEducation(index, 'endYear', e.target.value ? parseInt(e.target.value, 10) : null)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Skills ── */}
        <div className="profile-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>
              <Wrench className="w-4 h-4 inline" style={{ marginRight: '0.4rem', verticalAlign: '-2px' }} />
              Skills
            </h3>
            <button
              onClick={addSkill}
              className="btn-outline"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {formData.skills.length === 0 && (
            <p style={{ fontSize: '0.82rem', color: '#8a8a8a' }}>No skills added yet.</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {formData.skills.map((sk, index) => (
              <div key={isNewItem(sk.id) ? `new-sk-${index}` : sk.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: isNewItem(sk.id) ? '#f0fdf4' : 'transparent',
                borderRadius: '0.5rem',
                padding: '0.5rem 0.75rem',
              }}>
                {isNewItem(sk.id) ? (
                  <Input
                    placeholder="Skill name"
                    value={sk.rawText || ''}
                    onChange={(e) => updateSkill(index, 'name', e.target.value)}
                    style={{ flex: 1 }}
                  />
                ) : (
                  <span style={{ flex: 1, fontSize: '0.85rem', color: '#3d3d3d' }}>
                    {sk.skill?.label || sk.rawText || 'Unknown'}
                  </span>
                )}
                <select
                  value={sk.proficiency || ''}
                  onChange={(e) => updateSkill(index, 'proficiency', e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                >
                  <option value="">Proficiency</option>
                  {PROFICIENCY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt.charAt(0) + opt.slice(1).toLowerCase()}</option>
                  ))}
                </select>
                <button
                  onClick={() => removeSkill(index)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem', flexShrink: 0 }}
                  aria-label="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  /* ── Read-Only View ── */
  return (
    <>
      <div className="dashboard-header">
        <div className="dashboard-breadcrumb">
          <Link href="/">Home</Link>
          <span className="separator">/</span>
          <Link href="/account">Dashboard</Link>
          <span className="separator">/</span>
          <span>Profile</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Your profile</h1>
            <p>How employers and the matching engine see you.</p>
          </div>
          <button className="btn-outline" onClick={startEditing}><Pencil className="w-4 h-4" /> Edit profile</button>
        </div>
      </div>

      {/* Personal info */}
      <div className="profile-section">
        <h3>Personal information</h3>
        <div className="info-row">
          <span className="info-label">Full name</span>
          <span className="info-value">{candidate.firstName} {candidate.lastName}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Email</span>
          <span className="info-value"><a href={`mailto:${candidate.email}`}>{candidate.email}</a></span>
        </div>
        <div className="info-row">
          <span className="info-label">Phone</span>
          <span className="info-value">{candidate.phone || '—'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Location</span>
          <span className="info-value">
            <MapPin className="w-3.5 h-3.5 inline" style={{ marginRight: '0.3rem' }} />
            {candidate.locationCounty || '—'}, {candidate.country}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Career level</span>
          <span className="info-value" style={{ textTransform: 'capitalize' }}>
            {(candidate.profile?.seniorityLevel || '—').toLowerCase()} &middot; {candidate.profile?.totalExperienceYears ?? 0} years experience
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Primary domain</span>
          <span className="info-value">
            {candidate.profile?.primaryCategory?.label || '—'} &rarr; {candidate.profile?.primarySubcategory?.label || '—'}
          </span>
        </div>
      </div>

      {/* Education */}
      <div className="profile-section">
        <h3><GraduationCap className="w-4 h-4 inline" style={{ marginRight: '0.4rem', verticalAlign: '-2px' }} /> Education</h3>
        {candidate.educations.length === 0 && (
          <p style={{ fontSize: '0.82rem', color: '#8a8a8a' }}>No education added yet.</p>
        )}
        {candidate.educations.map((edu) => (
          <div key={edu.id}>
            <div className="info-row">
              <span className="info-label">{(edu.level || '').charAt(0) + (edu.level || '').slice(1).toLowerCase()}</span>
              <span className="info-value" style={{ fontWeight: 600 }}>{edu.fieldOfStudy || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Institution</span>
              <span className="info-value">{edu.institution || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Duration</span>
              <span className="info-value">{edu.startYear || '—'} – {edu.endYear || 'Present'} &middot; {edu.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Work experience */}
      <div className="profile-section">
        <h3><Briefcase className="w-4 h-4 inline" style={{ marginRight: '0.4rem', verticalAlign: '-2px' }} /> Work experience</h3>
        {candidate.workExperiences.length === 0 && (
          <p style={{ fontSize: '0.82rem', color: '#8a8a8a' }}>No work experience added yet.</p>
        )}
        {candidate.workExperiences.map((exp) => (
          <div key={exp.id} style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{exp.roleTitle || '—'}</p>
              {exp.isCurrent && <span style={{ fontSize: '0.7rem', color: '#0b7e4a', fontWeight: 600 }}>Current</span>}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#6b6b6b', margin: '0.1rem 0 0.3rem' }}>
              <Building2 className="w-3 h-3 inline" style={{ marginRight: '0.25rem' }} />{exp.employerName || '—'} &middot; {exp.organizationIndustry?.label || '—'}
            </p>
            <p style={{ fontSize: '0.78rem', color: '#8a8a8a', margin: '0 0 0.4rem' }}>
              {exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' }) : '—'} – {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' }) : 'Present'}
            </p>
            <p style={{ fontSize: '0.82rem', color: '#6b6b6b', lineHeight: 1.5, margin: 0 }}>{exp.description || ''}</p>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="profile-section">
        <h3><Wrench className="w-4 h-4 inline" style={{ marginRight: '0.4rem', verticalAlign: '-2px' }} /> Skills</h3>
        {candidate.skills.length === 0 && candidate.tools.length === 0 && (
          <p style={{ fontSize: '0.82rem', color: '#8a8a8a' }}>No skills added yet.</p>
        )}
        {candidate.skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 0.8rem' }}>
            {candidate.skills.map((skill) => (
              <span key={skill.id} style={{ fontSize: '0.82rem', color: '#3d3d3d' }}>
                {skill.skill?.label || skill.rawText || 'Unknown'}{' '}
                <span style={{ color: '#a0a0a0', fontSize: '0.72rem' }}>
                  ({(skill.proficiency || '').charAt(0) + (skill.proficiency || '').slice(1).toLowerCase()})
                </span>
              </span>
            ))}
          </div>
        )}
        {candidate.tools.length > 0 && (
          <>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b6b6b', marginTop: '1rem', marginBottom: '0.4rem' }}>Tools</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 0.8rem' }}>
              {candidate.tools.map((tool) => (
                <span key={tool.id} style={{ fontSize: '0.82rem', color: '#3d3d3d' }}>{tool.tool?.label || '—'}</span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Certifications */}
      <div className="profile-section">
        <h3><Award className="w-4 h-4 inline" style={{ marginRight: '0.4rem', verticalAlign: '-2px' }} /> Certifications</h3>
        {candidate.certifications.length === 0 && (
          <p style={{ fontSize: '0.82rem', color: '#8a8a8a' }}>No certifications added yet.</p>
        )}
        {candidate.certifications.map((cert) => (
          <div key={cert.id} className="info-row">
            <span className="info-label">{cert.issuingBody || '—'}</span>
            <span className="info-value">
              {cert.certification?.label || '—'} {cert.yearAwarded ? `(${cert.yearAwarded})` : ''} &middot; {cert.status}
            </span>
          </div>
        ))}
      </div>

      {/* Interests */}
      <div className="profile-section">
        <h3><Heart className="w-4 h-4 inline" style={{ marginRight: '0.4rem', verticalAlign: '-2px' }} /> Career interests</h3>
        {candidate.interests.length === 0 && (
          <p style={{ fontSize: '0.82rem', color: '#8a8a8a' }}>No interests selected yet.</p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1rem' }}>
          {candidate.interests.map((interest, i) => (
            <span key={interest.id} style={{
              fontSize: '0.82rem',
              color: i === 0 ? '#0b7e4a' : '#6b6b6b',
              fontWeight: i === 0 ? 600 : 400,
            }}>
              {i === 0 ? 'Primary' : ''} {interest.category?.label || '—'}
            </span>
          ))}
        </div>
      </div>

      <div className="dashboard-divider" />

      {/* Completion checklist */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem', letterSpacing: '-0.01em' }}>Profile completion</h2>
      <div>
        {profileCompletionChecklist.map((item, i) => (
          <div key={i} className={`completion-item ${item.complete ? 'complete' : ''}`}>
            <span className="check-icon">
              {item.complete ? <Check className="w-2.5 h-2.5" /> : null}
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
