import { PrismaClient } from '@prisma/client';
import { jobCategoryData } from './seed-data/categories';
import { locationData } from './seed-data/locations';
import { organizationData } from './seed-data/organizations';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seedCategories() {
  console.log('🌱 Seeding categories and subcategories...');

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

  const catCount = await prisma.jobCategory.count();
  const subCount = await prisma.jobSubcategory.count();
  console.log(`✅ Seeded ${catCount} categories and ${subCount} subcategories`);
}

async function seedLocations() {
  console.log('🌱 Seeding locations (47 counties)...');

  for (const loc of locationData) {
    await prisma.location.upsert({
      where: { slug: loc.slug },
      update: { county: loc.county, description: loc.description, seoTitle: `Jobs in ${loc.county} County - Find Vacancies in ${loc.county}`, seoDescription: `Browse current job vacancies in ${loc.county} County, Kenya. Find the latest ${loc.county.toLowerCase()} job opportunities across all industries and sectors.` },
      create: {
        county: loc.county,
        slug: loc.slug,
        description: loc.description,
        seoTitle: `Jobs in ${loc.county} County - Find Vacancies in ${loc.county}`,
        seoDescription: `Browse current job vacancies in ${loc.county} County, Kenya. Find the latest ${loc.county.toLowerCase()} job opportunities across all industries and sectors.`,
      },
    });
  }

  const count = await prisma.location.count();
  console.log(`✅ Seeded ${count} county locations`);
}

async function seedOrganizations() {
  console.log('🌱 Seeding organizations...');

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
        seoDescription: `View current job openings at ${org.orgName}. Find ${org.orgName.toLowerCase()} career opportunities, apply online, and start your professional journey.`,
      },
    });
  }

  const count = await prisma.organization.count();
  console.log(`✅ Seeded ${count} organizations`);
}

async function main() {
  console.log('🚀 Starting database seed...\n');

  await seedCategories();
  await seedLocations();
  await seedOrganizations();

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - Categories: ${await prisma.jobCategory.count()}`);
  console.log(`  - Subcategories: ${await prisma.jobSubcategory.count()}`);
  console.log(`  - Locations: ${await prisma.location.count()}`);
  console.log(`  - Organizations: ${await prisma.organization.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });