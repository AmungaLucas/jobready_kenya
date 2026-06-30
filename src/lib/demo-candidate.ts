// Demo mock data for Jobseeker Dashboard — Phase 1
// This file will be replaced with real DB queries once auth is implemented.

export type Verdict = 'EXCELLENT' | 'STRONG' | 'MODERATE' | 'WEAK' | 'NOT_RECOMMENDED';
export type RecommendationType = 'PRIMARY_MATCH' | 'INTEREST_MATCH' | 'ADJACENT_MATCH' | 'STRETCH_MATCH' | 'NOT_RECOMMENDED';
export type ApplicationStatus = 'APPLIED' | 'VIEWED' | 'SHORTLISTED' | 'INTERVIEW' | 'REJECTED' | 'HIRED' | 'WITHDRAWN';
export type OnboardingStatus = 'STARTED' | 'CV_UPLOADED' | 'EXTRACTION_COMPLETE' | 'PROFILE_REVIEWED' | 'DOMAIN_SUGGESTED' | 'DOMAIN_CONFIRMED' | 'INTERESTS_SELECTED' | 'PREFERENCES_SET' | 'COMPLETED';
export type Proficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type SeniorityLevel = 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'EXECUTIVE';

export interface Skill {
  name: string;
  proficiency: Proficiency;
  yearsExperience: number;
}

export interface WorkExperience {
  id: string;
  employerName: string;
  roleTitle: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string;
  industry: string;
}

export interface Education {
  id: string;
  institution: string;
  fieldOfStudy: string;
  level: 'CERTIFICATE' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'PHD' | 'OTHER';
  status: 'COMPLETED' | 'ONGOING';
  startYear: number;
  endYear: number | null;
}

export interface Certification {
  id: string;
  name: string;
  issuingBody: string;
  status: 'COMPLETED' | 'ONGOING';
  yearAwarded: number | null;
}

export interface CandidateInterest {
  category: string;
  isPrimary: boolean;
}

export interface CandidatePreferences {
  preferredLocations: string[];
  remotePreference: 'ONSITE' | 'HYBRID' | 'REMOTE' | 'ANY';
  expectedSalaryMin: number;
  expectedSalaryMax: number;
  salaryCurrency: string;
  availabilityStatus: 'IMMEDIATE' | 'NOTICE_PERIOD' | 'UNAVAILABLE';
  noticePeriodDays: number;
  willingToRelocate: boolean;
  preferredJobTypes: string[];
}

export interface MatchScore {
  jobId: string;
  jobSlug: string;
  jobTitle: string;
  company: string;
  location: string;
  employmentType: string;
  finalScore: number;
  categoryScore: number;
  subcategoryScore: number;
  skillsScore: number;
  qualificationsScore: number;
  experienceScore: number;
  industryScore: number;
  verdict: Verdict;
  recommendationType: RecommendationType;
  matchedSkillCount: number;
  totalRequiredSkills: number;
  matchedQualificationCount: number;
  totalRequiredQualifications: number;
  explanation: string;
  isRead: boolean;
  isSaved: boolean;
  computedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobSlug: string;
  jobTitle: string;
  company: string;
  location: string;
  matchScoreAtApplication: number;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
}

export interface SavedJob {
  jobId: string;
  jobSlug: string;
  jobTitle: string;
  company: string;
  location: string;
  employmentType: string;
  salaryRange: string;
  savedAt: string;
}

export interface CandidateProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  locationCounty: string;
  country: string;
  primaryCategory: string;
  primarySubcategory: string;
  subcategories: string[];
  seniorityLevel: SeniorityLevel;
  totalExperienceYears: number;
  profileCompletionScore: number;
  onboardingStatus: OnboardingStatus;
  skills: Skill[];
  tools: string[];
  workExperience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  interests: CandidateInterest[];
  preferences: CandidatePreferences;
}

// ============================================================
// MOCK DATA
// ============================================================

