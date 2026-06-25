import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function run() {
  const c = await p.jobCategory.count();
  console.log('Category count before clear:', c);
  if (c > 0) {
    await p.jobSubcategory.deleteMany();
    await p.jobCategory.deleteMany();
  }
  console.log('After clear:', await p.jobCategory.count());
  await p.$disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });