export function generateJobPostingJsonLd(job: {
  title: string;
  description: string;
  slug: string;
  datePosted: Date;
  deadline: Date | null;
  employmentType: string | null;
  locationCity: string | null;
  locationCounty: string | null;
  isRemote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency?: string;
  organization: {
    orgName: string;
    orgLogoUrl: string | null;
  } | null;
}) {
  const SITE_URL = 'https://jobboard.ke';

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
    } : undefined,
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
    TEMPORARY: 'TEMPORARY',
    CASUAL: 'PART_TIME',
    VOLUNTEER: 'VOLUNTEER',
  };
  return map[type];
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `https://jobboard.ke${item.url}`,
    })),
  };
}