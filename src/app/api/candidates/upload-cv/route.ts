import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';
import { extractCandidateProfile } from '@/lib/extraction/candidate-extractor';

/**
 * POST /api/candidates/upload-cv
 *
 * Accepts a CV file (multipart/form-data), extracts text using
 * pdf-parse (PDF) or mammoth (DOCX), then triggers AI-based
 * profile extraction synchronously.
 *
 * Expected form fields:
 *   - file: the CV file (PDF, DOCX, DOC)
 *
 * Flow:
 *   1. Validate file type and size (max 5MB)
 *   2. Extract text using appropriate parser
 *   3. Update candidate onboardingStatus to CV_UPLOADED
 *   4. Trigger AI profile extraction (skills, quals, experience, etc.)
 *   5. Return success with extraction stats
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

    // Extract text from CV
    let extractedText = '';
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      if (file.type === 'application/pdf') {
        // Use pdf-parse for PDF files
        const pdfParse = (await import('pdf-parse')).default;
        const data = await pdfParse(buffer);
        extractedText = data.text || '';
      } else {
        // Use mammoth for DOCX/DOC files
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || '';
      }
    } catch (conversionError) {
      console.error('[CV Upload] text extraction failed:', conversionError);
      extractedText = '';
    }

    // Update candidate onboarding status
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { onboardingStatus: 'CV_UPLOADED' },
    });

    // Trigger AI extraction if we got usable text
    let extractionResult: { success: boolean; error?: string; stats?: Record<string, number> } | null = null;

    if (extractedText.length >= 50) {
      console.log(`[CV Upload] Starting AI extraction for candidate ${candidateId} (${extractedText.length} chars)`);
      extractionResult = await extractCandidateProfile(candidateId, extractedText);
      if (extractionResult.success) {
        console.log(`[CV Upload] Extraction complete: ${JSON.stringify(extractionResult.stats)}`);
      } else {
        console.error(`[CV Upload] Extraction failed: ${extractionResult.error}`);
      }
    } else {
      console.log(`[CV Upload] Extracted text too short (${extractedText.length} chars), skipping AI extraction`);
    }

    return NextResponse.json({
      success: true,
      message: extractionResult?.success
        ? 'CV uploaded and profile extracted successfully'
        : 'CV uploaded. Profile extraction ' + (extractionResult ? 'failed — ' + extractionResult.error : 'skipped (text too short)'),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      textLength: extractedText.length,
      extracted: extractionResult?.success ?? false,
      extractionStats: extractionResult?.stats ?? null,
    });
  } catch (error) {
    console.error('[POST /api/candidates/upload-cv]', error);
    return NextResponse.json({ error: 'Failed to upload CV' }, { status: 500 });
  }
}