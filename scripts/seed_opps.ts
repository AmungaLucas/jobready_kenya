import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function run() {
  await p.opportunity.deleteMany();
  console.log('Cleared opportunities');

  const orgs = await p.organization.findMany({ select: { id: true, orgSlug: true } });
  const orgMap = new Map(orgs.map(o => [o.orgSlug, o.id]));

  function slugify(t: string) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 80); }

  const opps = [
    { t: 'Masters Scholarship in Data Science - University of Nairobi', ty: 'SCHOLARSHIP', pr: 'University of Nairobi', pw: 'https://uonbi.ac.ke', l: 'Nairobi', co: 'Nairobi', fd: 'FULLY_FUNDED', fa: 500000, fc: 'KES', dur: '2 Years', dl: '2026-09-30', f: true, io: false,
      d: 'The University of Nairobi is offering fully funded Masters scholarships in Data Science for Kenyan students. This program covers full tuition, a monthly stipend, and research support. Applicants must hold a Bachelor degree in Computer Science, Mathematics, Statistics, or a related field with a minimum second-class upper division.',
      ec: 'Kenyan citizens with a Bachelor degree in STEM field, minimum second-class upper division, under 35 years old',
      rq: 'Bachelor degree in Computer Science, Mathematics, Statistics or related field. Strong quantitative background. Statement of purpose and academic transcripts.',
      bn: 'Full tuition coverage, monthly stipend of KES 50,000, research funding, mentorship from faculty, access to university facilities' },
    { t: 'Agricultural Innovation Grant - Kilimo Trust', ty: 'GRANT', pr: 'Kilimo Trust', pw: 'https://kilimotrust.org', l: 'Nairobi', co: 'Nairobi', fd: 'SHOW_AMOUNT', fa: 5000000, fc: 'KES', dur: '12 Months', dl: '2026-08-15', f: true, io: false,
      d: 'Kilimo Trust is offering innovation grants of up to KES 5,000,000 for agricultural technology startups and cooperatives in Kenya. The grant supports innovative solutions in precision agriculture, post-harvest management, and market linkage platforms that benefit smallholder farmers.',
      ec: 'Registered agricultural enterprises, cooperatives, or tech startups operating in Kenya for at least 1 year',
      rq: 'Business registration certificate, detailed project proposal, budget justification, and impact assessment plan',
      bn: 'Up to KES 5,000,000 in funding, technical advisory support, market linkages, and networking with agricultural stakeholders' },
    { t: 'Tech Policy Fellowship - Mozilla Africa', ty: 'FELLOWSHIP', pr: 'Mozilla Foundation', pw: 'https://mozilla.org', l: 'Nairobi', co: 'Nairobi', fd: 'FULLY_FUNDED', fa: 300000, fc: 'KES', dur: '6 Months', dl: '2026-08-20', f: true, io: true,
      d: 'Mozilla Africa is inviting applications for its Tech Policy Fellowship program based in Nairobi. Fellows will work on digital rights, internet governance, and AI policy research while engaging with policymakers across East Africa. The fellowship includes a stipend, travel support, and mentorship.',
      ec: 'Early to mid-career professionals in law, public policy, or technology with demonstrated interest in digital rights and internet governance',
      rq: 'CV, writing sample on tech policy topic, two professional references, and a fellowship proposal (max 1000 words)',
      bn: 'Monthly stipend, travel to Mozilla events, policy training workshops, mentorship from global experts, publication support' },
    { t: 'Google Developer Student Club Lead Sponsorship', ty: 'SPONSORSHIP', pr: 'Google', pw: 'https://developers.google.com', l: 'Nairobi', co: 'Nairobi', fd: 'FULLY_FUNDED', fa: 200000, fc: 'KES', dur: '1 Year', dl: '2026-10-01', f: false, io: false,
      d: 'Google is sponsoring student leaders to run Developer Student Clubs (DSC) in universities across Kenya. DSC leads organize workshops, hackathons, and study jams to help students grow their developer skills. Selected leads receive funding, swag, and direct access to Google resources.',
      ec: 'Enrolled university students in Kenya with strong programming skills and leadership experience',
      rq: 'Currently enrolled in a Kenyan university, proficiency in at least one programming language, evidence of community involvement, and a plan for DSC activities',
      bn: 'Club activity funding up to KES 200,000, Google swag and merchandise, access to Google developer tools, networking with Google engineers, certificate of recognition' },
    { t: 'Women in Tech Mentorship Program - AkiraChix', ty: 'MENTORSHIP', pr: 'AkiraChix', pw: 'https://akirachix.com', l: 'Nairobi', co: 'Nairobi', fd: 'NOT_FUNDED', fa: null, fc: 'KES', dur: '6 Months', dl: '2026-08-25', f: true, io: false,
      d: 'AkiraChix is running a mentorship program for women in technology across Kenya. Participants get paired with industry mentors, attend monthly workshops, and gain access to a supportive community of women tech professionals. The program covers career development, technical skills, and leadership training.',
      ec: 'Women with at least 1 year of experience or training in technology, based in Kenya',
      rq: 'Completed application form, CV, brief essay on career goals, and commitment to attend monthly sessions',
      bn: 'One-on-one mentorship with industry professionals, monthly skill-building workshops, networking events, job referral support, and access to co-working space' },
    { t: 'Hult Prize Campus Challenge - Kenya', ty: 'COMPETITION', pr: 'Hult Prize Foundation', pw: 'https://www.hultprize.org', l: 'Nairobi', co: 'Nairobi', fd: 'SHOW_AMOUNT', fa: 1500000, fc: 'KES', dur: '6 Months', dl: '2026-09-15', f: false, io: false,
      d: 'The Hult Prize Campus Challenge at the University of Nairobi invites student teams to develop innovative social enterprise solutions addressing this year theme. Winning teams advance to regional and global finals with prizes up to USD 1,000,000. Teams of 3-4 students compete.',
      ec: 'Currently enrolled university students in Kenya. Teams of 3-4 members from the same or different universities',
      rq: 'Team registration, business idea pitch deck (10 slides max), and a 3-minute video pitch',
      bn: 'Campus winner: KES 150,000 and advancement to regional finals. Global winner: USD 1,000,000 in startup funding, mentorship, and incubation support' },
    { t: 'Africa Tech Summit - Nairobi 2026', ty: 'CONFERENCE', pr: 'Africa Tech Summit', pw: 'https://africatechsummit.com', l: 'Nairobi', co: 'Nairobi', fd: 'PARTIALLY_FUNDED', fa: 50000, fc: 'KES', dur: '3 Days', dl: '2026-07-30', f: false, io: true,
      d: 'Africa Tech Summit Nairobi brings together tech leaders, investors, and entrepreneurs from across the continent. Attend workshops, panel discussions, and networking sessions covering fintech, healthtech, agritech, and AI. Student tickets available at discounted rates with partial travel support.',
      ec: 'Tech professionals, entrepreneurs, investors, and students interested in African tech ecosystem',
      rq: 'Online registration, valid ID, and proof of student status for discounted tickets',
      bn: 'Access to 50+ sessions, networking with 2000+ attendees, exhibition hall access, post-event recordings, and certificate of attendance' },
    { t: 'Digital Marketing Professional Certificate', ty: 'TRAINING', pr: 'Google Digital Skills Africa', pw: 'https://learndigital.withgoogle.com', l: 'Remote', co: 'Nairobi', fd: 'FULLY_FUNDED', fa: null, fc: 'KES', dur: '3 Months', dl: '2026-12-31', f: false, io: true, rm: true,
      d: 'Google is offering free Digital Marketing Professional Certificate training for Kenyan youth through the Digital Skills Africa program. The self-paced online course covers SEO, social media marketing, content marketing, Google Ads, and analytics. Earn an industry-recognized certificate upon completion.',
      ec: 'Kenyan citizens aged 18-35 with basic computer literacy and internet access',
      rq: 'Valid email address, computer or smartphone with internet access, and commitment to complete the course within 3 months',
      bn: 'Free certification, practical skills in 7 digital marketing modules, hands-on projects, and badge for LinkedIn profile' },
    { t: 'UN Volunteers - Community Health Kenya', ty: 'VOLUNTEER', pr: 'United Nations Volunteers', pw: 'https://unv.org', l: 'Kisumu', co: 'Kisumu', fd: 'PARTIALLY_FUNDED', fa: 30000, fc: 'KES', dur: '12 Months', dl: '2026-08-10', f: false, io: false,
      d: 'The United Nations Volunteers program is recruiting community health volunteers in Kisumu County, Kenya. Volunteers will support local health facilities with community outreach, health education, and data collection for public health programs. This is an excellent opportunity for individuals passionate about public health.',
      ec: 'Kenyan citizens aged 22-40 residing in or willing to relocate to Kisumu County. Background in public health or community development preferred',
      rq: 'National ID, certificate of good conduct, medical clearance, and CV. Diploma in public health or related field is an advantage',
      bn: 'Monthly living allowance of KES 30,000, medical insurance, training, and a UN Volunteer certificate upon completion' },
    { t: 'MSc AI & Machine Learning - Strathmore University', ty: 'SCHOLARSHIP', pr: 'Strathmore University', pw: 'https://strathmore.edu', l: 'Nairobi', co: 'Nairobi', fd: 'PARTIALLY_FUNDED', fa: 350000, fc: 'KES', dur: '2 Years', dl: '2026-09-15', f: true, io: false,
      d: 'Strathmore University is offering partial scholarships for the MSc in Artificial Intelligence and Machine Learning program. The scholarship covers 60% of tuition fees for exceptional candidates. The program is designed for working professionals with evening and weekend classes.',
      ec: 'Kenyan citizens with a Bachelor degree in Computer Science, IT, or related field with minimum GPA of 3.0. Working professionals preferred',
      rq: 'Bachelor degree certificate and transcripts, CV, statement of purpose, two academic or professional references, and proof of English proficiency',
      bn: '60% tuition scholarship, access to Strathmore AI research lab, industry internship placement, and networking with tech companies' },
    { t: 'Youth Enterprise Development Fund Loan', ty: 'GRANT', pr: 'Youth Enterprise Development Fund', pw: 'https://youthfund.go.ke', l: 'Nairobi', co: 'Nairobi', fd: 'SHOW_AMOUNT', fa: 1000000, fc: 'KES', dur: '36 Months', dl: '2026-12-31', f: false, io: false,
      d: 'The Youth Enterprise Development Fund provides affordable business loans of up to KES 1,000,000 to young Kenyan entrepreneurs aged 18-35. The fund offers low-interest rates with flexible repayment terms to support youth-owned businesses in any sector. Group lending also available.',
      ec: 'Kenyan youth aged 18-35 with a registered business or viable business plan',
      rq: 'National ID, business registration certificate or business plan, bank statements (3 months), and guarantors',
      bn: 'Loans up to KES 1,000,000 at 8% interest rate, flexible repayment up to 36 months, business development services, and mentorship' },
    { t: 'Aga Khan Foundation International Scholarship', ty: 'SCHOLARSHIP', pr: 'Aga Khan Foundation', pw: 'https://the.akdn/en/how-we-work/our-agencies/aga-khan-foundation', l: 'Nairobi', co: 'Nairobi', fd: 'FULLY_FUNDED', fa: 2000000, fc: 'KES', dur: '2 Years', dl: '2026-08-31', f: true, io: true,
      d: 'The Aga Khan Foundation provides international scholarships for outstanding students from developing countries, including Kenya, to pursue postgraduate studies at reputable universities worldwide. The scholarship covers tuition, living expenses, and travel costs for masters and PhD programs.',
      ec: 'Kenyan citizens under 30 years old with exceptional academic records, admitted to a reputable university for postgraduate studies',
      rq: 'Admission letter from target university, academic transcripts, proof of financial need, leadership experience, and commitment to return to Kenya after studies',
      bn: 'Full tuition and living expenses coverage, travel costs, health insurance, and membership in the Aga Khan Alumni Network' },
    { t: 'Microsoft Learn AI Skills Challenge', ty: 'COMPETITION', pr: 'Microsoft', pw: 'https://learn.microsoft.com', l: 'Remote', co: 'Nairobi', fd: 'NOT_FUNDED', fa: null, fc: 'KES', dur: '2 Months', dl: '2026-09-30', f: false, io: true, rm: true,
      d: 'Microsoft is running the AI Skills Challenge for developers and data scientists in Kenya. Participants complete learning modules on Azure AI, build AI-powered projects, and submit them for judging. Top winners receive Microsoft certification vouchers and swag packages.',
      ec: 'Developers, data scientists, and tech enthusiasts in Kenya. All skill levels welcome',
      rq: 'Microsoft account, basic programming knowledge, and willingness to complete Azure AI learning paths',
      bn: 'Microsoft certification exam vouchers worth KES 100,000, branded merchandise, and featured projects on Microsoft Learn community' },
    { t: 'Kenya Red Cross Volunteer - Disaster Response', ty: 'VOLUNTEER', pr: 'Kenya Red Cross Society', pw: 'https://redcross.or.ke', l: 'Mombasa', co: 'Mombasa', fd: 'NOT_FUNDED', fa: null, fc: 'KES', dur: '6 Months', dl: '2026-08-05', f: false, io: false,
      d: 'The Kenya Red Cross Society is recruiting volunteers for disaster response and community resilience programs in Mombasa County. Volunteers receive training in first aid, disaster management, and community mobilization to support emergency response efforts.',
      ec: 'Kenyan citizens aged 18-50 in Mombasa County. No prior experience required as training will be provided',
      req: 'National ID, certificate of good conduct, medical fitness certificate, and willingness to work flexible hours including weekends',
      bn: 'Free training in disaster response and first aid, certificate of completion, networking opportunities, and consideration for future employment' },
    { t: 'Ashoka East Africa Fellowship - Social Entrepreneurs', ty: 'FELLOWSHIP', pr: 'Ashoka Innovators for the Public', pw: 'https://ashoka.org', l: 'Nairobi', co: 'Nairobi', fd: 'FULLY_FUNDED', fa: 800000, fc: 'KES', dur: '3 Years', dl: '2026-10-15', f: true, io: true,
      d: 'Ashoka is selecting East Africa social entrepreneurs for its prestigious fellowship program. Fellows receive a living stipend, professional support, and access to a global network of over 4,000 social entrepreneurs. The fellowship recognizes innovative solutions to pressing social challenges.',
      ec: 'Social entrepreneurs from Kenya, Uganda, Tanzania, Rwanda, or Ethiopia with a proven social innovation that has demonstrated impact',
      rq: 'Nomination or self-nomination, detailed project description with impact metrics, organizational documents, and references',
      bn: '3-year living stipend, pro-bono professional services, global networking, media visibility, and lifetime Ashoka Fellowship' },
  ];

  let created = 0;
  for (const o of opps) {
    const slug = slugify(o.t);
    const orgId = (o.pr && orgMap.has(slugify(o.pr))) ? orgMap.get(slugify(o.pr)) : null;
    try {
      await p.opportunity.create({
        data: {
          title: o.t, slug, type: o.ty as any,
          providerName: o.pr,
          providerWebsite: o.pw || null,
          providerOrgId: orgId,
          description: o.d,
          eligibilityCriteria: o.ec || null,
          requirements: o.rq || o.req || null,
          benefits: o.bn || null,
          locationCity: o.l || null,
          locationCounty: o.co || null,
          isRemote: o.rm || false,
          isOnline: o.io || false,
          fundingDisclosure: o.fd as any,
          fundingAmount: o.fa || null,
          fundingCurrency: o.fc || 'KES',
          duration: o.dur || null,
          deadline: o.dl ? new Date(o.dl) : null,
          featured: o.f || false,
          status: 'ACTIVE',
          seoTitle: `${o.t} | JobBoard Kenya`,
          seoDescription: o.d.substring(0, 160),
        },
      });
      created++;
    } catch (e: any) {
      if (e.code === 'P2002') console.log(`  SKIP dup: ${slug}`);
      else { console.error(`FAIL: ${o.t} - ${e.message.substring(0, 100)}`); }
    }
  }
  console.log(`Opportunities created: ${created}/${opps.length}`);
  console.log(`Total in DB: ${await p.opportunity.count()}`);
  await p.$disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });