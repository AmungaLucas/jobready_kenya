import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

/**
 * POST /api/candidates/upload-cv
 *
 * Accepts a CV file (multipart/form-data), extracts text using markitdown,
 * then triggers AI-based profile extraction.
 *
 * Expected form fields:
 *   - file: the CV file (PDF, DOCX, DOC)
 *
 * Flow:
 *   1. Validate file type and size (max 5MB)
 *   2. Store file reference (in production: upload to S3/Blob storage)
 *   3. Extract text using markitdown
 *   4. Update candidate onboardingStatus to CV_UPLOADED
 *   5. Return success — AI extraction will happen async (cron or queue)
 */
export async function POST(request: NextRequest) {
  try {
    const candidateId = await getServerCandidateId(request);
    if (!candidateId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Upload a PDF, DOCX, or DOC file.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // TODO: In production, upload file to S3/Vercel Blob and store the URL

    // Extract text using markitdown
    let extractedText = '';
    try {
      const { MarkItDown } = await import('markitdown');
      const md = new MarkItDown();
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await md.convert(buffer);
      extractedText = result.text_content;
    } catch (conversionError) {
      console.error('[CV Upload] markitdown conversion failed:', conversionError);
      extractedText = '';
    }

    // Update candidate onboarding status
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { onboardingStatus: 'CV_UPLOADED' },
    });

    // TODO: Queue AI extraction job here

    return NextResponse.json({
      success: true,
      message: 'CV uploaded successfully',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      textLength: extractedText.length,
    });
  } catch (error) {
    console.error('[POST /api/candidates/upload-cv]', error);
    return NextResponse.json({ error: 'Failed to upload CV' }, { status: 500 });
  }
}