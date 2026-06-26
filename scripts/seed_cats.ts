import { PrismaClient } from '@prisma/client';
import { jobCategoryData } from '../prisma/seed-data/categories';

const p = new PrismaClient();
function slugify(t: string) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

async function run() {
  // Step 1: Insert all categories
  console.log('Inserting categories...');
  for (const cat of jobCategoryData) {
    const s = slugify(cat.value);
    await p.jobCategory.create({
      data: {
        value: cat.value, label: cat.label, slug: s,
        icon: cat.icon || null,
        seoDescription: cat.seoDescription,
        seoTitle: cat.label + ' Jobs in Kenya',
        description: cat.seoDescription?.substring(0, 200) || null,
      },
    });
  }
  console.log(`Created ${await p.jobCategory.count()} categories`);

  // Step 2: Get all categories for subcategory foreign keys
  const allCats = await p.jobCategory.findMany({ select: { id: true, slug: true, value: true } });
  const catMap = new Map(allCats.map(c => [c.value, { id: c.id, slug: c.slug }]));

  // Step 3: Insert all subcategories
  console.log('Inserting subcategories...');
  let subCount = 0;
  for (const cat of jobCategoryData) {
    const parent = catMap.get(cat.value);
    if (!parent) { console.error('Missing parent:', cat.value); continue; }
    for (let j = 0; j < cat.subcategories.length; j++) {
      const sub = cat.subcategories[j];
      await p.jobSubcategory.create({
        data: {
          value: sub.value, label: sub.label,
          slug: parent.slug + '-' + slugify(sub.label),
          categoryId: parent.id, sortOrder: j,
        },
      });
      subCount++;
    }
  }
  console.log(`Created ${subCount} subcategories (total: ${await p.jobSubcategory.count()})`);
  await p.$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });