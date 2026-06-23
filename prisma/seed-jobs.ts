import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
}

// Map old mock category values to Prisma enum EmploymentType
const typeMap: Record<string, string> = {
  'Full-time': 'FULL_TIME',
  'Part-time': 'PART_TIME',
  'Contract': 'CONTRACT',
  'Internship': 'INTERNSHIP',
  'Freelance': 'FREELANCE',
  'Casual': 'CASUAL',
  'Temporary': 'TEMPORARY',
};

const mockJobs = [
  {
    title: 'Senior Software Engineer', company: 'Safaricom', location: 'Nairobi', locationCounty: 'Nairobi',
    type: 'FULL_TIME', salary: 'KSh 60k – 80k', salaryMin: 60000, salaryMax: 80000,
    deadline: '2026-06-30', categoryValue: 'TECHNOLOGY', subcategoryValue: 'SOFTWARE_ENGINEERING',
    orgSlug: 'safaricom', experienceLevel: 'SENIOR',
    description: "We're looking for a passionate Senior Software Engineer to join our fintech team in Nairobi. You will be responsible for designing, developing, and maintaining high-performance applications that power our mobile banking platform.",
    requirements: '5+ years of experience|Strong proficiency in Node.js, React, and TypeScript|Excellent problem-solving and communication skills',
    responsibilities: 'Design and develop scalable microservices using Node.js and TypeScript|Build responsive user interfaces with React.js and Tailwind CSS|Mentor junior engineers and conduct code reviews',
    companyDescription: 'Safaricom is a leading telecommunications company in Kenya, providing mobile network, financial services, and enterprise solutions to millions of customers.'
  },
  {
    title: 'Public Health Officer', company: 'County Gov. Mombasa', location: 'Mombasa', locationCounty: 'Mombasa',
    type: 'CONTRACT', salary: 'KSh 45k – 55k', salaryMin: 45000, salaryMax: 55000,
    deadline: '2026-07-05', categoryValue: 'HEALTHCARE', subcategoryValue: 'PUBLIC_HEALTH',
    orgSlug: null, experienceLevel: 'MID',
    description: 'The County Government of Mombasa is seeking a qualified Public Health Officer to oversee disease prevention and community health programs.',
    requirements: 'Degree in Public Health|3+ years experience|Registered with relevant board',
    responsibilities: 'Coordinate health campaigns|Monitor disease outbreaks|Community health education',
    companyDescription: 'County Government of Mombasa is a devolved government unit serving the coastal region.'
  },
  {
    title: 'IT Support Intern', company: 'Equity Bank', location: 'Kisumu', locationCounty: 'Kisumu',
    type: 'INTERNSHIP', salary: 'Stipend', salaryMin: null, salaryMax: null,
    deadline: '2026-07-10', categoryValue: 'TECHNOLOGY', subcategoryValue: 'IT_SUPPORT',
    orgSlug: 'equity-group', experienceLevel: 'ENTRY',
    description: 'Equity Bank is looking for a motivated IT Support Intern to join our Kisumu office. Great opportunity to learn and grow in a dynamic environment.',
    requirements: 'Pursuing a degree in IT or related|Basic networking skills|Good communication',
    responsibilities: 'Provide IT support to staff|Assist with hardware and software issues|Maintain IT inventory',
    companyDescription: 'Equity Bank is a leading financial services provider in Kenya, offering banking and insurance products.'
  },
  {
    title: 'Project Coordinator', company: 'UNICEF', location: 'Nairobi', locationCounty: 'Nairobi',
    type: 'CONTRACT', salary: 'KSh 120k – 150k', salaryMin: 120000, salaryMax: 150000,
    deadline: '2026-07-15', categoryValue: 'NGO_DEVELOPMENT', subcategoryValue: 'PROGRAM_MANAGEMENT',
    orgSlug: null, experienceLevel: 'SENIOR',
    description: 'UNICEF Kenya is hiring a Project Coordinator to manage education and child welfare programs across multiple counties.',
    requirements: 'Masters degree in Project Management or related|5+ years in NGO sector|Experience managing multi-county programs',
    responsibilities: 'Coordinate education programs|Manage budgets and timelines|Stakeholder engagement and reporting',
    companyDescription: "UNICEF works in over 190 countries and territories to save children's lives, defend their rights, and help them fulfill their potential."
  },
  {
    title: 'Marketing Manager', company: 'Co-operative Bank', location: 'Nairobi', locationCounty: 'Nairobi',
    type: 'FULL_TIME', salary: 'KSh 80k – 100k', salaryMin: 80000, salaryMax: 100000,
    deadline: '2026-06-25', categoryValue: 'MARKETING', subcategoryValue: 'BRAND_MANAGEMENT',
    orgSlug: null, experienceLevel: 'SENIOR',
    description: 'Co-operative Bank is seeking an experienced Marketing Manager to develop and implement marketing strategies that drive brand awareness and customer acquisition.',
    requirements: 'Degree in Marketing or Business|5+ years marketing experience|Digital marketing expertise',
    responsibilities: 'Develop marketing strategies|Manage digital campaigns|Brand management and PR',
    companyDescription: "Co-operative Bank is one of Kenya's largest banks, offering a wide range of financial services."
  },
  {
    title: 'Data Analyst', company: 'Kenya Revenue Authority', location: 'Nairobi', locationCounty: 'Nairobi',
    type: 'FULL_TIME', salary: 'KSh 50k – 65k', salaryMin: 50000, salaryMax: 65000,
    deadline: '2026-06-30', categoryValue: 'DATA_SCIENCE', subcategoryValue: 'DATA_ANALYSIS',
    orgSlug: 'kenya-revenue-authority', experienceLevel: 'MID',
    description: 'Kenya Revenue Authority is looking for a Data Analyst to support tax data analysis and revenue forecasting.',
    requirements: 'Degree in Statistics, Mathematics, or related|Proficiency in SQL and Python|Data visualization skills',
    responsibilities: 'Analyze tax data and trends|Create revenue forecasts|Develop dashboards and reports',
    companyDescription: 'KRA is the government agency responsible for collecting revenue on behalf of the Government of Kenya.'
  },
  {
    title: 'Nurse', company: 'County Gov. Kisumu', location: 'Kisumu', locationCounty: 'Kisumu',
    type: 'FULL_TIME', salary: 'KSh 35k – 45k', salaryMin: 35000, salaryMax: 45000,
    deadline: '2026-06-28', categoryValue: 'HEALTHCARE', subcategoryValue: 'NURSING',
    orgSlug: null, experienceLevel: 'MID',
    description: 'The County Government of Kisumu is seeking qualified nurses to join public health facilities across the county.',
    requirements: 'Diploma in Nursing|Valid nursing license|1+ year clinical experience',
    responsibilities: 'Provide patient care|Administer medications|Maintain patient records',
    companyDescription: 'County Government of Kisumu provides healthcare services through a network of public health facilities.'
  },
  {
    title: 'Civil Engineer', company: 'KURA', location: 'Nairobi', locationCounty: 'Nairobi',
    type: 'CONTRACT', salary: 'KSh 70k – 90k', salaryMin: 70000, salaryMax: 90000,
    deadline: '2026-07-02', categoryValue: 'ENGINEERING', subcategoryValue: 'CIVIL_ENGINEERING',
    orgSlug: null, experienceLevel: 'MID',
    description: 'Kenya Urban Roads Authority is looking for a Civil Engineer to oversee road construction and maintenance projects in Nairobi.',
    requirements: 'Degree in Civil Engineering|3+ years experience|Registered with EBK',
    responsibilities: 'Supervise road construction|Conduct site inspections|Prepare project reports',
    companyDescription: 'KURA is a state corporation mandated to manage, develop, and maintain urban roads in Kenya.'
  },
  {
    title: 'Finance Officer', company: 'UNICEF', location: 'Nairobi', locationCounty: 'Nairobi',
    type: 'CONTRACT', salary: 'KSh 100k – 130k', salaryMin: 100000, salaryMax: 130000,
    deadline: '2026-07-07', categoryValue: 'FINANCE', subcategoryValue: 'FINANCIAL_ANALYSIS',
    orgSlug: null, experienceLevel: 'MID',
    description: 'UNICEF Kenya seeks a Finance Officer to manage financial operations and ensure compliance with organizational policies.',
    requirements: 'CPA or ACCA qualification|3+ years in finance|NGO experience preferred',
    responsibilities: 'Financial planning and budgeting|Manage donor funds|Financial reporting and compliance',
    companyDescription: "UNICEF works in over 190 countries and territories to save children's lives, defend their rights, and help them fulfill their potential."
  },
  {
    title: 'Retail Sales Assistant', company: 'Naivas', location: 'Nairobi', locationCounty: 'Nairobi',
    type: 'PART_TIME', salary: 'KSh 15k/mo', salaryMin: 15000, salaryMax: 15000,
    deadline: '2026-07-15', categoryValue: 'RETAIL', subcategoryValue: 'RETAIL_MANAGEMENT',
    orgSlug: null, experienceLevel: 'ENTRY',
    description: 'Naivas Supermarket is hiring part-time retail sales assistants for our new branch in Nairobi.',
    requirements: 'KCSE certificate|Good customer service skills|Prior retail experience is a plus',
    responsibilities: 'Assist customers|Restock shelves|Handle point-of-sale transactions',
    companyDescription: "Naivas is one of Kenya's largest supermarket chains, with stores across the country."
  },
  {
    title: 'Agricultural Officer', company: 'County Gov. Nakuru', location: 'Nakuru', locationCounty: 'Nakuru',
    type: 'FULL_TIME', salary: 'KSh 40k – 55k', salaryMin: 40000, salaryMax: 55000,
    deadline: '2026-06-25', categoryValue: 'AGRICULTURE', subcategoryValue: 'AGRI_EXTENSION',
    orgSlug: null, experienceLevel: 'MID',
    description: 'The County Government of Nakuru is seeking an Agricultural Officer to support farming communities with extension services and training.',
    requirements: 'Degree in Agriculture|2+ years experience|Knowledge of modern farming techniques',
    responsibilities: 'Provide extension services|Train farmers on best practices|Conduct soil and crop assessments',
    companyDescription: "County Government of Nakuru serves one of Kenya's most agriculturally productive regions."
  },
  {
    title: 'ICT Officer', company: 'ICT Authority', location: 'Nairobi', locationCounty: 'Nairobi',
    type: 'FULL_TIME', salary: 'KSh 55k – 70k', salaryMin: 55000, salaryMax: 70000,
    deadline: '2026-07-05', categoryValue: 'TECHNOLOGY', subcategoryValue: 'SYSTEM_ADMIN',
    orgSlug: null, experienceLevel: 'MID',
    description: 'The ICT Authority is looking for an ICT Officer to support government digital transformation initiatives.',
    requirements: 'Degree in IT/Computer Science|3+ years in ICT|Government experience preferred',
    responsibilities: 'Implement ICT projects|Support digital services|System administration and maintenance',
    companyDescription: 'ICT Authority is a state corporation under the Ministry of ICT responsible for ICT policy and standards.'
  },
  {
    title: 'Customs Officer', company: 'Kenya Revenue Authority', location: 'Mombasa', locationCounty: 'Mombasa',
    type: 'FULL_TIME', salary: 'KSh 40k – 55k', salaryMin: 40000, salaryMax: 55000,
    deadline: '2026-07-15', categoryValue: 'GOVERNMENT', subcategoryValue: 'REVENUE_COLLECTION',
    orgSlug: 'kenya-revenue-authority', experienceLevel: 'ENTRY',
    description: 'Kenya Revenue Authority is seeking Customs Officers to manage customs operations at the Port of Mombasa.',
    requirements: 'Degree in Business or related|Clean criminal record|Knowledge of customs regulations',
    responsibilities: 'Clear imported goods|Assess customs duties|Enforce customs laws',
    companyDescription: 'KRA is the government agency responsible for collecting revenue on behalf of the Government of Kenya.'
  },
  {
    title: 'Teacher - Mathematics', company: 'TSC', location: 'Nairobi', locationCounty: 'Nairobi',
    type: 'FULL_TIME', salary: 'KSh 30k – 45k', salaryMin: 30000, salaryMax: 45000,
    deadline: '2026-07-20', categoryValue: 'EDUCATION', subcategoryValue: 'TEACHING_SECONDARY',
    orgSlug: null, experienceLevel: 'JUNIOR',
    description: 'Teachers Service Commission is recruiting Mathematics teachers for secondary schools in Nairobi.',
    requirements: 'Bachelor of Education (Mathematics)|TSC registration|2+ years teaching experience',
    responsibilities: 'Teach mathematics|Prepare lesson plans|Assess student performance',
    companyDescription: 'TSC is a constitutional commission responsible for managing the teaching service in Kenya.'
  },
  {
    title: 'Legal Assistant', company: 'Attorney General', location: 'Nairobi', locationCounty: 'Nairobi',
    type: 'FULL_TIME', salary: 'KSh 45k – 60k', salaryMin: 45000, salaryMax: 60000,
    deadline: '2026-07-10', categoryValue: 'LEGAL', subcategoryValue: 'CORPORATE_LAW',
    orgSlug: null, experienceLevel: 'JUNIOR',
    description: 'The Office of the Attorney General is seeking a Legal Assistant to support legal research and draft legal documents.',
    requirements: 'LLB degree|Advocate of the High Court|1+ year legal experience',
    responsibilities: 'Legal research|Draft legal opinions|Assist in court proceedings',
    companyDescription: 'The Office of the Attorney General is the principal legal advisor to the Government of Kenya.'
  },
  {
    title: 'Water Engineer', company: 'County Gov. Kisumu', location: 'Kisumu', locationCounty: 'Kisumu',
    type: 'CONTRACT', salary: 'KSh 50k – 65k', salaryMin: 50000, salaryMax: 65000,
    deadline: '2026-07-10', categoryValue: 'ENGINEERING', subcategoryValue: 'ENVIRONMENTAL_ENGINEERING',
    orgSlug: null, experienceLevel: 'MID',
    description: 'County Government of Kisumu seeks a Water Engineer to design and oversee water supply and sanitation projects.',
    requirements: 'Degree in Water Engineering|3+ years experience|Registered with EBK',
    responsibilities: 'Design water systems|Supervise construction|Monitor water quality',
    companyDescription: 'County Government of Kisumu provides water and sanitation services to residents.'
  },
  {
    title: 'Freelance Writer', company: 'Self-employed', location: 'Remote', locationCounty: 'Nairobi',
    type: 'FREELANCE', salary: 'KSh 2k/article', salaryMin: null, salaryMax: null,
    deadline: '2026-12-31', categoryValue: 'MEDIA', subcategoryValue: 'JOURNALISM',
    orgSlug: null, experienceLevel: 'MID', isRemote: true,
    description: 'Looking for talented freelance writers to create content on career, technology, and business topics for Kenyan audiences.',
    requirements: 'Excellent writing skills|Portfolio of published work|Knowledge of SEO',
    responsibilities: 'Write articles and blog posts|Research topics|Meet deadlines',
    companyDescription: 'Remote freelance opportunity.'
  },
  {
    title: 'Logistics Coordinator', company: 'Maersk', location: 'Mombasa', locationCounty: 'Mombasa',
    type: 'FULL_TIME', salary: 'KSh 55k – 70k', salaryMin: 55000, salaryMax: 70000,
    deadline: '2026-07-08', categoryValue: 'LOGISTICS', subcategoryValue: 'PORT_OPERATIONS',
    orgSlug: null, experienceLevel: 'MID',
    description: 'Maersk is looking for a Logistics Coordinator to manage shipping operations and coordinate with port authorities in Mombasa.',
    requirements: 'Degree in Logistics or related|2+ years experience|Knowledge of shipping processes',
    responsibilities: 'Coordinate shipments|Manage documentation|Liaise with port authorities',
    companyDescription: 'Maersk is a global leader in container shipping and logistics, operating in over 130 countries.'
  },
  {
    title: 'Community Development Officer', company: 'County Gov. Machakos', location: 'Machakos', locationCounty: 'Machakos',
    type: 'FULL_TIME', salary: 'KSh 35k – 45k', salaryMin: 35000, salaryMax: 45000,
    deadline: '2026-07-18', categoryValue: 'SOCIAL_WORK', subcategoryValue: 'COMMUNITY_DEVELOPMENT',
    orgSlug: null, experienceLevel: 'JUNIOR',
    description: 'County Government of Machakos seeks a Community Development Officer to implement community empowerment programs.',
    requirements: 'Degree in Social Work or Community Development|2+ years experience|Strong interpersonal skills',
    responsibilities: 'Implement community programs|Mobilize community participation|Monitor and evaluate programs',
    companyDescription: 'County Government of Machakos is committed to community development and empowerment.'
  },
  {
    title: 'Audit Intern', company: 'EY', location: 'Nairobi', locationCounty: 'Nairobi',
    type: 'INTERNSHIP', salary: 'Stipend', salaryMin: null, salaryMax: null,
    deadline: '2026-07-30', categoryValue: 'CONSULTING', subcategoryValue: 'AUDIT_ASSURANCE',
    orgSlug: null, experienceLevel: 'ENTRY',
    description: 'Ernst & Young is offering audit internship positions for students pursuing accounting and finance degrees.',
    requirements: 'Pursuing CPA/ACCA|Strong analytical skills|Proficiency in Excel',
    responsibilities: 'Assist in audit procedures|Prepare working papers|Support audit team',
    companyDescription: 'EY is one of the Big Four accounting firms, providing assurance, tax, and advisory services globally.'
  },
  {
    title: 'Event Staff', company: 'Events Kenya', location: 'Mombasa', locationCounty: 'Mombasa',
    type: 'CASUAL', salary: 'KSh 1.5k/day', salaryMin: 1500, salaryMax: 1500,
    deadline: '2026-12-31', categoryValue: 'HOSPITALITY_TOURISM', subcategoryValue: 'EVENT_PLANNING',
    orgSlug: null, experienceLevel: 'ENTRY',
    description: 'Looking for reliable event staff for upcoming conferences and exhibitions in Mombasa.',
    requirements: 'Good communication skills|Available on weekends|Punctual and presentable',
    responsibilities: 'Event setup and coordination|Guest registration|General event support',
    companyDescription: 'Events Kenya is a leading event management company.'
  },
  {
    title: 'Temporary Admin Assistant', company: 'World Vision', location: 'Nakuru', locationCounty: 'Nakuru',
    type: 'TEMPORARY', salary: 'KSh 25k/mo', salaryMin: 25000, salaryMax: 25000,
    deadline: '2026-07-01', categoryValue: 'HUMAN_RESOURCES', subcategoryValue: 'HR_GENERALIST',
    orgSlug: 'world-vision-kenya', experienceLevel: 'ENTRY',
    description: 'World Vision Kenya needs a temporary admin assistant to cover maternity leave at their Nakuru office.',
    requirements: 'Diploma in Business Admin|Computer literacy|1+ year admin experience',
    responsibilities: 'Office management|Data entry|Scheduling and correspondence',
    companyDescription: 'World Vision is a Christian humanitarian organization dedicated to working with children, families, and communities.'
  },
  {
    title: 'Software Development Intern', company: 'Google', location: 'Remote', locationCounty: 'Nairobi',
    type: 'INTERNSHIP', salary: 'Stipend', salaryMin: null, salaryMax: null,
    deadline: '2026-07-15', categoryValue: 'TECHNOLOGY', subcategoryValue: 'SOFTWARE_ENGINEERING',
    orgSlug: 'google-kenya', experienceLevel: 'ENTRY', isRemote: true,
    description: 'Google is offering software development internships for talented students and recent graduates.',
    requirements: 'Pursuing CS degree|Strong coding skills|Knowledge of at least one programming language',
    responsibilities: 'Build software solutions|Collaborate with teams|Participate in code reviews',
    companyDescription: 'Google is a multinational technology company specializing in Internet-related services and products.'
  },
  {
    title: 'Data Science Intern', company: 'UN-Habitat', location: 'Nairobi', locationCounty: 'Nairobi',
    type: 'INTERNSHIP', salary: 'Stipend', salaryMin: null, salaryMax: null,
    deadline: '2026-07-20', categoryValue: 'DATA_SCIENCE', subcategoryValue: 'DATA_ANALYSIS',
    orgSlug: null, experienceLevel: 'ENTRY',
    description: 'UN-Habitat is seeking a Data Science Intern to support urban data analytics and visualization projects.',
    requirements: 'Pursuing degree in Data Science or related|Python and R skills|Machine learning basics',
    responsibilities: 'Analyze urban datasets|Create data visualizations|Support research initiatives',
    companyDescription: 'UN-Habitat is the United Nations programme for human settlements and sustainable urban development.'
  },
];

