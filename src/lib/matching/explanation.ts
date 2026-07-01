// AI Match Explanation Generator
// Generates human-readable explanations for match scores using the z-ai-web-dev-sdk LLM.
// Called on-demand for top matches, NOT during bulk matching (to keep matching fast).

import { prisma } from '@/lib/prisma';
import type { MatchResult } from './types';

/**
 * Generate an AI explanation for a candidate-job match.
 * Only called for matches the candidate views or interacts with.
 */
export async function generateMatchExplanation(
  candidateId: string,
  jobId: string,
  match: MatchResult,
  matchedSkillNames: string[],
  missingSkillNames: string[],
  candidateCategoryLabel: string | null,
  jobCategoryLabel: string | null
): Promise<string> {
  const verdict = match.verdict;

  // For low scores, skip LLM — use a template
  if (verdict === 'NOT_RECOMMENDED' || verdict === 'WEAK') {
    return generateTemplateExplanation(
      verdict,
      matchedSkillNames,
      missingSkillNames,
      candidateCategoryLabel,
      jobCategoryLabel,
      match
    );
  }

  try {
    const prompt = `You are a career advisor for a Kenyan job matching platform. Write a brief (2-3 sentences) explanation for why this candidate is a ${verdict} match for this job.

Match scores (out of 100):
- Category match: ${match.categoryScore}
- Subcategory match: ${match.subcategoryScore}
- Skills match: ${match.skillsScore} (${match.matchedSkillCount}/${match.totalRequiredSkills} required skills matched)
- Qualifications match: ${match.qualificationsScore}
- Experience match: ${match.experienceScore}

Candidate's strongest category: ${candidateCategoryLabel || 'Unknown'}
Job's category: ${jobCategoryLabel || 'Unknown'}
Matched skills: ${matchedSkillNames.join(', ') || 'None'}
Missing skills: ${missingSkillNames.join(', ') || 'None'}

Write the explanation in a friendly, encouraging tone. Be specific about strengths and gaps. Do NOT use markdown formatting.`;

    const { ZAi } = await import('z-ai-web-dev-sdk');
    const sdk = new ZAi();
    const response = await sdk.chat.completions.create({
      model: 'glm-4-flash',
      messages: [
        { role: 'system', content: 'You are a helpful career advisor. Keep responses concise (2-3 sentences max).' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 150,
    });

    const explanation = response.choices?.[0]?.message?.content?.trim();
    return explanation || generateTemplateExplanation(verdict, matchedSkillNames, missingSkillNames, candidateCategoryLabel, jobCategoryLabel, match);
  } catch (error) {
    console.error('[MatchExplanation] LLM call failed, using template:', error);
    return generateTemplateExplanation(verdict, matchedSkillNames, missingSkillNames, candidateCategoryLabel, jobCategoryLabel, match);
  }
}

/**
 * Generate a template-based explanation (no LLM call).
 * Used as fallback or for low-score matches.
 */
function generateTemplateExplanation(
  verdict: string,
  matchedSkills: string[],
  missingSkills: string[],
  candidateCategory: string | null,
  jobCategory: string | null,
  match: MatchResult
): string {
  const parts: string[] = [];

  if (verdict === 'EXCELLENT' || verdict === 'STRONG') {
    parts.push(`You are a strong match with a ${match.finalScore}% score.`);
    if (matchedSkills.length > 0) {
      parts.push(`Your key strengths include ${matchedSkills.slice(0, 3).join(', ')}.`);
    }
    if (missingSkills.length > 0) {
      parts.push(`Consider gaining experience with ${missingSkills.slice(0, 2).join(' and ')} to strengthen your application.`);
    }
  } else if (verdict === 'MODERATE') {
    parts.push(`You are a moderate match (${match.finalScore}%).`);
    if (matchedSkills.length > 0) {
      parts.push(`You have relevant skills: ${matchedSkills.slice(0, 3).join(', ')}.`);
    }
    if (missingSkills.length > 0) {
      parts.push(`Key gaps include ${missingSkills.slice(0, 3).join(', ')}.`);
    }
  } else if (verdict === 'WEAK') {
    if (candidateCategory && jobCategory && candidateCategory !== jobCategory) {
      parts.push(`This role requires ${jobCategory} expertise, while your background is in ${candidateCategory}.`);
    }
    if (missingSkills.length > 0) {
      parts.push(`Most required skills (${missingSkills.slice(0, 3).join(', ')}) are not in your profile.`);
    }
  } else {
    if (candidateCategory && jobCategory) {
      parts.push(`This ${jobCategory} role requires different expertise than your ${candidateCategory} background.`);
    }
    parts.push('Consider exploring roles that better match your skills and experience.');
  }

  return parts.join(' ');
}

/**
 * Generate and persist explanation for a specific match score.
 * Called when a candidate views a match detail.
 */
export async function explainAndSaveMatch(
  candidateId: string,
  jobId: string
): Promise<string | null> {
  const score = await prisma.candidateJobScore.findUnique({
    where: { candidateId_jobId: { candidateId, jobId } },
  });

  if (!score || score.explanation) return score?.explanation ?? null;

  // Get labels
  const [candidate, job] = await Promise.all([
    prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        profile: { select: { primaryCategoryId: true } },
        skills: { select: { skillId: true } },
      },
    }),
    prisma.job.findUnique({
      where: { id: jobId },
      include: {
        jobProfile: { select: { jobCategoryId: true } },
        jobSkills: { where: { importance: 'MUST_HAVE' }, select: { skillId: true } },
      },
    }),
  ]);

  if (!candidate || !job) return null;

  const matchedSkillIds = candidate.skills
    .map((s) => s.skillId)
    .filter((sid) => job.jobSkills.some((js) => js.skillId === sid));
  const missingSkillIds = job.jobSkills
    .map((s) => s.skillId)
    .filter((sid) => !candidate.skills.some((cs) => cs.skillId === sid));

  // Get skill labels
  const skillIds = [...matchedSkillIds, ...missingSkillIds];
  const taxonomyItems = skillIds.length > 0
    ? await prisma.taxonomyItem.findMany({
        where: { id: { in: skillIds } },
        select: { id: true, label: true },
      })
    : [];

  const labelMap = Object.fromEntries(taxonomyItems.map((t) => [t.id, t.label]));

  const match: MatchResult = {
    finalScore: score.finalScore,
    categoryScore: score.categoryScore,
    subcategoryScore: score.subcategoryScore,
    skillsScore: score.skillsScore,
    qualificationsScore: score.qualificationsScore,
    experienceScore: score.experienceScore,
    industryScore: score.industryScore,
    verdict: score.verdict as MatchResult['verdict'],
    recommendationType: score.recommendationType as MatchResult['recommendationType'],
    matchedSkillCount: score.matchedSkillCount,
    totalRequiredSkills: score.totalRequiredSkills,
    matchedQualificationCount: score.matchedQualificationCount,
    totalRequiredQualifications: score.totalRequiredQualifications,
  };

  const explanation = await generateMatchExplanation(
    candidateId,
    jobId,
    match,
    matchedSkillIds.map((id) => labelMap[id] || id),
    missingSkillIds.map((id) => labelMap[id] || id),
    candidate.profile?.primaryCategoryId ?? null,
    job.jobProfile?.jobCategoryId ?? null
  );

  // Save explanation
  await prisma.candidateJobScore.update({
    where: { candidateId_jobId: { candidateId, jobId } },
    data: { explanation },
  });

  return explanation;
}