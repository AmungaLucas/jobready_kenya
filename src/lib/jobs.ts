import { prisma } from '@/lib/prisma';

export type JobListItem = {
  id: string;
  slug: string;
  title: string;
  locationCity: string | null;
  locationCounty: string | null;
  employmentType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryDisclosure: string;
  datePosted: Date;
  deadline: Date | null;
  featured: boolean;
  isRemote: boolean;
  organization: { orgName: string; orgSlug: string; orgLogoUrl: string | null } | null;
  category: { label: string; slug: string; value: string } | null;
  subcategory: { label: string; slug: string } | null;
};

export type JobDetail = JobListItem & {
  description: string;
  experienceLevel: string | null;
  educationLevel: string | null;
  howToApply: string | null;
  applicationUrl: string | null;
  applyEmail: string | null;
  sourceUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
 categoryId: string | null;
  organization: {
    orgName: string;
    orgSlug: string;
    orgLogoUrl: string | null;
    orgWebsite: string | null;
    orgDescription: string | null;
    orgIndustry: string;
    orgType: string;
    headquarters: string | null;
  } | null;
};

const jobListSelect = {
  id: true,
  slug: true,
  title: true,
  locationCity: true,
  locationCounty: true,
  employmentType: true,
  salaryMin: true,
  salaryMax: true,
  salaryDisclosure: true,
  datePosted: true,
  deadline: true,
  featured: true,
  isRemote: true,
  organization: { select: { orgName: true, orgSlug: true, orgLogoUrl: true } },
  category: { select: { label: true, slug: true, value: true } },
  subcategory: { select: { label: true, slug: true } },
} as const;

export async function getJobs(params?: {
  category?: string;
  location?: string;
  type?: string;
  county?: string;
  search?: string;
  page?: number;
  perPage?: number;
  featured?: boolean;
}): Promise<{ jobs: JobListItem[]; total: number }> {
  const { category, location, type, county, search, page = 1, perPage = 20, featured } = params || {};

  const where: any = { status: 'ACTIVE', deletedAt: null };

  if (category) {
    where.OR = [
      { category: { slug: category } },
      { category: { value: category } },
      { subcategory: { slug: category } },
    ];
  }
  if (county) {
    where.locationCounty = county;
  }
  if (location) {
    where.locationCity = { contains: location, mode: 'insensitive' };
  }
  if (type) {
    where.employmentType = type.toUpperCase().replace('-', '_');
  }
  if (featured) {
    where.featured = true;
  }
  if (search) {
    where.searchText = { contains: search };
  }

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

export async function getJobBySlug(slug: string): Promise<JobDetail | null> {
  const job = await prisma.job.findFirst({
    where: { slug, status: 'ACTIVE', deletedAt: null },
    include: {
      organization: { select: { orgName: true, orgSlug: true, orgLogoUrl: true, orgWebsite: true, orgDescription: true, orgIndustry: true, orgType: true, headquarters: true } },
      category: { select: { label: true, slug: true, value: true } },
      subcategory: { select: { label: true, slug: true } },
    },
  });
  if (!job) return null;
  return { ...job, categoryId: job.categoryId } as unknown as JobDetail;
}

export async function getSimilarJobs(job: JobDetail, limit = 4): Promise<JobListItem[]> {
  const where: any = {
    status: 'ACTIVE',
    deletedAt: null,
    id: { not: job.id },
  };
  // Prefer same category
  if (job.categoryId) {
    where.categoryId = job.categoryId;
  } else if (job.locationCounty) {
    where.locationCounty = job.locationCounty;
  }

  const jobs = await prisma.job.findMany({
    where,
    select: jobListSelect,
    orderBy: { datePosted: 'desc' },
    take: limit,
  });
  return jobs as unknown as JobListItem[];
}

export async function getAllJobSlugs(): Promise<string[]> {
  const jobs = await prisma.job.findMany({
    where: { status: 'ACTIVE', deletedAt: null },
    select: { slug: true },
  });
  return jobs.map(j => j.slug);
}

export async function getFeaturedJobs(limit = 6): Promise<JobListItem[]> {
  const jobs = await prisma.job.findMany({
    where: { status: 'ACTIVE', deletedAt: null, featured: true },
    select: jobListSelect,
    orderBy: { datePosted: 'desc' },
    take: limit,
  });
  return jobs as unknown as JobListItem[];
}

export async function getClosingSoonJobs(days = 7, limit = 5): Promise<JobListItem[]> {
  const now = new Date();
  const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const jobs = await prisma.job.findMany({
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      deadline: { gte: now, lte: cutoff },
    },
    select: jobListSelect,
    orderBy: { deadline: 'asc' },
    take: limit,
  });
  return jobs as unknown as JobListItem[];
}

// Employment type display helpers
export const employmentTypeLabels: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  FREELANCE: 'Freelance',
  INTERNSHIP: 'Internship',
  APPRENTICESHIP: 'Apprenticeship',
  TEMPORARY: 'Temporary',
  CASUAL: 'Casual',
  VOLUNTEER: 'Volunteer',
};

export function formatSalary(job: { salaryMin: number | null; salaryMax: number | null; salaryDisclosure: string }): string {
  if (job.salaryMin && job.salaryMax) {
    return `KSh ${Math.round(job.salaryMin / 1000)}k – ${Math.round(job.salaryMax / 1000)}k`;
  }
  if (job.salaryMin) {
    return `KSh ${Math.round(job.salaryMin / 1000)}k+`;
  }
  const labels: Record<string, string> = {
    NOT_DISCLOSED: 'Competitive',
    NEGOTIABLE: 'Negotiable',
    COMPETITIVE: 'Competitive',
    SHOW_RANGE: 'Competitive',
  };
  return labels[job.salaryDisclosure] || 'Competitive';
}

export function timeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function formatDate(date: Date | null): string {
  if (!date) return 'Open';
  return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}