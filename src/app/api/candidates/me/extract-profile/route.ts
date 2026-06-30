import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';
import { extractCandidateProfile } from '@/lib/extraction/candidate-extractor';

/**
 * POST /api/candidates/me/extract-profile
 *
 * Triggers AI extraction for the logged-in candidate's most recently
 * uploaded CV. If no CV text is stored yet, returns an error.
 *
 * Optionally accepts { cvText?: string } in the body to provide text
 * directly (used after upload-cv extracts text via markitdown).
 */
export async function POST(request: NextRequest) {
  try {
    const candidateId = await getServerCandidateId(request);
    if (!candidateId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if candidate already has an extracted profile
    const existingProfile = await prisma.candidateProfile.findUnique({
      where: { candidateId },
      select: { extractionStatus: true },
    });

    if (existingProfile?.extractionStatus === 'EXTRACTED') {
      return NextResponse.json({
        success: true,
        message: 'Profile already extracted',
        alreadyExtracted: true,
      });
    }

    // Check if body contains cvText (called from upload-cv route)
    let cvText = '';
    try {
      const body = await request.json();
      cvText = body.cvText ?? '';
    } catch {
      // No body — will try to read from candidate record
    }

    // If no cvText provided, the candidate needs to upload a CV first
    if (!cvText || cvText.length < 50) {
      return NextResponse.json(
        {
          error: 'No CV text available. Please upload your CV first.',
          code: 'NO_CV_TEXT',
        },
        { status: 400 },
      );
    }

    // Run extraction (this is async and may take 10-30 seconds)
    const result = await extractCandidateProfile(candidateId, cvText);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? 'Extraction failed' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile extracted successfully',
      stats: result.stats,
    });
  } catch (error) {
    console.error('[POST /api/candidates/me/extract-profile]', error);
    return NextResponse.json(
      { error: 'Extraction failed due to a server error' },
      { status: 500 },
    );
  }
}