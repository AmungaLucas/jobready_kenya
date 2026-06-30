import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!type) {
      return NextResponse.json(
        { error: 'type query parameter is required (e.g. SKILL, CATEGORY, ROLE)' },
        { status: 400 }
      );
    }

    const items = await prisma.taxonomyItem.findMany({
      where: {
        type: type as any,
        isActive: true,
        ...(search && {
          OR: [
            { label: { contains: search } },
            { value: { contains: search } },
          ],
        }),
      },
      select: {
        id: true,
        type: true,
        value: true,
        label: true,
      },
      orderBy: { label: 'asc' },
      take: limit,
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching taxonomy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch taxonomy items' },
      { status: 500 }
    );
  }
}
