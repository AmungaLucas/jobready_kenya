'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';

interface SmartApplyButtonProps {
  applicationUrl?: string | null;
  applyEmail?: string | null;
  howToApply?: string | null;
  jobTitle: string;
  companyName: string;
  deadline?: string | null;
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
  onClose,
}: {
  jobTitle: string;
  companyName: string;
  onProceed: () => void;
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

/* ───────────────── Smart Apply Button ───────────────── */

export default function SmartApplyButton({
  applicationUrl,
  applyEmail,
  howToApply,
  jobTitle,
  companyName,
  deadline,
}: SmartApplyButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const method = detectMethod({ applicationUrl, applyEmail, howToApply });

  const executeApply = useCallback(() => {
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

  /* ── How To Apply instructions panel ── */
  function HowToApplyPanel() {
    if (method !== 'instructions' || !howToApply) return null;
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
        <HowToApplyPanel />
      </div>

      {showModal && (
        <ServicePromotionModal
          jobTitle={jobTitle}
          companyName={companyName}
          onProceed={executeApply}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}