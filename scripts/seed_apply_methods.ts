import { PrismaClient } from '@prisma/client';

const DATABASE_URL = 'mysql://jobready_kenya_db_admin:Admincyber@d7.my-control-panel.com:3306/jobready_kenya_db?connection_limit=1&pool_timeout=60';
const prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });

/* Map each job title → realistic apply method */
const applyData: Record<string, { applyEmail?: string; applicationUrl?: string; howToApply?: string }> = {
  'Senior Software Engineer': {
    applicationUrl: 'https://www.safaricom.co.ke/about-us/careers',
    howToApply: 'Visit the Safaricom careers portal, search for this role, and submit your application online. Ensure your CV highlights relevant software engineering experience and projects.',
  },
  'Public Health Officer': {
    applyEmail: 'careers@health.go.ke',
    howToApply: 'Send your CV, cover letter, and copies of professional certificates to the email above. Include the job title in the subject line.',
  },
  'IT Support Intern': {
    applicationUrl: 'https://www.equitybank.co.ke/careers',
    howToApply: 'Apply through the Equity Group careers portal. Select "Internships" and search for this role.',
  },
  'Project Coordinator - Education Programs': {
    applyEmail: 'jobs@educationdevelopmenttrust.org',
    howToApply: 'Email your CV and a one-page cover letter explaining your experience in education program coordination. Include "Project Coordinator Application" in the subject.',
  },
  'Marketing Manager - Digital': {
    applyEmail: 'hr@brightmark.co.ke',
    howToApply: 'Submit your CV, portfolio of digital marketing campaigns, and a brief strategy note (max 500 words) for a Kenyan tech brand to the email above.',
  },
  'Data Analyst - Revenue Forecasting': {
    applicationUrl: 'https://www.kra.go.ke/careers',
    howToApply: 'Apply through the KRA recruitment portal. Upload your CV, academic certificates, and a short essay on data-driven decision making in public finance.',
  },
  'Data Science Intern - Urban Analytics': {
    applyEmail: 'internships@unhabitat.org',
    howToApply: 'Email your CV, academic transcript, and a brief statement of interest to the address above. Mention "Data Science Intern - Urban Analytics" in the subject line.',
  },
  'Customs Officer - Port of Mombasa': {
    applicationUrl: 'https://www.kra.go.ke/careers',
    howToApply: 'Apply via the KRA online recruitment system. You will need your KCSE certificate, national ID, and a clearance certificate from the Directorate of Criminal Investigations.',
  },
  'Registered Nurse - County Facilities': {
    applyEmail: 'hr@nairobi-county.go.ke',
    howToApply: 'Submit your application to the County Public Service Board. Include your Nursing Council of Kenya practising licence, CV, and academic certificates.',
  },
  'Mathematics Teacher - Secondary': {
    applyEmail: 'recruitment@tsc.go.ke',
    howToApply: 'Apply through the Teachers Service Commission online portal. Ensure your TSC registration is up to date and include your registration number.',
  },
  'Civil Engineer - Urban Roads': {
    applyEmail: 'careers@kenha.co.ke',
    howToApply: 'Send your CV, registration certificate from the Engineers Board of Kenya, and copies of relevant project experience to the email above.',
  },
  'Audit Intern - Big Four': {
    applicationUrl: 'https://www.kpmg.co.ke/careers',
    howToApply: 'Apply through the KPMG East Africa careers page under the "Internships" section. Upload your academic transcript and CV.',
  },
  'Agricultural Extension Officer': {
    applyEmail: 'recruitment@agriculture.go.ke',
    howToApply: 'Submit your application letter, CV, and copies of certificates to the email above. Candidates with a diploma or degree in Agricultural Extension or related field will be considered.',
  },
  'Community Development Officer': {
    applyEmail: 'hr@worldvision.co.ke',
    howToApply: 'Email your CV and cover letter to the address above. Include "Community Development Officer" in the subject line and describe your community engagement experience.',
  },
  'Event Staff - Conference Support': {
    applyEmail: 'events@kenyainternationalconventioncentre.go.ke',
    howToApply: 'Send a brief CV and availability schedule to the email above. Shortlisted candidates will be contacted for a brief phone interview.',
  },
  'Finance Officer - Donor Funds': {
    applyEmail: 'hr@usaid-kenya.org',
    howToApply: 'Email your CV, cover letter, and three professional references to the address above. Include "Finance Officer - Donor Funds" in the subject.',
  },
  'Freelance Content Writer': {
    applyEmail: 'freelance@digitalcontentke.com',
    howToApply: 'Send 3 writing samples (published articles or blog posts), your CV, and your rates per 1000 words to the email above.',
  },
  'ICT Officer - Digital Government': {
    applyEmail: 'ict.recruitment@icta.go.ke',
    howToApply: 'Submit your application through the ICT Authority recruitment portal or email your CV and certificates to the address above.',
  },
  'Legal Assistant - Constitutional Law': {
    applyEmail: 'careers@kituochakatiba.org',
    howToApply: 'Email your CV, cover letter, and a writing sample (max 5 pages) on a constitutional law topic to the address above.',
  },
  'Logistics Coordinator - Shipping': {
    applyEmail: 'hr@maersk.co.ke',
    howToApply: 'Apply through the Maersk careers portal or email your CV to the address above. Include your experience in shipping, customs clearance, or supply chain management.',
  },
  'Retail Sales Assistant': {
    applyEmail: 'careers@tuskys.co.ke',
    howToApply: 'Walk into any branch with your CV and national ID, or email your application to the address above. Candidates with previous retail experience will have an advantage.',
  },
  'Software Development Intern': {
    applicationUrl: 'https://careers.google.com/locations/nairobi/',
    howToApply: 'Apply through the Google careers page. Search for internship opportunities in the Nairobi office and submit your application online.',
  },
  'Temporary Admin Assistant': {
    applyEmail: 'hr@wvi.org',
    howToApply: 'Email your CV and a brief cover letter to the address above. Include "Temporary Admin Assistant" in the subject line and state your available start date.',
  },
  'Water Engineer - Supply Projects': {
    applyEmail: 'careers@wasreb.go.ke',
    howToApply: 'Send your CV, registration with the Engineers Board of Kenya, and copies of relevant water project experience to the email above.',
  },
};

async function main() {
  const jobs = await prisma.job.findMany({ select: { id: true, title: true } });
  let updated = 0;

  for (const job of jobs) {
    const data = applyData[job.title];
    if (!data) {
      console.log(`⚠️  No apply data for: ${job.title}`);
      continue;
    }
    await prisma.job.update({
      where: { id: job.id },
      data,
    });
    updated++;
    const method = data.applicationUrl ? 'URL' : data.applyEmail ? 'EMAIL' : 'TEXT';
    console.log(`✅ ${job.title} → ${method}`);
  }

  console.log(`\nUpdated ${updated}/${jobs.length} jobs`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());