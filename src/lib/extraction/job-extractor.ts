/**
 * AI-powered job profile extraction.
 *
 * Takes a job description + metadata, sends to LLM, receives structured
 * extraction data, maps to TaxonomyItem IDs, persists JobProfile +
 * JobSkill + JobQualification + JobSubcategoryLink records.
 *
 * Can be used for:
 *   - Single-job extraction (after a new job is posted)
 *   - Batch backfill (script that processes all jobs without a profile)
 */

import { prisma } from '@/lib/prisma';
import { TaxonomyLookup } from './taxonomy-lookup';

// ─── LLM Helper (shared with candidate-extractor) ───────────────

async function callLLM(systemPrompt: string, userContent: string): Promise<string> {
  const ZAI = await import('z-ai-web-dev-sdk');
  const zai = await (ZAI.default ?? ZAI).create();

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    thinking: { type: 'disabled' },
  });

  return completion.choices[0]?.message?.content ?? '';
}

// ─── Extraction Prompt ───────────────────────────────────────────

const JOB_EXTRACTION_SYSTEM = `You are an expert job description parser for the Kenyan job market. Extract structured data from the job posting and return ONLY valid JSON (no markdown, no code fences).

Return a JSON object with exactly these fields:
{
  "primaryCategory": "e.g. Information Technology, Engineering, Healthcare, Finance",
  "subcategories": ["Primary subcategory", "Secondary if applicable"],
  "requiredSkills": ["Skill 1", "Skill 2", ...],
  "requiredQualifications": [
    { "name": "e.g. Bachelor of Science in Computer Science", "level": "BACHELORS|MASTERS|DIPLOMA|PHD|CERTIFICATE|HIGH_SCHOOL", "fieldOfStudy": "e.g. Computer Science" }
  ],
  "minimumExperienceYears": 3,
  "preferredExperienceYears": 5,
  "seniorityLevel": "ENTRY|JUNIOR|MID|SENIOR|LEAD|EXECUTIVE",
  "organizationIndustry": "e.g. Banking, Information Technology, Healthcare",
  "organizationType": "PRIVATE_COMPANY|PUBLIC_LISTED_COMPANY|NGO_LOCAL|NGO_INTERNATIONAL|GOVERNMENT_PUBLIC_ADMIN|STARTUP|UNIVERSITY|STATE_CORPORATION"
}

Rules:
- Extract ALL required/essential skills mentioned in the description
- For qualifications, include the minimum required qualification
- Infer seniority from experience requirements and role level
- Use standard Kenyan job market category names
- Return ONLY the JSON object, nothing else`;

// ─── Parsed Output Type ──────────────────────────────────────────

interface ParsedJobQual {
  name: string;
  level?: string;
  fieldOfStudy?: string;
}

interface ParsedJob {
  primaryCategory?: string;
  subcategories?: string[];
  requiredSkills?: string[];
  requiredQualifications?: ParsedJobQual[];
  minimumExperienceYears?: number;
  preferredExperienceYears?: number;
  seniorityLevel?: string;
  organizationIndustry?: string;
  organizationType?: string;
}

// ─── Normalizer ─────────────────────────────────────────────────

function normalizeSeniority(raw: string | undefined): 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE' | undefined {
  if (!raw) return undefined;
  const map: Record<string, 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE'> = {
    entry: 'ENTRY', entry_level: 'ENTRY', internship: 'ENTRY', fresh: 'ENTRY', graduate: 'ENTRY',
    junior: 'JUNIOR', junior_level: 'JUNIOR', associate: 'JUNIOR',
    mid: 'MID', mid_level: 'MID', intermediate: 'MID', regular: 'MID',
    senior: 'SENIOR', senior_level: 'SENIOR', experienced: 'SENIOR',
    lead: 'LEAD', lead_level: 'LEAD', principal: 'LEAD', staff: 'LEAD',
    executive: 'EXECUTIVE', c_level: 'EXECUTIVE', director: 'EXECUTIVE', vp: 'EXECUTIVE', head: 'EXECUTIVE',
  };
  return map[raw.toLowerCase().replace(/[_\s-]/g, '')] ?? 'MID';
}

