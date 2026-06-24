import { Metadata } from 'next';
import Link from 'next/link';
import { generateWebPageJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';

export const revalidate = 86400;

const title = 'Frequently Asked Questions - JobBoard Kenya | How to Find Jobs in Kenya';
const description = 'Get answers to the most common questions about finding jobs in Kenya, applying for government positions, writing a CV that passes ATS, salary expectations, interview preparation, and using JobBoard Kenya.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/faq` },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/faq`,
    siteName: 'JobBoard Kenya',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title, description },
};

const faqs = [
  {
    question: 'How do I find jobs on JobBoard Kenya?',
    answer: 'Finding jobs on JobBoard Kenya is straightforward and designed to help you discover opportunities quickly. You can browse all active listings on our Jobs page, filter by category, location, employment type, or experience level to narrow down results that match your profile. Use the search bar at the top of any page to search by job title, company name, or keyword. Each job listing includes detailed information about the role, requirements, salary range where available, application deadline, and clear instructions on how to apply. You can also browse jobs by category on our Categories page, which organises all listings across 43 industries, or explore opportunities by location to find positions near you. We add new verified listings daily, so checking back regularly or setting up job alerts ensures you never miss a relevant opening.'
  },
  {
    question: 'How do I apply for government jobs in Kenya?',
    answer: 'Applying for government jobs in Kenya follows a specific process managed by the Public Service Commission (PSC) for national positions and respective County Public Service Boards for county-level roles. On JobBoard Kenya, we aggregate all verified government job listings in one place on our dedicated Government Jobs page, where you can browse current openings sorted by posting date. To apply, you typically need to visit the official government recruitment portal (publicservice.go.ke for national positions) and create an account. You will be required to upload your CV, academic certificates, national ID, and sometimes a cover letter. Government application deadlines are strictly enforced, so it is important to apply well before the closing date. Our listings include direct links to the official application portals and clear instructions specific to each vacancy, ensuring you always apply through the correct channel.'
  },
  {
    question: 'How do I write a CV that passes ATS in Kenya?',
    answer: 'An Applicant Tracking System (ATS) is software used by employers to automatically scan and filter CVs before a human recruiter reviews them. To pass ATS, your CV should use a clean, single-column layout without tables, graphics, headers/footers, or complex formatting that confuses the parsing algorithm. Use standard section headings like "Work Experience," "Education," and "Skills" rather than creative alternatives. Include relevant keywords from the job description naturally throughout your CV — for example, if the listing mentions "project management" and "stakeholder engagement," ensure those exact phrases appear in your experience descriptions. Save your CV as a Word document (.docx) rather than PDF, as most ATS systems parse Word files more reliably. Avoid using images, logos, or fancy fonts, and keep your formatting consistent with standard bullet points. If you need professional help, our CV Writing Service specialises in creating ATS-optimised documents specifically for the Kenyan job market.'
  },
  {
    question: 'What is the average salary in Kenya?',
    answer: 'Salaries in Kenya vary significantly depending on the industry, experience level, location, and type of employer. Entry-level positions typically pay between KSh 20,000 and KSh 40,000 per month, while mid-career professionals with 3 to 7 years of experience can expect KSh 60,000 to KSh 150,000. Senior professionals and managers often earn between KSh 150,000 and KSh 500,000, with executive-level roles exceeding KSh 500,000 monthly. Nairobi-based positions generally pay 20-40% more than similar roles in other counties due to the higher cost of living and concentration of multinational companies. The technology sector, particularly software engineering and data science, tends to offer the highest starting salaries for graduates. Government jobs follow structured salary scales based on job groups defined by the Salaries and Remuneration Commission. International organisations and NGOs operating in Kenya typically pay above local market rates. Many jobs on JobBoard Kenya include salary range information to help you make informed decisions before applying.'
  },
  {
    question: 'How do I prepare for job interviews in Kenya?',
    answer: 'Preparing for a job interview in Kenya requires thorough research and practice. Start by researching the company thoroughly — understand their products or services, recent news, organisational culture, and the specific challenges they face. Review the job description and prepare concrete examples from your experience that demonstrate how you meet each requirement, using the STAR method (Situation, Task, Action, Result) to structure your responses. Dress professionally; business formal is expected for corporate roles, while smart casual may be acceptable for tech startups and creative industries. Arrive 10 to 15 minutes early for in-person interviews, and test your technology beforehand for virtual interviews. Prepare thoughtful questions to ask the interviewer about the role, team, and company direction — this shows genuine interest and engagement. Common questions in Kenyan interviews include "Tell me about yourself," "Why do you want to work here?", and "Where do you see yourself in five years?" Practice your answers out loud, and if possible, do a mock interview with a friend or mentor.'
  },
  {
    question: 'Is JobBoard Kenya free for job seekers?',
    answer: 'Yes, JobBoard Kenya is completely free for job seekers. You can browse all job listings, view full job descriptions, and access application instructions without creating an account or paying any fees. There are no hidden charges, premium tiers, or paywalls that restrict access to job information. We believe that every Kenyan deserves free access to verified employment opportunities, which is why our core job search functionality remains open to everyone. We also provide free career resources through our blog, including articles on CV writing, interview preparation, salary negotiation, and Kenya-specific job market insights. Our optional paid services, such as professional CV writing and LinkedIn optimisation, are entirely separate from the free job search experience and are designed for job seekers who want additional professional support. Whether you choose to use our paid services or not, you will always have full access to every job listing on our platform.'
  },
  {
    question: 'How do I get job alerts on JobBoard Kenya?',
    answer: 'You can receive job alerts through our email newsletter subscription. Enter your email address in the subscription form available in the footer of every page or on our dedicated subscribe page, and you will receive regular updates about new job postings that match your interests. Our newsletter includes curated job listings across various categories and locations, along with career tips and job market updates specific to Kenya. You can also subscribe to specific category pages or location pages to receive notifications about new postings in your preferred industry or county. Additionally, following JobBoard Kenya on social media platforms like Twitter, LinkedIn, and Facebook ensures you see new job postings as they are published. For the most real-time experience, bookmark our Jobs page and check back daily, as we add new verified listings every day from employers across all 47 counties.'
  },
  {
    question: 'What types of jobs are available on JobBoard Kenya?',
    answer: 'JobBoard Kenya features a comprehensive range of employment opportunities spanning 43 job categories and 468 subcategories. This includes full-time positions, part-time jobs, contract roles, freelance opportunities, internships, apprenticeships, and volunteer positions. Our listings cover every major industry in Kenya: technology and IT, healthcare and medical, finance and accounting, engineering, education and training, marketing and sales, legal and compliance, hospitality and tourism, agriculture, logistics and supply chain, construction, manufacturing, government, NGOs, media and communications, creative arts, and many more. We list opportunities from diverse employers including multinational corporations, local businesses, government ministries and agencies, county governments, international organisations, UN agencies, startups, and non-profits. Positions range from entry-level roles for fresh graduates to senior executive and C-suite appointments. We also list remote and work-from-home positions that are increasingly available to Kenyan professionals.'
  },
  {
    question: 'How do I verify if a job listing is legitimate?',
    answer: 'Verifying job legitimacy is crucial, as job scams are unfortunately common in Kenya. At JobBoard Kenya, every listing goes through our verification process before publication, but it is still important to exercise personal diligence. Legitimate employers will never ask you to pay money to secure a job — if any listing or recruiter requests payment for application processing, training materials, or medical exams before you are hired, it is almost certainly a scam. Verify the company exists by checking their website, physical address, and registration with the Business Registration Service (BRS). Cross-reference the job posting on the company’s official website or their verified social media pages. Be cautious of listings that offer unusually high salaries for minimal qualifications, have vague job descriptions, or use free email addresses (Gmail, Yahoo) instead of company email domains. Legitimate government jobs are posted on official portals like publicservice.go.ke. If something feels off, trust your instincts and report the listing to us through our Contact page.'
  },
  {
    question: 'How do I search for remote jobs in Kenya?',
    answer: 'Finding remote jobs in Kenya has become significantly easier as more companies adopt flexible work arrangements. On JobBoard Kenya, you can filter job listings by the "Remote" option on the Jobs page to see only positions that offer work-from-home or location-independent arrangements. You can also use the search bar with keywords like "remote," "work from home," or "WFH" to discover relevant listings. Many international companies hire Kenyan professionals for remote roles in software development, customer support, digital marketing, content writing, data analysis, and virtual assistance. When applying for remote positions, emphasise your ability to work independently, manage time effectively, and communicate clearly using digital tools. Having a reliable internet connection and a dedicated workspace is often mentioned in remote job requirements. Our blog regularly features articles about remote work opportunities available to Kenyan professionals, including tips on how to find and succeed in location-independent roles.'
  },
  {
    question: 'What documents do I need to apply for jobs in Kenya?',
    answer: 'The documents required for job applications in Kenya vary depending on the employer and type of position, but several documents are commonly requested across most applications. A well-written CV or resume is almost always required, ideally tailored to the specific role you are applying for. A cover letter addressing the hiring manager and connecting your experience to the job requirements is expected for most professional positions. Your National Identity Card (ID) or passport is typically required for verification purposes. Academic certificates and transcripts from your university, college, or technical institution are commonly requested, along with any professional certifications relevant to the role. Some employers, particularly in banking and government, require a Certificate of Good Conduct from the Directorate of Criminal Investigations. For government positions, you may also need your KRA PIN certificate, Kenya Revenue Authority tax compliance certificate, and sometimes a recommendation letter from your local chief or religious leader. It is advisable to keep both digital (PDF) and physical copies of all these documents readily available.'
  },
  {
    question: 'How does the CV matching service work?',
    answer: 'Our professional CV writing service is designed to transform your existing CV into a powerful, ATS-optimised document that significantly increases your chances of landing interviews. The process begins when you upload your current CV or fill out a questionnaire about your experience, education, skills, and career goals. A professional writer specialising in your industry is assigned to your project and conducts a thorough review of your background. They then craft a completely rewritten CV that highlights your achievements with measurable metrics, uses industry-specific keywords optimised for Applicant Tracking Systems, and follows modern formatting standards preferred by Kenyan recruiters. Depending on the plan you choose, the service may also include a custom cover letter and LinkedIn profile optimisation. You receive your documents within 48 hours and can request revisions to ensure complete satisfaction. The service is particularly valuable for career changers, fresh graduates, and professionals who have not updated their CV in several years and need help presenting their experience effectively.'
  },
  {
    question: 'Can I find internships on JobBoard Kenya?',
    answer: 'Yes, JobBoard Kenya lists a wide range of internship opportunities across Kenya. Internships are an excellent way for students, recent graduates, and career changers to gain practical experience, build professional networks, and enhance their employability. To find internships, you can filter jobs by the "Internship" employment type on the Jobs page, or search using keywords like "intern," "attachment," or "industrial training." Our internship listings come from diverse employers including leading corporations like Safaricom, Equity Bank, and KCB Group, government ministries and state corporations, international organisations and UN agencies, tech startups, NGOs, and media houses. Many internships in Kenya last between three and twelve months, with some offering monthly stipends and others being unpaid. We strongly recommend applying to multiple internships simultaneously, as competition can be stiff, especially for positions at well-known organisations. Check our blog for articles specifically about finding and succeeding in internships in the Kenyan context.'
  },
  {
    question: 'How do I negotiate salary in Kenya?',
    answer: 'Salary negotiation is a critical skill that many Kenyan job seekers find challenging, but it can significantly impact your long-term earnings. The first rule is to research market rates for your role, experience level, and industry before any negotiation begins. Use salary information from job listings on JobBoard Kenya, industry salary surveys, and insights from professional networks to establish a realistic range. When the topic arises during the interview process, let the employer state their offer first if possible — this gives you a stronger negotiating position. Present your salary expectation as a range rather than a fixed number, with the lower end being your minimum acceptable figure. Always justify your request by highlighting specific skills, achievements, certifications, or experience that add value to the employer. In Kenya, it is also important to consider the total compensation package beyond base salary, including medical insurance, allowances (housing, transport, meals), retirement benefits, bonuses, and professional development opportunities. Be professional and respectful throughout the negotiation, and be prepared to walk away if the offer significantly undervalues your worth.'
  },
  {
    question: 'What are the most in-demand skills in Kenya 2026?',
    answer: 'The Kenyan job market in 2026 is being shaped by digital transformation, economic diversification, and evolving employer needs across all sectors. Technology skills remain the most sought-after, with software development (particularly in Python, JavaScript, and cloud technologies), data science and analytics, cybersecurity, artificial intelligence and machine learning, and DevOps engineering leading demand. Digital marketing skills including SEO, social media management, content marketing, and performance analytics are highly valued as businesses expand their online presence. In the healthcare sector, nursing, clinical medicine, pharmacy, and health informatics continue to see strong demand. Financial technology (fintech) skills are growing rapidly due to Kenya’s position as a global leader in mobile money innovation. Project management, agile methodologies, and product management are increasingly required across industries. Soft skills such as communication, critical thinking, adaptability, and emotional intelligence are now considered equally important as technical abilities. Green skills related to renewable energy, environmental sustainability, and climate resilience are also emerging as Kenya invests heavily in these areas.'
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': faqs.map(faq => ({
    '@type': 'Question',
    'name': faq.question,
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': faq.answer,
    },
  })),
};

