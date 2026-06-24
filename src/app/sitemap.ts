import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getAllBlogPostSlugs } from '@/lib/blog';
import { getAllJobSlugs } from '@/lib/jobs';
import { getAllCategorySlugs, getAllSubcategorySlugs } from '@/lib/categories';
import { getAllLocationSlugs } from '@/lib/locations';
import { getAllGovernmentCountySlugs } from '@/lib/government';
import { getAllOpportunitySlugs } from '@/lib/opportunities';

const SITE_URL = 'https://jobboard.ke';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    jobSlugs,
    categorySlugs,
    subcategorySlugs,
    locationSlugs,
    govCountySlugs,
    opportunitySlugs,
    blogSlugs,
  ] = await Promise.all([
    getAllJobSlugs(),
    getAllCategorySlugs(),
    getAllSubcategorySlugs(),
    getAllLocationSlugs(),
    getAllGovernmentCountySlugs(),
    getAllOpportunitySlugs(),
    getAllBlogPostSlugs(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/jobs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/government-jobs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/opportunities`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms-of-service`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/cv-services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/cv-matching`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/locations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];

  // Job detail pages
  const jobPages: MetadataRoute.Sitemap = jobSlugs.map((slug) => ({
    url: `${SITE_URL}/jobs/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${SITE_URL}/categories/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Subcategory pages
  const subcategoryPages: MetadataRoute.Sitemap = subcategorySlugs.map(({ category, slug }) => ({
    url: `${SITE_URL}/categories/${category}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Location pages
  const locationPages: MetadataRoute.Sitemap = locationSlugs.map((slug) => ({
    url: `${SITE_URL}/locations/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Government job county pages
  const govCountyPages: MetadataRoute.Sitemap = govCountySlugs.map(({ slug }) => ({
    url: `${SITE_URL}/government-jobs/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Opportunity pages
  const opportunityPages: MetadataRoute.Sitemap = opportunitySlugs.map((slug) => ({
    url: `${SITE_URL}/opportunities/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Blog pages
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...jobPages,
    ...categoryPages,
    ...subcategoryPages,
    ...locationPages,
    ...govCountyPages,
    ...opportunityPages,
    ...blogPages,
  ];
}