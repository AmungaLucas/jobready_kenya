import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const counties = await prisma.location.findMany({
      select: {
        county: true,
        slug: true,
      },
      orderBy: { county: 'asc' },
    });

    return NextResponse.json(
      counties.map((c) => ({ county: c.county, slug: c.slug }))
    );
  } catch (error) {
    console.error('Error fetching counties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch counties' },
      { status: 500 }
    );
  }
}
