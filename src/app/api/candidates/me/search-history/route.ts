import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

/**
 * POST /api/candidates/me/search-history
 *
 * Records a candidate's search query for recommendation tuning.
 * Body: { query: string, searchType?: 'KEYWORD' | 'CATEGORY' | 'SKILL', resultsCount?: number }
 *
 * Fire-and-forget: the jobs page calls this client-side after search.
 */
export async function POST(request: NextRequest) {
  try {
    const candidateId = await getServerCandidateId(request);
    if (!candidateId) {
      return NextResponse.json({ skipped: true });
    }

    const body = await request.json();
    const { query, searchType = 'KEYWORD', resultsCount = 0 } = body as {
      query: string;
      searchType?: 'KEYWORD' | 'CATEGORY' | 'SKILL';
      resultsCount?: number;
    };

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    if (query.length > 255) {
      return NextResponse.json({ error: 'query too long' }, { status: 400 });
    }

    // Only record if not identical to the most recent search (debounce duplicates)
    const lastSearch = await prisma.candidateSearchHistory.findFirst({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
      select: { searchQuery: true },
    });

    if (lastSearch?.searchQuery.toLowerCase() === query.trim().toLowerCase()) {
      return NextResponse.json({ skipped: true, reason: 'duplicate' });
    }

    await prisma.candidateSearchHistory.create({
      data: {
        candidateId,
        searchQuery: query.trim(),
        searchType,
        resultsCount,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/candidates/me/search-history]', error);
    return NextResponse.json({ error: 'Failed to record search' }, { status: 500 });
  }
}