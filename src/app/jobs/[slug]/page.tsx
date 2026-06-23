import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getJobBySlug, getSimilarJobs, getAllJobSlugs, formatSalary, timeAgo, formatDate, employmentTypeLabels } from '@/lib/jobs';
import { generateJobPostingJsonLd, generateBreadcrumbJsonLd } from '@/lib/jsonld';
import JobDetailsContent from '@/components/jobboard/JobDetailsContent';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';

export const revalidate = 60; // ISR: revalidate every 60 seconds

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: 'Job Not Found' };

  const title = job.seoTitle || `${job.title} at ${job.organization?.orgName || 'JobBoard Kenya'}`;
  const description = job.seoDescription || job.description.substring(0, 160);

  return {
    title,
    description,
    alternates: { canonical: `/jobs/${job.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: job.datePosted.toISOString(),
      modifiedTime: job.datePosted.toISOString(),
      url: `/jobs/${job.slug}`,
      siteName: 'JobBoard Kenya',
      images: job.organization?.orgLogoUrl ? [{ url: job.organization.orgLogoUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
    description: job.description,
    isRemote: job.isRemote,
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

  // JSON-LD
  const jobLd = generateJobPostingJsonLd(job);
  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Browse Jobs', url: '/jobs' },
    { name: job.title, url: `/jobs/${job.slug}` },
  ]);

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
      <Navbar />
      <JobDetailsContent job={formattedJob} similar={formattedSimilar} />
      <Footer />
    </>
  );
}