export const candidate: CandidateProfile = {
  firstName: 'James',
  lastName: 'Mito',
  email: 'james.mito@gmail.com',
  phone: '+254 712 345 678',
  locationCounty: 'Nairobi',
  country: 'Kenya',
  primaryCategory: 'Finance & Accounting',
  primarySubcategory: 'Accounting',
  subcategories: ['Accounting', 'Accounts Payable', 'Financial Reporting', 'Audit', 'Payroll'],
  seniorityLevel: 'JUNIOR',
  totalExperienceYears: 2.5,
  profileCompletionScore: 87,
  onboardingStatus: 'COMPLETED',
  skills: [
    { name: 'Accounts Payable', proficiency: 'ADVANCED', yearsExperience: 2.5 },
    { name: 'Bank Reconciliation', proficiency: 'ADVANCED', yearsExperience: 2.0 },
    { name: 'Financial Reporting', proficiency: 'INTERMEDIATE', yearsExperience: 1.5 },
    { name: 'Invoice Processing', proficiency: 'ADVANCED', yearsExperience: 2.5 },
    { name: 'Audit Support', proficiency: 'INTERMEDIATE', yearsExperience: 1.0 },
    { name: 'Payroll Support', proficiency: 'INTERMEDIATE', yearsExperience: 1.5 },
    { name: 'Budget Monitoring', proficiency: 'BEGINNER', yearsExperience: 0.5 },
    { name: 'Data Entry', proficiency: 'ADVANCED', yearsExperience: 3.0 },
  ],
  tools: ['Microsoft Excel', 'QuickBooks', 'Sage Pastel', 'Google Sheets', 'ERP Systems'],
  workExperience: [
    {
      id: 'we1',
      employerName: 'PATH Kenya',
      roleTitle: 'Finance Assistant',
      startDate: '2024-03',
      endDate: null,
      isCurrent: true,
      description: 'Managed accounts payable for a USD 2M+ portfolio. Processed vendor payments, performed monthly bank reconciliations, and supported the annual audit. Prepared financial reports for donor-funded projects across 4 counties.',
      industry: 'International Development',
    },
    {
      id: 'we2',
      employerName: 'Kenya Commercial Bank (KCB)',
      roleTitle: 'Finance Intern',
      startDate: '2023-01',
      endDate: '2023-12',
      isCurrent: false,
      description: 'Supported the finance operations team with reconciliations, invoice processing, and data entry. Assisted in preparing monthly financial summaries for branch operations.',
      industry: 'Banking',
    },
    {
      id: 'we3',
      employerName: 'County Government of Nakuru',
      roleTitle: 'Finance Attaché',
      startDate: '2022-06',
      endDate: '2022-12',
      isCurrent: false,
      description: 'Assisted the county finance department with processing expenditure vouchers, filing financial documents, and supporting the preparation of quarterly budget performance reports.',
      industry: 'Government & Public Administration',
    },
  ],
  education: [
    {
      id: 'edu1',
      institution: 'University of Nairobi',
      fieldOfStudy: 'Bachelor of Commerce (Finance)',
      level: 'BACHELOR',
      status: 'COMPLETED',
      startYear: 2018,
      endYear: 2022,
    },
  ],
  certifications: [
    { id: 'cert1', name: 'CPA Section 1', issuingBody: 'ICPAK', status: 'COMPLETED', yearAwarded: 2023 },
    { id: 'cert2', name: 'CPA Section 2', issuingBody: 'ICPAK', status: 'COMPLETED', yearAwarded: 2024 },
    { id: 'cert3', name: 'CPA Section 3', issuingBody: 'ICPAK', status: 'ONGOING', yearAwarded: null },
    { id: 'cert4', name: 'QuickBooks Online Certified', issuingBody: 'Intuit', status: 'COMPLETED', yearAwarded: 2024 },
  ],
  interests: [
    { category: 'Finance & Accounting', isPrimary: true },
    { category: 'Human Resources', isPrimary: false },
    { category: 'Administration', isPrimary: false },
    { category: 'Procurement & Supply Chain', isPrimary: false },
  ],
  preferences: {
    preferredLocations: ['Nairobi', 'Kiambu', 'Nakuru'],
    remotePreference: 'HYBRID',
    expectedSalaryMin: 40000,
    expectedSalaryMax: 70000,
    salaryCurrency: 'KES',
    availabilityStatus: 'IMMEDIATE',
    noticePeriodDays: 0,
    willingToRelocate: false,
    preferredJobTypes: ['FULL_TIME'],
  },
};

