/**
 * Taxonomy lookup utility.
 *
 * Loads TaxonomyItems from the DB into memory-indexed maps so we can
 * fuzzy-match AI-extracted text labels to actual taxonomy IDs.
 *
 * Usage:
 *   const lookup = await TaxonomyLookup.getInstance(prisma);
 *   const skillId = await lookup.findSkillId('Python');
 *   const qualId  = await lookup.findQualificationId('Bachelor of Science');
 */

import { PrismaClient, type Prisma } from '@prisma/client';

type TaxonomyType =
  | 'SKILL'
  | 'QUALIFICATION'
  | 'CATEGORY'
  | 'SUBCATEGORY'
  | 'INDUSTRY'
  | 'CERTIFICATION'
  | 'ROLE'
  | 'ORGANIZATION_TYPE'
  | 'TOOL'
  | 'SPECIALIZATION';

// Simple normalized string for comparison
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Trigram-like similarity (bigram Jaccard) — fast and good enough for short labels
function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.length < 2 || nb.length < 2) return 0;

  const bigrams = (s: string) => {
    const set = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
    return set;
  };

  const ba = bigrams(na);
  const bb = bigrams(nb);
  let intersection = 0;
  for (const b of ba) if (bb.has(b)) intersection++;
  return intersection / (ba.size + bb.size - intersection);
}

export class TaxonomyLookup {
  private static instance: TaxonomyLookup | null = null;

  // Indexed by normalized label → { id, originalLabel }
  private indexes: Map<TaxonomyType, Map<string, { id: string; label: string }>> = new Map();

  private constructor() {}

  static async getInstance(prisma: PrismaClient): Promise<TaxonomyLookup> {
    if (TaxonomyLookup.instance) return TaxonomyLookup.instance;

    const lookup = new TaxonomyLookup();
    await lookup.load(prisma);
    TaxonomyLookup.instance = lookup;
    return lookup;
  }

  private async load(prisma: PrismaClient) {
    const types: TaxonomyType[] = [
      'SKILL',
      'QUALIFICATION',
      'CATEGORY',
      'SUBCATEGORY',
      'INDUSTRY',
      'CERTIFICATION',
      'ROLE',
      'ORGANIZATION_TYPE',
      'TOOL',
      'SPECIALIZATION',
    ];

    for (const type of types) {
      const items = await prisma.taxonomyItem.findMany({
        where: { type, isActive: true },
        select: { id: true, label: true, value: true },
      });

      const map = new Map<string, { id: string; label: string }>();
      for (const item of items) {
        const key = normalize(item.label);
        map.set(key, { id: item.id, label: item.label });
        // Also index by value if different
        if (normalize(item.value) !== key) {
          map.set(normalize(item.value), { id: item.id, label: item.label });
        }
      }
      this.indexes.set(type, map);
    }

    console.log(
      `[TaxonomyLookup] Loaded indexes: ${[...this.indexes.entries()]
        .map(([t, m]) => `${t}=${m.size}`)
        .join(', ')}`,
    );
  }

  /**
   * Find the best matching taxonomy ID for a given text label.
   * Returns null if no match exceeds the threshold.
   */
  private findBest(
    type: TaxonomyType,
    label: string,
    threshold = 0.45,
  ): string | null {
    const idx = this.indexes.get(type);
    if (!idx || idx.size === 0) return null;

    // 1. Exact normalized match
    const exact = idx.get(normalize(label));
    if (exact) return exact.id;

    // 2. Contains match (label contains the search term or vice versa)
    const nl = normalize(label);
    for (const [key, val] of idx) {
      if (key.includes(nl) || nl.includes(key)) return val.id;
    }

    // 3. Best similarity score above threshold
    let bestId: string | null = null;
    let bestScore = 0;
    for (const [key, val] of idx) {
      const score = similarity(label, key);
      if (score > bestScore) {
        bestScore = score;
        bestId = val.id;
      }
    }

    return bestScore >= threshold ? bestId : null;
  }

  /** Find multiple matches, returning up to `limit` IDs */
  private findMultiple(
    type: TaxonomyType,
    labels: string[],
    threshold = 0.4,
    limit = 20,
  ): string[] {
    const seen = new Set<string>();
    const results: string[] = [];

    for (const label of labels) {
      const id = this.findBest(type, label, threshold);
      if (id && !seen.has(id)) {
        seen.add(id);
        results.push(id);
        if (results.length >= limit) break;
      }
    }

    return results;
  }

  // ─── Public convenience methods ─────────────────────────────────

  findSkillId(label: string): string | null {
    return this.findBest('SKILL', label);
  }

  findQualificationId(label: string): string | null {
    return this.findBest('QUALIFICATION', label);
  }

  findCategoryId(label: string): string | null {
    return this.findBest('CATEGORY', label);
  }

  findSubcategoryId(label: string): string | null {
    return this.findBest('SUBCATEGORY', label);
  }

  findIndustryId(label: string): string | null {
    return this.findBest('INDUSTRY', label);
  }

  findCertificationId(label: string): string | null {
    return this.findBest('CERTIFICATION', label);
  }

  findRoleId(label: string): string | null {
    return this.findBest('ROLE', label);
  }

  findOrgTypeId(label: string): string | null {
    return this.findBest('ORGANIZATION_TYPE', label);
  }

  findSkillIds(labels: string[], limit = 30): string[] {
    return this.findMultiple('SKILL', labels, 0.35, limit);
  }

  findQualificationIds(labels: string[], limit = 10): string[] {
    return this.findMultiple('QUALIFICATION', labels, 0.35, limit);
  }

  findSubcategoryIds(labels: string[], limit = 10): string[] {
    return this.findMultiple('SUBCATEGORY', labels, 0.35, limit);
  }

  findCategoryIds(labels: string[], limit = 5): string[] {
    return this.findMultiple('CATEGORY', labels, 0.4, limit);
  }
}