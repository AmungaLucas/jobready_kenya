import { PrismaClient } from '@prisma/client';
import { jobCategoryData } from '../prisma/seed-data/categories';
import { locationData } from '../prisma/seed-data/locations';
import { organizationData } from '../prisma/seed-data/organizations';

const p = new PrismaClient();
function slugify(t: string) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

async function seedCategories() {
  console.log('Seeding categories & subcategories...');
  for (let i = 0; i < jobCategoryData.length; i++) {
    const cat = jobCategoryData[i];
    const s = slugify(cat.value);
    await p.jobCategory.upsert({
      where: { value: cat.value },
      update: { label: cat.label, icon: cat.icon || null, seoDescription: cat.seoDescription, seoTitle: cat.label + ' Jobs in Kenya', sortOrder: i },
      create: { value: cat.value, label: cat.label, slug: s, icon: cat.icon || null, seoDescription: cat.seoDescription, seoTitle: cat.label + ' Jobs in Kenya', description: cat.seoDescription?.substring(0, 200) || null, sortOrder: i },
    });
  }
  console.log(`  Categories: ${await p.jobCategory.count()}`);

  const allCats = await p.jobCategory.findMany({ select: { id: true, slug: true, value: true } });
  const catMap = new Map(allCats.map(c => [c.value, { id: c.id, slug: c.slug }]));

  let subTotal = 0;
  for (const cat of jobCategoryData) {
    const parent = catMap.get(cat.value);
    if (!parent) continue;
    for (let j = 0; j < cat.subcategories.length; j++) {
      const sub = cat.subcategories[j];
      const subSlug = parent.slug + '-' + slugify(sub.label);
      await p.jobSubcategory.upsert({
        where: { categoryId_value: { categoryId: parent.id, value: sub.value } },
        update: { label: sub.label, slug: subSlug, sortOrder: j },
        create: { value: sub.value, label: sub.label, slug: subSlug, categoryId: parent.id, sortOrder: j },
      });
      subTotal++;
    }
  }
  console.log(`  Subcategories: ${await p.jobSubcategory.count()} (processed ${subTotal})`);
}

async function seedLocations() {
  console.log('Seeding locations...');
  for (const loc of locationData) {
    await p.location.upsert({
      where: { slug: loc.slug },
      update: { county: loc.county, description: loc.description, seoTitle: `Jobs in ${loc.county} County`, seoDescription: `Browse job vacancies in ${loc.county} County, Kenya.` },
      create: { county: loc.county, slug: loc.slug, description: loc.description, seoTitle: `Jobs in ${loc.county} County`, seoDescription: `Browse job vacancies in ${loc.county} County, Kenya.` },
    });
  }
  console.log(`  Locations: ${await p.location.count()}`);
}

async function seedOrganizations() {
  console.log('Seeding organizations...');
  for (const org of organizationData) {
    await p.organization.upsert({
      where: { orgSlug: org.orgSlug },
      update: { orgName: org.orgName, orgIndustry: org.orgIndustry as any, orgType: org.orgType as any, headquarters: org.headquarters, orgDescription: org.orgDescription },
      create: { orgName: org.orgName, orgSlug: org.orgSlug, orgIndustry: org.orgIndustry as any, orgType: org.orgType as any, headquarters: org.headquarters, orgWebsite: org.orgWebsite || null, orgDescription: org.orgDescription, seoTitle: `${org.orgName} Careers & Jobs`, seoDescription: `View job openings at ${org.orgName}.` },
    });
  }
  console.log(`  Organizations: ${await p.organization.count()}`);
}

async function main() {
  console.log('=== SEED START ===');
  await seedCategories();
  await seedLocations();
  await seedOrganizations();
  console.log('=== SEED COMPLETE ===');
  console.log(`Categories: ${await p.jobCategory.count()}, Subs: ${await p.jobSubcategory.count()}, Locations: ${await p.location.count()}, Orgs: ${await p.organization.count()}`);
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });