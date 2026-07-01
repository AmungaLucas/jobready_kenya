import { PrismaClient, UpdateType, UpdateStatus } from '@prisma/client';

const prisma = new PrismaClient();

const updates = [
  {
    title: 'KNEC announces shortlisted candidates for 2025 marking exercise',
    slug: 'knec-shortlisted-candidates-2026',
    summary: 'KNEC has published the list of shortlisted candidates for the 2025 marking exercise. Successful applicants must report to designated centres.',
    body: `The Kenya National Examinations Council has published the list of shortlisted candidates for the 2025 marking exercise. Successful applicants are required to report to their designated marking centres on the dates indicated in their invitation letters. Candidates who do not report within the stipulated timeframe will be automatically disqualified.

The council encourages all shortlisted persons to carry original academic certificates, national ID, and a copy of their application confirmation. Reporting times vary by centre and candidates are advised to check their invitation letters carefully.

For any inquiries, candidates can contact KNEC through their official website or visit the nearest KNEC county office. The marking exercise is expected to run for approximately three weeks, during which all shortlisted examiners will be accommodated at the respective marking centres.`,
    updateType: 'SHORTLISTING' as UpdateType,
    sourceName: 'Kenya National Examinations Council',
    sourceUrl: 'https://www.knec.ac.ke',
    status: 'PUBLISHED' as UpdateStatus,
    featured: true,
    datePublished: new Date('2025-06-26T06:00:00Z'),
  },
  {
    title: 'KRA interviews for tax officers — dates released for July 2025',
    slug: 'kra-tax-officer-interviews-june',
    summary: 'KRA has released interview schedules for Tax Officer II positions. Interviews run from 7th to 18th July 2025 at KRA Training School, Nairobi.',
    body: `The Kenya Revenue Authority has released interview schedules for the Tax Officer II position. Interviews will be conducted from 7th to 18th July 2025 at KRA Training School, Nairobi. Shortlisted candidates will receive individual invitation letters via email with specific reporting times and required documents.

Candidates are advised to carry their original academic certificates, professional certificates, national identity card, and two recent passport-size photographs. The interview process will include both written assessments and oral interviews.

Successful candidates will be deployed to various KRA stations across the country. The authority has emphasized that all communication regarding the interviews will be done through official channels and candidates should beware of fraudsters soliciting money in exchange for employment.`,
    updateType: 'INTERVIEW' as UpdateType,
    sourceName: 'Kenya Revenue Authority',
    sourceUrl: 'https://www.kra.go.ke',
    status: 'PUBLISHED' as UpdateStatus,
    featured: true,
    datePublished: new Date('2025-06-26T03:00:00Z'),
  },
  {
    title: 'County government of Nakuru opens 50 new positions across departments',
    slug: 'nakuru-county-50-positions',
    summary: 'Nakuru County Government has announced 50 new job vacancies across Health, Education, Infrastructure, and Public Service Management departments.',
    body: `The County Government of Nakuru has announced 50 new job vacancies across multiple departments including Health, Education, Infrastructure, and Public Service Management. Interested candidates must be residents of Nakuru County and should submit their applications through the county public service portal before the stated deadline.

Requirements vary by position but generally include a minimum diploma qualification and relevant work experience. The county government has stated that preference will be given to youth, women, and persons with disabilities in line with the constitutional requirement for inclusive representation.

Available positions include nursing officers, civil engineers, education officers, procurement officers, and administrative assistants. Detailed job descriptions and requirements for each position are available on the Nakuru County Government official website.`,
    updateType: 'RECRUITMENT' as UpdateType,
    sourceName: 'County Government of Nakuru',
    sourceUrl: 'https://nakuru.go.ke',
    status: 'PUBLISHED' as UpdateStatus,
    featured: false,
    datePublished: new Date('2025-06-25T08:00:00Z'),
  },
  {
    title: 'TSC extends application deadline for teacher recruitment to 30 July 2025',
    slug: 'tsc-deadline-extended-june',
    summary: 'TSC has extended the application deadline for the ongoing teacher recruitment exercise to 30th July 2025 for both primary and secondary positions.',
    body: `The Teachers Service Commission has extended the application deadline for the ongoing teacher recruitment exercise. The new deadline is now 30th July 2025, giving prospective applicants additional time to prepare and submit their applications. The extension applies to both primary and secondary school teaching positions.

Applicants are reminded to ensure all required documents are uploaded before the new deadline. The commission has noted that a significant number of applications were incomplete at the initial deadline, prompting the extension to allow candidates to finalize their submissions.

The recruitment exercise aims to fill over 10,000 teaching positions across public schools in Kenya. Applicants must be registered teachers with the TSC and meet the minimum qualification requirements for their respective levels.`,
    updateType: 'DEADLINE' as UpdateType,
    sourceName: 'Teachers Service Commission',
    sourceUrl: 'https://www.tsc.go.ke',
    status: 'PUBLISHED' as UpdateStatus,
    featured: false,
    datePublished: new Date('2025-06-24T10:00:00Z'),
  },
  {
    title: 'Kenya Defence Forces releases shortlist for cadet recruitment 2025',
    slug: 'kdf-cadet-shortlist-2025',
    summary: 'KDF has published the shortlist for the 2025 cadet recruitment programme. Shortlisted candidates must report to designated centres with required documents.',
    body: `The Kenya Defence Forces has published the shortlist of candidates selected for the 2025 cadet recruitment programme. Shortlisted candidates are required to report to the designated recruitment centres on the dates specified. Candidates must carry original academic certificates, national identity card, birth certificate, and valid medical fitness certificates from a recognised government hospital.

The cadet programme is one of the most prestigious entry points into the Kenya Defence Forces, offering successful candidates comprehensive military training and a path to a career as a commissioned officer. The training period typically lasts between three to four years depending on the specific cadet programme.

Candidates who fail to report on the specified dates will automatically forfeit their positions. The KDF has advised candidates to verify their reporting centres and dates through the official KDF recruitment portal.`,
    updateType: 'SHORTLISTING' as UpdateType,
    sourceName: 'Kenya Defence Forces',
    sourceUrl: 'https://mod.go.ke',
    status: 'PUBLISHED' as UpdateStatus,
    featured: false,
    datePublished: new Date('2025-06-24T07:00:00Z'),
  },
  {
    title: 'Kenyatta University Teaching Hospital announces 30 nursing positions',
    slug: 'kuth-nursing-positions',
    summary: 'KUTRRH has announced 30 nursing positions across critical care, paediatrics, and surgical nursing departments.',
    body: `Kenyatta University Teaching, Referral and Research Hospital (KUTRRH) has announced 30 nursing positions across various departments including critical care, paediatrics, and surgical nursing. Applicants must hold a valid Nursing Council of Kenya licence and have at least two years of post-qualification experience.

Applications should be submitted online through the KUTRRH careers portal. The hospital is seeking qualified nurses who are passionate about patient care and willing to work in a fast-paced, teaching and referral hospital environment.

KUTRRH offers competitive remuneration packages, continuous professional development opportunities, and a supportive working environment. Shortlisted candidates will be contacted via email with interview details.`,
    updateType: 'RECRUITMENT' as UpdateType,
    sourceName: 'Kenyatta University Teaching, Referral and Research Hospital',
    sourceUrl: 'https://kutrrh.go.ke',
    status: 'PUBLISHED' as UpdateStatus,
    featured: false,
    datePublished: new Date('2025-06-23T09:00:00Z'),
  },
  {
    title: 'Commission on Revenue Allocation schedules interviews for economists',
    slug: 'cra-economist-interviews',
    summary: 'CRA has scheduled interviews for Economist positions for the week of 14th July 2025 at CRA headquarters in Nairobi.',
    body: `The Commission on Revenue Allocation (CRA) has scheduled interviews for Economist positions for the week of 14th July 2025. Shortlisted candidates will be notified via email and are required to appear in person at the CRA headquarters in Nairobi. Candidates should come prepared with academic certificates, curriculum vitae, and a brief presentation on public finance management in Kenya.

The Economist positions at CRA play a critical role in advising on equitable revenue sharing among county governments. The commission is looking for candidates with strong analytical skills, knowledge of Kenya's public finance system, and the ability to conduct research on fiscal matters.

Successful candidates will join a team of professionals dedicated to ensuring fair and transparent revenue allocation across Kenya's 47 counties.`,
    updateType: 'INTERVIEW' as UpdateType,
    sourceName: 'Commission on Revenue Allocation',
    sourceUrl: 'https://cra.go.ke',
    status: 'PUBLISHED' as UpdateStatus,
    featured: false,
    datePublished: new Date('2025-06-23T06:00:00Z'),
  },
  {
    title: 'Public Service Commission extends internship application deadline',
    slug: 'psc-internship-deadline',
    summary: 'PSC has extended the application deadline for its graduate internship programme to 15th August 2025.',
    body: `The Public Service Commission (PSC) has extended the application deadline for its graduate internship programme. The new closing date is 15th August 2025. The internship programme targets recent graduates from recognised universities with a minimum of a bachelor's degree.

Interested applicants should submit their applications through the PSC online portal with certified copies of their academic certificates. The programme offers graduates an opportunity to gain practical work experience in various government ministries, departments, and agencies.

Interns are placed for a period of twelve months and receive a monthly stipend. The programme has been instrumental in bridging the gap between academic training and professional practice for thousands of Kenyan graduates since its inception.`,
    updateType: 'DEADLINE' as UpdateType,
    sourceName: 'Public Service Commission',
    sourceUrl: 'https://www.publicservice.go.ke',
    status: 'PUBLISHED' as UpdateStatus,
    featured: false,
    datePublished: new Date('2025-06-22T10:00:00Z'),
  },
  {
    title: 'National Police Service shortlists candidates for constable recruitment',
    slug: 'nps-constable-shortlist',
    summary: 'NPS has released the shortlist for constable recruitment. Candidates must report to county recruitment centres for fitness tests and verification.',
    body: `The National Police Service has released the shortlist of candidates for the constable recruitment exercise. Shortlisted candidates are required to report to their respective county recruitment centres on the dates indicated. All candidates must carry their national identity card, academic certificates, and birth certificate. Physical fitness tests and document verification will be conducted during the reporting period.

The recruitment exercise is part of the government's initiative to increase the number of police officers in the country to improve security and reduce the police-to-citizen ratio. Successful candidates will undergo rigorous training at the Kenya Police College, Kiganjo.

The NPS has warned the public against fraudsters who may attempt to solicit money from candidates, emphasizing that the recruitment process is free and merit-based.`,
    updateType: 'SHORTLISTING' as UpdateType,
    sourceName: 'National Police Service',
    sourceUrl: 'https://www.nps.go.ke',
    status: 'PUBLISHED' as UpdateStatus,
    featured: false,
    datePublished: new Date('2025-06-21T08:00:00Z'),
  },
  {
    title: 'Ministry of Health opens recruitment for medical officers countrywide',
    slug: 'moh-medical-officers',
    summary: 'Ministry of Health has announced vacancies for Medical Officers to be deployed across county hospitals and sub-county health facilities.',
    body: `The Ministry of Health has announced vacancies for Medical Officers to be deployed across various county hospitals and sub-county health facilities. Applicants must be registered with the Kenya Medical Practitioners and Dentists Council (KMPDC) and hold a bachelor of medicine and surgery degree.

Preference will be given to candidates willing to serve in rural and underserved areas. The recruitment is part of the government's commitment to improve healthcare access in remote parts of the country, where doctor-to-patient ratios remain significantly below recommended standards.

Interested candidates should apply through the Ministry of Health online recruitment portal. The application period is open for four weeks from the date of this announcement.`,
    updateType: 'RECRUITMENT' as UpdateType,
    sourceName: 'Ministry of Health',
    sourceUrl: 'https://www.health.go.ke',
    status: 'PUBLISHED' as UpdateStatus,
    featured: false,
    datePublished: new Date('2025-06-21T06:00:00Z'),
  },
  {
    title: 'Central Bank of Kenya invites shortlisted candidates for graduate trainee interviews',
    slug: 'cbk-graduate-interviews',
    summary: 'CBK has invited shortlisted candidates for Graduate Trainee Programme interviews scheduled for July 2025.',
    body: `The Central Bank of Kenya (CBK) has invited shortlisted candidates for the Graduate Trainee Programme interviews scheduled for July 2025. The programme targets recent graduates with degrees in economics, finance, statistics, information technology, and related fields. Interviews will be conducted at the CBK headquarters in Nairobi.

Shortlisted candidates will receive detailed instructions via email. The Graduate Trainee Programme is a highly competitive two-year rotational programme that exposes participants to various departments within the bank, including monetary policy, banking supervision, financial markets, and payments systems.

The CBK Graduate Trainee Programme has produced many of Kenya's leading financial sector professionals since its inception. Successful candidates receive mentorship from senior CBK staff and access to professional development opportunities.`,
    updateType: 'INTERVIEW' as UpdateType,
    sourceName: 'Central Bank of Kenya',
    sourceUrl: 'https://www.centralbank.go.ke',
    status: 'PUBLISHED' as UpdateStatus,
    featured: false,
    datePublished: new Date('2025-06-19T10:00:00Z'),
  },
  {
    title: 'Judicial Service Commission extends application window for court clerks',
    slug: 'jsc-court-clerks-deadline',
    summary: 'JSC has extended the application deadline for Court Clerk positions to 25th July 2025. Applicants need a diploma in law or related field.',
    body: `The Judicial Service Commission (JSC) has extended the application deadline for Court Clerk positions across various courts in Kenya. The new closing date is 25th July 2025. Applicants must have a minimum diploma in law, public administration, or related field from a recognised institution.

Applications should be submitted through the JSC online recruitment portal with all required supporting documents. Court clerks play a vital role in the administration of justice, assisting judges and magistrates with case management, court proceedings, and administrative duties.

The JSC is looking for candidates who are detail-oriented, have strong organisational skills, and are committed to supporting the efficient delivery of justice. Successful candidates will be posted to courts across the country.`,
    updateType: 'DEADLINE' as UpdateType,
    sourceName: 'Judicial Service Commission',
    sourceUrl: 'https://jsc.go.ke',
    status: 'PUBLISHED' as UpdateStatus,
    featured: false,
    datePublished: new Date('2025-06-19T08:00:00Z'),
  },
];

async function main() {
  console.log('Seeding updates...');

  for (const update of updates) {
    await prisma.update.upsert({
      where: { slug: update.slug },
      update: {
        title: update.title,
        summary: update.summary,
        body: update.body,
        updateType: update.updateType,
        sourceName: update.sourceName,
        sourceUrl: update.sourceUrl,
        status: update.status,
        featured: update.featured,
        datePublished: update.datePublished,
      },
      create: update,
    });
    console.log(`  ✓ ${update.slug}`);
  }

  console.log(`Done! Seeded ${updates.length} updates.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });