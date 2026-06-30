/**
 * AI-powered candidate CV extraction.
 *
 * Takes raw CV text, sends it to an LLM with a structured prompt,
 * receives JSON with skills, qualifications, experience, etc.,
 * then maps the text labels to TaxonomyItem IDs via TaxonomyLookup.
 *
 * All methods are server-side only (uses z-ai-web-dev-sdk).
 */

import { prisma } from '@/lib/prisma';
import { TaxonomyLookup } from './taxonomy-lookup';
import { computeAndSaveMatches } from '@/lib/matching/engine';

// ─── LLM Helper ──────────────────────────────────────────────────

async function callLLM(systemPrompt: string, userContent: string): Promise<string> {
  // Dynamic import so client-side code never bundles this
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

const CV_EXTRACTION_SYSTEM = `You are an expert CV/resume parser for the Kenyan job market. Extract structured data from the CV text and return ONLY valid JSON (no markdown, no code fences).

Return a JSON object with exactly these fields:
{
  "skills": ["Skill Name 1", "Skill Name 2", ...],
  "qualifications": [
    { "name": "e.g. Bachelor of Science in Computer Science", "institution": "University Name", "level": "BACHELORS|MASTERS|DIPLOMA|PHD|CERTIFICATE|HIGH_SCHOOL", "fieldOfStudy": "e.g. Computer Science", "startYear": 2015, "endYear": 2019, "status": "COMPLETED|IN_PROGRESS" }
  ],
  "workExperiences": [
    { "employerName": "Company Name", "roleTitle": "Job Title", "industry": "e.g. Information Technology, Banking", "startDate": "2020-01", "endDate": "2023-06 or null if current", "isCurrent": true/false, "description": "Brief description of responsibilities" }
  ],
  "certifications": [
    { "name": "Certification Name", "issuingBody": "e.g. AWS, Google", "yearAwarded": 2022 }
  ],
  "primaryCategory": "e.g. Information Technology, Engineering, Healthcare",
  "interestCategories": ["Category 1", "Category 2"],
  "subcategories": ["Subcategory 1", "Subcategory 2"],
  "seniorityLevel": "ENTRY|JUNIOR|MID|SENIOR|LEAD|EXECUTIVE",
  "totalExperienceYears": 5.5
}

Rules:
- Extract ALL technical and soft skills mentioned
- For qualifications, include the full degree/diploma name
- For industries, use standard industry names
- For seniorityLevel, infer from total years of experience and roles
- For categories/subcategories, use standard Kenyan job market terminology
- Return empty arrays [] if something cannot be determined
- Return ONLY the JSON object, nothing else`;

// ─── Parsed Output Type ──────────────────────────────────────────

interface ParsedQualification {
  name: string;
  institution?: string;
  level?: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  status?: string;
}

interface ParsedWorkExperience {
  employerName?: string;
  roleTitle?: string;
  industry?: string;
  startDate?: string;
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string;
}

interface ParsedCertification {
  name?: string;
  issuingBody?: string;
  yearAwarded?: number;
}

interface ParsedCV {
  skills?: string[];
  qualifications?: ParsedQualification[];
  workExperiences?: ParsedWorkExperience[];
  certifications?: ParsedCertification[];
  primaryCategory?: string;
  interestCategories?: string[];
  subcategories?: string[];
  seniorityLevel?: string;
  totalExperienceYears?: number;
}

// ─── Normalizers ─────────────────────────────────────────────────

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

// ─── Main Extraction Function ────────────────────────────────────

export async function extractCandidateProfile(
  candidateId: string,
  cvText: string,
): Promise<{ success: boolean; error?: string; stats?: Record<string, number> }> {
  if (!cvText || cvText.trim().length < 50) {
    return { success: false, error: 'CV text too short to extract meaningful data' };
  }

  // Truncate very long CVs to avoid token limits
  const maxLen = 8000;
  const truncatedText = cvText.length > maxLen ? cvText.slice(0, maxLen) + '\n...[truncated]' : cvText;

  try {
    // 1. Call LLM
    const raw = await callLLM(CV_EXTRACTION_SYSTEM, truncatedText);
    let parsed: ParsedCV;

    try {
      // Strip markdown code fences if present
      const cleaned = raw.replace(/```json?\s*/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('[CV Extraction] Failed to parse LLM JSON response');
      return { success: false, error: 'AI returned invalid data format' };
    }

    // 2. Load taxonomy lookup
    const lookup = await TaxonomyLookup.getInstance(prisma);

    // 3. Map and persist in a transaction
    const stats = await prisma.$transaction(async (tx) => {
      let skillsCreated = 0;
      let qualsCreated = 0;
      let experiencesCreated = 0;
      let certsCreated = 0;
      let interestsCreated = 0;
      let subcategoriesCreated = 0;

      // ── Skills ───────────────────────────────────────
      const skillNames = parsed.skills ?? [];
      const skillIds = lookup.findSkillIds(skillNames, 30);
      for (let i = 0; i < skillIds.length; i++) {
        await tx.candidateSkill.upsert({
          where: { candidateId_skillId: { candidateId, skillId: skillIds[i] } },
          create: {
            candidateId,
            skillId: skillIds[i],
            source: 'AI_EXTRACTED',
          },
          update: { source: 'AI_EXTRACTED' },
        });
        skillsCreated++;
      }

      // ── Qualifications ───────────────────────────────
      const quals = parsed.qualifications ?? [];
      for (const q of quals) {
        let qualId: string | null = null;
        if (q.name) {
          qualId = lookup.findQualificationId(q.name);
        }

        await tx.candidateQualification.create({
          data: {
            candidateId,
            qualificationId: qualId,
            institution: q.institution,
            fieldOfStudy: q.fieldOfStudy,
            level: normalizeQualLevel(q.level),
            status: q.status ?? 'COMPLETED',
            startYear: q.startYear,
            endYear: q.endYear,
            rawText: q.name,
          },
        });
        qualsCreated++;
      }

      // ── Work Experiences ─────────────────────────────
      const experiences = parsed.workExperiences ?? [];
      for (const exp of experiences) {
        const industryId = exp.industry ? lookup.findIndustryId(exp.industry) : null;
        const roleId = exp.roleTitle ? lookup.findRoleId(exp.roleTitle) : null;

        await tx.candidateWorkExperience.create({
          data: {
            candidateId,
            employerName: exp.employerName,
            roleTitle: exp.roleTitle,
            normalizedRoleId: roleId,
            organizationIndustryId: industryId,
            startDate: exp.startDate ? new Date(exp.startDate) : undefined,
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            isCurrent: exp.isCurrent ?? false,
            description: exp.description,
          },
        });
        experiencesCreated++;
      }

      // ── Certifications ───────────────────────────────
      const certs = parsed.certifications ?? [];
      for (const c of certs) {
        let certId: string | null = null;
        if (c.name) {
          certId = lookup.findCertificationId(c.name);
        }

        await tx.candidateCertification.create({
          data: {
            candidateId,
            certificationId: certId,
            issuingBody: c.issuingBody,
            yearAwarded: c.yearAwarded,
            rawText: c.name,
          },
        });
        certsCreated++;
      }

      // ── Candidate Profile ────────────────────────────
      const primaryCategoryId = parsed.primaryCategory
        ? lookup.findCategoryId(parsed.primaryCategory)
        : null;
      const primarySubcategoryId =
        parsed.subcategories && parsed.subcategories.length > 0
          ? lookup.findSubcategoryId(parsed.subcategories[0])
          : null;

      // Compute total experience from work history if not provided
      let totalExp = parsed.totalExperienceYears ?? 0;
      if (!totalExp && experiences.length > 0) {
        const now = new Date();
        for (const exp of experiences) {
          const start = exp.startDate ? new Date(exp.startDate) : null;
          const end = exp.isCurrent ? now : exp.endDate ? new Date(exp.endDate) : now;
          if (start && end && end > start) {
            totalExp += (end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
          }
        }
        totalExp = Math.round(totalExp * 10) / 10; // 1 decimal
      }

      await tx.candidateProfile.upsert({
        where: { candidateId },
        create: {
          candidateId,
          primaryCategoryId,
          primarySubcategoryId,
          totalExperienceYears: totalExp,
          seniorityLevel: normalizeSeniority(parsed.seniorityLevel) ?? 'MID',
          extractionStatus: 'EXTRACTED',
          parserConfidenceScore: 0.8, // placeholder; could be refined
        },
        update: {
          primaryCategoryId,
          primarySubcategoryId,
          totalExperienceYears: totalExp,
          seniorityLevel: normalizeSeniority(parsed.seniorityLevel) ?? 'MID',
          extractionStatus: 'EXTRACTED',
          parserConfidenceScore: 0.8,
        },
      });

      // ── Interests ────────────────────────────────────
      const interestNames = parsed.interestCategories ?? [];
      const interestCategoryIds = lookup.findCategoryIds(interestNames, 5);
      for (const catId of interestCategoryIds) {
        await tx.candidateInterest.upsert({
          where: { candidateId_categoryId: { candidateId, categoryId: catId } },
          create: {
            candidateId,
            categoryId: catId,
            source: 'AI_EXTRACTED',
          },
          update: { source: 'AI_EXTRACTED', aiSuggested: true },
        });
        interestsCreated++;
      }

      // ── Subcategories ────────────────────────────────
      const subcatNames = parsed.subcategories ?? [];
      const subcatIds = lookup.findSubcategoryIds(subcatNames, 10);
      for (const scId of subcatIds) {
        await tx.candidateSubcategory.upsert({
          where: { candidateId_subcategoryId: { candidateId, subcategoryId: scId } },
          create: {
            candidateId,
            subcategoryId: scId,
            source: 'AI_EXTRACTED',
          },
          update: { source: 'AI_EXTRACTED' },
        });
        subcategoriesCreated++;
      }

      // ── Update candidate onboarding status ───────────
      await tx.candidate.update({
        where: { id: candidateId },
        data: { onboardingStatus: 'EXTRACTION_COMPLETE' },
      });

      return {
        skills: skillsCreated,
        qualifications: qualsCreated,
        experiences: experiencesCreated,
        certifications: certsCreated,
        interests: interestsCreated,
        subcategories: subcategoriesCreated,
      };
    });

    // 4. Trigger matching (outside transaction — this can fail independently)
    try {
      const matchCount = await computeAndSaveMatches(candidateId);
      console.log(`[CV Extraction] Computed ${matchCount} matches for candidate ${candidateId}`);
    } catch (matchErr) {
      console.error('[CV Extraction] Matching failed (non-fatal):', matchErr);
    }

    return { success: true, stats };
  } catch (error) {
    console.error('[CV Extraction] Fatal error:', error);
    return { success: false, error: 'Extraction failed due to a server error' };
  }
}