export const matchScores: MatchScore[] = [
  {
    jobId: 'j1',
    jobSlug: 'accounts-payable-officer-safaricom',
    jobTitle: 'Accounts Payable Officer',
    company: 'Safaricom PLC',
    location: 'Nairobi',
    employmentType: 'FULL_TIME',
    finalScore: 91,
    categoryScore: 100,
    subcategoryScore: 100,
    skillsScore: 88,
    qualificationsScore: 100,
    experienceScore: 83,
    industryScore: 30,
    verdict: 'EXCELLENT',
    recommendationType: 'PRIMARY_MATCH',
    matchedSkillCount: 7,
    totalRequiredSkills: 8,
    matchedQualificationCount: 2,
    totalRequiredQualifications: 2,
    explanation: 'Your CV shows strong Accounts Payable, Bank Reconciliation, and Invoice Processing experience. You meet all qualification requirements. SAP experience is the main gap.',
    isRead: false,
    isSaved: true,
    computedAt: '2026-06-28T14:30:00Z',
  },
  {
    jobId: 'j2',
    jobSlug: 'finance-assistant-undp-kenya',
    jobTitle: 'Finance Assistant',
    company: 'UNDP Kenya',
    location: 'Nairobi',
    employmentType: 'FULL_TIME',
    finalScore: 85,
    categoryScore: 100,
    subcategoryScore: 70,
    skillsScore: 78,
    qualificationsScore: 100,
    experienceScore: 100,
    industryScore: 100,
    verdict: 'STRONG',
    recommendationType: 'PRIMARY_MATCH',
    matchedSkillCount: 7,
    totalRequiredSkills: 9,
    matchedQualificationCount: 2,
    totalRequiredQualifications: 2,
    explanation: 'Strong match due to your finance experience in international development (PATH Kenya). Your QuickBooks and ERP skills are directly relevant. Grant management experience would strengthen your profile.',
    isRead: true,
    isSaved: false,
    computedAt: '2026-06-28T14:30:00Z',
  },
  {
    jobId: 'j3',
    jobSlug: 'junior-accountant-equity-bank',
    jobTitle: 'Junior Accountant',
    company: 'Equity Bank',
    location: 'Nairobi',
    employmentType: 'FULL_TIME',
    finalScore: 82,
    categoryScore: 100,
    subcategoryScore: 70,
    skillsScore: 75,
    qualificationsScore: 100,
    experienceScore: 83,
    industryScore: 100,
    verdict: 'STRONG',
    recommendationType: 'PRIMARY_MATCH',
    matchedSkillCount: 6,
    totalRequiredSkills: 8,
    matchedQualificationCount: 2,
    totalRequiredQualifications: 2,
    explanation: 'Your accounting background and banking internship make you a strong candidate. CPA progression is valued. Consider gaining more experience with financial analysis and tax compliance.',
    isRead: false,
    isSaved: true,
    computedAt: '2026-06-28T14:30:00Z',
  },
  {
    jobId: 'j4',
    jobSlug: 'project-finance-assistant-world-vision',
    jobTitle: 'Project Finance Assistant',
    company: 'World Vision Kenya',
    location: 'Nairobi',
    employmentType: 'CONTRACT',
    finalScore: 78,
    categoryScore: 100,
    subcategoryScore: 70,
    skillsScore: 67,
    qualificationsScore: 100,
    experienceScore: 83,
    industryScore: 100,
    verdict: 'MODERATE',
    recommendationType: 'PRIMARY_MATCH',
    matchedSkillCount: 6,
    totalRequiredSkills: 9,
    matchedQualificationCount: 2,
    totalRequiredQualifications: 2,
    explanation: 'Good match based on your NGO finance experience. Donor reporting and budget management skills would make you a stronger candidate for this role.',
    isRead: false,
    isSaved: false,
    computedAt: '2026-06-28T14:30:00Z',
  },
  {
    jobId: 'j5',
    jobSlug: 'accounts-assistant-kengen',
    jobTitle: 'Accounts Assistant',
    company: 'KenGen',
    location: 'Nairobi',
    employmentType: 'FULL_TIME',
    finalScore: 74,
    categoryScore: 100,
    subcategoryScore: 70,
    skillsScore: 63,
    qualificationsScore: 100,
    experienceScore: 67,
    industryScore: 30,
    verdict: 'MODERATE',
    recommendationType: 'PRIMARY_MATCH',
    matchedSkillCount: 5,
    totalRequiredSkills: 8,
    matchedQualificationCount: 2,
    totalRequiredQualifications: 2,
    explanation: 'Your accounting foundation is solid. The role requires more specific energy sector experience and familiarity with statutory deductions like NSSF, NHIF, and PAYE.',
    isRead: true,
    isSaved: false,
    computedAt: '2026-06-28T14:30:00Z',
  },
  {
    jobId: 'j6',
    jobSlug: 'audit-assistant-kpmg-kenya',
    jobTitle: 'Audit Assistant',
    company: 'KPMG Kenya',
    location: 'Nairobi',
    employmentType: 'FULL_TIME',
    finalScore: 68,
    categoryScore: 100,
    subcategoryScore: 50,
    skillsScore: 50,
    qualificationsScore: 100,
    experienceScore: 67,
    industryScore: 30,
    verdict: 'MODERATE',
    recommendationType: 'ADJACENT_MATCH',
    matchedSkillCount: 4,
    totalRequiredSkills: 8,
    matchedQualificationCount: 2,
    totalRequiredQualifications: 2,
    explanation: 'While you have audit support experience, this role requires deeper audit methodology knowledge and IFRS expertise. Your CPA progression is a positive signal.',
    isRead: false,
    isSaved: false,
    computedAt: '2026-06-28T14:30:00Z',
  },
  {
    jobId: 'j7',
    jobSlug: 'hr-admin-assistant-savannah-cement',
    jobTitle: 'HR & Admin Assistant',
    company: 'Savannah Cement',
    location: 'Athi River',
    employmentType: 'FULL_TIME',
    finalScore: 42,
    categoryScore: 0,
    subcategoryScore: 0,
    skillsScore: 50,
    qualificationsScore: 50,
    experienceScore: 67,
    industryScore: 30,
    verdict: 'WEAK',
    recommendationType: 'ADJACENT_MATCH',
    matchedSkillCount: 3,
    totalRequiredSkills: 6,
    matchedQualificationCount: 1,
    totalRequiredQualifications: 2,
    explanation: 'This is an HR role, not a finance position. Some transferable skills exist (data entry, organizational skills) but you lack HR-specific knowledge. Consider this only if you want to transition into HR.',
    isRead: false,
    isSaved: false,
    computedAt: '2026-06-28T14:30:00Z',
  },
  {
    jobId: 'j8',
    jobSlug: 'part-time-lecturer-amref',
    jobTitle: 'Part-Time Lecturer — Health Sciences',
    company: 'Amref International University',
    location: 'Nairobi',
    employmentType: 'PART_TIME',
    finalScore: 2,
    categoryScore: 0,
    subcategoryScore: 0,
    skillsScore: 0,
    qualificationsScore: 0,
    experienceScore: 0,
    industryScore: 30,
    verdict: 'NOT_RECOMMENDED',
    recommendationType: 'NOT_RECOMMENDED',
    matchedSkillCount: 0,
    totalRequiredSkills: 5,
    matchedQualificationCount: 0,
    totalRequiredQualifications: 1,
    explanation: 'This role requires Education & Training experience in health-related TVET specializations. You are strongest in Finance & Accounting. You lack teaching experience, pedagogy certification, and a relevant health sciences qualification.',
    isRead: false,
    isSaved: false,
    computedAt: '2026-06-28T14:30:00Z',
  },
];

