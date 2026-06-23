import { prisma } from '@/lib/prisma';

// Opportunity types
export const OPP_TYPES = [
  'SCHOLARSHIP',
  'GRANT',
  'FELLOWSHIP',
  'SPONSORSHIP',
  'MENTORSHIP',
  'COMPETITION',
  'CONFERENCE',
  'TRAINING',
  'VOLUNTEER',
] as const;

export type OppType = (typeof OPP_TYPES)[number];

export const OPP_TYPE_LABELS: Record<string, string> = {
  all: 'All Opportunities',
  SCHOLARSHIP: 'Scholarships',
  GRANT: 'Grants',
  FELLOWSHIP: 'Fellowships',
  SPONSORSHIP: 'Sponsorships',
  MENTORSHIP: 'Mentorship',
  COMPETITION: 'Competitions',
  CONFERENCE: 'Conferences',
  TRAINING: 'Training',
  VOLUNTEER: 'Volunteer',
};

export const OPP_TYPE_DESCRIPTIONS: Record<string, string> = {
  SCHOLARSHIP: 'Scholarships in Kenya provide financial support for students to pursue undergraduate, graduate, and doctoral studies. Major scholarship providers in Kenya include the Mastercard Foundation, KCB Foundation, Equity Group Foundation (Wings to Fly), DAAD, and the Commission for University Education. These scholarships cover tuition, accommodation, and sometimes living expenses, enabling talented Kenyan students to access quality education at local and international universities.',
  GRANT: 'Grants in Kenya are non-repayable funds provided by government agencies, international development organizations, foundations, and NGOs to support projects in areas such as education, healthcare, agriculture, technology, and community development. Key grant providers include USAID, UKAID, the European Union, Google.org, and the National Research Fund. Grants are available for individuals, startups, and registered organizations.',
  FELLOWSHIP: 'Fellowships in Kenya offer professionals and researchers the opportunity to advance their careers through funded work placements, research programs, and leadership development. Notable fellowship programs include the Mandela Washington Fellowship, AKU Global Fellowship, Africa Leadership Initiative, and various UN agency fellowships based in Nairobi. Fellowships typically include a stipend, mentorship, and professional networking opportunities.',
  SPONSORSHIP: 'Sponsorships in Kenya provide financial backing for individuals pursuing education, sports, arts, technology, and professional development. Corporate sponsors in Kenya include Safaricom, Equity Bank, KCB, and international brands. Sponsorship opportunities range from full educational sponsorship to partial funding for specific programs, events, or competitions.',
  MENTORSHIP: 'Mentorship programs in Kenya connect experienced professionals with emerging talent across industries including technology, business, healthcare, and the creative arts. Organizations like Mentors Without Borders, the Kenya Mentoring Network, and corporate programs at Safaricom and KCB provide structured mentorship that accelerates career growth, builds professional networks, and develops leadership skills.',
  COMPETITION: 'Competitions in Kenya span business pitch competitions, hackathons, essay contests, innovation challenges, and awards programs. Major competitions include the Safaricom Hackathon, Nairobi Tech Week challenges, Hult Prize Kenya, Kwani Manuscript Prize, and various university and government-sponsored innovation competitions. Winners receive prizes, funding, mentorship, and media exposure.',
  CONFERENCE: 'Conferences in Kenya cover technology, business, healthcare, education, agriculture, and international development. Nairobi serves as a major conference hub in East Africa, hosting events like the Africa Tech Summit, Nairobi DevFest, Kenya Medical Research Institute conferences, and various UN agency events. Conferences provide networking, learning, and collaboration opportunities for professionals across all sectors.',
  TRAINING: 'Training programs in Kenya include professional development courses, certifications, workshops, and capacity-building programs offered by universities, professional bodies, and training institutes. Key providers include Strathmore Professional Development Centre, KIM (Kenya Institute of Management), KASNEB, Google Digital Skills, and various international organizations. Training covers areas such as project management, data science, digital marketing, finance, and leadership.',
  VOLUNTEER: 'Volunteer opportunities in Kenya allow individuals to contribute to community development, environmental conservation, education, healthcare, and social welfare. Major volunteer organizations include the Kenya Red Cross, Voluntary Service Overseas (VSO), Peace Corps, UN Volunteers, and local community-based organizations. Volunteering provides valuable experience, skill development, and the satisfaction of making a positive impact in Kenyan communities.',
};

export interface OpportunityListItem {
  id: string;
  slug: string;
  type: string;
  title: string;
  providerName: string;
  providerLogoUrl: string | null;
  locationCity: string | null;
  locationCounty: string | null;
  isRemote: boolean;
  isOnline: boolean;
  fundingDisclosure: string;
  fundingAmount: number | null;
  fundingCurrency: string;
  deadline: Date | null;
  datePosted: Date;
  featured: boolean;
  description: string;
  duration: string | null;
  openToInternational: boolean;
}

const oppListSelect = {
  id: true,
  slug: true,
  type: true,
  title: true,
  providerName: true,
  providerLogoUrl: true,
  locationCity: true,
  locationCounty: true,
  isRemote: true,
  isOnline: true,
  fundingDisclosure: true,
  fundingAmount: true,
  fundingCurrency: true,
  deadline: true,
  datePosted: true,
  featured: true,
  description: true,
  duration: true,
  openToInternational: true,
} as const;

export async function getOpportunities(
  type?: string,
  page = 1,
  perPage = 20
): Promise<{ opportunities: OpportunityListItem[]; total: number }> {
  const where: any = {
    status: 'ACTIVE',
    deletedAt: null,
  };

  if (type && type !== 'all') {
    where.type = type;
  }

  const [opportunities, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      select: oppListSelect,
      orderBy: { datePosted: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.opportunity.count({ where }),
  ]);

  return { opportunities: opportunities as unknown as OpportunityListItem[], total };
}

export async function getOpportunityBySlug(slug: string) {
  return prisma.opportunity.findUnique({
    where: { slug },
    include: {
      providerOrg: {
        select: { orgName: true, orgLogoUrl: true, orgWebsite: true },
      },
    },
  });
}

export async function getAllOpportunitySlugs(): Promise<string[]> {
  const results = await prisma.opportunity.findMany({
    where: { status: 'ACTIVE', deletedAt: null },
    select: { slug: true },
  });
  return results.map(r => r.slug);
}

export async function getOpportunityCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  for (const type of OPP_TYPES) {
    counts[type] = await prisma.opportunity.count({
      where: { status: 'ACTIVE', deletedAt: null, type },
    });
  }

  counts['all'] = Object.values(counts).reduce((sum, n) => sum + n, 0);
  return counts;
}

export function formatFunding(opp: { fundingAmount: number | null; fundingCurrency: string; fundingDisclosure: string }): string {
  if (opp.fundingDisclosure === 'FULLY_FUNDED') return 'Fully Funded';
  if (opp.fundingDisclosure === 'NOT_FUNDED') return 'Not Funded';
  if (opp.fundingDisclosure === 'SHOW_AMOUNT' && opp.fundingAmount) {
    const amount = opp.fundingAmount >= 1_000_000
      ? `${(opp.fundingAmount / 1_000_000).toFixed(1)}M`
      : opp.fundingAmount >= 1_000
        ? `${(opp.fundingAmount / 1_000).toFixed(0)}K`
        : opp.fundingAmount.toLocaleString();
    return `${opp.fundingCurrency} ${amount}`;
  }
  if (opp.fundingDisclosure === 'PARTIALLY_FUNDED') return 'Partially Funded';
  return 'Funding Not Disclosed';
}