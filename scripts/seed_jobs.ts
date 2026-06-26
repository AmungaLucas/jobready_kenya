import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function run() {
  await p.job.deleteMany();
  console.log('Cleared jobs');

  const categories = await p.jobCategory.findMany({ select: { id: true, slug: true, value: true } });
  const catMap = new Map(categories.map(c => [c.value, c.id]));
  const subcats = await p.jobSubcategory.findMany({ select: { id: true, value: true, categoryId: true, category: { select: { value: true } } } });
  // Map: "CATEGORY_VALUE:SUB_VALUE" → subcategoryId
  const subMap = new Map(subcats.map(s => [`${s.category.value}:${s.value}`, s.id]));
  // Fallback: first sub per category
  const catFirstSub = new Map<string, string>();
  for (const s of subcats) {
    if (!catFirstSub.has(s.category.value)) catFirstSub.set(s.category.value, s.id);
  }
  const orgs = await p.organization.findMany({ select: { id: true, orgSlug: true } });
  const orgMap = new Map(orgs.map(o => [o.orgSlug, o.id]));

  function slugify(t: string) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 80); }
  function getSub(catVal: string, subVal: string): string {
    return subMap.get(`${catVal}:${subVal}`) || catFirstSub.get(catVal) || '';
  }

  const jobs = [
    { t: 'Senior Software Engineer', c: 'Safaricom', l: 'Nairobi', co: 'Nairobi', ty: 'FULL_TIME', sMin: 60000, sMax: 80000, dl: '2026-08-30', cv: 'TECHNOLOGY', sv: 'SOFTWARE_ENGINEERING', os: 'safaricom', ex: 'SENIOR', f: true, d: "We're looking for a passionate Senior Software Engineer to join our fintech team in Nairobi. You will be responsible for designing, developing, and maintaining high-performance applications that power our mobile banking platform used by millions of Kenyans. The ideal candidate has 5+ years of experience with Node.js, React, and TypeScript, and a strong understanding of microservices architecture and cloud infrastructure." },
    { t: 'Public Health Officer', c: 'County Gov. Mombasa', l: 'Mombasa', co: 'Mombasa', ty: 'CONTRACT', sMin: 45000, sMax: 55000, dl: '2026-08-05', cv: 'HEALTHCARE', sv: 'PUBLIC_HEALTH', os: null, ex: 'MID', d: 'The County Government of Mombasa is seeking a qualified Public Health Officer to oversee disease prevention and community health programs across the county. Responsibilities include coordinating health campaigns, monitoring disease outbreaks, and community health education.' },
    { t: 'IT Support Intern', c: 'Equity Bank', l: 'Kisumu', co: 'Kisumu', ty: 'INTERNSHIP', sMin: null, sMax: null, dl: '2026-08-10', cv: 'TECHNOLOGY', sv: 'IT_SUPPORT', os: 'equity-group', ex: 'ENTRY', d: 'Equity Bank is looking for a motivated IT Support Intern to join our Kisumu office. Great opportunity to learn and grow in a dynamic banking environment. You will assist with hardware and software troubleshooting, network support, and IT inventory management.' },
    { t: 'Project Coordinator - Education Programs', c: 'UNICEF', l: 'Nairobi', co: 'Nairobi', ty: 'CONTRACT', sMin: 120000, sMax: 150000, dl: '2026-08-15', cv: 'GOVERNMENT', sv: 'CIVIL_SERVICE', os: null, ex: 'SENIOR', f: true, d: 'UNICEF Kenya is hiring a Project Coordinator to manage education and child welfare programs across multiple counties. This role involves coordinating with government partners, managing budgets and timelines, and monitoring program implementation to ensure quality delivery.' },
    { t: 'Marketing Manager - Digital', c: 'Co-operative Bank', l: 'Nairobi', co: 'Nairobi', ty: 'FULL_TIME', sMin: 80000, sMax: 100000, dl: '2026-07-25', cv: 'MARKETING', sv: 'DIGITAL_MARKETING', os: null, ex: 'SENIOR', d: 'Co-operative Bank is seeking an experienced Marketing Manager to develop and implement marketing strategies that drive brand awareness and customer acquisition across all digital and traditional channels. Must have 5+ years marketing experience and digital marketing expertise.' },
    { t: 'Data Analyst - Revenue Forecasting', c: 'Kenya Revenue Authority', l: 'Nairobi', co: 'Nairobi', ty: 'FULL_TIME', sMin: 50000, sMax: 65000, dl: '2026-08-30', cv: 'FINANCE', sv: 'ACCOUNTING', os: 'kenya-revenue-authority', ex: 'MID', d: 'Kenya Revenue Authority is looking for a Data Analyst to support tax data analysis, revenue forecasting, and compliance monitoring using advanced analytical tools including SQL, Python, and data visualization platforms.' },
    { t: 'Registered Nurse - County Facilities', c: 'County Gov. Kisumu', l: 'Kisumu', co: 'Kisumu', ty: 'FULL_TIME', sMin: 35000, sMax: 45000, dl: '2026-07-28', cv: 'HEALTHCARE', sv: 'NURSING', os: null, ex: 'MID', d: 'The County Government of Kisumu is seeking qualified registered nurses to join public health facilities across the county. Opportunities available in both urban and rural health centers providing patient care and administering medications.' },
    { t: 'Civil Engineer - Urban Roads', c: 'KURA', l: 'Nairobi', co: 'Nairobi', ty: 'CONTRACT', sMin: 70000, sMax: 90000, dl: '2026-08-02', cv: 'ENGINEERING', sv: 'CIVIL_ENGINEERING', os: null, ex: 'MID', d: 'Kenya Urban Roads Authority is looking for a Civil Engineer to oversee road construction and maintenance projects in Nairobi. Must be registered with the Engineers Board of Kenya and have 3+ years experience in road infrastructure.' },
    { t: 'Finance Officer - Donor Funds', c: 'UNICEF', l: 'Nairobi', co: 'Nairobi', ty: 'CONTRACT', sMin: 100000, sMax: 130000, dl: '2026-08-07', cv: 'FINANCE', sv: 'FINANCIAL_ANALYSIS', os: null, ex: 'MID', d: 'UNICEF Kenya seeks a Finance Officer to manage financial operations and ensure compliance with organizational policies and donor requirements for education programs. CPA or ACCA qualification required with 3+ years NGO experience.' },
    { t: 'Retail Sales Assistant', c: 'Naivas', l: 'Nairobi', co: 'Nairobi', ty: 'PART_TIME', sMin: 15000, sMax: 15000, dl: '2026-08-15', cv: 'CONSTRUCTION', sv: 'SITE_MANAGEMENT', os: null, ex: 'ENTRY', d: 'Naivas Supermarket is hiring part-time retail sales assistants for our new branch in Nairobi. Ideal for students and individuals seeking flexible working hours in a fast-paced retail environment.' },
    { t: 'Agricultural Extension Officer', c: 'County Gov. Nakuru', l: 'Nakuru', co: 'Nakuru', ty: 'FULL_TIME', sMin: 40000, sMax: 55000, dl: '2026-07-25', cv: 'AGRICULTURE', sv: 'AGRONOMY', os: null, ex: 'MID', d: 'The County Government of Nakuru is seeking an Agricultural Officer to support farming communities with extension services, training on modern farming techniques, and crop assessment to improve agricultural productivity.' },
    { t: 'ICT Officer - Digital Government', c: 'ICT Authority', l: 'Nairobi', co: 'Nairobi', ty: 'FULL_TIME', sMin: 55000, sMax: 70000, dl: '2026-08-05', cv: 'TECHNOLOGY', sv: 'SYSTEM_ADMIN', os: null, ex: 'MID', d: 'The ICT Authority is looking for an ICT Officer to support government digital transformation initiatives including e-government services, digital infrastructure development, and system administration across government agencies.' },
    { t: 'Customs Officer - Port of Mombasa', c: 'Kenya Revenue Authority', l: 'Mombasa', co: 'Mombasa', ty: 'FULL_TIME', sMin: 40000, sMax: 55000, dl: '2026-08-15', cv: 'GOVERNMENT', sv: 'REVENUE_COLLECTION', os: 'kenya-revenue-authority', ex: 'ENTRY', d: 'Kenya Revenue Authority is seeking Customs Officers to manage customs operations at the Port of Mombasa. Responsibilities include clearing imported goods, assessing customs duties, and enforcing customs laws and regulations.' },
    { t: 'Mathematics Teacher - Secondary', c: 'TSC', l: 'Nairobi', co: 'Nairobi', ty: 'FULL_TIME', sMin: 30000, sMax: 45000, dl: '2026-08-20', cv: 'EDUCATION', sv: 'TEACHING_SECONDARY', os: null, ex: 'JUNIOR', d: 'Teachers Service Commission is recruiting Mathematics teachers for secondary schools in Nairobi. Applicants must be TSC registered and hold a Bachelor of Education in Mathematics with 2+ years teaching experience.' },
    { t: 'Legal Assistant - Constitutional Law', c: 'Attorney General', l: 'Nairobi', co: 'Nairobi', ty: 'FULL_TIME', sMin: 45000, sMax: 60000, dl: '2026-08-10', cv: 'LEGAL', sv: 'CORPORATE_LAW', os: null, ex: 'JUNIOR', d: 'The Office of the Attorney General is seeking a Legal Assistant to support legal research, draft legal opinions, and assist in court proceedings for constitutional matters and government legal advisory.' },
    { t: 'Water Engineer - Supply Projects', c: 'County Gov. Kisumu', l: 'Kisumu', co: 'Kisumu', ty: 'CONTRACT', sMin: 50000, sMax: 65000, dl: '2026-08-10', cv: 'ENGINEERING', sv: 'ENVIRONMENTAL_ENGINEERING', os: null, ex: 'MID', d: 'County Government of Kisumu seeks a Water Engineer to design and oversee water supply and sanitation projects across the county. Must be registered with EBK and have 3+ years experience in water engineering.' },
    { t: 'Freelance Content Writer', c: 'Remote', l: 'Remote', co: 'Nairobi', ty: 'FREELANCE', sMin: null, sMax: null, dl: '2026-12-31', cv: 'MARKETING', sv: 'PUBLIC_RELATIONS', os: null, ex: 'MID', d: 'Looking for talented freelance writers to create content on career, technology, and business topics for Kenyan audiences. Remote position with flexible hours. Must have excellent writing skills and knowledge of SEO.', rm: true },
    { t: 'Logistics Coordinator - Shipping', c: 'Maersk', l: 'Mombasa', co: 'Mombasa', ty: 'FULL_TIME', sMin: 55000, sMax: 70000, dl: '2026-08-08', cv: 'CONSTRUCTION', sv: 'QUANTITY_SURVEYING', os: null, ex: 'MID', d: 'Maersk is looking for a Logistics Coordinator to manage shipping operations and coordinate with port authorities in Mombasa. Must have knowledge of shipping processes and 2+ years experience in logistics.' },
    { t: 'Community Development Officer', c: 'County Gov. Machakos', l: 'Machakos', co: 'Machakos', ty: 'FULL_TIME', sMin: 35000, sMax: 45000, dl: '2026-08-18', cv: 'HUMAN_RESOURCES', sv: 'HR_BUSINESS_PARTNER', os: null, ex: 'JUNIOR', d: 'County Government of Machakos seeks a Community Development Officer to implement community empowerment programs and mobilize participation in county development initiatives.' },
    { t: 'Audit Intern - Big Four', c: 'EY', l: 'Nairobi', co: 'Nairobi', ty: 'INTERNSHIP', sMin: null, sMax: null, dl: '2026-08-30', cv: 'FINANCE', sv: 'ACCOUNTING', os: null, ex: 'ENTRY', d: 'Ernst & Young is offering audit internship positions for students pursuing accounting and finance degrees. Gain hands-on experience in audit procedures, working papers, and financial analysis in a Big Four environment.' },
    { t: 'Event Staff - Conference Support', c: 'Events Kenya', l: 'Mombasa', co: 'Mombasa', ty: 'CASUAL', sMin: 1500, sMax: 1500, dl: '2026-12-31', cv: 'MARKETING', sv: 'BRAND_MANAGEMENT', os: null, ex: 'ENTRY', d: 'Looking for reliable event staff for upcoming conferences and exhibitions in Mombasa. Weekend availability required. Good communication skills and punctual.' },
    { t: 'Temporary Admin Assistant', c: 'World Vision', l: 'Nakuru', co: 'Nakuru', ty: 'TEMPORARY', sMin: 25000, sMax: 25000, dl: '2026-08-01', cv: 'HUMAN_RESOURCES', sv: 'HR_GENERALIST', os: 'world-vision-kenya', ex: 'ENTRY', d: 'World Vision Kenya needs a temporary admin assistant to cover maternity leave at their Nakuru office. Diploma in Business Admin required with computer literacy and 1+ year admin experience.' },
    { t: 'Software Development Intern', c: 'Google', l: 'Remote', co: 'Nairobi', ty: 'INTERNSHIP', sMin: null, sMax: null, dl: '2026-08-15', cv: 'TECHNOLOGY', sv: 'SOFTWARE_ENGINEERING', os: 'google-kenya', ex: 'ENTRY', f: true, d: 'Google is offering software development internships for talented students and recent graduates. Work on real products used by billions of people worldwide. Must be pursuing a CS degree with strong coding skills.', rm: true },
    { t: 'Data Science Intern - Urban Analytics', c: 'UN-Habitat', l: 'Nairobi', co: 'Nairobi', ty: 'INTERNSHIP', sMin: null, sMax: null, dl: '2026-08-20', cv: 'TECHNOLOGY', sv: 'WEB_DEVELOPMENT', os: null, ex: 'ENTRY', d: 'UN-Habitat is seeking a Data Science Intern to support urban data analytics and visualization projects for sustainable urban development across African cities. Python and R skills required with machine learning basics.' },
  ];

  let created = 0;
  for (const j of jobs) {
    const slug = slugify(`${j.t} ${j.c} ${j.l}`);
    const catId = catMap.get(j.cv) || null;
    const subId = getSub(j.cv, j.sv);
    if (!subId) { console.log(`  SKIP no sub ${j.cv}:${j.sv}`); continue; }
    const orgId = j.os ? (orgMap.get(j.os) || null) : null;
    const searchT = [j.t, j.d, j.c, j.l, j.co].join(' ');
    try {
      await p.job.create({
        data: {
          title: j.t, slug, description: j.d,
          employmentType: j.ty as any, experienceLevel: j.ex as any,
          salaryMin: j.sMin, salaryMax: j.sMax,
          salaryDisclosure: (j.sMin && j.sMax) ? 'SHOW_RANGE' as any : 'NOT_DISCLOSED' as any,
          locationCity: j.l, locationCounty: j.co, isRemote: j.rm || false,
          deadline: j.dl ? new Date(j.dl) : null,
          featured: j.f || false, status: 'ACTIVE',
          categoryId: catId, subcategoryId: subId, organizationId: orgId,
          searchText: searchT,
          seoTitle: `${j.t} at ${j.c} - ${j.l} | JobBoard Kenya`,
          seoDescription: j.d.substring(0, 160),
        },
      });
      created++;
    } catch (e: any) {
      if (e.code === 'P2002') console.log(`  SKIP dup: ${slug}`);
      else { console.error(`FAIL: ${j.t} - ${e.message.substring(0, 100)}`); }
    }
  }
  console.log(`Jobs created: ${created}/${jobs.length}`);
  console.log(`Total in DB: ${await p.job.count()}`);
  await p.$disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });