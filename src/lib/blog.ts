import { prisma } from '@/lib/prisma';

export type BlogPostListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  category: string;
  authorName: string;
  authorAvatarUrl: string | null;
  readTimeMinutes: number;
  featured: boolean;
  datePosted: Date;
  datePublished: Date | null;
  tags: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type BlogPostDetail = BlogPostListItem & {
  content: string;
};

export const BLOG_CATEGORIES = [
  'Career Advice',
  'Kenya Job Market',
  'How-To',
  'Industry Insights',
] as const;

export const BLOG_CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Career Advice':
    'Expert career guidance for Kenyan job seekers. Practical tips on CV writing, interview preparation, salary negotiation, and professional development to help you advance your career in Kenya\'s competitive job market. Our career advice articles are written by industry professionals with deep knowledge of the Kenyan employment landscape.',
  'Kenya Job Market':
    'In-depth analysis of Kenya\'s job market trends, salary benchmarks, and employment data. Stay informed about which sectors are hiring, what skills are in demand, and how economic changes affect job opportunities across different counties and industries in Kenya.',
  'How-To':
    'Step-by-step guides and practical tutorials for Kenyan professionals. From transitioning into tech and optimizing your LinkedIn profile to understanding labour laws and applying for government jobs, our how-to articles provide actionable instructions you can follow today.',
  'Industry Insights':
    'Expert analysis of key industries driving Kenya\'s economy. Understand the trends, challenges, and opportunities in sectors like technology, banking, healthcare, manufacturing, and agriculture. Our industry insights help you make informed career decisions based on where the market is heading.',
};

export async function getBlogPosts(category?: string, page = 1, perPage = 12) {
  const where = {
    status: 'PUBLISHED' as const,
    deletedAt: null,
    ...(category && category !== 'all' ? { category } : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImageUrl: true,
        category: true,
        authorName: true,
        authorAvatarUrl: true,
        readTimeMinutes: true,
        featured: true,
        datePosted: true,
        datePublished: true,
        tags: true,
        seoTitle: true,
        seoDescription: true,
      },
      orderBy: [{ featured: 'desc' }, { datePosted: 'desc' }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return { posts, total };
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  return prisma.blogPost.findUnique({
    where: { slug },
  });
}

export async function getAllBlogPostSlugs(): Promise<string[]> {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    select: { slug: true },
  });
  return posts.map((p) => p.slug);
}

export async function getBlogPostCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const cat of BLOG_CATEGORIES) {
    counts[cat] = await prisma.blogPost.count({
      where: { status: 'PUBLISHED', deletedAt: null, category: cat },
    });
  }
  counts['all'] = Object.values(counts).reduce((a, b) => a + b, 0);
  return counts;
}

export async function getRelatedPosts(currentSlug: string, category: string, limit = 4) {
  return prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      deletedAt: null,
      slug: { not: currentSlug },
      category,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
      category: true,
      authorName: true,
      authorAvatarUrl: true,
      readTimeMinutes: true,
      featured: true,
      datePosted: true,
      datePublished: true,
      tags: true,
    },
    orderBy: { datePosted: 'desc' },
    take: limit,
  });
}

export async function getFeaturedPosts(limit = 3) {
  return prisma.blogPost.findMany({
    where: { status: 'PUBLISHED', deletedAt: null, featured: true },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
      category: true,
      authorName: true,
      readTimeMinutes: true,
      datePosted: true,
      datePublished: true,
    },
    orderBy: { datePosted: 'desc' },
    take: limit,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}