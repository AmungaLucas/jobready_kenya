import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';
import { extractCandidateProfile } from '@/lib/extraction/candidate-extractor';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import os from 'os';

/**
 * POST /api/candidates/upload-cv
 *
 * Accepts a CV file (multipart/form-data), extracts text using
 * markitdown-js (unified PDF/DOCX parser), then triggers AI-based
 * profile extraction synchronously.
 *
 * Expected form fields:
 *   - file: the CV file (PDF, DOCX, DOC)
 *
 * Flow:
 *   1. Validate file type and size (max 5MB)
 *   2. Write buffer to a temp file
 *   3. Use markitdown-js to extract text
 *   4. Clean up temp file
 *   5. Update candidate onboardingStatus to CV_UPLOADED
 *   6. Trigger AI profile extraction (skills, quals, experience, etc.)
 *   7. Return success with extraction stats
 */
export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

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

    // Extract text from CV using markitdown-js
    let extractedText = '';
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      // Determine file extension from original filename
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const allowedExts = ['pdf', 'docx', 'doc'];
      const fileExt = allowedExts.includes(ext) ? `.${ext}` : '';

      // Write buffer to a temp file (markitdown-js operates on file paths)
      const tmpDir = join(os.tmpdir(), 'cv-uploads');
      await mkdir(tmpDir, { recursive: true });
      tempFilePath = join(tmpDir, `${randomUUID()}${fileExt}`);
      await writeFile(tempFilePath, buffer);

      // Dynamically import markitdown-js (loaded at runtime via serverExternalPackages)
      const { default: MarkItDown } = await import('markitdown-js');
      const md = new MarkItDown();

      const result = await md.convert(tempFilePath, {
        fileExtension: fileExt || undefined,
      });

      extractedText = result?.textContent || '';
      console.log(`[CV Upload] markitdown-js extracted ${extractedText.length} chars from ${file.name}`);
    } catch (conversionError) {
      console.error('[CV Upload] markitdown-js extraction failed:', conversionError);
      extractedText = '';
    } finally {
      // Always clean up the temp file
      if (tempFilePath) {
        try {
          await unlink(tempFilePath);
        } catch (cleanupErr) {
          console.warn('[CV Upload] Failed to clean up temp file:', cleanupErr);
        }
        tempFilePath = null;
      }
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
  } finally {
    // Safety net: clean up if still exists
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch {
        // already cleaned up or never created
      }
    }
  }
}