function normalizeQualLevel(raw: string | undefined): 'CERTIFICATE' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'PHD' | 'OTHER' | undefined {
  if (!raw) return undefined;
  const map: Record<string, 'CERTIFICATE' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'PHD' | 'OTHER'> = {
    certificate: 'CERTIFICATE', cert: 'CERTIFICATE',
    diploma: 'DIPLOMA',
    bachelor: 'BACHELOR', bachelors: 'BACHELOR', bsc: 'BACHELOR', ba: 'BACHELOR', undergrad: 'BACHELOR',
    master: 'MASTER', masters: 'MASTER', msc: 'MASTER', ma: 'MASTER', mba: 'MASTER', postgrad: 'MASTER',
    phd: 'PHD', doctorate: 'PHD', dphil: 'PHD',
    high_school: 'OTHER', kcse: 'OTHER', 'a-level': 'OTHER', 'o-level': 'OTHER',
  };
  return map[raw.toLowerCase().replace(/[_\s-]/g, '')] ?? 'OTHER';
}

// ─── Single-Job Extraction ───────────────────────────────────────

export async function extractJobProfile(jobId: string): Promise<{
  success: boolean;
  error?: string;
  stats?: Record<string, number>;
}> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      title: true,
      description: true,
      organization: {
        select: { organizationType: true, industry: true },
      },
    },
  });

  if (!job) return { success: false, error: 'Job not found' };

  const orgContext = job.organization
    ? `Organization type: ${job.organization.organizationType ?? 'Unknown'}, Industry: ${job.organization.industry ?? 'Unknown'}`
    : '';

  const userContent = `Job Title: ${job.title}\n${orgContext}\n\nJob Description:\n${job.description ?? ''}`;

  return extractJobFromText(jobId, userContent);
}

// ─── Core Extraction Logic (shared) ──────────────────────────────

