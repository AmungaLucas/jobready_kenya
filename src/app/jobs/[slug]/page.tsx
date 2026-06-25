import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getJobBySlug, getSimilarJobs, getAllJobSlugs, formatSalary, timeAgo, formatDate, employmentTypeLabels } from '@/lib/jobs';
import { generateJobPostingJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import JobDetailsContent from '@/components/jobboard/JobDetailsContent';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';

export const revalidate = 60; // ISR: revalidate every 60 seconds
export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: 'Job Not Found' };

  const orgName = job.organization?.orgName || 'JobBoard Kenya';
  const location = job.locationCity || job.locationCounty || 'Kenya';
  const title = job.seoTitle || `${job.title} at ${orgName} - ${location} | JobBoard Kenya`;
  const description = job.seoDescription || `${job.title} vacancy at ${orgName} in ${location}. ${job.description.substring(0, 120).trim()}. Apply now on JobBoard Kenya.`;

  return {
    title,
    description: description.substring(0, 160),
    alternates: { canonical: `${SITE_URL}/jobs/${job.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: description.substring(0, 160),
      type: 'article',
      publishedTime: job.datePosted.toISOString(),
      modifiedTime: job.datePosted.toISOString(),
      url: `${SITE_URL}/jobs/${job.slug}`,
      siteName: 'JobBoard Kenya',
      images: job.organization?.orgLogoUrl ? [{ url: job.organization.orgLogoUrl, width: 1200, height: 630, alt: `${job.title} at ${orgName}` }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.substring(0, 160),
    },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllJobSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function JobDetailsPage({ params }: Props) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  const similar = await getSimilarJobs(job, 3);

  // Format for the existing component
  const formattedJob = {
    id: job.id,
    slug: job.slug,
    title: job.title,
    company: job.organization?.orgName || 'Confidential',
    companySlug: job.organization?.orgSlug || null,
    companyWebsite: job.organization?.orgWebsite || null,
    companyDescription: job.organization?.orgDescription || '',
    location: job.locationCity || job.locationCounty || 'Kenya',
    locationCounty: job.locationCounty || null,
    type: employmentTypeLabels[job.employmentType || ''] || job.employmentType || 'Full-time',
    employmentType: job.employmentType,
    salary: formatSalary(job),
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    posted: timeAgo(job.datePosted),
    deadline: formatDate(job.deadline),
    datePosted: job.datePosted,
    deadlineDate: job.deadline,
    category: job.category?.label || '',
    categorySlug: job.category?.slug || '',
    subcategory: job.subcategory?.label || '',
    subcategorySlug: job.subcategory?.slug || '',
    experienceLevel: job.experienceLevel,
    educationLevel: job.educationLevel,
    description: job.description,
    isRemote: job.isRemote,
    externalUrl: job.externalUrl || null,
    featured: job.featured,
    requirements: [],
    responsibilities: [],
    match: 85, // placeholder; matching algorithm comes in Phase 3
  };

  const formattedSimilar = similar.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    company: s.organization?.orgName || 'Confidential',
    location: s.locationCity || s.locationCounty || 'Kenya',
    type: employmentTypeLabels[s.employmentType || ''] || s.employmentType || 'Full-time',
    salary: formatSalary(s),
    posted: timeAgo(s.datePosted),
    deadline: formatDate(s.deadline),
    category: s.category?.label || '',
    description: '',
  }));

  // JSON-LD: JobPosting + BreadcrumbList
  const jobLd = generateJobPostingJsonLd({
    title: job.title,
    description: job.description,
    slug: job.slug,
    datePosted: job.datePosted,
    deadline: job.deadline,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    educationLevel: job.educationLevel,
    locationCity: job.locationCity,
    locationCounty: job.locationCounty,
    isRemote: job.isRemote,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: 'KES',
    category: job.category,
    subcategory: job.subcategory,
    organization: job.organization ? {
      orgName: job.organization.orgName,
      orgLogoUrl: job.organization.orgLogoUrl,
      orgWebsite: job.organization.orgWebsite,
    } : null,
  });

  // Breadcrumb: Home > Jobs > [Category] > Job Title
  const breadcrumbItems: { name: string; url: string }[] = [
    { name: 'Home', url: '/' },
    { name: 'Browse Jobs', url: '/jobs' },
  ];
  if (job.category) {
    breadcrumbItems.push({ name: job.category.label, url: `/categories/${job.category.slug}` });
  }
  breadcrumbItems.push({ name: job.title, url: `/jobs/${job.slug}` });
  const breadcrumbLd = generateBreadcrumbJsonLd(breadcrumbItems);

  // JSON-LD: FAQPage for AEO
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': `What is the salary for this ${job.category?.label || 'position'}?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': formatSalary(job) !== 'Salary not disclosed' ? `The salary range is ${formatSalary(job)}.` : 'Salary details are available upon application.',
        },
      },
      {
        '@type': 'Question',
        'name': `Where is this ${job.title} job located?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': job.isRemote ? 'This is a remote position.' : `This position is located in ${job.locationCity || job.locationCounty || 'Kenya'}.`,
        },
      },
      {
        '@type': 'Question',
        'name': `When is the application deadline?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': job.deadline ? `The application deadline is ${job.deadline.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}.` : 'No deadline specified.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Navbar />
      <JobDetailsContent job={formattedJob} similar={formattedSimilar} />
      <Footer />
    </>
  );
}