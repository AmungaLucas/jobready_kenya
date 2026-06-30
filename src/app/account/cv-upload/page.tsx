'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { UploadCloud, FileText, Check, ChevronRight, Loader2 } from 'lucide-react';
import { DEMO_MODE, useCandidateId, uploadCV } from '@/lib/api-client';

const onboardingSteps = [
  { label: 'Profile', status: 'completed' },
  { label: 'Preferences', status: 'completed' },
  { label: 'CV Upload', status: 'current' },
  { label: 'Done', status: 'upcoming' },
];

export default function CVUploadPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'build'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extractionStats, setExtractionStats] = useState<Record<string, number> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  }

  function validateAndSetFile(file: File) {
    setUploadError(null);
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a PDF, DOCX, or DOC file.');
      setSelectedFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 5MB.');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  }

  const candidateId = useCandidateId();

  async function handleUpload() {
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);

    try {
      if (!DEMO_MODE && selectedFile) {
        const result = await uploadCV(candidateId, selectedFile);
        if (result?.success) {
          setUploadSuccess(true);
          // Show extraction stats if available
          if ('extractionStats' in result && result.extractionStats) {
            setExtractionStats(result.extractionStats as Record<string, number>);
          }
        } else {
          setUploadError(result?.message ?? 'Upload failed. Please try again.');
        }
      } else {
        // Demo mode — simulate upload delay
        await new Promise((r) => setTimeout(r, 1200));
        setUploadSuccess(true);
      }
    } catch {
      setUploadError('An error occurred during upload. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function resetUpload() {
    setUploadSuccess(false);
    setExtractionStats(null);
    setSelectedFile(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <>
      <div className="dashboard-header">
        <div className="dashboard-breadcrumb">
          <Link href="/">Home</Link>
          <span className="separator">/</span>
          <Link href="/account">Dashboard</Link>
          <span className="separator">/</span>
          <span>CV Upload</span>
        </div>
        <h1>CV Upload</h1>
        <p>Upload your CV or build one with our tools</p>
      </div>

      {/* Onboarding steps */}
      <div className="onboarding-steps">
        {onboardingSteps.map((step, i) => (
          <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              className={`onboarding-step ${step.status}`}
            >
              <span className="step-dot" />
              {step.label}
            </div>
            {i < onboardingSteps.length - 1 && (
              <div className="onboarding-step-connector" />
            )}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="dashboard-filter-tabs" style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={`dashboard-filter-tab${activeTab === 'upload' ? ' active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload CV
        </button>
        <button
          type="button"
          className={`dashboard-filter-tab${activeTab === 'build' ? ' active' : ''}`}
          onClick={() => setActiveTab('build')}
        >
          Build CV
        </button>
      </div>

      {activeTab === 'upload' && (
        <div>
          {uploadSuccess ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#d1fae5', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 1rem',
              }}>
                <Check style={{ width: '1.5rem', height: '1.5rem', color: '#065f46' }} />
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a' }}>
                CV uploaded and processed successfully
              </div>
              <div style={{ fontSize: '0.82rem', color: '#8a8a8a', marginTop: '0.3rem' }}>
                {selectedFile?.name}
              </div>
              {extractionStats ? (
                <div style={{
                  marginTop: '1rem', display: 'inline-flex', flexWrap: 'wrap', gap: '0.5rem',
                  justifyContent: 'center', maxWidth: '400px',
                }}>
                  {extractionStats.skills ? (
                    <span style={{ background: '#f0fdf4', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 500 }}>
                      {extractionStats.skills} skills
                    </span>
                  ) : null}
                  {extractionStats.qualifications ? (
                    <span style={{ background: '#eff6ff', color: '#1e40af', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 500 }}>
                      {extractionStats.qualifications} qualifications
                    </span>
                  ) : null}
                  {extractionStats.experiences ? (
                    <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 500 }}>
                      {extractionStats.experiences} experiences
                    </span>
                  ) : null}
                  {extractionStats.certifications ? (
                    <span style={{ background: '#f5f3ff', color: '#5b21b6', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 500 }}>
                      {extractionStats.certifications} certifications
                    </span>
                  ) : null}
                </div>
              ) : !DEMO_MODE ? (
                <div style={{ fontSize: '0.82rem', color: '#8a8a8a', marginTop: '0.5rem' }}>
                  Your CV is being processed. We are extracting your skills, qualifications, and experience.
                </div>
              ) : (
                <div style={{ fontSize: '0.82rem', color: '#8a8a8a', marginTop: '0.15rem' }}>
                  Your profile is now 97% complete
                </div>
              )}
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {extractionStats && extractionStats.skills > 0 && (
                  <Link
                    href="/account/matches"
                    className="btn-primary"
                    style={{ fontSize: '0.82rem' }}
                  >
                    View your matches
                  </Link>
                )}
                <button
                  type="button"
                  className="btn-outline"
                  onClick={resetUpload}
                >
                  Upload a different CV
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className={`upload-area${isDragOver ? ' dragging' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="upload-icon">
                  <UploadCloud style={{ width: '2.5rem', height: '2.5rem' }} />
                </div>
                <p><strong>Click to upload</strong> or drag and drop</p>
                <p className="upload-hint">PDF, DOC, or DOCX (max 5MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </div>
              {uploadError && (
                <p style={{ fontSize: '0.82rem', color: '#ef4444', marginTop: '0.5rem' }}>
                  {uploadError}
                </p>
              )}
              {selectedFile && (
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <FileText style={{ width: '1.2rem', height: '1.2rem', color: '#6b6b6b' }} />
                  <span style={{ fontSize: '0.85rem', color: '#3d3d3d' }}>{selectedFile.name}</span>
                  <span style={{ fontSize: '0.75rem', color: '#a0a0a0' }}>
                    ({(selectedFile.size / 1024).toFixed(0)} KB)
                  </span>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ marginLeft: 'auto', padding: '0.35rem 1.2rem', fontSize: '0.82rem' }}
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        {' '}{!DEMO_MODE ? 'Uploading & extracting...' : 'Uploading...'}
                      </>
                    ) : 'Upload'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'build' && (
        <div>
          <div className="cv-builder-section">
            <h3>Personal information</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Full name</label>
                <input type="text" defaultValue="James Mito" />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input type="email" defaultValue="james.mito@gmail.com" />
              </div>
              <div className="form-field">
                <label>Phone</label>
                <input type="tel" defaultValue="+254 712 345 678" />
              </div>
              <div className="form-field">
                <label>Location</label>
                <input type="text" defaultValue="Nairobi, Kenya" />
              </div>
              <div className="form-field full-width">
                <label>Professional summary</label>
                <textarea defaultValue="Finance and Accounting graduate with 2.5 years of experience in accounts payable, bank reconciliation, and financial reporting." />
              </div>
            </div>
          </div>

          <div className="cv-builder-section">
            <h3>Education</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Degree</label>
                <input type="text" defaultValue="Bachelor of Commerce" />
              </div>
              <div className="form-field">
                <label>Field of study</label>
                <input type="text" defaultValue="Finance" />
              </div>
              <div className="form-field">
                <label>Institution</label>
                <input type="text" defaultValue="University of Nairobi" />
              </div>
              <div className="form-field">
                <label>Year</label>
                <input type="text" defaultValue="2017 – 2021" />
              </div>
            </div>
          </div>

          <div className="cv-builder-section">
            <h3>Work experience</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Job title</label>
                <input type="text" defaultValue="Finance Assistant" />
              </div>
              <div className="form-field">
                <label>Company</label>
                <input type="text" defaultValue="PATH Kenya" />
              </div>
              <div className="form-field">
                <label>Start date</label>
                <input type="text" defaultValue="March 2023" />
              </div>
              <div className="form-field">
                <label>End date</label>
                <input type="text" defaultValue="Present" />
              </div>
              <div className="form-field full-width">
                <label>Description</label>
                <textarea defaultValue="Process accounts payable for donor-funded health projects. Prepare monthly bank reconciliations and financial reports." />
              </div>
            </div>
          </div>

          <div className="cv-builder-section">
            <h3>Skills</h3>
            <div className="form-field full-width">
              <label>Skills (comma separated)</label>
              <input
                type="text"
                defaultValue="Accounts Payable, Bank Reconciliation, Financial Reporting, Invoice Processing, Audit Support, Payroll Support, Excel, QuickBooks"
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn-primary" style={{ marginRight: '0.6rem' }}>
              Generate CV
              <ChevronRight style={{ width: '0.85rem', height: '0.85rem' }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}