import { prisma } from '@/lib/prisma';
import { JobListItem, jobListSelect } from './jobs';

// ============================================
// Types
// ============================================

export type LocationWithMeta = {
  id: string;
  county: string;
  slug: string;
  description: string;
  seoTitle: string | null;
  seoDescription: string | null;
  jobCount: number;
};

export type LocationCategoryInfo = {
  categorySlug: string;
  categoryLabel: string;
  jobCount: number;
};

// ============================================
// Location queries
// ============================================

export async function getLocationBySlug(slug: string): Promise<LocationWithMeta | null> {
  const loc = await prisma.location.findUnique({
    where: { slug },
    select: {
      id: true,
      county: true,
      slug: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
    },
  });
  if (!loc) return null;

  // Count jobs manually — Location has no Prisma relation to Job
  const jobCount = await prisma.job.count({
    where: { status: 'ACTIVE', deletedAt: null, locationCounty: loc.county },
  });

  return { ...loc, jobCount };
}

export async function getLocationJobs(countyName: string, page = 1, perPage = 20): Promise<{ jobs: JobListItem[]; total: number }> {
  const where = { status: 'ACTIVE' as const, deletedAt: null as null, locationCounty: countyName };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      select: jobListSelect,
      orderBy: { datePosted: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.job.count({ where }),
  ]);

  return { jobs: jobs as unknown as JobListItem[], total };
}

export async function getLocationCategories(countyName: string): Promise<LocationCategoryInfo[]> {
  const results = await prisma.job.groupBy({
    by: ['categoryId'],
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      locationCounty: countyName,
      categoryId: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 12,
  });

  // Batch-fetch category labels in one query
  const catIds = results.map(r => r.categoryId).filter(Boolean);
  const cats = catIds.length > 0
    ? await prisma.jobCategory.findMany({
        where: { id: { in: catIds } },
        select: { id: true, slug: true, label: true },
      })
    : [];

  const catMap = new Map(cats.map(c => [c.id, c]));

  return results
    .map(r => {
      const cat = r.categoryId ? catMap.get(r.categoryId) : null;
      if (!cat) return null;
      return {
        categorySlug: cat.slug,
        categoryLabel: cat.label,
        jobCount: r._count.id,
      };
    })
    .filter(Boolean) as LocationCategoryInfo[];
}

export async function getOtherLocations(currentSlug: string, limit = 12): Promise<{ county: string; slug: string; jobCount: number }[]> {
  // Get all locations with their job counts via a single groupBy + manual join
  const locs = await prisma.location.findMany({
    where: { slug: { not: currentSlug } },
    select: { county: true, slug: true },
    orderBy: { county: 'asc' },
  });

  // Batch count jobs per county
  const counties = locs.map(l => l.county);
  const jobCounts = counties.length > 0
    ? await prisma.job.groupBy({
        by: ['locationCounty'],
        where: { status: 'ACTIVE', deletedAt: null, locationCounty: { in: counties } },
        _count: { id: true },
      })
    : [];

  const countMap = new Map(jobCounts.map(j => [j.locationCounty, j._count.id]));

  return locs
    .map(l => ({
      county: l.county,
      slug: l.slug,
      jobCount: countMap.get(l.county) || 0,
    }))
    .sort((a, b) => b.jobCount - a.jobCount)
    .slice(0, limit);
}

export async function getAllLocationSlugs(): Promise<string[]> {
  const locs = await prisma.location.findMany({
    select: { slug: true },
    orderBy: { county: 'asc' },
  });
  return locs.map(l => l.slug);
}

export async function getPopularLocations(limit = 8): Promise<{ county: string; slug: string; jobCount: number }[]> {
  // Get all locations with job counts, sorted by job count descending
  const locs = await prisma.location.findMany({
    select: { county: true, slug: true },
    orderBy: { county: 'asc' },
  });

  const counties = locs.map(l => l.county);
  const jobCounts = counties.length > 0
    ? await prisma.job.groupBy({
        by: ['locationCounty'],
        where: { status: 'ACTIVE', deletedAt: null, locationCounty: { in: counties } },
        _count: { id: true },
      })
    : [];

  const countMap = new Map(jobCounts.map(j => [j.locationCounty, j._count.id]));

  return locs
    .map(l => ({ county: l.county, slug: l.slug, jobCount: countMap.get(l.county) || 0 }))
    .sort((a, b) => b.jobCount - a.jobCount)
    .slice(0, limit);
}