import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function run() {
  const counts = {
    cats: await p.jobCategory.count(),
    subs: await p.jobSubcategory.count(),
    locs: await p.location.count(),
    orgs: await p.organization.count(),
    jobs: await p.job.count(),
    opps: await p.opportunity.count(),
    blog: await p.blogPost.count(),
  };
  console.log(JSON.stringify(counts, null, 2));
  await p.$disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });