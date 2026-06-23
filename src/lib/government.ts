import { prisma } from '@/lib/prisma';
import { JobListItem, jobListSelect } from './jobs';

// Government organization types
export const GOV_TYPES = {
  ALL: 'all',
  NATIONAL: 'NATIONAL_GOVERNMENT',
  COUNTY: 'COUNTY_GOVERNMENT',
  STATE_CORPORATION: 'STATE_CORPORATION',
  REGULATORY: 'REGULATORY_AUTHORITY',
} as const;

export type GovTypeKey = keyof typeof GOV_TYPES;

export const GOV_TYPE_LABELS: Record<string, string> = {
  all: 'All Government',
  NATIONAL_GOVERNMENT: 'National Government',
  COUNTY_GOVERNMENT: 'County Government',
  STATE_CORPORATION: 'State Corporations',
  REGULATORY_AUTHORITY: 'Regulatory Authorities',
};

const GOV_ORG_TYPES = [GOV_TYPES.NATIONAL, GOV_TYPES.COUNTY, GOV_TYPES.STATE_CORPORATION, GOV_TYPES.REGULATORY];

export async function getGovernmentJobs(type?: string, page = 1, perPage = 20): Promise<{ jobs: JobListItem[]; total: number }> {
  const orgTypes = type && type !== 'all' ? [type] : GOV_ORG_TYPES;

  const where: any = {
    status: 'ACTIVE',
    deletedAt: null,
    organization: { orgType: { in: orgTypes } },
  };

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

export async function getGovernmentOrgs(): Promise<{ orgName: string; orgSlug: string; orgType: string; jobCount: number }[]> {
  const orgs = await prisma.organization.findMany({
    where: { orgType: { in: GOV_ORG_TYPES } },
    select: { id: true, orgName: true, orgSlug: true, orgType: true },
    orderBy: { orgName: 'asc' },
  });

  // Batch count jobs per org
  const orgIds = orgs.map(o => o.id);
  const jobCounts = orgIds.length > 0
    ? await prisma.job.groupBy({
        by: ['organizationId'],
        where: { status: 'ACTIVE', deletedAt: null, organizationId: { in: orgIds } },
        _count: { id: true },
      })
    : [];

  const countMap = new Map(jobCounts.map(j => [j.organizationId, j._count.id]));

  return orgs.map(o => ({
    orgName: o.orgName,
    orgSlug: o.orgSlug,
    orgType: o.orgType,
    jobCount: countMap.get(o.id) || 0,
  }));
}

export async function getGovernmentJobCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  // Count by org type
  for (const orgType of GOV_ORG_TYPES) {
    counts[orgType] = await prisma.job.count({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        organization: { orgType },
      },
    });
  }

  // Total
  counts['all'] = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return counts;
}

// ── County-level government jobs ──

export async function getGovernmentJobsByCounty(
  county: string,
  type?: string,
  page = 1,
  perPage = 20
): Promise<{ jobs: JobListItem[]; total: number }> {
  const orgTypes = type && type !== 'all' ? [type] : GOV_ORG_TYPES;

  const where: any = {
    status: 'ACTIVE',
    deletedAt: null,
    locationCounty: county,
    organization: { orgType: { in: orgTypes } },
  };

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

export async function getGovernmentJobCountsByCounty(county: string): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  for (const orgType of GOV_ORG_TYPES) {
    counts[orgType] = await prisma.job.count({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        locationCounty: county,
        organization: { orgType },
      },
    });
  }

  counts['all'] = Object.values(counts).reduce((sum, n) => sum + n, 0);
  return counts;
}

export async function getAllGovernmentCountySlugs(): Promise<{ slug: string; county: string }[]> {
  return prisma.location.findMany({
    select: { slug: true, county: true },
    orderBy: { county: 'asc' },
  });
}