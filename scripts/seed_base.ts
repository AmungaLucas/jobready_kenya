import { PrismaClient } from '@prisma/client';
import { jobCategoryData } from '../prisma/seed-data/categories';
import { locationData } from '../prisma/seed-data/locations';
import { organizationData } from '../prisma/seed-data/organizations';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('Seeding categories...');
  for (let i = 0; i < jobCategoryData.length; i++) {
    const cat = jobCategoryData[i];
    const categorySlug = slugify(cat.value);
    const category = await prisma.jobCategory.create({
      data: {
        value: cat.value,
        label: cat.label,
        slug: categorySlug,
        icon: cat.icon || null,
        seoDescription: cat.seoDescription,
        seoTitle: `${cat.label} Jobs in Kenya - Find ${cat.label} Vacancies`,
        description: cat.seoDescription?.substring(0, 200) || null,
        sortOrder: i,
      },
    });
    for (let j = 0; j < cat.subcategories.length; j++) {
      const sub = cat.subcategories[j];
      const subSlug = `${categorySlug}-${slugify(sub.label)}`;
      await prisma.jobSubcategory.create({
        data: {
          value: sub.value,
          label: sub.label,
          slug: subSlug,
          categoryId: category.id,
          sortOrder: j,
        },
      });
    }
  }
  console.log(`Done: ${await prisma.jobCategory.count()} categories, ${await prisma.jobSubcategory.count()} subcategories`);

  console.log('Seeding locations...');
  for (const loc of locationData) {
    await prisma.location.create({
      data: {
        county: loc.county,
        slug: loc.slug,
        description: loc.description,
        seoTitle: `Jobs in ${loc.county} County - Find Vacancies in ${loc.county}`,
        seoDescription: `Browse current job vacancies in ${loc.county} County, Kenya.`,
      },
    });
  }
  console.log(`Done: ${await prisma.location.count()} locations`);

  console.log('Seeding organizations...');
  for (const org of organizationData) {
    await prisma.organization.create({
      data: {
        orgName: org.orgName,
        orgSlug: org.orgSlug,
        orgIndustry: org.orgIndustry as any,
        orgType: org.orgType as any,
        headquarters: org.headquarters,
        orgWebsite: org.orgWebsite || null,
        orgDescription: org.orgDescription,
        seoTitle: `${org.orgName} Careers & Job Vacancies in Kenya`,
        seoDescription: `View current job openings at ${org.orgName}.`,
      },
    });
  }
  console.log(`Done: ${await prisma.organization.count()} organizations`);
  console.log('BASE SEED COMPLETE');
}

main()
  .catch((e) => { console.error('FAILED:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });