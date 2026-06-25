import { Metadata } from 'next';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';
import Hero from '@/components/jobboard/Hero';
import OfficialUpdates from '@/components/jobboard/OfficialUpdates';
import ClosingSoon from '@/components/jobboard/ClosingSoon';
import CategoryScroll from '@/components/jobboard/CategoryScroll';
import LocationScroll from '@/components/jobboard/LocationScroll';
import OpportunitiesTabs from '@/components/jobboard/OpportunitiesTabs';
import GovernmentJobs from '@/components/jobboard/GovernmentJobs';
import MatchingCard from '@/components/jobboard/MatchingCard';
import FlexibleJobs from '@/components/jobboard/FlexibleJobs';
import CareerResources from '@/components/jobboard/CareerResources';
import Newsletter from '@/components/jobboard/Newsletter';
import GoogleAd from '@/components/jobboard/GoogleAd';

// Homepage queries the DB (latest jobs, gov jobs, etc.) — must be dynamic
// to avoid exhausting remote MySQL connections during build
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'JobBoard Kenya - Find Verified Jobs & Opportunities in Kenya',
  description: 'Find verified jobs, internships, and opportunities across Kenya. Browse 43+ job categories, 468 subcategories, and opportunities in all 47 counties. Updated daily with government, NGO, and private sector vacancies.',
  alternates: { canonical: 'https://jobboard.ke' },
  openGraph: {
    title: 'JobBoard Kenya - Find Verified Jobs & Opportunities in Kenya',
    description: 'Find verified jobs, internships, and opportunities across Kenya. Browse 43+ job categories, 468 subcategories, and opportunities in all 47 counties. Updated daily.',
    url: 'https://jobboard.ke',
    siteName: 'JobBoard Kenya',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobBoard Kenya - Find Verified Jobs & Opportunities in Kenya',
    description: 'Find verified jobs, internships, and opportunities across Kenya. Updated daily with government, NGO, and private sector vacancies.',
  },
};

const homePageFaqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is JobBoard Kenya?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'JobBoard Kenya is Kenya\'s leading job search platform, listing verified job vacancies, internships, tenders, scholarships, and career opportunities from government, NGO, and private sector employers across all 47 counties.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I find jobs on JobBoard Kenya?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can search jobs by keyword, browse by category (43+ industries), filter by location (all 47 counties), or explore government jobs and opportunities. Use the search bar on the homepage or navigate to /jobs for advanced filtering.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is JobBoard Kenya free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, JobBoard Kenya is completely free for job seekers. You can browse, search, and apply for jobs at no cost. Set up free email alerts to get notified when new matching positions are posted.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many jobs are listed on JobBoard Kenya?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'JobBoard Kenya lists hundreds of active job vacancies across 43+ job categories and 468 subcategories, covering technology, healthcare, finance, engineering, education, government, and more. New jobs are added daily.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I apply for jobs on JobBoard Kenya?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Click on any job listing to view the full details, then use the "Apply Now" button. Some jobs link directly to the employer\'s application portal, while others provide email instructions. Always apply before the stated deadline.',
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageFaqLd) }} />
      <Navbar />
      <main>
        <Hero />
        <OfficialUpdates />
        <ClosingSoon />
        <CategoryScroll />
        <LocationScroll />
        <OpportunitiesTabs />
        <GovernmentJobs />
        <MatchingCard />
        <FlexibleJobs />
        <CareerResources />
        <Newsletter />
        {/* Bottom Ad */}
        <div className="section-bg pb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <GoogleAd slot="home-bottom" format="horizontal" className="rounded-xl" style={{ minHeight: '90px' }} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}