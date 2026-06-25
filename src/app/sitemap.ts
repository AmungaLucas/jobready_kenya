import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

// Force dynamic generation — sitemap MUST always reflect current DB state.
// Without this, Next.js pre-renders the sitemap at build time and it goes stale.
export const dynamic = 'force-dynamic';

const SITE_URL = 'https://jobboard.ke';

// Truly static pages — these rarely change and are safe to hardcode
const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
  { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  { url: `${SITE_URL}/terms-of-service`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  { url: `${SITE_URL}/cv-services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${SITE_URL}/cv-matching`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Dynamic index/listing pages (always included)
  const listingPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/jobs`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/government-jobs`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/opportunities`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/locations`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/categories`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ];

  try {
    // Query all dynamic slugs directly from DB — always fresh
    const [
      jobs,
      categories,
      subcategories,
      locations,
      govCounties,
      opportunities,
      blogPosts,
    ] = await Promise.all([
      // Active jobs with their datePosted for accurate lastModified
      prisma.job.findMany({
        where: { status: 'ACTIVE', deletedAt: null },
        select: { slug: true, datePosted: true },
        orderBy: { datePosted: 'desc' },
      }),
      // Categories
      prisma.jobCategory.findMany({
        select: { slug: true, updatedAt: true },
        orderBy: { sortOrder: 'asc' },
      }),
      // Subcategories with parent slug
      prisma.jobSubcategory.findMany({
        select: {
          slug: true,
          updatedAt: true,
          category: { select: { slug: true } },
        },
        orderBy: { sortOrder: 'asc' },
      }),
      // Locations (all 47 counties)
      prisma.location.findMany({
        select: { slug: true, updatedAt: true },
        orderBy: { county: 'asc' },
      }),
      // Government job county pages
      (async () => {
        const govJobs = await prisma.job.findMany({
          where: {
            status: 'ACTIVE',
            deletedAt: null,
            locationCounty: { not: null },
            organization: { orgType: { in: ['NATIONAL_GOVERNMENT', 'COUNTY_GOVERNMENT', 'STATE_CORPORATION', 'REGULATORY_AUTHORITY'] } },
          },
          select: { locationCounty: true },
          distinct: ['locationCounty'],
        });
        const counties = govJobs.map(j => j.locationCounty).filter(Boolean) as string[];
        if (counties.length === 0) return [];
        return prisma.location.findMany({
          where: { county: { in: counties } },
          select: { slug: true },
        });
      })(),
      // Active opportunities
      prisma.opportunity.findMany({
        where: { status: 'ACTIVE', deletedAt: null },
        select: { slug: true, datePosted: true },
        orderBy: { datePosted: 'desc' },
      }),
      // Published blog posts
      prisma.blogPost.findMany({
        where: { status: 'PUBLISHED', deletedAt: null },
        select: { slug: true, updatedAt: true },
        orderBy: { datePosted: 'desc' },
      }),
    ]);

    return [
      ...STATIC_PAGES,
      ...listingPages,
      // Jobs — use actual datePosted as lastModified for SEO accuracy
      ...jobs.map((j) => ({
        url: `${SITE_URL}/jobs/${j.slug}`,
        lastModified: j.datePosted,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })),
      // Categories
      ...categories.map((c) => ({
        url: `${SITE_URL}/categories/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      // Subcategories
      ...subcategories.map((s) => ({
        url: `${SITE_URL}/categories/${s.category.slug}/${s.slug}`,
        lastModified: s.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
      // Locations
      ...locations.map((l) => ({
        url: `${SITE_URL}/locations/${l.slug}`,
        lastModified: l.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      // Government jobs by county
      ...govCounties.map((g) => ({
        url: `${SITE_URL}/government-jobs/${g.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
      // Opportunities
      ...opportunities.map((o) => ({
        url: `${SITE_URL}/opportunities/${o.slug}`,
        lastModified: o.datePosted,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      // Blog posts
      ...blogPosts.map((b) => ({
        url: `${SITE_URL}/blog/${b.slug}`,
        lastModified: b.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ];
  } catch {
    // DB unavailable — return static pages only so sitemap still renders
    return [...STATIC_PAGES, ...listingPages];
  }
}