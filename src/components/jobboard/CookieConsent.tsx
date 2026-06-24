'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ConsentPreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
};

const DEFAULT_PREFS: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

export default function CookieConsent() {
  const [visible, setVisible] = useState<boolean | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<ConsentPreferences>(DEFAULT_PREFS);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const consent = localStorage.getItem('cookie-consent');
        setVisible(!consent);
        if (consent) {
          try {
            const saved = JSON.parse(consent) as ConsentPreferences;
            setPrefs({ ...DEFAULT_PREFS, ...saved });
          } catch { /* ignore parse errors */ }
        }
      } catch {
        setVisible(true);
      }
    });
  }, []);

  const savePreferences = (preferences: ConsentPreferences) => {
    try {
      localStorage.setItem('cookie-consent', JSON.stringify(preferences));
      // Dispatch custom event for other scripts to react to consent changes
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: preferences }));
      }
    } catch { /* ignore storage errors */ }
    setVisible(false);
  };

  const handleAcceptAll = () => {
    const allAccepted: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    savePreferences(allAccepted);
  };

  const handleRejectOptional = () => {
    savePreferences(DEFAULT_PREFS);
  };

  const handleSavePreferences = () => {
    savePreferences(prefs);
  };

  const togglePref = (key: keyof ConsentPreferences) => {
    if (key === 'necessary') return; // Always required
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (visible === false || visible === null) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-5xl mx-auto px-4 pb-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden">

          {/* Main banner */}
          <div className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row items-start gap-4">
              {/* Text */}
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-800 mb-1">We value your privacy</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  We use cookies and similar technologies to improve your browsing experience, analyse site traffic, and personalise content. Some cookies are necessary for the site to function, while others help us understand how you use JobBoard Kenya. You can choose which cookies to allow. Read our{' '}
                  <Link
                    href="/privacy-policy"
                    className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 font-medium"
                  >
                    Privacy Policy
                  </Link>{' '}
                  for more details.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="border border-gray-300 hover:border-gray-400 text-gray-600 text-xs font-medium px-4 py-2 rounded-lg transition"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="border border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-xs font-medium px-4 py-2 rounded-lg transition"
                >
                  Customise
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>

          {/* Detailed preferences panel */}
          {showDetails && (
            <div className="px-5 md:px-6 pb-5 md:pb-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {/* Necessary */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="mt-0.5">
                    <div className="w-5 h-5 rounded border-2 border-emerald-600 bg-emerald-600 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-gray-800">Necessary</span>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Required for the site to function properly. Includes session cookies and CSRF protection. Cannot be disabled.
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full h-fit">Always On</span>
                </div>

                {/* Analytics */}
                <div
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 cursor-pointer hover:border-emerald-200 transition"
                  onClick={() => togglePref('analytics')}
                >
                  <div className="mt-0.5">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                      prefs.analytics ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'
                    }`}>
                      {prefs.analytics && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-gray-800">Analytics</span>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Help us understand how visitors interact with JobBoard Kenya by collecting anonymous data like page views and search patterns.
                    </p>
                  </div>
                </div>

                {/* Marketing */}
                <div
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 cursor-pointer hover:border-emerald-200 transition"
                  onClick={() => togglePref('marketing')}
                >
                  <div className="mt-0.5">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                      prefs.marketing ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'
                    }`}>
                      {prefs.marketing && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-gray-800">Marketing</span>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Used to deliver relevant advertisements and track campaign effectiveness. May be set by our advertising partners.
                    </p>
                  </div>
                </div>

                {/* Functional */}
                <div
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 cursor-pointer hover:border-emerald-200 transition"
                  onClick={() => togglePref('functional')}
                >
                  <div className="mt-0.5">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                      prefs.functional ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'
                    }`}>
                      {prefs.functional && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-gray-800">Functional</span>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Enable enhanced functionality and personalisation, such as remembering your job search preferences and location settings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="border border-gray-300 hover:border-gray-400 text-gray-600 text-xs font-medium px-4 py-2 rounded-lg transition"
                >
                  Reject Optional
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}