async function extractJobFromText(
  jobId: string,
  userContent: string,
): Promise<{ success: boolean; error?: string; stats?: Record<string, number> }> {
  try {
    const raw = await callLLM(JOB_EXTRACTION_SYSTEM, userContent);
    let parsed: ParsedJob;

    try {
      const cleaned = raw.replace(/```json?\s*/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error(`[Job Extraction] Failed to parse LLM response for job ${jobId}`);
      return { success: false, error: 'AI returned invalid data format' };
    }

    const lookup = await TaxonomyLookup.getInstance(prisma);

    const stats = await prisma.$transaction(async (tx) => {
      const primaryCategoryId = parsed.primaryCategory
        ? lookup.findCategoryId(parsed.primaryCategory)
        : null;
      const primarySubcategoryId =
        parsed.subcategories && parsed.subcategories.length > 0
          ? lookup.findSubcategoryId(parsed.subcategories[0])
          : null;
      const industryId = parsed.organizationIndustry
        ? lookup.findIndustryId(parsed.organizationIndustry)
        : null;
      const orgTypeId = parsed.organizationType
        ? lookup.findOrgTypeId(parsed.organizationType)
        : null;

      // Upsert JobProfile
      await tx.jobProfile.upsert({
        where: { jobId },
        create: {
          jobId,
          jobCategoryId: primaryCategoryId,
          primarySubcategoryId,
          organizationIndustryId: industryId,
          organizationTypeId: orgTypeId,
          minimumExperienceYears: parsed.minimumExperienceYears ?? 0,
          preferredExperienceYears: parsed.preferredExperienceYears ?? 0,
          seniorityLevel: normalizeSeniority(parsed.seniorityLevel) ?? 'MID',
          extractionStatus: 'EXTRACTED',
          parserConfidenceScore: 0.8,
        },
        update: {
          jobCategoryId: primaryCategoryId,
          primarySubcategoryId,
          organizationIndustryId: industryId,
          organizationTypeId: orgTypeId,
          minimumExperienceYears: parsed.minimumExperienceYears ?? 0,
          preferredExperienceYears: parsed.preferredExperienceYears ?? 0,
          seniorityLevel: normalizeSeniority(parsed.seniorityLevel) ?? 'MID',
          extractionStatus: 'EXTRACTED',
          parserConfidenceScore: 0.8,
        },
      });

      // ── Skills ───────────────────────────────────────
      const skillNames = parsed.requiredSkills ?? [];
      const skillIds = lookup.findSkillIds(skillNames, 20);
      let skillsCreated = 0;

      // Delete old skills and recreate
      await tx.jobSkill.deleteMany({ where: { jobId } });
      for (const skillId of skillIds) {
        await tx.jobSkill.create({
          data: { jobId, skillId, importance: 'MUST_HAVE' },
        });
        skillsCreated++;
      }

      // ── Qualifications ───────────────────────────────
      const quals = parsed.requiredQualifications ?? [];
      let qualsCreated = 0;

      await tx.jobQualification.deleteMany({ where: { jobId } });
      for (const q of quals) {
        const qualId = q.name ? lookup.findQualificationId(q.name) : null;
        await tx.jobQualification.create({
          data: {
            jobId,
            qualificationId: qualId,
            level: normalizeQualLevel(q.level),
            fieldOfStudy: q.fieldOfStudy,
            importance: 'MUST_HAVE',
            rawText: q.name,
          },
        });
        qualsCreated++;
      }

      // ── Subcategory Links ────────────────────────────
      const subcatNames = parsed.subcategories ?? [];
      const subcatIds = lookup.findSubcategoryIds(subcatNames, 5);
      let subcatsCreated = 0;

      await tx.jobSubcategoryLink.deleteMany({ where: { jobId } });
      for (const scId of subcatIds) {
        await tx.jobSubcategoryLink.create({
          data: { jobId, subcategoryId: scId },
        });
        subcatsCreated++;
      }

      return { skills: skillsCreated, qualifications: qualsCreated, subcategories: subcatsCreated };
    });

    return { success: true, stats };
  } catch (error) {
    console.error(`[Job Extraction] Fatal error for job ${jobId}:`, error);
    return { success: false, error: 'Extraction failed due to a server error' };
  }
}

// ─── Batch Extraction (for backfill scripts) ─────────────────────

export async function extractJobsBatch(
  options?: { limit?: number; offset?: number; delayMs?: number },
): Promise<{ processed: number; succeeded: number; failed: number }> {
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;
  const delayMs = options?.delayMs ?? 500;

  // Find jobs without an extracted profile
  const jobs = await prisma.job.findMany({
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      OR: [
        { jobProfile: null },
        { jobProfile: { extractionStatus: 'PENDING' } },
      ],
    },
    select: { id: true, title: true, description: true },
    skip: offset,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  let succeeded = 0;
  let failed = 0;

  for (const job of jobs) {
    const org = await prisma.job.findUnique({
      where: { id: job.id },
      select: {
        organization: {
          select: { organizationType: true, industry: true },
        },
      },
    });

    const orgContext = org?.organization
      ? `Organization type: ${org.organization.organizationType ?? 'Unknown'}, Industry: ${org.organization.industry ?? 'Unknown'}`
      : '';

    const userContent = `Job Title: ${job.title}\n${orgContext}\n\nJob Description:\n${job.description ?? ''}`;
    const result = await extractJobFromText(job.id, userContent);

    if (result.success) {
      succeeded++;
      console.log(`  ✓ Job ${job.id} (${job.title}): ${JSON.stringify(result.stats)}`);
    } else {
      failed++;
      console.log(`  ✗ Job ${job.id} (${job.title}): ${result.error}`);
    }

    // Rate-limit to avoid overwhelming the LLM API
    if (delayMs > 0 && jobs.indexOf(job) < jobs.length - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  console.log(`\nBatch complete: ${succeeded} succeeded, ${failed} failed out of ${jobs.length} jobs`);
  return { processed: jobs.length, succeeded, failed };
}