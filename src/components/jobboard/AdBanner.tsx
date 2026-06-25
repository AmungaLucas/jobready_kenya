'use client';
import GoogleAd from './GoogleAd';

export default function AdBanner({ slot = '1111111111', className = 'my-6' }: { slot?: string; className?: string }) {
  return (
    <div className="w-full flex justify-center">
      <GoogleAd slot={slot} format="auto" className={className} />
    </div>
  );
}