export default function FaqPage() {
  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'FAQ', url: '/faq' },
  ]);

  const webPageLd = generateWebPageJsonLd({
    name: 'Frequently Asked Questions - JobBoard Kenya',
    description,
    url: '/faq',
    dateModified: '2026-01-15',
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Navbar />

      {/* Breadcrumb */}
      <section className="section-bg py-4 border-b border-gray-200/50" style={{ paddingTop: '88px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-medium">FAQ</span>
          </nav>
        </div>
      </section>

      {/* Hero */}
      <section className="section-bg py-12 md:py-16 border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Everything you need to know about finding jobs, applying for positions, and using JobBoard Kenya. Can&apos;t find your answer? <Link href="/contact" className="text-emerald-600 hover:text-emerald-700 font-medium">Contact us</Link>.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-bg py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 overflow-hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer p-5 md:p-6 text-left select-none">
                <h2 className="text-sm font-bold text-gray-800 pr-4">{faq.question}</h2>
                <span className="w-6 h-6 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-open:bg-emerald-100 group-open:text-emerald-600 transition">
                  <i className="fas fa-plus text-xs group-open:hidden"></i>
                  <i className="fas fa-minus text-xs hidden group-open:inline"></i>
                </span>
              </summary>
              <div className="px-5 md:px-6 pb-5 md:pb-6 -mt-1">
                <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* SEO Content + Related Links */}
      <section className="section-bg py-12 border-t border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/60">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-4">Still Have Questions?</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              We are here to help you navigate the Kenyan job market with confidence. Whether you need guidance on writing your CV, preparing for interviews, understanding salary expectations, or finding the right job category for your skills, our team and resources are available to support you. JobBoard Kenya is committed to making job searching easier and more transparent for every Kenyan, from fresh graduates to seasoned executives.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/blog" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200/60 hover:border-emerald-300/60 transition group">
                <i className="fas fa-book-reader text-emerald-600"></i>
                <div>
                  <span className="text-sm font-medium text-gray-800 group-hover:text-emerald-600 transition">Career Blog</span>
                  <p className="text-xs text-gray-500">In-depth guides and tips</p>
                </div>
              </Link>
              <Link href="/cv-services" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200/60 hover:border-emerald-300/60 transition group">
                <i className="fas fa-file-alt text-emerald-600"></i>
                <div>
                  <span className="text-sm font-medium text-gray-800 group-hover:text-emerald-600 transition">CV Services</span>
                  <p className="text-xs text-gray-500">Professional CV writing</p>
                </div>
              </Link>
              <Link href="/jobs" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200/60 hover:border-emerald-300/60 transition group">
                <i className="fas fa-briefcase text-emerald-600"></i>
                <div>
                  <span className="text-sm font-medium text-gray-800 group-hover:text-emerald-600 transition">Browse Jobs</span>
                  <p className="text-xs text-gray-500">Thousands of verified listings</p>
                </div>
              </Link>
              <Link href="/government-jobs" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200/60 hover:border-emerald-300/60 transition group">
                <i className="fas fa-landmark text-emerald-600"></i>
                <div>
                  <span className="text-sm font-medium text-gray-800 group-hover:text-emerald-600 transition">Government Jobs</span>
                  <p className="text-xs text-gray-500">National and county vacancies</p>
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