export const applications: Application[] = [
  {
    id: 'app1',
    jobId: 'j1',
    jobSlug: 'accounts-payable-officer-safaricom',
    jobTitle: 'Accounts Payable Officer',
    company: 'Safaricom PLC',
    location: 'Nairobi',
    matchScoreAtApplication: 91,
    status: 'SHORTLISTED',
    appliedAt: '2026-06-25T10:00:00Z',
    updatedAt: '2026-06-28T09:00:00Z',
  },
  {
    id: 'app2',
    jobId: 'j2',
    jobSlug: 'finance-assistant-undp-kenya',
    jobTitle: 'Finance Assistant',
    company: 'UNDP Kenya',
    location: 'Nairobi',
    matchScoreAtApplication: 85,
    status: 'APPLIED',
    appliedAt: '2026-06-27T14:30:00Z',
    updatedAt: '2026-06-27T14:30:00Z',
  },
  {
    id: 'app3',
    jobId: 'j3',
    jobSlug: 'junior-accountant-equity-bank',
    jobTitle: 'Junior Accountant',
    company: 'Equity Bank',
    location: 'Nairobi',
    matchScoreAtApplication: 82,
    status: 'INTERVIEW',
    appliedAt: '2026-06-20T08:00:00Z',
    updatedAt: '2026-06-28T11:00:00Z',
  },
];

