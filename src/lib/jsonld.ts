export const SITE_URL = 'https://jobboard.ke';

export function generateJobPostingJsonLd(job: {
  title: string;
  description: string;
  slug: string;
  datePosted: Date;
  deadline: Date | null;
  employmentType: string | null;
  experienceLevel: string | null;
  educationLevel: string | null;
  locationCity: string | null;
  locationCounty: string | null;
  isRemote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency?: string;
  category?: { label: string } | null;
  subcategory?: { label: string } | null;
  organization: {
    orgName: string;
    orgLogoUrl: string | null;
    orgWebsite: string | null;
  } | null;
}) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    identifier: { '@type': 'PropertyValue', name: 'JobBoard Kenya', value: job.slug },
    datePosted: job.datePosted.toISOString(),
    validThrough: job.deadline?.toISOString(),
    employmentType: mapEmploymentType(job.employmentType),
    hiringOrganization: job.organization ? {
      '@type': 'Organization',
      name: job.organization.orgName,
      logo: job.organization.orgLogoUrl || `${SITE_URL}/default-og.jpg`,
      sameAs: job.organization.orgWebsite || undefined,
    } : {
      '@type': 'Organization',
      name: 'Confidential',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.locationCity || '',
        addressRegion: job.locationCounty || '',
        addressCountry: 'KE',
      },
    },
    ...(job.isRemote ? { jobLocationType: 'TELECOMMUTE' } : {}),
    baseSalary: job.salaryMin || job.salaryMax ? {
      '@type': 'MonetaryAmount',
      currency: job.salaryCurrency || 'KES',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salaryMin,
        maxValue: job.salaryMax,
        unitText: 'MONTH',
      },
    } : undefined,
    ...(job.experienceLevel ? { experienceRequirements: { '@type': 'OccupationalExperienceRequirements', monthsOfExperience: mapExperienceToMonths(job.experienceLevel) } } : {}),
    ...(job.educationLevel ? { educationRequirements: { '@type': 'EducationalOccupationalCredential', credentialCategory: mapEducationLevel(job.educationLevel) } } : {}),
    ...(job.category ? { industry: job.category.label } : {}),
    ...(job.subcategory ? { occupationalCategory: job.subcategory.label } : {}),
  };
}

function mapEmploymentType(type: string | null): string | undefined {
  if (!type) return undefined;
  const map: Record<string, string> = {
    FULL_TIME: 'FULL_TIME',
    PART_TIME: 'PART_TIME',
    CONTRACT: 'CONTRACT',
    FREELANCE: 'CONTRACTOR',
    INTERNSHIP: 'INTERN',
    APPRENTICESHIP: 'INTERN',
    TEMPORARY: 'TEMPORARY',
    CASUAL: 'PART_TIME',
    VOLUNTEER: 'VOLUNTEER',
  };
  return map[type];
}

function mapExperienceToMonths(level: string): number {
  const map: Record<string, number> = {
    ENTRY: 0,
    JUNIOR: 12,
    MID: 36,
    SENIOR: 60,
    LEAD: 84,
    EXECUTIVE: 120,
  };
  return map[level] || 12;
}

function mapEducationLevel(level: string): string {
  const map: Record<string, string> = {
    NONE: 'no formal education',
    HIGH_SCHOOL: 'high school',
    CERTIFICATE: 'professional certification',
    DIPLOMA: 'diploma',
    BACHELORS: 'bachelor degree',
    MASTERS: 'master degree',
    DOCTORATE: 'doctorate degree',
    PROFESSIONAL: 'professional degree',
  };
  return map[level] || 'bachelor degree';
}

export function generateCollectionPageJsonLd(params: {
  name: string;
  description: string;
  url: string;
  itemCount: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: params.name,
    description: params.description,
    url: `${SITE_URL}${params.url}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'JobBoard Kenya',
      url: SITE_URL,
    },
    ...(params.itemCount > 0 ? { about: { '@type': 'ItemList', numberOfItems: params.itemCount } } : {}),
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function generateOpportunityJsonLd(opp: {
  title: string;
  description: string;
  slug: string;
  datePosted: Date;
  deadline: Date | null;
  providerName: string;
  providerLogoUrl: string | null;
  providerWebsite: string | null;
  locationCity: string | null;
  locationCounty: string | null;
  isOnline: boolean;
  fundingAmount: number | null;
  fundingCurrency: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: opp.title,
    description: opp.description,
    identifier: { '@type': 'PropertyValue', name: 'JobBoard Kenya', value: opp.slug },
    startDate: opp.datePosted.toISOString(),
    endDate: opp.deadline?.toISOString(),
    organizer: {
      '@type': 'Organization',
      name: opp.providerName,
      logo: opp.providerLogoUrl || `${SITE_URL}/default-og.jpg`,
      sameAs: opp.providerWebsite || undefined,
    },
    location: opp.isOnline
      ? { '@type': 'VirtualLocation', url: opp.providerWebsite || SITE_URL }
      : {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: opp.locationCity || '',
            addressRegion: opp.locationCounty || '',
            addressCountry: 'KE',
          },
        },
    offers: opp.fundingAmount
      ? {
          '@type': 'Offer',
          price: opp.fundingAmount,
          priceCurrency: opp.fundingCurrency || 'KES',
          description: 'Funding amount',
        }
      : undefined,
    isAccessibleForFree: !opp.fundingAmount || opp.fundingAmount === 0 ? true : undefined,
    url: `${SITE_URL}/opportunities/${opp.slug}`,
  };
}