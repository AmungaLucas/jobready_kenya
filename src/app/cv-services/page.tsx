import { Metadata } from 'next';
import Link from 'next/link';
import { generateWebPageJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';
import {
  FileText,
  MailOpen,
  Linkedin,
  Bot,
  Newspaper,
  Lightbulb,
  HelpCircle,
  Search,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const revalidate = 86400;

const title = 'Professional CV Writing Services in Kenya - From KSh 1,500 | JobBoard Kenya';
const description = 'Affordable, ATS-optimised CV writing services in Kenya from KSh 1,500. Professional cover letters, LinkedIn profile optimisation, and industry-specific CV rewrites by experienced Kenyan writers.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/cv-services` },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/cv-services`,
    siteName: 'JobBoard Kenya',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title, description },
};

export default function CvServicesPage() {
  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'CV Services', url: '/cv-services' },
  ]);

  const webPageLd = generateWebPageJsonLd({
    name: 'Professional CV Writing Services in Kenya',
    description,
    url: '/cv-services',
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
            <span className="text-gray-700 font-medium">CV Services</span>
          </nav>
        </div>
      </section>

      {/* Hero */}
      <section className="section-bg py-12 md:py-16 border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            Professional CV Writing Services in Kenya
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-4">
            Stand out from thousands of applicants with a professionally written, ATS-optimised CV. In Kenya&apos;s competitive job market, where a single listing can attract hundreds of qualified candidates, your CV is often the only chance you have to make a first impression on a recruiter. Our expert writers understand exactly what Kenyan hiring managers look for — from the formatting preferences of government ministries and parastatals to the expectations of multinational companies and fast-growing tech startups in Nairobi. Trusted by over 5,000 Kenyan job seekers across all industries and career levels, our CV writing service has helped professionals land interviews at organisations including Safaricom, Equity Bank, KCB Group, UN agencies, and county governments throughout all 47 counties.
          </p>
          <p className="text-base text-gray-600 leading-relaxed max-w-2xl mx-auto mb-6">
            Whether you are a fresh graduate applying for your first role, a mid-career professional seeking a promotion, or a senior executive pursuing board-level opportunities, we craft documents that showcase your unique value and get results. Our team combines deep knowledge of the Kenyan employment landscape with international CV best practices to deliver documents that pass Applicant Tracking Systems and impress human recruiters alike.
          </p>
          <div className="inline-flex items-baseline gap-2 bg-emerald-50 px-6 py-3 rounded-full border border-emerald-200/60 mb-6">
            <span className="text-sm text-gray-600">Starting from</span>
            <span className="text-2xl font-extrabold text-emerald-600">KSh 1,500</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#pricing" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-lg transition text-sm shadow-md shadow-emerald-200">
              View Pricing Plans
            </a>
            <Link href="/blog" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition flex items-center gap-1">
              Read Free CV Tips <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section-bg py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* What You Get */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/60">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-6">What You Get</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Our CV writing service is designed specifically for the Kenyan job market. Every document we produce is crafted by professional writers who understand what Kenyan recruiters and hiring managers look for. We don&apos;t just rewrite your CV — we transform it into a powerful marketing tool that showcases your achievements, aligns with industry expectations, and passes through Applicant Tracking Systems with ease. Our team has helped thousands of job seekers across Nairobi, Mombasa, Kisumu, Nakuru, and all 47 counties land interviews at top employers including Safaricom, Equity Bank, KCB, UN agencies, and government ministries. Each document is tailored to your unique career trajectory, ensuring that your skills, experience, and potential are communicated with maximum impact to the right audience.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <span className="w-10 h-10 shrink-0 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">Professional CV Rewrite</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We completely restructure and rewrite your CV using modern, achievement-focused formatting. Your new CV will highlight measurable accomplishments, use powerful action verbs, and present your career history in a way that immediately captures a recruiter&apos;s attention. We eliminate generic language, optimise keyword density for ATS compatibility, and ensure the layout is clean and easy to scan in under 10 seconds. Whether you need a one-page CV for an entry-level role or a comprehensive executive document, our writers adapt the format to suit your career stage and target positions in the Kenyan market.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-10 h-10 shrink-0 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <MailOpen className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">Custom Cover Letter</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Every job application in Kenya deserves a tailored cover letter that connects your specific experience to the role. Our writers craft a custom cover letter that addresses the employer&apos;s needs, demonstrates your understanding of the organisation, and positions you as the ideal candidate. We write in a professional yet engaging tone that reflects Kenyan business communication standards. A well-written cover letter can be the deciding factor when recruiters are choosing between candidates with similar qualifications, and we make sure yours tells a compelling story about why you are the perfect fit for the position.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-10 h-10 shrink-0 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Linkedin className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">LinkedIn Profile Optimisation</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    LinkedIn is increasingly used by Kenyan recruiters to source candidates, especially for mid-level and senior positions. We optimise your LinkedIn headline, summary, experience descriptions, and skills section to improve your visibility in recruiter searches. Your profile will be transformed from a digital resume into a compelling professional brand that attracts inbound opportunities from hiring managers across East Africa. With Kenya&apos;s growing tech ecosystem and the rise of remote work, a strong LinkedIn presence is no longer optional — it is a critical component of your job search strategy.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-10 h-10 shrink-0 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Bot className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">ATS Optimisation</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Over 75% of Kenyan employers now use Applicant Tracking Systems to filter CVs before a human ever reads them. Our ATS optimisation ensures your CV contains the right keywords, formatting, and structure to pass through systems like Workday, Greenhouse, and Taleo. We test your CV against common ATS algorithms used by Kenyan companies, government agencies, and international organisations operating in the country. This means your application won&apos;t be filtered out by automated software, giving you a significantly higher chance of reaching the interview stage where your personality and skills can truly shine.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/60">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-6">How It Works</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-8">
              Getting a professionally written CV has never been easier. Our streamlined three-step process is designed to be hassle-free, so you can focus on preparing for your next interview while we handle the paperwork. We&apos;ve served thousands of clients across Kenya and refined our process to be as efficient and convenient as possible, whether you&apos;re in Nairobi CBD or a remote part of the country. The entire process is conducted online, so there is no need to visit any office or schedule in-person meetings — everything from document submission to final delivery happens through our secure digital platform, accessible from any device with an internet connection.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <span className="w-12 h-12 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-extrabold mb-4">1</span>
                <h3 className="text-sm font-bold text-gray-800 mb-2">Upload Your Current CV</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Upload your existing CV through our secure portal along with any target job descriptions you&apos;re interested in. If you don&apos;t have a CV yet, simply fill out a short questionnaire about your education, work experience, skills, and career goals. The more information you provide, the better we can tailor your documents. You can also share your LinkedIn profile URL for additional context about your professional background. We accept documents in Word, PDF, and plain text formats, and our system securely stores all your information in compliance with Kenya&apos;s data protection regulations.
                </p>
              </div>
              <div className="text-center">
                <span className="w-12 h-12 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-extrabold mb-4">2</span>
                <h3 className="text-sm font-bold text-gray-800 mb-2">Expert Review &amp; Writing</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  A professional writer specialising in your industry reviews your information and crafts your new CV, cover letter, and LinkedIn profile. Our writers are experienced professionals with backgrounds in recruitment, HR, and career coaching across the Kenyan market. They understand the nuances of different industries — from banking and telecoms to NGOs and government — and tailor each document accordingly. During this stage, your writer may also reach out with clarifying questions to ensure every detail is captured accurately, especially for technical roles that require specific certifications or project descriptions.
                </p>
              </div>
              <div className="text-center">
                <span className="w-12 h-12 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-extrabold mb-4">3</span>
                <h3 className="text-sm font-bold text-gray-800 mb-2">Receive &amp; Revise</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Receive your professionally written documents via email within 48 hours. Review everything and request up to two rounds of revisions at no extra cost. We want you to be completely satisfied with the final product. Once approved, you&apos;ll receive your CV in both PDF and Word formats, ready to submit to employers. Many of our clients report receiving interview calls within the first week of using their new CVs. If you need any adjustments after receiving your documents, simply reply to the delivery email and your writer will make the changes promptly.
                </p>
              </div>
            </div>
          </div>

          {/* Who It's For */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/60">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Who It&apos;s For</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Whether you&apos;re entering the Kenyan job market for the first time or you&apos;re a seasoned executive looking to take the next step, our CV writing service is tailored to your specific career stage. We understand that a fresh graduate&apos;s CV looks fundamentally different from a CEO&apos;s, and our writers are trained to adapt their approach based on where you are in your professional journey. Every career stage comes with unique challenges — from conveying potential when you lack experience to distilling decades of leadership into a concise narrative — and we have the expertise to address each one effectively.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">Fresh Graduates</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  If you&apos;ve just completed your degree, diploma, or certificate from a Kenyan university, college, or technical institution, we&apos;ll help you create a CV that highlights your education, internships, volunteer work, and transferable skills. Many Kenyan graduates struggle to stand out because their CVs focus on responsibilities rather than achievements. We&apos;ll reposition your academic projects, campus leadership roles, and any part-time work to show employers your potential and readiness to contribute. We also help you articulate the value of your education in a way that resonates with Kenyan employers who may not be familiar with your specific institution or programme.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">Mid-Career Professionals</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  With 3 to 15 years of experience, your CV needs to demonstrate progressive responsibility, leadership, and measurable impact. We&apos;ll restructure your CV to emphasise career growth, quantify your achievements with specific metrics, and position you for senior roles. Whether you&apos;re aiming for a promotion internally or looking to switch employers for better opportunities, a professionally written CV can make the difference between being overlooked and getting the interview. We also help mid-career professionals address common challenges such as employment gaps, career stagnation, and the need to refocus their narrative for a new industry or functional area.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">Senior Executives</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Executive-level CVs require a fundamentally different approach. We create a compelling narrative around your leadership philosophy, strategic vision, and board-level contributions. Your executive CV will be designed for C-suite roles, director positions, and senior management opportunities in Kenya&apos;s top organisations. We also prepare you with an executive bio and a tailored cover letter that speaks to boards and search firms. Our executive service is particularly valuable for leaders transitioning between sectors — for example, from the public sector to private industry — where the communication style and expectations differ significantly.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">Career Changers</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Transitioning to a new industry or role is one of the most challenging CV writing tasks. We specialise in repositioning your existing experience to highlight transferable skills relevant to your target field. Whether you&apos;re moving from teaching to corporate training, from engineering to product management, or from the public sector to private industry, we&apos;ll craft a CV that bridges the gap and makes your career change feel like a natural, logical progression. We also help you identify and articulate skills you may not realise are valuable in your new field, giving you the confidence to apply for roles that might have seemed out of reach.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Table */}
          <div id="pricing" className="bg-white/70 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/60">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Pricing Plans</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-8">
              We offer three transparent pricing tiers designed to fit every budget. All plans include ATS optimisation and delivery within 48 hours. Choose the plan that best matches your career needs. Every plan comes with a satisfaction guarantee — if you&apos;re not happy with the results, we&apos;ll revise your documents until you are. Payment is easy via M-Pesa, bank transfer, or card. We believe that professional CV writing should be accessible to all Kenyans, which is why our pricing is significantly lower than international services while delivering the same — or better — quality tailored specifically for the local market. There are no hidden fees, no upselling, and no surprise charges at any point in the process.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic */}
              <div className="rounded-xl border border-gray-200/60 p-6 flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Basic</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-extrabold text-gray-800">KSh 1,500</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-3 mb-6 flex-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Professional CV rewrite (1-2 pages)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>ATS keyword optimisation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>PDF and Word delivery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>1 round of revisions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>48-hour turnaround</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-400 mb-4">Best for entry-level and fresh graduates</p>
                <a href="#cta" className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition text-sm">
                  Get Started
                </a>
              </div>

              {/* Standard */}
              <div className="rounded-xl border-2 border-emerald-600 p-6 flex flex-col relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Standard</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-extrabold text-gray-800">KSh 3,000</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-3 mb-6 flex-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Professional CV rewrite (2-3 pages)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Custom cover letter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>ATS keyword optimisation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>PDF and Word delivery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>2 rounds of revisions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>48-hour turnaround</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-400 mb-4">Best for mid-career professionals</p>
                <a href="#cta" className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition text-sm">
                  Get Started
                </a>
              </div>

              {/* Premium */}
              <div className="rounded-xl border border-gray-200/60 p-6 flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Premium</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-extrabold text-gray-800">KSh 5,000</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-3 mb-6 flex-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Executive CV rewrite (3+ pages)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Custom cover letter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>LinkedIn profile optimisation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>ATS keyword optimisation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>PDF, Word, and plain text delivery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Unlimited revisions for 7 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>48-hour turnaround</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-400 mb-4">Best for senior executives and managers</p>
                <a href="#cta" className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition text-sm">
                  Get Started
                </a>
              </div>
            </div>
          </div>

          {/* Why JobBoard Kenya */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/60">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Why Choose JobBoard Kenya for Your CV</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Not all CV writing services are created equal. Many generic online services produce CVs that look professional but fail to account for the specific expectations of Kenyan employers, government hiring processes, and the unique dynamics of the local job market. At JobBoard Kenya, we combine deep local knowledge with international best practices to deliver CVs that actually get results. Our writers don&apos;t just follow templates — they craft each document from scratch based on your individual career story, target roles, and industry requirements, ensuring that your CV stands out for all the right reasons.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">ATS-Tested Templates</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Every CV template we use has been tested against the most common Applicant Tracking Systems used by Kenyan employers, including Workday, Oracle Taleo, SAP SuccessFactors, and BambooHR. We avoid graphics, tables, and complex formatting that cause ATS parsing errors. The result is a CV that looks great to human recruiters and passes automated screening with flying colours, giving you the best possible chance of reaching the interview stage. Our continuous testing process means we stay up to date with the latest ATS algorithm changes and employer preferences.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">Industry-Specific Writers</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Our team includes writers with direct experience in technology, healthcare, finance, engineering, education, NGOs, government, hospitality, and more. When you order, we match you with a writer who understands your industry&apos;s terminology, hiring norms, and what recruiters in that sector value most. This ensures your CV speaks the language of your target employers and demonstrates genuine domain expertise. For specialised fields like medicine, law, and ICT, this industry-specific knowledge makes a significant difference in how your qualifications are perceived.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">Kenya Market Knowledge</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We understand the Kenyan job market inside and out — from the specific formats preferred by government recruitment agencies like the Public Service Commission to the expectations of multinational companies operating in Nairobi. We know what salary ranges to suggest, which professional certifications carry weight locally, and how to position international experience for Kenyan employers. This local expertise is something no generic CV writing service can replicate, and it gives our clients a meaningful advantage in a competitive hiring landscape.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">48-Hour Turnaround</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We know that job opportunities in Kenya move quickly, and a delayed application can mean missing out entirely. That&apos;s why we guarantee delivery within 48 hours of receiving your information. For urgent requests, we also offer a 24-hour expedited service. Our efficient process and dedicated team ensure that speed never comes at the expense of quality — every CV we deliver meets the same high professional standards. We also offer flexible communication channels including email, WhatsApp, and phone support for clients who prefer to discuss their requirements directly.
                </p>
              </div>
            </div>
          </div>

          {/* CTA with Email Input */}
          <div id="cta" className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-6 md:p-8 border border-emerald-200/60 text-center">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-3">Ready to Transform Your CV?</h2>
            <p className="text-sm text-gray-600 mb-6 max-w-lg mx-auto">
              Join thousands of Kenyan professionals who&apos;ve landed their dream jobs with a professionally written CV. Enter your email below to get started, and our team will reach out within 24 hours with next steps. Whether you are actively applying for roles or simply want to refresh your professional documents for future opportunities, there is no better time to invest in your career. A professionally written CV is not an expense — it is an investment that pays for itself the moment you receive your first interview invitation. You can also <Link href="/jobs" className="text-emerald-600 hover:text-emerald-700 font-medium">browse current job openings</Link> while we prepare your documents, or read our <Link href="/blog" className="text-emerald-600 hover:text-emerald-700 font-medium">career advice blog</Link> for tips on acing your next interview. If you have questions about the process, visit our <Link href="/faq" className="text-emerald-600 hover:text-emerald-700 font-medium">FAQ page</Link> for detailed answers.
            </p>
            <form action="/api/subscribe" method="POST" className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
                className="flex-1 w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition text-sm whitespace-nowrap shadow-md shadow-emerald-200"
              >
                Get Started
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-3">
              No spam. We&apos;ll only contact you about your CV service request.
            </p>
          </div>

          {/* Related Career Resources */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/60">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-4">Related Career Resources</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              While your CV is being prepared, explore our free career resources to sharpen your job search skills. Our blog features in-depth guides written specifically for the Kenyan job market, covering everything from interview preparation to salary negotiation strategies. These articles complement our CV writing service and help you present yourself confidently at every stage of the hiring process. We regularly update our content to reflect the latest trends, including the impact of technology on recruitment in Kenya, the growing demand for specific skills in sectors like fintech and agritech, and practical advice for navigating government recruitment processes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/blog" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200/60 hover:border-emerald-300/60 transition group">
                <Newspaper className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-sm font-medium text-gray-800 group-hover:text-emerald-600 transition">Browse All Career Articles</span>
                  <p className="text-xs text-gray-500">Tips, guides, and Kenya job market insights</p>
                </div>
              </Link>
              <Link href="/blog?category=Career Advice" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200/60 hover:border-emerald-300/60 transition group">
                <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-sm font-medium text-gray-800 group-hover:text-emerald-600 transition">Career Advice for Kenyans</span>
                  <p className="text-xs text-gray-500">Expert guidance for every career stage</p>
                </div>
              </Link>
              <Link href="/faq" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200/60 hover:border-emerald-300/60 transition group">
                <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-sm font-medium text-gray-800 group-hover:text-emerald-600 transition">Frequently Asked Questions</span>
                  <p className="text-xs text-gray-500">Answers about jobs, applications, and more</p>
                </div>
              </Link>
              <Link href="/jobs" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200/60 hover:border-emerald-300/60 transition group">
                <Search className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-sm font-medium text-gray-800 group-hover:text-emerald-600 transition">Browse Current Job Openings</span>
                  <p className="text-xs text-gray-500">Thousands of verified listings across Kenya</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
