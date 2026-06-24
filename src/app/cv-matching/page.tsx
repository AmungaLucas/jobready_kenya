import { Metadata } from 'next';
import Link from 'next/link';
import { generateWebPageJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';
import {
  Brain,
  Search,
  TrendingUp,
  Shield,
  Zap,
  Users,
  CheckCircle2,
  ArrowRight,
  FileText,
  Target,
  BarChart3,
} from 'lucide-react';

export const revalidate = 86400;

const title = 'AI CV Matching Service - Find Jobs That Match Your Skills | JobBoard Kenya';
const description = 'Upload your CV and let our AI match you with the best jobs in Kenya. Smart skill-based matching across 43+ categories and 47 counties. Premium feature available in your jobseeker dashboard.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/cv-matching` },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/cv-matching`,
    siteName: 'JobBoard Kenya',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title, description },
};

export default function CvMatchingPage() {
  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'CV Matching', url: '/cv-matching' },
  ]);

  const webPageLd = generateWebPageJsonLd({
    name: 'AI CV Matching Service',
    description,
    url: '/cv-matching',
    dateModified: '2026-01-15',
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />

      {/* Breadcrumb */}
      <section className="section-bg py-4 border-b border-gray-200/50" style={{ paddingTop: '88px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-medium">CV Matching</span>
          </nav>
        </div>
      </section>

      {/* Hero */}
      <section className="section-bg py-12 md:py-16 border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100/70 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Brain className="w-3.5 h-3.5" />
            Premium Feature
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            AI-Powered CV Matching
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Stop scrolling through hundreds of irrelevant listings. Upload your CV once and let our intelligent matching engine find the jobs that truly fit your skills, experience, and career goals across all 47 Kenyan counties.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-bg py-12 border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2 text-center">How CV Matching Works</h2>
          <p className="text-sm text-gray-500 mb-10 text-center max-w-xl mx-auto">
            Our matching engine analyses your CV against every active job listing on JobBoard Kenya and ranks them by relevance to your profile.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-2">1. Upload Your CV</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Upload your current CV or fill out a profile questionnaire in your jobseeker dashboard. Our system parses your skills, qualifications, experience level, and preferred locations automatically. The process takes less than 30 seconds and you only need to do it once.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 mb-4">
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-2">2. AI Analyses &amp; Matches</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Our matching engine compares your profile against every active listing using skill extraction, semantic analysis, and relevance scoring. It considers your experience level, education, technical skills, industry background, location preferences, and salary expectations to calculate a match percentage for each job.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 mb-4">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-2">3. Get Matched Jobs</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Receive a ranked list of jobs sorted by match percentage directly in your dashboard. You can filter by match score, set minimum match thresholds, and opt in to receive WhatsApp or email notifications when new high-match jobs are posted. Apply with a single tap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Matching Features */}
      <section className="section-bg py-12 border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2 text-center">Intelligent Matching Features</h2>
          <p className="text-sm text-gray-500 mb-10 text-center max-w-xl mx-auto">
            Our CV matching engine goes beyond simple keyword matching to deliver truly relevant job recommendations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <Search className="w-5 h-5" />,
                title: 'Skill Extraction',
                desc: 'Automatically identifies and categorises all technical and soft skills from your CV, including industry-specific terminology, tools, certifications, and proficiency levels.',
              },
              {
                icon: <BarChart3 className="w-5 h-5" />,
                title: 'Match Scoring',
                desc: 'Each job receives a percentage match score based on skill overlap, experience alignment, education compatibility, location match, and salary range fit with your expectations.',
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                title: 'Career Path Analysis',
                desc: 'Understands your career trajectory and recommends not just exact matches but also relevant next-step roles that align with your career progression and growth potential.',
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: 'Real-Time Alerts',
                desc: 'Get instant WhatsApp or email notifications when new jobs that match your profile above your set threshold are posted, so you can apply before the deadline.',
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: 'Privacy First',
                desc: 'Your CV data is encrypted and never shared with employers without your explicit consent. You control which parts of your profile are visible when you apply.',
              },
              {
                icon: <Users className="w-5 h-5" />,
                title: 'Category Intelligence',
                desc: 'Leverages our database of 43+ job categories and 468 subcategories to understand the nuanced differences between roles and find the best category fit for your skills.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60 hover:border-emerald-300/60 hover:shadow-sm transition">
                <div className="w-10 h-10 rounded-lg bg-emerald-100/70 flex items-center justify-center text-emerald-700 mb-3">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1.5">{feature.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Gets Analysed */}
      <section className="section-bg py-12 border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2 text-center">What We Analyse in Your CV</h2>
          <p className="text-sm text-gray-500 mb-8 text-center max-w-xl mx-auto">
            Our AI engine examines multiple dimensions of your profile to calculate accurate match scores.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Technical skills and programming languages',
              'Professional certifications and licences',
              'Work experience duration and seniority level',
              'Educational qualifications and institutions',
              'Industry experience and domain knowledge',
              'Location preferences and mobility',
              'Salary expectations vs. job ranges',
              'Soft skills and leadership indicators',
              'Achievements and quantifiable results',
              'Career progression patterns',
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white/70 rounded-lg border border-white/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Matching vs Traditional */}
      <section className="section-bg py-12 border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2 text-center">CV Matching vs. Traditional Job Search</h2>
          <p className="text-sm text-gray-500 mb-8 text-center max-w-xl mx-auto">
            See how AI-powered matching compares to manually browsing job listings.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200/60">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-gray-400">&#x2717;</span> Traditional Job Search
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">&#x2022;</span>Manually scroll through hundreds of listings</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">&#x2022;</span>Hard to tell which jobs match your skills</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">&#x2022;</span>Miss relevant jobs in unexpected categories</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">&#x2022;</span>Time-consuming filtering and searching</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">&#x2022;</span>No personalisation or learning from preferences</li>
              </ul>
            </div>
            <div className="bg-emerald-50/50 rounded-xl p-6 border border-emerald-200/60">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-emerald-600">&#x2713;</span> AI CV Matching
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">&#x2022;</span>Jobs ranked by match percentage automatically</li>
                <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">&#x2022;</span>Cross-category matching finds hidden opportunities</li>
                <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">&#x2022;</span>Real-time alerts for new high-match jobs</li>
                <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">&#x2022;</span>One-tap apply from your dashboard</li>
                <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">&#x2022;</span>Gets smarter as you interact with recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-bg py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-2xl p-8 md:p-12 border border-emerald-200/60">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-4">
              Start Getting Matched Today
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed max-w-lg mx-auto mb-8">
              CV Matching is a premium feature available in your jobseeker dashboard. Create a free account, upload your CV, and let our AI do the heavy lifting. Your perfect job is already waiting on JobBoard Kenya.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/cv-services" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-lg transition text-sm shadow-md shadow-emerald-200 flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/faq" className="border border-gray-300 hover:border-emerald-400 text-gray-700 hover:text-emerald-600 font-medium px-6 py-3 rounded-lg transition text-sm">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}