import type { Metadata } from "next";
import { Nunito } from 'next/font/google';
import "./globals.css";
import CookieConsent from '@/components/jobboard/CookieConsent';
import WhatsAppButton from '@/components/jobboard/WhatsAppButton';
import { generateOrganizationJsonLd } from '@/lib/jsonld';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: {
    default: 'JobBoard Kenya - Find Verified Jobs & Opportunities in Kenya',
    template: '%s | JobBoard Kenya',
  },
  description: 'Find verified jobs, internships, and opportunities across Kenya. Browse 43+ job categories, 468 subcategories, and opportunities in all 47 counties.',
  metadataBase: new URL('https://jobboard.ke'),
  alternates: {
    canonical: 'https://jobboard.ke',
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://jobboard.ke',
    siteName: 'JobBoard Kenya',
    title: 'JobBoard Kenya - Find Verified Jobs & Opportunities in Kenya',
    description: 'Find verified jobs, internships, and opportunities across Kenya. Browse 43+ job categories, 468 subcategories, and opportunities in all 47 counties.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobBoard Kenya',
    description: 'Find verified jobs, internships, and opportunities across Kenya.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'JobBoard Kenya',
    url: 'https://jobboard.ke',
    description: 'Kenya\'s leading job search platform with verified jobs, internships, and opportunities across all 47 counties.',
    publisher: {
      '@type': 'Organization',
      name: 'JobBoard Kenya',
      url: 'https://jobboard.ke',
      logo: { '@type': 'ImageObject', url: 'https://jobboard.ke/default-og.jpg' },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://jobboard.ke/jobs?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" className={nunito.variable} suppressHydrationWarning>
      <head>
        {/* DNS prefetch & preconnect for performance */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        {/* Google AdSense - replace ca-pub-XXXXXXXXXX with your real publisher ID */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX" crossOrigin="anonymous" />
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
        )}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationJsonLd()) }} />
      </head>
      <body className="font-sans bg-[#faf9f6]">
        {children}
        <CookieConsent />
        <WhatsAppButton />
      </body>
    </html>
  );
}