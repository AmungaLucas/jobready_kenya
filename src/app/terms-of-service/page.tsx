import { Metadata } from 'next';
import Link from 'next/link';
import { generateWebPageJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';

export const revalidate = 86400;

const title = 'Terms of Service - JobBoard Kenya Terms & Conditions | JobBoard Kenya';
const description = 'Read the terms of service for JobBoard Kenya. Understand your rights and responsibilities when using our job search platform.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/terms-of-service` },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/terms-of-service`,
    siteName: 'JobBoard Kenya',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title, description },
};

export default function TermsOfServicePage() {
  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Terms of Service', url: '/terms-of-service' },
  ]);

  const webPageLd = generateWebPageJsonLd({
    name: 'Terms of Service - JobBoard Kenya',
    description,
    url: '/terms-of-service',
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
            <span className="text-gray-700 font-medium">Terms of Service</span>
          </nav>
        </div>
      </section>

      {/* Hero */}
      <section className="section-bg py-12 border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-500">Last updated: January 15, 2026</p>
        </div>
      </section>

      <section className="section-bg py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 md:p-10 border border-white/60 space-y-8 text-sm text-gray-600 leading-relaxed">

            <div>
              <p className="mb-4">
                Welcome to JobBoard Kenya. These Terms of Service (&quot;Terms&quot;) govern your access to and use of jobboard.ke (the &quot;Site&quot;) and all services, features, and content provided through the Site (collectively, the &quot;Services&quot;). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use our Services. We encourage you to read these Terms carefully and to check this page periodically for changes.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">1. Use of Services</h2>
              <p className="mb-3">
                JobBoard Kenya provides an online platform that aggregates and displays job listings, career opportunities, scholarships, and related content for job seekers in Kenya. You may use our Services to search for jobs, read career resources, and access other features as described on the Site. You must be at least 18 years old to create an account or use certain features of our Services. By using our Services, you represent and warrant that you are at least 18 years of age.
              </p>
              <p>
                You agree to use our Services only for lawful purposes and in accordance with these Terms. You shall not use the Services in any way that violates any applicable local, national, or international law or regulation. You shall not attempt to gain unauthorized access to any portion of the Services, other accounts, computer systems, or networks connected to the Services through hacking, password mining, or any other means. You shall not engage in any activity that interferes with or disrupts the Services or servers and networks connected to the Services.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">2. User Accounts</h2>
              <p className="mb-3">
                Certain features of our Services may require you to create a user account. When creating an account, you must provide accurate, current, and complete information and keep this information up to date. You are responsible for safeguarding your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
              </p>
              <p>
                We reserve the right to suspend or terminate your account if any information provided proves to be inaccurate, not current, or incomplete, or if we have reasonable grounds to suspect fraud, abuse, or violation of these Terms. Account termination may result in the loss of access to your saved jobs, job alerts, application history, and other account-related data.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">3. Job Listings and Content</h2>
              <p className="mb-3">
                JobBoard Kenya acts as an intermediary platform that aggregates job listings from various sources including direct employer submissions, public job boards, and organizational websites. While we strive to verify the accuracy and legitimacy of all listings, we do not guarantee the accuracy, completeness, or reliability of any job posting, employer information, or other content displayed on the Site. Job seekers are encouraged to independently verify the legitimacy of any opportunity before applying or providing personal information.
              </p>
              <p className="mb-3">
                Employers and organizations posting jobs on our platform are responsible for the accuracy and legality of their listings. JobBoard Kenya does not act as an employer, recruiter, or agent for any employer or job seeker, and we are not a party to any employment agreement between job seekers and employers. We are not responsible for any employment decisions, including hiring, firing, compensation, benefits, or working conditions, which are solely at the discretion of the employer.
              </p>
              <p>
                All content on the Site, including but not limited to text, graphics, logos, images, data compilations, and software, is the property of JobBoard Kenya or its content suppliers and is protected by Kenyan and international copyright laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Site without our prior written consent, except as permitted by applicable law or as reasonably necessary for your personal, non-commercial use of the Services.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">4. Prohibited Conduct</h2>
              <p className="mb-3">
                In using our Services, you agree not to post, upload, or transmit any content that is unlawful, defamatory, libelous, abusive, threatening, harmful, vulgar, obscene, or otherwise objectionable. You shall not post fraudulent, misleading, or deceptive job listings, including listings that misrepresent the employer, compensation, requirements, or nature of the work. You shall not use the Services to collect personal information about other users without their consent or to send unsolicited communications.
              </p>
              <p>
                You shall not use automated systems, bots, scrapers, or other automated means to access the Services for any purpose without our express written permission. This includes using automated tools to extract job listings, user data, or other content from the Site. Systematic retrieval of data or content from the Services, whether to create or compile a collection, compilation, database, or directory, is prohibited without our written consent.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">5. Intellectual Property</h2>
              <p className="mb-3">
                The JobBoard Kenya name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of JobBoard Kenya or its affiliates. You may not use such marks without the prior written permission of JobBoard Kenya. All other names, logos, product and service names, designs, and slogans on the Site are the trademarks of their respective owners who may or may not be affiliated with, connected to, or sponsored by JobBoard Kenya.
              </p>
              <p>
                Any feedback, comments, ideas, improvements, or suggestions you provide regarding the Services (&quot;Feedback&quot;) shall be the sole and exclusive property of JobBoard Kenya. You hereby irrevocably assign to us all right, title, and interest in and to the Feedback and waive all claims to any compensation for such Feedback. We may use, copy, modify, publish, or distribute the Feedback without limitation and without any obligation to you.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">6. Limitation of Liability</h2>
              <p className="mb-3">
                To the maximum extent permitted by applicable law, JobBoard Kenya shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Services, any conduct or content of any third party on the Services, any content obtained from the Services, or unauthorized access, use, or alteration of your transmissions or content.
              </p>
              <p>
                In no event shall JobBoard Kenya&apos;s total aggregate liability to you for all claims arising out of or relating to the use of the Services exceed the amount of one hundred Kenya shillings (KES 100) or the equivalent in your local currency. This limitation of liability applies whether the alleged liability is based on contract, tort, negligence, strict liability, or any other basis, even if JobBoard Kenya has been advised of the possibility of such damage.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">7. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless JobBoard Kenya, its affiliates, officers, directors, employees, agents, licensors, and suppliers from and against any claims, actions, demands, liabilities, and settlements including but not limited to legal and accounting fees, arising out of or relating to your use of the Services, your violation of these Terms, or your violation of any rights of a third party or applicable law.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">8. Modifications and Interruptions</h2>
              <p>
                We reserve the right to modify, suspend, or discontinue the Services (or any part thereof) at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Services. We also reserve the right to impose limits on certain features and services or restrict your access to parts or all of the Services without notice or liability.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">9. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the Republic of Kenya, without regard to its conflict of law principles. Any dispute arising out of or related to these Terms or the Services shall be subject to the exclusive jurisdiction of the courts of Kenya. You agree to submit to the personal jurisdiction of such courts and waive any objection to venue in such courts.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">10. Contact Information</h2>
              <p className="mb-3">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                <p><span className="font-medium text-gray-700">Email:</span> info@jobboard.ke</p>
                <p><span className="font-medium text-gray-700">Phone:</span> +254 700 000 000</p>
                <p><span className="font-medium text-gray-700">Address:</span> Nairobi, Kenya</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}