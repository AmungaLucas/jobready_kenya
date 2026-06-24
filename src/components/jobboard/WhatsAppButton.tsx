'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [phone, setPhone] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check if user already subscribed
  useEffect(() => {
    try {
      const sub = localStorage.getItem('whatsapp-subscribed');
      if (sub === 'true') setDismissed(true);
    } catch { /* ignore */ }
  }, []);

  const categoryOptions = [
    'Government Jobs',
    'IT & Technology',
    'Healthcare & Medical',
    'Finance & Accounting',
    'Engineering',
    'Education & Training',
    'Internships',
    'NGO & Development',
    'All Categories',
  ];

  const toggleCategory = (cat: string) => {
    if (cat === 'All Categories') {
      setCategories(prev => prev.includes('All Categories') ? [] : ['All Categories']);
      return;
    }
    setCategories(prev => {
      const filtered = prev.filter(c => c !== 'All Categories');
      return filtered.includes(cat) ? filtered.filter(c => c !== cat) : [...filtered, cat];
    });
  };

  const handleSubscribe = useCallback(() => {
    if (!phone || phone.length < 10) return;

    // Save subscription locally (backend integration point)
    try {
      localStorage.setItem('whatsapp-subscribed', 'true');
      localStorage.setItem('whatsapp-phone', phone);
      localStorage.setItem('whatsapp-categories', JSON.stringify(categories));
    } catch { /* ignore */ }

    // Construct WhatsApp message with preferences
    const catsText = categories.length > 0 ? categories.join(', ') : 'All Categories';
    const message = `Hi JobBoard Kenya! I'd like to subscribe to job alerts.\n\nPhone: ${phone}\nPreferred Categories: ${catsText}`;
    const encoded = encodeURIComponent(message);

    window.open(
      `https://wa.me/254700000000?text=${encoded}`,
      '_blank'
    );

    setSubmitted(true);
    setTimeout(() => {
      setShowPanel(false);
      setDismissed(true);
    }, 3000);
  }, [phone, categories]);

  const handleChat = () => {
    const message = 'Hi JobBoard Kenya, I would like to know more about your services';
    window.open(
      `https://wa.me/254700000000?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  if (dismissed && !showPanel) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Subscription Panel */}
      {showPanel && (
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-[#25D366] px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Get Job Alerts on WhatsApp</h3>
                <p className="text-xs text-white/80 mt-0.5">Receive new jobs matching your preferences</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPanel(false)}
                className="text-white/80 hover:text-white text-lg leading-none"
                aria-label="Close panel"
              >
                &times;
              </button>
            </div>
          </div>

          {submitted ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-800 text-sm">You&apos;re Subscribed!</h4>
              <p className="text-xs text-gray-500 mt-1">We&apos;ll send job alerts to your WhatsApp.</p>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {/* Phone input */}
              <div>
                <label htmlFor="wa-phone" className="block text-xs font-medium text-gray-700 mb-1">
                  WhatsApp Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-xs text-gray-500">
                    +254
                  </span>
                  <input
                    id="wa-phone"
                    type="tel"
                    placeholder="7XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    className="flex-1 px-3 py-2 rounded-r-lg border border-gray-300 text-sm focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366]"
                  />
                </div>
              </div>

              {/* Category selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Preferred Categories
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                        categories.includes(cat)
                          ? 'bg-[#25D366]/10 border-[#25D366] text-[#25D366] font-medium'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subscribe button */}
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={phone.length < 10}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                </svg>
                Subscribe via WhatsApp
              </button>

              <p className="text-[10px] text-gray-400 text-center">
                By subscribing, you agree to receive job alerts. Unsubscribe anytime.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Button */}
      <div className="relative">
        {/* Tooltip */}
        <span
          className={`absolute right-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-opacity duration-200 pointer-events-none ${
            hovered && !showPanel ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {showPanel ? 'Close' : 'Job Alerts'}
          <span className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-gray-800 rotate-45" />
        </span>

        {/* Button */}
        <button
          type="button"
          onClick={showPanel ? () => setShowPanel(false) : handleChat}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label={showPanel ? 'Close WhatsApp panel' : 'Chat with us on WhatsApp'}
          className="w-14 h-14 rounded-full bg-[#25D366] shadow-lg hover:shadow-xl hover:bg-[#20bd5a] transition-all flex items-center justify-center text-white"
          style={{ animation: showPanel ? 'none' : 'whatsapp-pulse 2.5s ease-in-out infinite' }}
        >
          {showPanel ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          )}
        </button>
      </div>

      {/* Subscription toggle - small badge */}
      {!showPanel && !submitted && (
        <button
          type="button"
          onClick={() => setShowPanel(true)}
          className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md hover:bg-emerald-700 transition"
          aria-label="Subscribe to job alerts"
          title="Get job alerts"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      )}

      <style jsx>{`
        @keyframes whatsapp-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(37, 211, 102, 0);
          }
        }
      `}</style>
    </div>
  );
}