export const savedJobs: SavedJob[] = [
  {
    jobId: 'j1',
    jobSlug: 'accounts-payable-officer-safaricom',
    jobTitle: 'Accounts Payable Officer',
    company: 'Safaricom PLC',
    location: 'Nairobi',
    employmentType: 'FULL_TIME',
    salaryRange: 'KES 60,000 – 90,000',
    savedAt: '2026-06-28T10:00:00Z',
  },
  {
    jobId: 'j3',
    jobSlug: 'junior-accountant-equity-bank',
    jobTitle: 'Junior Accountant',
    company: 'Equity Bank',
    location: 'Nairobi',
    employmentType: 'FULL_TIME',
    salaryRange: 'KES 50,000 – 80,000',
    savedAt: '2026-06-27T16:00:00Z',
  },
  {
    jobId: 'j4',
    jobSlug: 'project-finance-assistant-world-vision',
    jobTitle: 'Project Finance Assistant',
    company: 'World Vision Kenya',
    location: 'Nairobi',
    employmentType: 'CONTRACT',
    salaryRange: 'KES 45,000 – 65,000',
    savedAt: '2026-06-26T09:00:00Z',
  },
  {
    jobId: 'j9',
    jobSlug: 'grant-finance-officer-cfao',
    jobTitle: 'Grant Finance Officer',
    company: 'CFAO Kenya',
    location: 'Mombasa',
    employmentType: 'FULL_TIME',
    salaryRange: 'KES 55,000 – 85,000',
    savedAt: '2026-06-25T14:00:00Z',
  },
];

// Helper functions
export function getVerdictColor(verdict: Verdict): string {
  switch (verdict) {
    case 'EXCELLENT': return 'text-emerald-600';
    case 'STRONG': return 'text-green-600';
    case 'MODERATE': return 'text-amber-600';
    case 'WEAK': return 'text-orange-500';
    case 'NOT_RECOMMENDED': return 'text-red-500';
  }
}

export function getVerdictBarColor(verdict: Verdict): string {
  switch (verdict) {
    case 'EXCELLENT': return 'bg-emerald-500';
    case 'STRONG': return 'bg-green-500';
    case 'MODERATE': return 'bg-amber-400';
    case 'WEAK': return 'bg-orange-400';
    case 'NOT_RECOMMENDED': return 'bg-red-400';
  }
}

export function getVerdictLabel(verdict: Verdict): string {
  switch (verdict) {
    case 'EXCELLENT': return 'Excellent match';
    case 'STRONG': return 'Strong match';
    case 'MODERATE': return 'Moderate match';
    case 'WEAK': return 'Weak match';
    case 'NOT_RECOMMENDED': return 'Not recommended';
  }
}

export function getStatusColor(status: ApplicationStatus): string {
  switch (status) {
    case 'APPLIED': return 'text-gray-500';
    case 'VIEWED': return 'text-blue-600';
    case 'SHORTLISTED': return 'text-amber-600';
    case 'INTERVIEW': return 'text-emerald-600';
    case 'REJECTED': return 'text-red-500';
    case 'HIRED': return 'text-green-700';
    case 'WITHDRAWN': return 'text-gray-400';
  }
}

export function getStatusLabel(status: ApplicationStatus): string {
  const labels: Record<ApplicationStatus, string> = {
    APPLIED: 'Applied',
    VIEWED: 'Viewed by employer',
    SHORTLISTED: 'Shortlisted',
    INTERVIEW: 'Interview scheduled',
    REJECTED: 'Not selected',
    HIRED: 'Hired',
    WITHDRAWN: 'Withdrawn',
  };
  return labels[status];
}

export const matchWeights = {
  category: 25,
  subcategory: 25,
  skills: 25,
  qualifications: 10,
  experience: 10,
  industry: 5,
};

export const profileCompletionChecklist = [
  { label: 'Personal information', complete: true },
  { label: 'CV uploaded and processed', complete: true },
  { label: 'Work experience', complete: true },
  { label: 'Education history', complete: true },
  { label: 'Skills and tools', complete: true },
  { label: 'Certifications', complete: true },
  { label: 'Career domain confirmed', complete: true },
  { label: 'Interest categories selected', complete: true },
  { label: 'Job preferences set', complete: true },
  { label: 'Profile photo', complete: false },
  { label: 'Professional summary', complete: false },
  { label: 'References added', complete: false },
];