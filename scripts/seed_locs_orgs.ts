import { PrismaClient } from '@prisma/client';
import { locationData } from '../prisma/seed-data/locations';
import { organizationData } from '../prisma/seed-data/organizations';

const p = new PrismaClient();

async function seedLocations() {
  console.log('Seeding locations...');
  for (const loc of locationData) {
    await p.location.upsert({
      where: { slug: loc.slug },
      update: { county: loc.county, description: loc.description, seoTitle: `Jobs in ${loc.county} County`, seoDescription: `Browse job vacancies in ${loc.county} County, Kenya.` },
      create: { county: loc.county, slug: loc.slug, description: loc.description, seoTitle: `Jobs in ${loc.county} County`, seoDescription: `Browse job vacancies in ${loc.county} County, Kenya.` },
    });
  }
  console.log(`Locations: ${await p.location.count()}`);
}

async function seedOrganizations() {
  console.log('Seeding organizations...');
  for (const org of organizationData) {
    await p.organization.upsert({
      where: { orgSlug: org.orgSlug },
      update: { orgName: org.orgName, orgIndustry: org.orgIndustry as any, orgType: org.orgType as any, headquarters: org.headquarters, orgDescription: org.orgDescription },
      create: { orgName: org.orgName, orgSlug: org.orgSlug, orgIndustry: org.orgIndustry as any, orgType: org.orgType as any, headquarters: org.headquarters, orgWebsite: org.orgWebsite || null, orgDescription: org.orgDescription, seoTitle: `${org.orgName} Careers`, seoDescription: `View jobs at ${org.orgName}.` },
    });
  }
  console.log(`Organizations: ${await p.organization.count()}`);
}

async function main() {
  await seedLocations();
  await seedOrganizations();
  console.log('DONE');
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });