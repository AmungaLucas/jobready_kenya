import type { Metadata } from "next";
import { Nunito } from 'next/font/google';
import "./globals.css";

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
    google: 'your-google-verification-code',
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
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      </head>
      <body className="font-sans bg-[#faf9f6]">
        {children}
      </body>
    </html>
  );
}