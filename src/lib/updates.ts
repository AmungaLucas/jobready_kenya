import { prisma } from '@/lib/prisma';

// Update type constants
export const UPDATE_TYPES = [
  'SHORTLISTING',
  'INTERVIEW',
  'RECRUITMENT',
  'DEADLINE',
  'ANNOUNCEMENT',
] as const;

export type UpdateType = (typeof UPDATE_TYPES)[number];

export const UPDATE_TYPE_LABELS: Record<string, string> = {
  all: 'All Updates',
  SHORTLISTING: 'Shortlisting',
  INTERVIEW: 'Interview Dates',
  RECRUITMENT: 'Recruitment',
  DEADLINE: 'Deadline Changes',
  ANNOUNCEMENT: 'Announcements',
};

export const UPDATE_TYPE_ICONS: Record<string, string> = {
  SHORTLISTING: '\uD83D\uDCE2',
  INTERVIEW: '\uD83D\uDCC5',
  RECRUITMENT: '\uD83D\uDCCB',
  DEADLINE: '\u23F3',
  ANNOUNCEMENT: '\uD83D\uDCE3',
};

export const UPDATE_TAG_COLORS: Record<string, string> = {
  SHORTLISTING: 'text-blue-700',
  INTERVIEW: 'text-purple-700',
  RECRUITMENT: 'text-emerald-700',
  DEADLINE: 'text-amber-700',
  ANNOUNCEMENT: 'text-gray-700',
};

export interface UpdateListItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  updateType: string;
  sourceName: string;
  sourceLogoUrl: string | null;
  imageUrl: string | null;
  hasPdf: boolean;
  datePosted: Date;
  featured: boolean;
}

const updateListSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  updateType: true,
  sourceName: true,
  sourceLogoUrl: true,
  imageUrl: true,
  pdfUrl: true,
  datePosted: true,
  featured: true,
} as const;

export async function getUpdates(
  type?: string,
  page = 1,
  perPage = 20
): Promise<{ updates: UpdateListItem[]; total: number }> {
  const where: any = {
    status: 'PUBLISHED',
    deletedAt: null,
  };

  if (type && type !== 'all') {
    where.updateType = type;
  }

  const [updates, total] = await Promise.all([
    prisma.update.findMany({
      where,
      select: updateListSelect,
      orderBy: { datePosted: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.update.count({ where }),
  ]);

  return {
    updates: updates.map((u) => ({
      ...u,
      hasPdf: !!u.pdfUrl,
    })) as unknown as UpdateListItem[],
    total,
  };
}

export async function getRecentUpdates(limit = 4): Promise<UpdateListItem[]> {
  const updates = await prisma.update.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    select: updateListSelect,
    orderBy: { datePosted: 'desc' },
    take: limit,
  });

  return updates.map((u) => ({
    ...u,
    hasPdf: !!u.pdfUrl,
  })) as unknown as UpdateListItem[];
}

export async function getUpdateBySlug(slug: string) {
  return prisma.update.findUnique({
    where: { slug },
  });
}

export async function getAllUpdateSlugs(): Promise<string[]> {
  const results = await prisma.update.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    select: { slug: true },
  });
  return results.map((r) => r.slug);
}

export async function getUpdateTypeCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  for (const type of UPDATE_TYPES) {
    counts[type] = await prisma.update.count({
      where: { status: 'PUBLISHED', deletedAt: null, updateType: type },
    });
  }

  counts['all'] = Object.values(counts).reduce((sum, n) => sum + n, 0);
  return counts;
}