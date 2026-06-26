import Link from 'next/link';
import { candidate, profileCompletionChecklist } from '@/lib/demo-candidate';
import { Pencil, Check, MapPin, Building2, GraduationCap, Briefcase, Award, Wrench, Heart } from 'lucide-react';

export default function ProfilePage() {
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
          <button className="btn-outline"><Pencil className="w-4 h-4" /> Edit profile</button>
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
          <span className="info-value">{candidate.phone}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Location</span>
          <span className="info-value"><MapPin className="w-3.5 h-3.5 inline" style={{ marginRight: '0.3rem' }} />{candidate.locationCounty}, {candidate.country}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Career level</span>
          <span className="info-value" style={{ textTransform: 'capitalize' }}>{candidate.seniorityLevel.toLowerCase()} &middot; {candidate.totalExperienceYears} years experience</span>
        </div>
        <div className="info-row">
          <span className="info-label">Primary domain</span>
          <span className="info-value">{candidate.primaryCategory} &rarr; {candidate.primarySubcategory}</span>
        </div>
      </div>

      {/* Education */}
      <div className="profile-section">
        <h3><GraduationCap className="w-4 h-4 inline" style={{ marginRight: '0.4rem', verticalAlign: '-2px' }} /> Education</h3>
        {candidate.education.map((edu) => (
          <div key={edu.id}>
            <div className="info-row">
              <span className="info-label">{edu.level.charAt(0) + edu.level.slice(1).toLowerCase()}</span>
              <span className="info-value" style={{ fontWeight: 600 }}>{edu.fieldOfStudy}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Institution</span>
              <span className="info-value">{edu.institution}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Duration</span>
              <span className="info-value">{edu.startYear} – {edu.endYear || 'Present'} &middot; {edu.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Work experience */}
      <div className="profile-section">
        <h3><Briefcase className="w-4 h-4 inline" style={{ marginRight: '0.4rem', verticalAlign: '-2px' }} /> Work experience</h3>
        {candidate.workExperience.map((exp) => (
          <div key={exp.id} style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{exp.roleTitle}</p>
              {exp.isCurrent && <span style={{ fontSize: '0.7rem', color: '#0b7e4a', fontWeight: 600 }}>Current</span>}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#6b6b6b', margin: '0.1rem 0 0.3rem' }}>
              <Building2 className="w-3 h-3 inline" style={{ marginRight: '0.25rem' }} />{exp.employerName} &middot; {exp.industry}
            </p>
            <p style={{ fontSize: '0.78rem', color: '#8a8a8a', margin: '0 0 0.4rem' }}>
              {exp.startDate} – {exp.endDate || 'Present'}
            </p>
            <p style={{ fontSize: '0.82rem', color: '#6b6b6b', lineHeight: 1.5, margin: 0 }}>{exp.description}</p>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="profile-section">
        <h3><Wrench className="w-4 h-4 inline" style={{ marginRight: '0.4rem', verticalAlign: '-2px' }} /> Skills</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 0.8rem' }}>
          {candidate.skills.map((skill, i) => (
            <span key={i} style={{ fontSize: '0.82rem', color: '#3d3d3d' }}>
              {skill.name} <span style={{ color: '#a0a0a0', fontSize: '0.72rem' }}>({skill.proficiency.charAt(0) + skill.proficiency.slice(1).toLowerCase()})</span>
            </span>
          ))}
        </div>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b6b6b', marginTop: '1rem', marginBottom: '0.4rem' }}>Tools</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 0.8rem' }}>
          {candidate.tools.map((tool, i) => (
            <span key={i} style={{ fontSize: '0.82rem', color: '#3d3d3d' }}>{tool}</span>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="profile-section">
        <h3><Award className="w-4 h-4 inline" style={{ marginRight: '0.4rem', verticalAlign: '-2px' }} /> Certifications</h3>
        {candidate.certifications.map((cert) => (
          <div key={cert.id} className="info-row">
            <span className="info-label">{cert.issuingBody}</span>
            <span className="info-value">{cert.name} {cert.yearAwarded ? `(${cert.yearAwarded})` : ''} &middot; {cert.status}</span>
          </div>
        ))}
      </div>

      {/* Interests */}
      <div className="profile-section">
        <h3><Heart className="w-4 h-4 inline" style={{ marginRight: '0.4rem', verticalAlign: '-2px' }} /> Career interests</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1rem' }}>
          {candidate.interests.map((interest, i) => (
            <span key={i} style={{ fontSize: '0.82rem', color: interest.isPrimary ? '#0b7e4a' : '#6b6b6b', fontWeight: interest.isPrimary ? 600 : 400 }}>
              {interest.isPrimary ? 'Primary' : ''} {interest.category}
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