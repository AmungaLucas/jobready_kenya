'use client';

import { useEffect, useRef } from 'react';

interface GoogleAdProps {
  slot: string;        // Ad slot ID (from Google AdSense)
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical' | 'fluid';
  style?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}

export default function GoogleAd({
  slot,
  format = 'auto',
  style,
  className = '',
  responsive = true
}: GoogleAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const adLoaded = useRef(false);

  useEffect(() => {
    // Only load ad once per component mount
    if (adLoaded.current || !adRef.current) return;

    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script in layout.tsx
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adLoaded.current = true;
    } catch (e) {
      console.warn('Google Ad load error:', e);
    }
  }, []);

  return (
    <div ref={adRef} className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={style || { display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}