import { Metadata } from 'next';
import Link from 'next/link';
import { generateCollectionPageJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';
import AdBanner from '@/components/jobboard/AdBanner';
import { getAllCategories } from '@/lib/categories';
import { LucideIcon, Search, ChevronRight, BookOpen, MapPin, Landmark, Briefcase,
  Laptop, HeartPulse, TrendingUp, Cog, GraduationCap, Megaphone, Scale, BedDouble,
  Sprout, Truck, HardHat, Factory, HandHelping, Newspaper, Palette, Handshake,
  FileText, Users, Headset, Building, Satellite, Zap, Gem, Car, ShoppingCart,
  Banknote, ShieldCheck, Calculator, ClipboardCheck, Lightbulb, Database, Pencil,
  ShieldAlert, Bus, Pill, Leaf, Plane, Microscope, CircleDot, Flower2,
  UtensilsCrossed, Globe } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const categories = await getAllCategories();
  const totalJobs = categories.reduce((sum, c) => sum + c.jobCount, 0);
  const title = 'Browse 43 Job Categories in Kenya - Find Jobs by Industry | JobBoard Kenya';
  const description = `Explore all ${categories.length} job categories in Kenya with ${totalJobs}+ active listings. Find jobs in Technology, Healthcare, Finance, Engineering, Education, and more. Your gateway to career opportunities across all 47 counties.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/categories` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/categories`,
      siteName: 'JobBoard Kenya',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const categoryIcons: Record<string, LucideIcon> = {
  'technology': Laptop,
  'healthcare': HeartPulse,
  'finance': TrendingUp,
  'engineering': Cog,
  'education': GraduationCap,
  'marketing': Megaphone,
  'legal': Scale,
  'hospitality-tourism': BedDouble,
  'agriculture': Sprout,
  'logistics': Truck,
  'construction': HardHat,
  'manufacturing': Factory,
  'government': Landmark,
  'ngo': HandHelping,
  'media': Newspaper,
  'creative': Palette,
  'sales': Handshake,
  'admin': FileText,
  'human-resources': Users,
  'customer-service': Headset,
  'real-estate': Building,
  'telecommunications': Satellite,
  'energy': Zap,
  'mining': Gem,
  'automotive': Car,
  'retail': ShoppingCart,
  'banking': Banknote,
  'insurance': ShieldCheck,
  'accounting': Calculator,
  'audit': ClipboardCheck,
  'consulting': Lightbulb,
  'data': Database,
  'design': Pencil,
  'security': ShieldAlert,
  'transport': Bus,
  'social-work': HandHelping,
  'pharmaceutical': Pill,
  'environmental': Leaf,
  'aviation': Plane,
  'research': Microscope,
  'sports': CircleDot,
  'beauty': Flower2,
  'food-beverage': UtensilsCrossed,
  'imports': Globe,
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();
  const totalJobs = categories.reduce((sum, c) => sum + c.jobCount, 0);

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Job Categories', url: '/categories' },
  ]);

  const collectionLd = generateCollectionPageJsonLd({
    name: 'All Job Categories in Kenya',
    description: `Browse ${categories.length} job categories with ${totalJobs}+ active job listings across Kenya.`,
    url: '/categories',
    itemCount: categories.length,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />

      {/* Breadcrumb */}
      <section className="section-bg py-4 border-b border-gray-200/50" style={{ paddingTop: '88px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-medium">Job Categories</span>
          </nav>
        </div>
      </section>

      {/* Hero */}
      <section className="section-bg py-12 md:py-16 border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            Browse {categories.length} Job Categories in Kenya
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
            Explore career opportunities across every major industry in Kenya. From technology and healthcare to finance and government, find the perfect job in your field.
          </p>

          {/* Search Box */}
          <form action="/jobs" method="GET" className="max-w-xl mx-auto">
            <div className="flex items-center bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500">
              <Search className="w-4 h-4 text-gray-400 ml-4" />
              <input
                type="text"
                name="search"
                placeholder="Search jobs by keyword, title, or company..."
                className="flex-1 px-4 py-3 text-sm bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 transition text-sm"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <AdBanner slot="1111111111" className="my-4" />

      {/* Categories Grid */}
      <section className="section-bg py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800">All Job Categories</h2>
              <p className="text-sm text-gray-500 mt-1">
                {categories.length} categories &middot; {totalJobs}+ active listings
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-sm text-gray-500">
              <Link href="/locations/nairobi" className="hover:text-emerald-600 transition">Browse by Location</Link>
              <span className="text-gray-300">|</span>
              <Link href="/government-jobs" className="hover:text-emerald-600 transition">Government Jobs</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.slug] || Briefcase;
              return (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="group bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60 hover:border-emerald-300/60 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <span className="w-10 h-10 shrink-0 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition">
                      <IconComponent className="w-5 h-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-gray-800 group-hover:text-emerald-600 transition truncate">
                        {category.label}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {category.jobCount} {category.jobCount === 1 ? 'job' : 'jobs'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition mt-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <AdBanner slot="3333333333" className="my-4" />

      {/* SEO Content Section */}
      <section className="section-bg py-12 border-t border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/60">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-4">Find Your Next Job by Industry</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              JobBoard Kenya organises job listings into {categories.length} comprehensive categories covering every major industry in the Kenyan economy. Whether you&apos;re a software engineer looking for tech roles in Nairobi&apos;s Silicon Savannah, a healthcare professional seeking hospital positions across the country, or a finance expert targeting banking jobs in the capital, our category pages make it easy to find opportunities that match your skills and experience.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Each category page displays all active job listings within that industry, complete with detailed information about the role, requirements, salary range, and application instructions. You can further filter by location, employment type, experience level, and more. Our categories span both the formal and informal sectors, including opportunities in government, NGOs, international organisations, startups, and established corporations.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              The Kenyan job market is diverse and growing rapidly, driven by sectors such as information technology, financial services, agriculture, manufacturing, and healthcare. By browsing our curated category pages, you gain a clear overview of available positions in your field and can apply directly to employers. New jobs are added daily, so be sure to check back often or set up job alerts to be notified when new positions in your category are posted.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/blog" className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60 hover:border-emerald-300/60 transition group text-center">
              <BookOpen className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-gray-800 group-hover:text-emerald-600 transition">Career Blog</h3>
              <p className="text-xs text-gray-500 mt-1">Expert advice and job market insights</p>
            </Link>
            <Link href="/locations/nairobi" className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60 hover:border-emerald-300/60 transition group text-center">
              <MapPin className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-gray-800 group-hover:text-emerald-600 transition">Jobs by Location</h3>
              <p className="text-xs text-gray-500 mt-1">Browse opportunities in all 47 counties</p>
            </Link>
            <Link href="/government-jobs" className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60 hover:border-emerald-300/60 transition group text-center">
              <Landmark className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-gray-800 group-hover:text-emerald-600 transition">Government Jobs</h3>
              <p className="text-xs text-gray-500 mt-1">National and county government vacancies</p>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}