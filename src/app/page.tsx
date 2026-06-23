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

export default function Home() {
  return (
    <>
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
            <div className="bg-gray-100 rounded-xl flex items-center justify-center h-20 md:h-24 border border-gray-200 text-gray-400 text-sm">
              📢 Google Ad – 728x90 (Bottom Leaderboard)
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}