async function seedJobs() {
  console.log('🌱 Seeding 24 mock jobs...');

  for (let i = 0; i < mockJobs.length; i++) {
    const m = mockJobs[i];
    const slug = slugify(`${m.title} ${m.company} ${m.location}`);

    // Find category
    const category = await prisma.jobCategory.findFirst({
      where: { value: m.categoryValue },
    });

    // Find subcategory
    const subcategory = category ? await prisma.jobSubcategory.findFirst({
      where: { categoryId: category.id, value: m.subcategoryValue },
    }) : null;

    // Find organization
    const organization = m.orgSlug ? await prisma.organization.findFirst({
      where: { orgSlug: m.orgSlug },
    }) : null;

    // Build searchText
    const searchText = [m.title, m.description, m.company, m.location, m.locationCounty, category?.label, subcategory?.label].filter(Boolean).join(' ');

    const deadline = m.deadline ? new Date(m.deadline) : null;

    await prisma.job.create({
      data: {
        title: m.title,
        slug,
        description: m.description,
        employmentType: m.type as any,
        experienceLevel: m.experienceLevel as any,
        salaryMin: m.salaryMin,
        salaryMax: m.salaryMax,
        salaryDisclosure: (m.salaryMin && m.salaryMax) ? 'SHOW_RANGE' as any : 'NOT_DISCLOSED' as any,
        locationCity: m.location,
        locationCounty: m.locationCounty,
        isRemote: (m as any).isRemote || false,
        deadline,
        featured: i < 3, // First 3 jobs are featured
        status: 'ACTIVE',
        categoryId: category?.id,
        subcategoryId: subcategory?.id,
        organizationId: organization?.id,
        searchText,
        seoTitle: `${m.title} at ${m.company} - ${m.location} | JobBoard Kenya`,
        seoDescription: m.description.substring(0, 160),
      },
    });
  }

  console.log(`✅ Seeded ${mockJobs.length} jobs`);
}

async function main() {
  await seedJobs();
  const total = await prisma.job.count();
  const active = await prisma.job.count({ where: { status: 'ACTIVE' } });
  const featured = await prisma.job.count({ where: { featured: true } });
  console.log(`\n📊 Jobs summary: ${total} total, ${active} active, ${featured} featured`);
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });