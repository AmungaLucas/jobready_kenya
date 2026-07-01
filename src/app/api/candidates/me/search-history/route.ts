import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

const recordSchema = z.object({
  query: z.string().min(1).max(200).transform(v => v.trim()),
  searchType: z.enum(['KEYWORD', 'CATEGORY', 'SKILL']).optional().default('KEYWORD'),
  resultsCount: z.number().int().min(0).optional().default(0),
});

// GET /api/candidates/me/search-history — recent searches
export async function GET(request: NextRequest) {
  const candidateId = await getServerCandidateId(request);
  if (!candidateId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit') || 20), 50);

  try {
    const history = await prisma.candidateSearchHistory.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        searchQuery: true,
        searchType: true,
        resultsCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error('[search-history] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch search history' }, { status: 500 });
  }
}

// POST /api/candidates/me/search-history — record a search
export async function POST(request: NextRequest) {
  const candidateId = await getServerCandidateId(request);
  if (!candidateId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = recordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { query, searchType, resultsCount } = parsed.data;

    // Upsert: if same candidate+query exists within 5 minutes, update count; otherwise create new
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existing = await prisma.candidateSearchHistory.findFirst({
      where: {
        candidateId,
        searchQuery: query,
        searchType,
        createdAt: { gte: fiveMinAgo },
      },
    });

    if (existing) {
      await prisma.candidateSearchHistory.update({
        where: { id: existing.id },
        data: { resultsCount },
      });
    } else {
      await prisma.candidateSearchHistory.create({
        data: {
          candidateId,
          searchQuery: query,
          searchType,
          resultsCount,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[search-history] POST error:', error);
    return NextResponse.json({ error: 'Failed to record search' }, { status: 500 });
  }
}