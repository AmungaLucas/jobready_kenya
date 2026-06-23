import { Metadata } from 'next';
import Link from 'next/link';
import { generateWebPageJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';

export const revalidate = 86400;

const title = 'Privacy Policy - How JobBoard Kenya Protects Your Data | JobBoard Kenya';
const description = 'Read JobBoard Kenya\'s privacy policy. Learn how we collect, use, store, and protect your personal information. Your privacy is our priority.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/privacy-policy`,
    siteName: 'JobBoard Kenya',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title, description },
};

export default function PrivacyPolicyPage() {
  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Privacy Policy', url: '/privacy-policy' },
  ]);

  const webPageLd = generateWebPageJsonLd({
    name: 'Privacy Policy - JobBoard Kenya',
    description,
    url: '/privacy-policy',
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
            <span className="text-gray-700 font-medium">Privacy Policy</span>
          </nav>
        </div>
      </section>

      {/* Hero */}
      <section className="section-bg py-12 border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: January 15, 2026</p>
        </div>
      </section>

      <section className="section-bg py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 md:p-10 border border-white/60 space-y-8 text-sm text-gray-600 leading-relaxed">

            <div>
              <p className="mb-4">
                At JobBoard Kenya (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), we are committed to protecting your privacy and ensuring that your personal information is handled responsibly. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit jobboard.ke (the &quot;Site&quot;). Please read this policy carefully. By using our Site, you consent to the data practices described in this policy. If you do not agree with the terms of this privacy policy, please do not access the Site.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">1. Information We Collect</h2>
              <p className="mb-3">
                We collect information that you provide directly to us when you use our services. This includes personal information such as your name, email address, phone number, and CV or resume content when you choose to submit it. If you sign up for job alerts or newsletters, we collect your email address and notification preferences. When you contact us through our support channels, we collect the information you provide in those communications.
              </p>
              <p className="mb-3">
                We also collect certain information automatically when you visit our Site. This includes your IP address, browser type and version, operating system, referring URLs, pages viewed, links clicked, and the date and time of your visit. We use cookies and similar tracking technologies to collect this information. You can control cookies through your browser settings, though disabling cookies may affect the functionality of certain features on our Site.
              </p>
              <p>
                Additionally, we may collect information from third-party sources, such as publicly available professional profiles or data provided by partner organizations who post job listings on our platform. We use this information primarily to enhance the accuracy and completeness of our job listings and to improve our matching algorithms for job recommendations.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">2. How We Use Your Information</h2>
              <p className="mb-3">
                The personal information we collect serves several specific purposes that are essential to providing our services. We use your information to operate, maintain, and improve our platform, including processing job applications, delivering job alert notifications, and providing customer support. Your email address is used to send you job recommendations, newsletter content, and important updates about our services, and you can opt out of non-essential communications at any time.
              </p>
              <p className="mb-3">
                We use aggregated, non-personally identifiable information for analytics purposes to understand how users interact with our Site, identify popular job categories and locations, and make data-driven decisions about feature development. This helps us continuously improve the user experience and ensure that our platform meets the evolving needs of Kenyan job seekers and employers.
              </p>
              <p>
                We may also use your information to comply with legal obligations, detect and prevent fraud or abuse, enforce our terms of service, and protect the security of our platform and users. In cases where we detect suspicious activity, we may take steps to verify user identity and restrict access to certain features until verification is complete.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">3. Information Sharing and Disclosure</h2>
              <p className="mb-3">
                We do not sell, trade, or rent your personal information to third parties. However, we may share your information in specific circumstances. When you apply for a job through our platform, we share the relevant application details with the employer who posted the listing. When you submit your CV, it is shared only with employers you have explicitly applied to and is not made publicly visible without your consent.
              </p>
              <p className="mb-3">
                We may share information with trusted third-party service providers who assist us in operating our platform, such as hosting providers, email delivery services, analytics providers, and payment processors. These service providers are contractually obligated to use your information only for the specific purposes for which we have engaged them and must maintain appropriate security measures.
              </p>
              <p>
                We may also disclose information if required to do so by law, in response to a valid legal request (such as a court order or subpoena), or when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a government request. We will notify you of such disclosure unless prohibited by law.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">4. Data Security</h2>
              <p className="mb-3">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption of data in transit using TLS/SSL protocols, secure storage of sensitive data, regular security audits, access controls that limit which team members can access user data, and monitoring systems that detect and respond to potential security threats.
              </p>
              <p>
                While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet or electronic storage is 100 percent secure. Therefore, we cannot guarantee its absolute security. If you have reason to believe that your interaction with us is no longer secure, please contact us immediately at info@jobboard.ke so we can take appropriate steps.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">5. Data Retention</h2>
              <p>
                We retain your personal information only for as long as necessary to fulfil the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Job application data is retained for 12 months after the application deadline or until you request its deletion, whichever comes first. Newsletter subscription data is retained until you unsubscribe. Account data is retained for the duration of your account activity and for 24 months after your last login, after which it may be anonymized or deleted.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">6. Your Rights</h2>
              <p className="mb-3">
                Under the Kenya Data Protection Act, 2019, you have several rights regarding your personal information. You have the right to access the personal information we hold about you, and you can request a copy of this data at any time. You have the right to request correction of any inaccurate or incomplete personal information. You have the right to request deletion of your personal information, subject to certain legal exceptions.
              </p>
              <p>
                You also have the right to restrict or object to our processing of your personal information, the right to data portability (receiving your data in a structured, commonly used format), and the right to withdraw consent at any time where we rely on consent as a legal basis for processing. To exercise any of these rights, please contact us at info@jobboard.ke. We will respond to your request within 30 days as required by law.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">7. Children&apos;s Privacy</h2>
              <p>
                Our Site is not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately at info@jobboard.ke and we will take steps to delete such information from our systems.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">8. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date at the top. We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information. Your continued use of the Site after any changes constitutes your acceptance of the updated policy.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-800 mb-3">9. Contact Us</h2>
              <p className="mb-3">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please do not hesitate to contact us. You can reach our Data Protection Officer through the following channels:
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