import { prisma } from '@/lib/prisma';
import { JobListItem, jobListSelect } from './jobs';

// ============================================
// Types
// ============================================

export type CategoryWithMeta = {
  id: string;
  value: string;
  label: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  icon: string | null;
  _count: { jobs: number; subcategories: number };
};

export type SubcategoryWithMeta = {
  id: string;
  value: string;
  label: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  category: { slug: string; label: string };
  _count: { jobs: number };
};

// ============================================
// Category queries
// ============================================

export async function getCategoryBySlug(slug: string): Promise<CategoryWithMeta | null> {
  const cat = await prisma.jobCategory.findUnique({
    where: { slug },
    select: {
      id: true,
      value: true,
      label: true,
      slug: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
      icon: true,
      _count: {
        select: {
          jobs: { where: { status: 'ACTIVE', deletedAt: null } },
          subcategories: true,
        },
      },
    },
  });
  return cat as unknown as CategoryWithMeta | null;
}

export async function getSubcategoryBySlug(categorySlug: string, subSlug: string): Promise<SubcategoryWithMeta | null> {
  const category = await prisma.jobCategory.findUnique({
    where: { slug: categorySlug },
    select: { id: true, slug: true, label: true },
  });
  if (!category) return null;

  // Subcategory slug in DB is "{categorySlug}-{subSlug}", e.g. "technology-software-engineering"
  const fullSlug = `${categorySlug}-${subSlug}`;

  const sub = await prisma.jobSubcategory.findFirst({
    where: { slug: fullSlug, categoryId: category.id },
    select: {
      id: true,
      value: true,
      label: true,
      slug: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
      category: { select: { slug: true, label: true } },
      _count: {
        select: {
          jobs: { where: { status: 'ACTIVE', deletedAt: null } },
        },
      },
    },
  });
  return sub as unknown as SubcategoryWithMeta | null;
}

export async function getCategoryJobs(categoryId: string, page = 1, perPage = 20): Promise<{ jobs: JobListItem[]; total: number }> {
  const where = { status: 'ACTIVE' as const, deletedAt: null as null, categoryId };

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

export async function getSubcategoryJobs(subcategoryId: string, page = 1, perPage = 20): Promise<{ jobs: JobListItem[]; total: number }> {
  const where = { status: 'ACTIVE' as const, deletedAt: null as null, subcategoryId };

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

export async function getSiblingCategoryJobs(categoryId: string, limit = 6): Promise<JobListItem[]> {
  // Get jobs from other subcategories within the same category
  const subcategoryIds = await prisma.jobSubcategory.findMany({
    where: { categoryId },
    select: { id: true },
  });
  const subIds = subcategoryIds.map(s => s.id);

  const jobs = await prisma.job.findMany({
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      categoryId,
    },
    select: jobListSelect,
    orderBy: { datePosted: 'desc' },
    take: limit,
  });
  return jobs as unknown as JobListItem[];
}

export async function getCategorySubcategories(categoryId: string, categorySlug?: string): Promise<{ label: string; urlSlug: string; jobCount: number }[]> {
  const subs = await prisma.jobSubcategory.findMany({
    where: { categoryId },
    select: {
      label: true,
      slug: true,
      sortOrder: true,
      _count: { select: { jobs: { where: { status: 'ACTIVE', deletedAt: null } } } },
    },
    orderBy: { sortOrder: 'asc' },
  });

  const prefix = categorySlug ? `${categorySlug}-` : '';

  return subs.map(s => {
    // Strip category prefix from slug for URL: "technology-software-engineering" -> "software-engineering"
    const urlSlug = prefix && s.slug.startsWith(prefix) ? s.slug.slice(prefix.length) : s.slug;
    return {
      label: s.label,
      urlSlug,
      jobCount: s._count.jobs,
    };
  });
}

export async function getAllCategorySlugs(): Promise<string[]> {
  const cats = await prisma.jobCategory.findMany({
    select: { slug: true },
  });
  return cats.map(c => c.slug);
}

// Cache for subcategory slugs to avoid Prisma in nested generateStaticParams
// (Next.js 16/Turbopack bug: Prisma inside generateStaticParams for nested
//  dynamic routes silently produces zero pre-rendered pages)
let _cachedSubcategorySlugs: { category: string; slug: string }[] | null = null;

export async function getAllSubcategorySlugs(): Promise<{ category: string; slug: string }[]> {
  if (_cachedSubcategorySlugs) return _cachedSubcategorySlugs;

  const cats = await prisma.jobCategory.findMany({
    select: { slug: true, subcategories: { select: { slug: true } } },
  });

  const result: { category: string; slug: string }[] = [];
  for (const cat of cats) {
    for (const sub of cat.subcategories) {
      // Strip category prefix: "technology-software-engineering" -> "software-engineering"
      const prefix = cat.slug + '-';
      const subUrlSlug = sub.slug.startsWith(prefix) ? sub.slug.slice(prefix.length) : sub.slug;
      result.push({ category: cat.slug, slug: subUrlSlug });
    }
  }
  _cachedSubcategorySlugs = result;
  return result;
}

// Synchronous version for use in generateStaticParams (reads from cache)
export function getCachedSubcategorySlugs(): { category: string; slug: string }[] {
  return _cachedSubcategorySlugs || [];
}

export async function getPopularLocations(limit = 8): Promise<{ county: string; slug: string }[]> {
  const locs = await prisma.location.findMany({
    select: { county: true, slug: true },
    orderBy: { county: 'asc' },
    take: limit,
  });
  return locs;
}

export async function getAllCategories(): Promise<{ label: string; slug: string; jobCount: number }[]> {
  const cats = await prisma.jobCategory.findMany({
    select: {
      label: true,
      slug: true,
      sortOrder: true,
      _count: { select: { jobs: { where: { status: 'ACTIVE', deletedAt: null } } } },
    },
    orderBy: { sortOrder: 'asc' },
  });
  return cats.map(c => ({ label: c.label, slug: c.slug, jobCount: c._count.jobs }));
}