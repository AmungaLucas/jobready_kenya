'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const consent = localStorage.getItem('cookie-consent');
        setVisible(!consent);
      } catch {
        setVisible(true);
      }
    });
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('cookie-consent', 'accepted');
    } catch {
      // ignore storage errors
    }
    setVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('cookie-consent', 'declined');
    } catch {
      // ignore storage errors
    }
    setVisible(false);
  };

  if (visible === false || visible === null) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/90 border-t border-gray-200 rounded-t-xl shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            We use cookies to improve your experience. By continuing to browse, you agree to our{' '}
            <Link
              href="/privacy-policy"
              className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
            >
              Privacy Policy
            </Link>
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleAccept}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={handleDecline}
              className="border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
