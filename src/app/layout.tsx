import type { Metadata } from "next";
import { Nunito } from 'next/font/google';
import "./globals.css";
import CookieConsent from '@/components/jobboard/CookieConsent';
import WhatsAppButton from '@/components/jobboard/WhatsAppButton';
import { generateOrganizationJsonLd } from '@/lib/jsonld';
import AuthProvider from '@/components/AuthProvider';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-nunito',
});

const SITE_URL = 'https://jobboard.ke';
const SITE_NAME = 'JobBoard Kenya';
const SITE_DESCRIPTION = 'Find verified jobs, internships, and opportunities across Kenya. Browse 43+ job categories, 468 subcategories, and opportunities in all 47 counties.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Find Verified Jobs & Opportunities in Kenya`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['jobs in kenya', 'kenyan jobs', 'job vacancies kenya', 'government jobs kenya', 'internships kenya', 'careers kenya', 'jobboard', 'job search kenya', 'NGO jobs kenya', 'ICT jobs kenya'],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'manifest', url: '/manifest.json' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Find Verified Jobs & Opportunities in Kenya`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/images/og-default.png',
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: 'Find verified jobs, internships, and opportunities across Kenya.',
    images: ['/images/twitter-card.png'],
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
      logo: { '@type': 'ImageObject', url: 'https://jobboard.ke/logo.svg' },
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
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#0C1D32" />
        <meta name="msapplication-TileColor" content="#0C1D32" />
        <meta name="msapplication-TileImage" content="/icons/android-chrome-192x192.png" />
        {/* Google AdSense - replace ca-pub-XXXXXXXXXX with your real publisher ID */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX" crossOrigin="anonymous" />
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
        )}
        {/* Logo references for structured data */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationJsonLd()) }} />
      </head>
      <body className="font-sans bg-[#faf9f6]">
        <AuthProvider>
          {children}
          <CookieConsent />
          <WhatsAppButton />
        </AuthProvider>
      </body>
    </html>
  );
}