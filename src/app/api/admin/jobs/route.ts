import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/get-server-admin';

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(25),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional(),
  status: z.string().optional(),
});

// GET /api/admin/jobs — list all jobs with filters
export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const { limit, offset, search, status } = querySchema.parse(params);

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
        { organization: { name: { contains: search } } },
      ];
    }
    if (status && ['ACTIVE', 'EXPIRED', 'PAUSED', 'DRAFT'].includes(status)) {
      where.status = status;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        select: {
          id: true, title: true, slug: true, status: true, source: true,
          employmentType: true, location: { select: { name: true } },
          organization: { select: { name: true } },
          applicationDeadline: true, createdAt: true,
          _count: { select: { applications: true, jobViews: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      jobs,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (error) {
    console.error('[admin/jobs] GET error:', error);
    return NextResponse.json({ error: 'Failed to load jobs' }, { status: 500 });
  }
}

// PATCH /api/admin/jobs — bulk status update
export async function PATCH(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const body = await request.json();
    const { action, jobIds, status, jobId, data } = body;

    if (action === 'bulkStatus' && Array.isArray(jobIds) && status) {
      const result = await prisma.job.updateMany({
        where: { id: { in: jobIds } },
        data: { status: status.toUpperCase() },
      });
      return NextResponse.json({ success: true, updated: result.count });
    }

    if (action === 'update' && jobId && data) {
      // Partial update of job fields
      const allowedFields = ['title', 'status', 'applicationDeadline', 'description', 'requirements', 'salaryMin', 'salaryMax', 'employmentType'];
      const updateData: Record<string, unknown> = {};
      for (const key of allowedFields) {
        if (data[key] !== undefined) updateData[key] = data[key];
      }
      const job = await prisma.job.update({ where: { id: jobId }, data: updateData });
      return NextResponse.json({ success: true, job });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[admin/jobs] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update jobs' }, { status: 500 });
  }
}