import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-helpers';
import { extractJobProfile } from '@/lib/extraction/job-extractor';

/**
 * POST /api/recruiter/jobs
 *
 * Create a new job posting. Accepts structured job data,
 * optionally triggers AI extraction of the job profile.
 *
 * Expected body:
 * {
 *   title: string,
 *   description: string,          // raw job description
 *   organizationName?: string,
 *   locationCounty?: string,
 *   isRemote?: boolean,
 *   employmentType?: string,
 *   experienceLevel?: string,
 *   educationLevel?: string,
 *   deadline?: string,           // ISO date
 *   howToApply?: string,
 *   applyEmail?: string,
 *   applicationUrl?: string,
 *   salaryMin?: number,
 *   salaryMax?: number,
 *   source?: 'MANUAL' | 'API',
 *   // Optional: pre-extracted structured data
 *   jobProfile?: { ... }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).userId as string;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const {
      title,
      description,
      organizationName,
      locationCounty,
      isRemote,
      employmentType,
      experienceLevel,
      educationLevel,
      deadline,
      howToApply,
      applyEmail,
      applicationUrl,
      salaryMin,
      salaryMax,
      source = 'MANUAL',
      jobProfile: preExtractedProfile,
    } = body as Record<string, unknown>;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'title and description are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);

    // Find or create organization
    let organizationId: string | undefined;
    if (organizationName) {
      const existingOrg = await prisma.organization.findFirst({
        where: { orgName: organizationName as string },
      });
      if (existingOrg) {
        organizationId = existingOrg.id;
      } else {
        const newOrg = await prisma.organization.create({
          data: {
            orgName: organizationName as string,
            orgSlug: (organizationName as string)
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, ''),
          },
        });
        organizationId = newOrg.id;
      }
    }

    // Create the job
    const job = await prisma.job.create({
      data: {
        title: title as string,
        slug,
        description: description as string,
        rawDescription: description as string,
        organizationId,
        locationCounty: locationCounty as string | null,
        isRemote: isRemote === true,
        employmentType: (employmentType as string) || undefined,
        experienceLevel: (experienceLevel as string) || undefined,
        educationLevel: (educationLevel as string) || undefined,
        deadline: deadline ? new Date(deadline as string) : null,
        howToApply: (howToApply as string) || null,
        applyEmail: (applyEmail as string) || null,
        applicationUrl: (applicationUrl as string) || null,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        status: 'ACTIVE',
        jobSource: source as 'MANUAL' | 'SCRAPED' | 'IMPORTED' | 'API',
        extractionStatus: 'PENDING',
        searchText: `${title} ${(locationCounty as string) || ''}`.trim(),
      },
    });

    // Trigger AI extraction asynchronously (outside transaction per rules)
    let extractionSuccess = false;
    try {
      if (preExtractedProfile) {
        // Use pre-extracted data if provided
        await prisma.jobProfile.create({
          data: {
            jobId: job.id,
            ...mapPreExtractedProfile(preExtractedProfile),
            extractionStatus: 'EXTRACTED',
          },
        });
        extractionSuccess = true;
      } else {
        // AI extraction
        const result = await extractJobProfile(job.id, description as string);
        extractionSuccess = result.success;
      }

      // Update job extraction status
      await prisma.job.update({
        where: { id: job.id },
        data: {
          extractionStatus: extractionSuccess ? 'EXTRACTED' : 'FAILED',
        },
      });
    } catch (extractionError) {
      console.error('[Recruiter] Job extraction failed:', extractionError);
      await prisma.job.update({
        where: { id: job.id },
        data: { extractionStatus: 'FAILED' },
      });
    }

    return NextResponse.json(
      {
        success: true,
        job: {
          id: job.id,
          title: job.title,
          slug: job.slug,
          extractionStatus: extractionSuccess ? 'EXTRACTED' : 'FAILED',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/recruiter/jobs]', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}

/** Map pre-extracted profile fields to Prisma-compatible format */
function mapPreExtractedProfile(profile: Record<string, unknown>) {
  return {
    jobCategoryId: (profile.jobCategoryId as string) || null,
    primarySubcategoryId: (profile.primarySubcategoryId as string) || null,
    normalizedRoleId: (profile.normalizedRoleId as string) || null,
    organizationTypeId: (profile.organizationTypeId as string) || null,
    organizationIndustryId: (profile.organizationIndustryId as string) || null,
    minimumExperienceYears: Number(profile.minimumExperienceYears) || 0,
    preferredExperienceYears: Number(profile.preferredExperienceYears) || 0,
    seniorityLevel: (profile.seniorityLevel as string) || null,
    parserConfidenceScore: Number(profile.parserConfidenceScore) || null,
  };
}