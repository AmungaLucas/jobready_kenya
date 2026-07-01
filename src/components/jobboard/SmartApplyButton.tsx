'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

interface SmartApplyButtonProps {
  applicationUrl?: string | null;
  applyEmail?: string | null;
  howToApply?: string | null;
  jobTitle: string;
  companyName: string;
  deadline?: string | null;
  jobId?: string | null;
}

/* ───────────────────────────── helpers ───────────────────────────── */

function buildGmailUrlWithCompany(email: string, jobTitle: string, companyName: string): string {
  const subject = encodeURIComponent(`Application for ${jobTitle}`);
  const body = encodeURIComponent(
    `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobTitle} position at ${companyName}.\n\nPlease find my CV and cover letter attached for your review.\n\nI look forward to the opportunity to discuss how my skills and experience align with this role.\n\nKind regards,\n[Your Full Name]\n[Your Phone Number]\n[Your Email Address]`
  );
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}&body=${body}`;
}

type ApplyMethod = 'url' | 'email' | 'instructions' | 'contact';

function detectMethod(props: SmartApplyButtonProps): ApplyMethod {
  if (props.applicationUrl) return 'url';
  if (props.applyEmail) return 'email';
  if (props.howToApply) return 'instructions';
  return 'contact';
}

/* ───────────────── Service Promotion Modal ───────────────── */

function ServicePromotionModal({
  jobTitle,
  companyName,
  onProceed,
  onApplyWithProfile,
  isLoggedIn,
  onClose,
}: {
  jobTitle: string;
  companyName: string;
  onProceed: () => void;
  onApplyWithProfile?: () => void;
  isLoggedIn?: boolean;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setClosing(true);
        setTimeout(onClose, 200);
      }
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 200);
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
        closing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-all duration-200 ${
          closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 pt-6 pb-4 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition text-white"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Boost Your Application</h3>
              <p className="text-emerald-100 text-sm mt-0.5">
                Applying to {companyName}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Stand out from other applicants! Before you apply, consider giving your CV a professional edge.
          </p>

          {/* Service Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {/* CV Service Card */}
            <Link
              href="/cv-services"
              onClick={handleClose}
              className="group border border-gray-200 hover:border-emerald-300 rounded-xl p-4 transition hover:shadow-md hover:shadow-emerald-100 bg-gray-50/50 hover:bg-emerald-50/50"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center mb-2.5 group-hover:bg-emerald-200 transition">
                <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-800 text-sm">CV Revamp</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Professional CV writing tailored for Kenyan employers
              </p>
            </Link>

            {/* Job Matching Card */}
            <Link
              href="/contact?service=job-matching"
              onClick={handleClose}
              className="group border border-gray-200 hover:border-emerald-300 rounded-xl p-4 transition hover:shadow-md hover:shadow-emerald-100 bg-gray-50/50 hover:bg-emerald-50/50"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center mb-2.5 group-hover:bg-teal-200 transition">
                <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-800 text-sm">Job Matching</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Let us find the best jobs matched to your profile
              </p>
            </Link>
          </div>

          {/* Primary CTA — Proceed to Apply */}
          <button
            onClick={onProceed}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md shadow-emerald-200 flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Continue to Apply
          </button>

          {/* Apply with profile — for logged-in users with jobId */}
          {isLoggedIn && onApplyWithProfile && (
            <button
              onClick={onApplyWithProfile}
              className="w-full mt-3 bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Apply with Profile
            </button>
          )}

          {/* Skip text — very subtle, not aggressive */}
          <p className="text-center mt-3">
            <button
              onClick={onProceed}
              className="text-xs text-gray-400 hover:text-gray-500 transition"
            >
              No thanks, take me directly to apply
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────── In-App Apply Modal ───────────────── */

function InAppApplyModal({
  jobId,
  jobTitle,
  companyName,
  onClose,
}: {
  jobId: string;
  jobTitle: string;
  companyName: string;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setClosing(true);
        setTimeout(onClose, 200);
      }
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  function handleClose() {
    if (!submitting) {
      setClosing(true);
      setTimeout(onClose, 200);
    }
  }

  const handleSubmit = async () => {
    if (submitting || submitted) return;
    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coverLetter: coverLetter.trim() || null,
          source: 'DIRECT',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Application failed' }));
        if (res.status === 409) {
          setError('You have already applied to this job.');
        } else if (res.status === 401) {
          setError('Please sign in to apply.');
        } else {
          setError(data.error || 'Something went wrong. Please try again.');
        }
        return;
      }

      setSubmitted(true);
      toast.success('Application submitted successfully!');
      // Track SUBMITTED funnel step
      fetch(`/api/jobs/${jobId}/funnel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'SUBMITTED' }),
      }).catch(() => {});
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
        closing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transition-all duration-200 ${
          closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 pt-6 pb-4 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition text-white"
            aria-label="Close"
            disabled={submitting}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Apply with Profile</h3>
              <p className="text-emerald-100 text-sm mt-0.5">
                {jobTitle} at {companyName}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-800 text-lg">Application Sent!</h4>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                Your profile has been submitted to <strong>{companyName}</strong> for the <strong>{jobTitle}</strong> position. You can track your application status from your dashboard.
              </p>
              <button
                onClick={handleClose}
                className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl transition text-sm"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label htmlFor="cover-letter" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Cover letter <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="cover-letter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Write a brief cover letter to introduce yourself and explain why you're a great fit for this role..."
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition placeholder:text-gray-400"
                  disabled={submitting}
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md shadow-emerald-200 flex items-center justify-center gap-2 text-sm disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Submit Application
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────── How To Apply Panel ───────────────── */

function HowToApplyPanel({ howToApply }: { howToApply: string | null }) {
  if (!howToApply) return null;
  return (
    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <div className="flex items-start gap-2.5">
        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-gray-800 text-sm">How to Apply</h4>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-line">
            {howToApply}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────── Smart Apply Button ───────────────── */

export default function SmartApplyButton({
  applicationUrl,
  applyEmail,
  howToApply,
  jobTitle,
  companyName,
  deadline,
  jobId,
}: SmartApplyButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [showInAppApply, setShowInAppApply] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const method = detectMethod({ applicationUrl, applyEmail, howToApply });

  // Check auth status on mount (only when jobId is available)
  useEffect(() => {
    if (!jobId) return;
    fetch('/api/auth/session')
      .then((res) => {
        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => setIsLoggedIn(false));
  }, [jobId]);

  const executeApply = useCallback(() => {
    // Track CLICKED_APPLY funnel step
    if (jobId) {
      fetch(`/api/jobs/${jobId}/funnel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'CLICKED_APPLY' }),
      }).catch(() => {});
    }

    switch (method) {
      case 'url':
        window.open(applicationUrl!, '_blank', 'noopener,noreferrer');
        break;
      case 'email': {
        const gmailUrl = buildGmailUrlWithCompany(applyEmail!, jobTitle, companyName);
        window.open(gmailUrl, '_blank', 'noopener,noreferrer');
        break;
      }
      case 'instructions':
        // howToApply will be shown below the button; just close modal
        break;
      case 'contact':
        window.location.href = '/contact';
        break;
    }
    setShowModal(false);
  }, [method, applicationUrl, applyEmail, jobTitle, companyName]);

  function handleApplyClick() {
    setShowModal(true);
  }

  function handleInAppApply() {
    setShowModal(false);
    setShowInAppApply(true);
    // Track STARTED_APPLICATION funnel step
    if (jobId) {
      fetch(`/api/jobs/${jobId}/funnel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'STARTED_APPLICATION' }),
      }).catch(() => {});
    }
  }

  /* ── Button Label ── */
  const buttonLabel = (() => {
    switch (method) {
      case 'url':
        return 'Apply Now';
      case 'email':
        return 'Apply via Email';
      case 'instructions':
        return 'View Application Details';
      case 'contact':
        return 'Apply via Contact';
    }
  })();

  const buttonIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );

  return (
    <>
      <div>
        <button
          type="button"
          onClick={handleApplyClick}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-lg transition shadow-md shadow-emerald-200 flex items-center gap-2 text-sm cursor-pointer"
        >
          {buttonLabel}
          {buttonIcon}
        </button>
        {method === 'instructions' && <HowToApplyPanel howToApply={howToApply} />}
      </div>

      {showModal && (
        <ServicePromotionModal
          jobTitle={jobTitle}
          companyName={companyName}
          onProceed={executeApply}
          onApplyWithProfile={jobId ? handleInAppApply : undefined}
          isLoggedIn={isLoggedIn ?? false}
          onClose={() => setShowModal(false)}
        />
      )}

      {showInAppApply && jobId && (
        <InAppApplyModal
          jobId={jobId}
          jobTitle={jobTitle}
          companyName={companyName}
          onClose={() => setShowInAppApply(false)}
        />
      )}
    </>
  );
}
