/**
 * Taxonomy seed script for the matching engine.
 * Populates taxonomy_items with Kenyan job market categories, subcategories, skills, tools,
 * qualifications, certifications, and specializations.
 *
 * Usage: npx tsx prisma/seed-taxonomy.ts
 */

import { PrismaClient, TaxonomyType } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// TYPES
// ============================================================

interface TaxonomyEntry {
  type: TaxonomyType;
  value: string;
  label: string;
  parentId?: string; // will be resolved after parent is inserted
  parentValue?: string; // reference by value for resolution
  aliases?: string[];
  description?: string;
}

// ============================================================
// ORGANIZATION TYPES
// ============================================================

const orgTypes: TaxonomyEntry[] = [
  { type: 'ORGANIZATION_TYPE', value: 'PRIVATE_COMPANY', label: 'Private Company', aliases: ['Private Sector', 'Corporate'] },
  { type: 'ORGANIZATION_TYPE', value: 'PUBLIC_LISTED_COMPANY', label: 'Public Listed Company', aliases: ['Listed Company', 'NSE Listed'] },
  { type: 'ORGANIZATION_TYPE', value: 'NATIONAL_GOVERNMENT', label: 'National Government', aliases: ['Government of Kenya', 'GoK'] },
  { type: 'ORGANIZATION_TYPE', value: 'COUNTY_GOVERNMENT', label: 'County Government', aliases: ['County', 'Devolved Unit'] },
  { type: 'ORGANIZATION_TYPE', value: 'STATE_CORPORATION', label: 'State Corporation', aliases: ['Parastatal', 'Semi-Autonomous Government Agency'] },
  { type: 'ORGANIZATION_TYPE', value: 'REGULATORY_AUTHORITY', label: 'Regulatory Authority', aliases: ['Regulator'] },
  { type: 'ORGANIZATION_TYPE', value: 'NGO_LOCAL', label: 'Local NGO', aliases: ['Local Non-Profit'] },
  { type: 'ORGANIZATION_TYPE', value: 'NGO_INTERNATIONAL', label: 'International NGO', aliases: ['INGO', 'International Non-Profit', 'UN Agency'] },
  { type: 'ORGANIZATION_TYPE', value: 'UNIVERSITY', label: 'University', aliases: ['Higher Education Institution'] },
  { type: 'ORGANIZATION_TYPE', value: 'TVET_INSTITUTION', label: 'TVET Institution', aliases: ['Technical College', 'Polytechnic'] },
  { type: 'ORGANIZATION_TYPE', value: 'PRIMARY_SECONDARY_SCHOOL', label: 'Primary / Secondary School' },
  { type: 'ORGANIZATION_TYPE', value: 'FOUNDATION', label: 'Foundation', aliases: ['Trust'] },
  { type: 'ORGANIZATION_TYPE', value: 'EMBASSY_DIPLOMATIC', label: 'Embassy / Diplomatic Mission' },
  { type: 'ORGANIZATION_TYPE', value: 'RELIGIOUS_ORGANIZATION', label: 'Religious Organization' },
  { type: 'ORGANIZATION_TYPE', value: 'COOPERATIVE_SOCIETY', label: 'Cooperative Society', aliases: ['SACCO', 'Cooperative'] },
  { type: 'ORGANIZATION_TYPE', value: 'STARTUP', label: 'Startup', aliases: ['Tech Startup', 'Early-Stage Company'] },
];

// ============================================================
// INDUSTRIES
// ============================================================

const industries: TaxonomyEntry[] = [
  { type: 'INDUSTRY', value: 'AGRICULTURE', label: 'Agriculture', aliases: ['Agribusiness', 'Farming'] },
  { type: 'INDUSTRY', value: 'AUTOMOTIVE', label: 'Automotive' },
  { type: 'INDUSTRY', value: 'AVIATION', label: 'Aviation', aliases: ['Airlines', 'Aerospace'] },
  { type: 'INDUSTRY', value: 'BANKING', label: 'Banking', aliases: ['Financial Services', 'Banking & Finance'] },
  { type: 'INDUSTRY', value: 'CONSTRUCTION', label: 'Construction', aliases: ['Building & Construction'] },
  { type: 'INDUSTRY', value: 'CONSULTING', label: 'Consulting', aliases: ['Professional Services'] },
  { type: 'INDUSTRY', value: 'CONSUMER_GOODS', label: 'Consumer Goods', aliases: ['FMCG', 'Fast Moving Consumer Goods'] },
  { type: 'INDUSTRY', value: 'EDUCATION', label: 'Education', aliases: ['Education & Training'] },
  { type: 'INDUSTRY', value: 'ENERGY', label: 'Energy', aliases: ['Oil & Gas', 'Renewable Energy', 'Power'] },
  { type: 'INDUSTRY', value: 'ENVIRONMENT', label: 'Environment', aliases: ['Environmental Conservation'] },
  { type: 'INDUSTRY', value: 'FINTECH', label: 'Fintech', aliases: ['Financial Technology'] },
  { type: 'INDUSTRY', value: 'FOOD_BEVERAGE', label: 'Food & Beverage', aliases: ['Hospitality', 'Food Industry'] },
  { type: 'INDUSTRY', value: 'GOVERNMENT_PUBLIC_ADMIN', label: 'Government & Public Administration' },
  { type: 'INDUSTRY', value: 'HEALTHCARE', label: 'Healthcare', aliases: ['Health', 'Medical', 'Pharmaceutical'] },
  { type: 'INDUSTRY', value: 'HOSPITALITY_TOURISM', label: 'Hospitality & Tourism', aliases: ['Tourism', 'Hotels', 'Travel'] },
  { type: 'INDUSTRY', value: 'HUMAN_RESOURCES', label: 'Human Resources' },
  { type: 'INDUSTRY', value: 'INFORMATION_TECHNOLOGY', label: 'Information Technology', aliases: ['IT', 'Tech'] },
  { type: 'INDUSTRY', value: 'INSURANCE', label: 'Insurance' },
  { type: 'INDUSTRY', value: 'INTERNATIONAL_DEVELOPMENT', label: 'International Development', aliases: ['Development', 'Humanitarian'] },
  { type: 'INDUSTRY', value: 'LEGAL', label: 'Legal', aliases: ['Law', 'Legal Services'] },
  { type: 'INDUSTRY', value: 'LOGISTICS_SUPPLY_CHAIN', label: 'Logistics & Supply Chain', aliases: ['Supply Chain', 'Shipping', 'Transport'] },
  { type: 'INDUSTRY', value: 'MANUFACTURING', label: 'Manufacturing' },
  { type: 'INDUSTRY', value: 'MARKETING_ADVERTISING', label: 'Marketing & Advertising', aliases: ['Advertising', 'Media'] },
  { type: 'INDUSTRY', value: 'MEDIA_ENTERTAINMENT', label: 'Media & Entertainment' },
  { type: 'INDUSTRY', value: 'MINING', label: 'Mining', aliases: ['Minerals', 'Extractives'] },
  { type: 'INDUSTRY', value: 'NON_PROFIT', label: 'Non-Profit', aliases: ['NGO Sector', 'Civil Society'] },
  { type: 'INDUSTRY', value: 'PHARMACEUTICAL', label: 'Pharmaceutical' },
  { type: 'INDUSTRY', value: 'REAL_ESTATE', label: 'Real Estate', aliases: ['Property', 'Land'] },
  { type: 'INDUSTRY', value: 'RESEARCH', label: 'Research', aliases: ['Research & Development', 'R&D'] },
  { type: 'INDUSTRY', value: 'RETAIL', label: 'Retail', aliases: ['Retail & Wholesale'] },
  { type: 'INDUSTRY', value: 'SECURITY_DEFENSE', label: 'Security & Defense' },
  { type: 'INDUSTRY', value: 'SPORTS', label: 'Sports' },
  { type: 'INDUSTRY', value: 'TELECOMMUNICATIONS', label: 'Telecommunications', aliases: ['Telco', 'Telecom'] },
  { type: 'INDUSTRY', value: 'TEXTILES_APPAREL', label: 'Textiles & Apparel' },
  { type: 'INDUSTRY', value: 'WATER_SANITATION', label: 'Water & Sanitation', aliases: ['WASH'] },
];

// ============================================================
// JOB CATEGORIES + SUBCATEGORIES
// ============================================================

const categories: TaxonomyEntry[] = [
  // TECHNOLOGY
  { type: 'CATEGORY', value: 'TECHNOLOGY', label: 'Technology & IT' },
  { type: 'SUBCATEGORY', value: 'SOFTWARE_ENGINEERING', label: 'Software Engineering', parentValue: 'TECHNOLOGY' },
  { type: 'SUBCATEGORY', value: 'WEB_DEVELOPMENT', label: 'Web Development', parentValue: 'TECHNOLOGY' },
  { type: 'SUBCATEGORY', value: 'MOBILE_DEVELOPMENT', label: 'Mobile Development', parentValue: 'TECHNOLOGY' },
  { type: 'SUBCATEGORY', value: 'DATA_SCIENCE', label: 'Data Science & Analytics', parentValue: 'TECHNOLOGY' },
  { type: 'SUBCATEGORY', value: 'CYBER_SECURITY', label: 'Cybersecurity', parentValue: 'TECHNOLOGY' },
  { type: 'SUBCATEGORY', value: 'DEVOPS_CLOUD', label: 'DevOps & Cloud Infrastructure', parentValue: 'TECHNOLOGY' },
  { type: 'SUBCATEGORY', value: 'IT_SUPPORT', label: 'IT Support & Helpdesk', parentValue: 'TECHNOLOGY' },
  { type: 'SUBCATEGORY', value: 'NETWORK_ADMIN', label: 'Network Administration', parentValue: 'TECHNOLOGY' },
  { type: 'SUBCATEGORY', value: 'AI_ML', label: 'AI & Machine Learning', parentValue: 'TECHNOLOGY' },
  { type: 'SUBCATEGORY', value: 'QA_TESTING', label: 'QA & Testing', parentValue: 'TECHNOLOGY' },
  { type: 'SUBCATEGORY', value: 'UI_UX_DESIGN', label: 'UI/UX Design', parentValue: 'TECHNOLOGY' },
  { type: 'SUBCATEGORY', value: 'DATABASE_ADMIN', label: 'Database Administration', parentValue: 'TECHNOLOGY' },
  { type: 'SUBCATEGORY', value: 'SYSTEM_ADMIN', label: 'Systems Administration', parentValue: 'TECHNOLOGY' },
  { type: 'SUBCATEGORY', value: 'PRODUCT_MANAGEMENT', label: 'Product Management', parentValue: 'TECHNOLOGY' },
  { type: 'SUBCATEGORY', value: 'TECHNICAL_WRITING', label: 'Technical Writing', parentValue: 'TECHNOLOGY' },

  // FINANCE & ACCOUNTING
  { type: 'CATEGORY', value: 'FINANCE_ACCOUNTING', label: 'Finance & Accounting' },
  { type: 'SUBCATEGORY', value: 'ACCOUNTING', label: 'Accounting', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'SUBCATEGORY', value: 'ACCOUNTS_PAYABLE', label: 'Accounts Payable', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'SUBCATEGORY', value: 'FINANCIAL_REPORTING', label: 'Financial Reporting', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'SUBCATEGORY', value: 'AUDIT', label: 'Audit', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'SUBCATEGORY', value: 'TAX_COMPLIANCE', label: 'Tax & Compliance', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'SUBCATEGORY', value: 'PAYROLL', label: 'Payroll', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'SUBCATEGORY', value: 'FINANCIAL_ANALYSIS', label: 'Financial Analysis', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'SUBCATEGORY', value: 'BANKING_OPERATIONS', label: 'Banking Operations', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'SUBCATEGORY', value: 'INSURANCE', label: 'Insurance', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'SUBCATEGORY', value: 'GRANT_MANAGEMENT', label: 'Grant Management', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'SUBCATEGORY', value: 'PROCUREMENT', label: 'Procurement', parentValue: 'FINANCE_ACCOUNTING' },

  // HEALTHCARE
  { type: 'CATEGORY', value: 'HEALTHCARE', label: 'Healthcare & Medical' },
  { type: 'SUBCATEGORY', value: 'MEDICAL_DOCTOR', label: 'Medical Doctor', parentValue: 'HEALTHCARE' },
  { type: 'SUBCATEGORY', value: 'NURSING', label: 'Nursing', parentValue: 'HEALTHCARE' },
  { type: 'SUBCATEGORY', value: 'CLINICAL_OFFICER', label: 'Clinical Officer', parentValue: 'HEALTHCARE' },
  { type: 'SUBCATEGORY', value: 'PHARMACY', label: 'Pharmacy', parentValue: 'HEALTHCARE' },
  { type: 'SUBCATEGORY', value: 'PUBLIC_HEALTH', label: 'Public Health', parentValue: 'HEALTHCARE' },
  { type: 'SUBCATEGORY', value: 'HEALTH_RECORDS', label: 'Health Records & ICT', parentValue: 'HEALTHCARE' },
  { type: 'SUBCATEGORY', value: 'MEDICAL_LABORATORY', label: 'Medical Laboratory', parentValue: 'HEALTHCARE' },
  { type: 'SUBCATEGORY', value: 'NUTRITION', label: 'Nutrition & Dietetics', parentValue: 'HEALTHCARE' },
  { type: 'SUBCATEGORY', value: 'HEALTH_ADMINISTRATION', label: 'Health Administration', parentValue: 'HEALTHCARE' },

  // EDUCATION
  { type: 'CATEGORY', value: 'EDUCATION', label: 'Education & Training' },
  { type: 'SUBCATEGORY', value: 'LECTURING', label: 'Lecturing', parentValue: 'EDUCATION' },
  { type: 'SUBCATEGORY', value: 'TVET_TRAINING', label: 'TVET Training', parentValue: 'EDUCATION' },
  { type: 'SUBCATEGORY', value: 'CURRICULUM_DEVELOPMENT', label: 'Curriculum Development', parentValue: 'EDUCATION' },
  { type: 'SUBCATEGORY', value: 'EDUCATION_ADMIN', label: 'Education Administration', parentValue: 'EDUCATION' },
  { type: 'SUBCATEGORY', value: 'EARLY_CHILDHOOD', label: 'Early Childhood Education', parentValue: 'EDUCATION' },
  { type: 'SUBCATEGORY', value: 'SPECIAL_NEEDS', label: 'Special Needs Education', parentValue: 'EDUCATION' },
  { type: 'SUBCATEGORY', value: 'E_LEARNING', label: 'E-Learning', parentValue: 'EDUCATION' },

  // ENGINEERING
  { type: 'CATEGORY', value: 'ENGINEERING', label: 'Engineering' },
  { type: 'SUBCATEGORY', value: 'CIVIL_ENGINEERING', label: 'Civil Engineering', parentValue: 'ENGINEERING' },
  { type: 'SUBCATEGORY', value: 'ELECTRICAL_ENGINEERING', label: 'Electrical Engineering', parentValue: 'ENGINEERING' },
  { type: 'SUBCATEGORY', value: 'MECHANICAL_ENGINEERING', label: 'Mechanical Engineering', parentValue: 'ENGINEERING' },
  { type: 'SUBCATEGORY', value: 'CHEMICAL_ENGINEERING', label: 'Chemical Engineering', parentValue: 'ENGINEERING' },
  { type: 'SUBCATEGORY', value: 'ENVIRONMENTAL_ENGINEERING', label: 'Environmental Engineering', parentValue: 'ENGINEERING' },
  { type: 'SUBCATEGORY', value: 'GEOMATIC_ENGINEERING', label: 'Geomatic / Surveying', parentValue: 'ENGINEERING' },

  // HUMAN RESOURCES
  { type: 'CATEGORY', value: 'HUMAN_RESOURCES', label: 'Human Resources' },
  { type: 'SUBCATEGORY', value: 'HR_GENERALIST', label: 'HR Generalist', parentValue: 'HUMAN_RESOURCES' },
  { type: 'SUBCATEGORY', value: 'RECRUITMENT', label: 'Recruitment', parentValue: 'HUMAN_RESOURCES', aliases: ['Talent Acquisition', 'People Operations'] },
  { type: 'SUBCATEGORY', value: 'HR_OPERATIONS', label: 'HR Operations', parentValue: 'HUMAN_RESOURCES' },
  { type: 'SUBCATEGORY', value: 'TRAINING_DEVELOPMENT', label: 'Training & Development', parentValue: 'HUMAN_RESOURCES' },
  { type: 'SUBCATEGORY', value: 'COMPENSATION_BENEFITS', label: 'Compensation & Benefits', parentValue: 'HUMAN_RESOURCES' },

  // MARKETING & COMMUNICATIONS
  { type: 'CATEGORY', value: 'MARKETING', label: 'Marketing & Communications' },
  { type: 'SUBCATEGORY', value: 'DIGITAL_MARKETING', label: 'Digital Marketing', parentValue: 'MARKETING' },
  { type: 'SUBCATEGORY', value: 'CONTENT_MARKETING', label: 'Content Marketing', parentValue: 'MARKETING' },
  { type: 'SUBCATEGORY', value: 'SOCIAL_MEDIA', label: 'Social Media Management', parentValue: 'MARKETING' },
  { type: 'SUBCATEGORY', value: 'PUBLIC_RELATIONS', label: 'Public Relations', parentValue: 'MARKETING' },
  { type: 'SUBCATEGORY', value: 'BRAND_MANAGEMENT', label: 'Brand Management', parentValue: 'MARKETING' },

  // ADMINISTRATION
  { type: 'CATEGORY', value: 'ADMINISTRATION', label: 'Administration & Office' },
  { type: 'SUBCATEGORY', value: 'OFFICE_ADMIN', label: 'Office Administration', parentValue: 'ADMINISTRATION' },
  { type: 'SUBCATEGORY', value: 'RECEPTION', label: 'Reception & Front Desk', parentValue: 'ADMINISTRATION' },
  { type: 'SUBCATEGORY', value: 'DATA_ENTRY', label: 'Data Entry', parentValue: 'ADMINISTRATION' },
  { type: 'SUBCATEGORY', value: 'SECRETARIAL', label: 'Secretarial', parentValue: 'ADMINISTRATION' },

  // LEGAL
  { type: 'CATEGORY', value: 'LEGAL', label: 'Legal' },
  { type: 'SUBCATEGORY', value: 'CORPORATE_LAW', label: 'Corporate Law', parentValue: 'LEGAL' },
  { type: 'SUBCATEGORY', value: 'LITIGATION', label: 'Litigation', parentValue: 'LEGAL' },
  { type: 'SUBCATEGORY', value: 'COMPLIANCE', label: 'Compliance & Regulatory', parentValue: 'LEGAL' },
  { type: 'SUBCATEGORY', value: 'CONVEYANCING', label: 'Conveyancing', parentValue: 'LEGAL' },

  // SUPPLY CHAIN
  { type: 'CATEGORY', value: 'SUPPLY_CHAIN', label: 'Supply Chain & Logistics' },
  { type: 'SUBCATEGORY', value: 'LOGISTICS', label: 'Logistics', parentValue: 'SUPPLY_CHAIN' },
  { type: 'SUBCATEGORY', value: 'WAREHOUSING', label: 'Warehousing', parentValue: 'SUPPLY_CHAIN' },
  { type: 'SUBCATEGORY', value: 'IMPORT_EXPORT', label: 'Import & Export', parentValue: 'SUPPLY_CHAIN' },
  { type: 'SUBCATEGORY', value: 'FLEET_MANAGEMENT', label: 'Fleet Management', parentValue: 'SUPPLY_CHAIN' },

  // AGRICULTURE
  { type: 'CATEGORY', value: 'AGRICULTURE', label: 'Agriculture & Agribusiness' },
  { type: 'SUBCATEGORY', value: 'AGRONOMY', label: 'Agronomy', parentValue: 'AGRICULTURE' },
  { type: 'SUBCATEGORY', value: 'VETERINARY', label: 'Veterinary', parentValue: 'AGRICULTURE' },
  { type: 'SUBCATEGORY', value: 'AGRI_BUSINESS', label: 'Agribusiness Management', parentValue: 'AGRICULTURE' },
  { type: 'SUBCATEGORY', value: 'FOOD_SCIENCE', label: 'Food Science', parentValue: 'AGRICULTURE' },

  // CUSTOMER SERVICE
  { type: 'CATEGORY', value: 'CUSTOMER_SERVICE', label: 'Customer Service' },
  { type: 'SUBCATEGORY', value: 'CALL_CENTER', label: 'Call Centre', parentValue: 'CUSTOMER_SERVICE', aliases: ['Contact Centre'] },
  { type: 'SUBCATEGORY', value: 'CUSTOMER_SUCCESS', label: 'Customer Success', parentValue: 'CUSTOMER_SERVICE' },
  { type: 'SUBCATEGORY', value: 'CLIENT_RELATIONS', label: 'Client Relations', parentValue: 'CUSTOMER_SERVICE' },

  // SALES
  { type: 'CATEGORY', value: 'SALES', label: 'Sales' },
  { type: 'SUBCATEGORY', value: 'BUSINESS_DEVELOPMENT', label: 'Business Development', parentValue: 'SALES' },
  { type: 'SUBCATEGORY', value: 'ACCOUNT_MANAGEMENT', label: 'Account Management', parentValue: 'SALES' },
  { type: 'SUBCATEGORY', value: 'REAL_ESTATE_SALES', label: 'Real Estate Sales', parentValue: 'SALES' },

  // MEDIA & CREATIVE
  { type: 'CATEGORY', value: 'MEDIA_CREATIVE', label: 'Media & Creative' },
  { type: 'SUBCATEGORY', value: 'JOURNALISM', label: 'Journalism', parentValue: 'MEDIA_CREATIVE' },
  { type: 'SUBCATEGORY', value: 'GRAPHIC_DESIGN', label: 'Graphic Design', parentValue: 'MEDIA_CREATIVE' },
  { type: 'SUBCATEGORY', value: 'VIDEO_PRODUCTION', label: 'Video Production', parentValue: 'MEDIA_CREATIVE' },
  { type: 'SUBCATEGORY', value: 'PHOTOGRAPHY', label: 'Photography', parentValue: 'MEDIA_CREATIVE' },

  // SOCIAL WORK
  { type: 'CATEGORY', value: 'SOCIAL_WORK', label: 'Social Work & Community' },
  { type: 'SUBCATEGORY', value: 'COMMUNITY_DEVELOPMENT', label: 'Community Development', parentValue: 'SOCIAL_WORK' },
  { type: 'SUBCATEGORY', value: 'SOCIAL_WORK_DIRECT', label: 'Social Work', parentValue: 'SOCIAL_WORK' },
  { type: 'SUBCATEGORY', value: 'COUNSELLING', label: 'Counselling Psychology', parentValue: 'SOCIAL_WORK' },
  { type: 'SUBCATEGORY', value: 'M_E', label: 'Monitoring & Evaluation', parentValue: 'SOCIAL_WORK' },

  // GOVERNMENT & POLICY
  { type: 'CATEGORY', value: 'GOVERNMENT_POLICY', label: 'Government & Policy' },
  { type: 'SUBCATEGORY', value: 'PUBLIC_POLICY', label: 'Public Policy', parentValue: 'GOVERNMENT_POLICY' },
  { type: 'SUBCATEGORY', value: 'GOVERNANCE', label: 'Governance', parentValue: 'GOVERNMENT_POLICY' },
  { type: 'SUBCATEGORY', value: 'DISASTER_MANAGEMENT', label: 'Disaster Management', parentValue: 'GOVERNMENT_POLICY' },
];

// ============================================================
// SKILLS (cross-category, common in Kenyan job market)
// ============================================================

const skills: TaxonomyEntry[] = [
  // Finance & Accounting skills
  { type: 'SKILL', value: 'ACCOUNTS_PAYABLE', label: 'Accounts Payable', aliases: ['AP Processing', 'Creditor Management'] },
  { type: 'SKILL', value: 'ACCOUNTS_RECEIVABLE', label: 'Accounts Receivable', aliases: ['Debtor Management'] },
  { type: 'SKILL', value: 'BANK_RECONCILIATION', label: 'Bank Reconciliation' },
  { type: 'SKILL', value: 'FINANCIAL_REPORTING', label: 'Financial Reporting', aliases: ['Financial Statements'] },
  { type: 'SKILL', value: 'INVOICE_PROCESSING', label: 'Invoice Processing' },
  { type: 'SKILL', value: 'AUDIT_SUPPORT', label: 'Audit Support', aliases: ['Internal Audit', 'External Audit'] },
  { type: 'SKILL', value: 'PAYROLL_PROCESSING', label: 'Payroll Processing', aliases: ['Payroll Management'] },
  { type: 'SKILL', value: 'BUDGET_PREPARATION', label: 'Budget Preparation', aliases: ['Budgeting'] },
  { type: 'SKILL', value: 'TAX_COMPLIANCE_SKILL', label: 'Tax Compliance', aliases: ['Tax Filing', 'KRA Returns', 'PAYE', 'NSSF', 'NHIF'] },
  { type: 'SKILL', value: 'GRANT_MANAGEMENT', label: 'Grant Management', aliases: ['Donor Reporting'] },
  { type: 'SKILL', value: 'FINANCIAL_ANALYSIS_SKILL', label: 'Financial Analysis', aliases: ['Ratio Analysis', 'Trend Analysis'] },
  { type: 'SKILL', value: 'COST_ACCOUNTING', label: 'Cost Accounting' },
  { type: 'SKILL', value: 'FOREX_MANAGEMENT', label: 'Foreign Exchange Management' },
  { type: 'SKILL', value: 'CASH_FLOW_MANAGEMENT', label: 'Cash Flow Management' },

  // Tech skills
  { type: 'SKILL', value: 'JAVASCRIPT', label: 'JavaScript', aliases: ['JS', 'ES6+'] },
  { type: 'SKILL', value: 'TYPESCRIPT', label: 'TypeScript' },
  { type: 'SKILL', value: 'PYTHON', label: 'Python' },
  { type: 'SKILL', value: 'PHP', label: 'PHP' },
  { type: 'SKILL', value: 'REACT', label: 'React', aliases: ['React.js', 'ReactJS'] },
  { type: 'SKILL', value: 'NEXT_JS', label: 'Next.js', aliases: ['NextJS'] },
  { type: 'SKILL', value: 'NODE_JS', label: 'Node.js', aliases: ['Node', 'NodeJS'] },
  { type: 'SKILL', value: 'FLUTTER', label: 'Flutter' },
  { type: 'SKILL', value: 'REACT_NATIVE', label: 'React Native' },
  { type: 'SKILL', value: 'SQL', label: 'SQL', aliases: ['MySQL', 'PostgreSQL', 'Database Querying'] },
  { type: 'SKILL', value: 'REST_API', label: 'REST API Design', aliases: ['API Development', 'RESTful APIs'] },
  { type: 'SKILL', value: 'GIT', label: 'Git', aliases: ['Version Control'] },
  { type: 'SKILL', value: 'DOCKER', label: 'Docker', aliases: ['Containerization'] },
  { type: 'SKILL', value: 'AWS', label: 'AWS', aliases: ['Amazon Web Services'] },
  { type: 'SKILL', value: 'AZURE', label: 'Microsoft Azure' },
  { type: 'SKILL', value: 'MACHINE_LEARNING', label: 'Machine Learning', aliases: ['ML'] },
  { type: 'SKILL', value: 'DATA_VISUALIZATION', label: 'Data Visualization', aliases: ['Tableau', 'Power BI'] },
  { type: 'SKILL', value: 'LINUX', label: 'Linux Administration', aliases: ['Ubuntu', 'CentOS'] },
  { type: 'SKILL', value: 'CYBERSECURITY_FUNDAMENTALS', label: 'Cybersecurity Fundamentals' },
  { type: 'SKILL', value: 'HTML_CSS', label: 'HTML & CSS' },
  { type: 'SKILL', value: 'TAILWIND_CSS', label: 'Tailwind CSS' },
  { type: 'SKILL', value: 'FIGMA', label: 'Figma' },
  { type: 'SKILL', value: 'UI_UX_DESIGN_SKILL', label: 'UI/UX Design' },

  // Healthcare skills
  { type: 'SKILL', value: 'PATIENT_CARE', label: 'Patient Care' },
  { type: 'SKILL', value: 'CLINICAL_ASSESSMENT', label: 'Clinical Assessment' },
  { type: 'SKILL', value: 'PHARMACOLOGY', label: 'Pharmacology' },
  { type: 'SKILL', value: 'EPIDEMIOLOGY', label: 'Epidemiology' },
  { type: 'SKILL', value: 'HEALTH_RECORDS_MANAGEMENT', label: 'Health Records Management' },
  { type: 'SKILL', value: 'MATERNAL_HEALTH', label: 'Maternal & Child Health' },

  // Education skills
  { type: 'SKILL', value: 'LESSON_PLANNING', label: 'Lesson Planning' },
  { type: 'SKILL', value: 'STUDENT_ASSESSMENT', label: 'Student Assessment', aliases: ['Examination', 'Grading'] },
  { type: 'SKILL', value: 'MENTORSHIP', label: 'Mentorship', aliases: ['Student Mentorship'] },
  { type: 'SKILL', value: 'CURRICULUM_DELIVERY', label: 'Curriculum Delivery', aliases: ['Teaching'] },
  { type: 'SKILL', value: 'EXAM_INVIGILATION', label: 'Exam Invigilation' },
  { type: 'SKILL', value: 'E_LEARNING_DELIVERY', label: 'E-Learning Delivery' },

  // HR & Admin skills
  { type: 'SKILL', value: 'CANDIDATE_SCREENING', label: 'Candidate Screening', aliases: ['Talent Screening', 'CV Screening'] },
  { type: 'SKILL', value: 'INTERVIEWING', label: 'Interviewing' },
  { type: 'SKILL', value: 'ONBOARDING', label: 'Employee Onboarding' },
  { type: 'SKILL', value: 'PERFORMANCE_MANAGEMENT', label: 'Performance Management' },
  { type: 'SKILL', value: 'TRAINING_FACILITATION', label: 'Training Facilitation' },
  { type: 'SKILL', value: 'DATA_ENTRY_SKILL', label: 'Data Entry', aliases: ['Typing'] },
  { type: 'SKILL', value: 'SCHEDULING', label: 'Scheduling & Calendar Management' },
  { type: 'SKILL', value: 'FILING_RECORDS', label: 'Filing & Records Management' },

  // Marketing skills
  { type: 'SKILL', value: 'SEO', label: 'Search Engine Optimization', aliases: ['SEO'] },
  { type: 'SKILL', value: 'SEM', label: 'Search Engine Marketing', aliases: ['Google Ads', 'PPC'] },
  { type: 'SKILL', value: 'SOCIAL_MEDIA_MANAGEMENT', label: 'Social Media Management' },
  { type: 'SKILL', value: 'COPYWRITING', label: 'Copywriting' },
  { type: 'SKILL', value: 'EMAIL_MARKETING', label: 'Email Marketing' },

  // Project Management
  { type: 'SKILL', value: 'PROJECT_MANAGEMENT', label: 'Project Management', aliases: ['PM'] },
  { type: 'SKILL', value: 'AGILE_SCRUM', label: 'Agile & Scrum' },
  { type: 'SKILL', value: 'RISK_MANAGEMENT', label: 'Risk Management' },
  { type: 'SKILL', value: 'STAKEHOLDER_MANAGEMENT', label: 'Stakeholder Management' },

  // Soft skills / Cross-cutting
  { type: 'SKILL', value: 'REPORT_WRITING', label: 'Report Writing', aliases: ['Proposal Writing'] },
  { type: 'SKILL', value: 'PRESENTATION_SKILLS', label: 'Presentation Skills' },
  { type: 'SKILL', value: 'TEAM_LEADERSHIP', label: 'Team Leadership' },
  { type: 'SKILL', value: 'PROBLEM_SOLVING', label: 'Problem Solving' },
  { type: 'SKILL', value: 'CLIENT_MANAGEMENT', label: 'Client Management', aliases: ['Account Management'] },
  { type: 'SKILL', value: 'MONITORING_EVALUATION', label: 'Monitoring & Evaluation', aliases: ['M&E'] },
  { type: 'SKILL', value: 'RESEARCH_SKILLS', label: 'Research Skills' },
  { type: 'SKILL', value: 'QUANTITATIVE_ANALYSIS', label: 'Quantitative Analysis' },
  { type: 'SKILL', value: 'QUALITATIVE_ANALYSIS', label: 'Qualitative Analysis' },
  { type: 'SKILL', value: 'COMMUNITY_MOBILIZATION', label: 'Community Mobilization' },
];

// ============================================================
// TOOLS
// ============================================================

const tools: TaxonomyEntry[] = [
  // Finance & Accounting tools
  { type: 'TOOL', value: 'EXCEL', label: 'Microsoft Excel', aliases: ['Spreadsheets', 'MS Excel'] },
  { type: 'TOOL', value: 'QUICKBOOKS', label: 'QuickBooks', aliases: ['Quick Books'] },
  { type: 'TOOL', value: 'SAGE_PASTEL', label: 'Sage Pastel', aliases: ['Sage'] },
  { type: 'TOOL', value: 'GOOGLE_SHEETS', label: 'Google Sheets' },
  { type: 'TOOL', value: 'ERP_SYSTEMS', label: 'ERP Systems', aliases: ['SAP', 'Oracle ERP', 'Odoo'] },
  { type: 'TOOL', value: 'POWER_BI', label: 'Microsoft Power BI' },
  { type: 'TOOL', value: 'TABLEAU', label: 'Tableau' },

  // Dev tools
  { type: 'TOOL', value: 'VS_CODE', label: 'Visual Studio Code', aliases: ['VSCode'] },
  { type: 'TOOL', value: 'GITHUB', label: 'GitHub', aliases: ['Git'] },
  { type: 'TOOL', value: 'JIRA', label: 'Jira', aliases: ['Atlassian Jira'] },
  { type: 'TOOL', value: 'POSTMAN', label: 'Postman' },
  { type: 'TOOL', value: 'VERCEL', label: 'Vercel' },
  { type: 'TOOL', value: 'AWS_CONSOLE', label: 'AWS Console' },
  { type: 'TOOL', value: 'FIGMA_TOOL', label: 'Figma', aliases: ['Design Tool'] },
  { type: 'TOOL', value: 'ADOBE_CC', label: 'Adobe Creative Cloud', aliases: ['Photoshop', 'Illustrator', 'Premiere Pro'] },

  // Productivity
  { type: 'TOOL', value: 'GOOGLE_WORKSPACE', label: 'Google Workspace', aliases: ['G-Suite', 'Gmail', 'Google Docs'] },
  { type: 'TOOL', value: 'MICROSOFT_365', label: 'Microsoft 365', aliases: ['Office 365', 'MS Office', 'Word', 'PowerPoint'] },
  { type: 'TOOL', value: 'SLACK', label: 'Slack' },
  { type: 'TOOL', value: 'TEAMS', label: 'Microsoft Teams' },
  { type: 'TOOL', value: 'TRELLO', label: 'Trello' },
  { type: 'TOOL', value: 'ZOOM', label: 'Zoom' },

  // Marketing
  { type: 'TOOL', value: 'GOOGLE_ANALYTICS', label: 'Google Analytics' },
  { type: 'TOOL', value: 'GOOGLE_ADS', label: 'Google Ads' },
  { type: 'TOOL', value: 'META_BUSINESS_SUITE', label: 'Meta Business Suite', aliases: ['Facebook Ads', 'Instagram Ads'] },
  { type: 'TOOL', value: 'MAILCHIMP', label: 'Mailchimp' },
  { type: 'TOOL', value: 'HOOTSUITE', label: 'Hootsuite' },

  // HR
  { type: 'TOOL', value: 'BRIGHTHR', label: 'BrightHR' },
  { type: 'TOOL', value: 'WORKDAY', label: 'Workday' },
];

// ============================================================
// QUALIFICATIONS
// ============================================================

const qualifications: TaxonomyEntry[] = [
  { type: 'QUALIFICATION', value: 'HIGH_SCHOOL_CERT', label: 'Kenya Certificate of Secondary Education (KCSE)', aliases: ['KCSE', 'O-Level', 'High School'] },
  { type: 'QUALIFICATION', value: 'CERTIFICATE', label: 'Certificate' },
  { type: 'QUALIFICATION', value: 'DIPLOMA', label: 'Diploma' },
  { type: 'QUALIFICATION', value: 'BACHELOR_DEGREE', label: "Bachelor's Degree", aliases: ['Bachelors', 'Undergraduate Degree'] },
  { type: 'QUALIFICATION', value: 'MASTER_DEGREE', label: "Master's Degree", aliases: ['Masters', 'Postgraduate Degree'] },
  { type: 'QUALIFICATION', value: 'PHD', label: 'Doctorate (PhD)' },
  { type: 'QUALIFICATION', value: 'BACHELOR_OF_COMMERCE', label: 'Bachelor of Commerce', aliases: ['BCom'] },
  { type: 'QUALIFICATION', value: 'BACHELOR_OF_SCIENCE', label: 'Bachelor of Science', aliases: ['BSc'] },
  { type: 'QUALIFICATION', value: 'BACHELOR_OF_ARTS', label: 'Bachelor of Arts', aliases: ['BA'] },
  { type: 'QUALIFICATION', value: 'BACHELOR_OF_EDUCATION', label: 'Bachelor of Education', aliases: ['BEd'] },
  { type: 'QUALIFICATION', value: 'BACHELOR_OF_LAW', label: 'Bachelor of Laws', aliases: ['LLB'] },
  { type: 'QUALIFICATION', value: 'BACHELOR_OF_MEDICINE', label: 'Bachelor of Medicine & Surgery', aliases: ['MBChB', 'MBBS'] },
  { type: 'QUALIFICATION', value: 'BACHELOR_OF_ENGINEERING', label: 'Bachelor of Engineering', aliases: ['BEng', 'BE'] },
  { type: 'QUALIFICATION', value: 'BACHELOR_OF_NURSING', label: 'Bachelor of Science in Nursing', aliases: ['BScN'] },
  { type: 'QUALIFICATION', value: 'MBA', label: 'Master of Business Administration', aliases: ['MBA'] },
  { type: 'QUALIFICATION', value: 'MASTER_OF_SCIENCE', label: 'Master of Science', aliases: ['MSc'] },
  { type: 'QUALIFICATION', value: 'MASTER_OF_ARTS', label: 'Master of Arts', aliases: ['MA'] },
  { type: 'QUALIFICATION', value: 'CPA', label: 'Certified Public Accountant (Kenya)', aliases: ['CPA Kenya', 'ICPAK'] },
  { type: 'QUALIFICATION', value: 'ACCA', label: 'ACCA' },
  { type: 'QUALIFICATION', value: 'CISA', label: 'CISA (Certified Information Systems Auditor)' },
  { type: 'QUALIFICATION', value: 'PMP', label: 'PMP (Project Management Professional)' },
  { type: 'QUALIFICATION', value: 'CIPS', label: 'CIPS (Chartered Institute of Procurement & Supply)' },
  { type: 'QUALIFICATION', value: 'CHRP', label: 'CHRP (Certified HR Professional)' },
];

// ============================================================
// CERTIFICATIONS
// ============================================================

const certifications: TaxonomyEntry[] = [
  { type: 'CERTIFICATION', value: 'CPA_SECTION_1', label: 'CPA Section 1' },
  { type: 'CERTIFICATION', value: 'CPA_SECTION_2', label: 'CPA Section 2' },
  { type: 'CERTIFICATION', value: 'CPA_SECTION_3', label: 'CPA Section 3' },
  { type: 'CERTIFICATION', value: 'CPA_SECTION_4', label: 'CPA Section 4' },
  { type: 'CERTIFICATION', value: 'CPA_SECTION_5', label: 'CPA Section 5' },
  { type: 'CERTIFICATION', value: 'CPA_SECTION_6', label: 'CPA Section 6' },
  { type: 'CERTIFICATION', value: 'QUICKBOOKS_CERTIFIED', label: 'QuickBooks Certified' },
  { type: 'CERTIFICATION', value: 'AWS_CERTIFIED', label: 'AWS Certified Solutions Architect' },
  { type: 'CERTIFICATION', value: 'AZURE_FUNDAMENTALS', label: 'Microsoft Azure Fundamentals (AZ-900)' },
  { type: 'CERTIFICATION', value: 'GOOGLE_CLOUD', label: 'Google Cloud Certified' },
  { type: 'CERTIFICATION', value: 'PEDAGOGY_CERTIFICATE', label: 'Pedagogy Certificate', aliases: ['Teaching Certificate', 'Postgraduate Diploma in Education'] },
  { type: 'CERTIFICATION', value: 'TVETA_REGISTRATION', label: 'TVETA Registration' },
  { type: 'CERTIFICATION', value: 'COMPtia_A_PLUS', label: 'CompTIA A+' },
  { type: 'CERTIFICATION', value: 'COMPtia_SECURITY_PLUS', label: 'CompTIA Security+' },
  { type: 'CERTIFICATION', value: 'PMP_CERT', label: 'PMP Certification' },
  { type: 'CERTIFICATION', value: 'CIPS_CERT', label: 'CIPS Certification' },
  { type: 'CERTIFICATION', value: 'CHRP_CERT', label: 'CHRP Certification' },
  { type: 'CERTIFICATION', value: 'FIRST_AID', label: 'First Aid Certificate' },
  { type: 'CERTIFICATION', value: 'BLS', label: 'Basic Life Support' },
  { type: 'CERTIFICATION', value: 'DATA_PROTECTION', label: 'Data Protection Certificate' },
];

// ============================================================
// ROLES (common Kenyan job titles)
// ============================================================

const roles: TaxonomyEntry[] = [
  { type: 'ROLE', value: 'ACCOUNTS_PAYABLE_OFFICER', label: 'Accounts Payable Officer', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'ROLE', value: 'ACCOUNTS_ASSISTANT', label: 'Accounts Assistant', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'ROLE', value: 'FINANCE_ASSISTANT', label: 'Finance Assistant', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'ROLE', value: 'FINANCE_OFFICER', label: 'Finance Officer', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'ROLE', value: 'FINANCE_MANAGER', label: 'Finance Manager', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'ROLE', value: 'JUNIOR_ACCOUNTANT', label: 'Junior Accountant', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'ROLE', value: 'AUDIT_ASSISTANT', label: 'Audit Assistant', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'ROLE', value: 'AUDIT_MANAGER', label: 'Audit Manager', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'ROLE', value: 'GRANT_FINANCE_OFFICER', label: 'Grant Finance Officer', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'ROLE', value: 'CREDIT_OFFICER', label: 'Credit Officer', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'ROLE', value: 'TAX_OFFICER', label: 'Tax Officer', parentValue: 'FINANCE_ACCOUNTING' },
  { type: 'ROLE', value: 'FRONTEND_DEVELOPER', label: 'Frontend Developer', parentValue: 'TECHNOLOGY' },
  { type: 'ROLE', value: 'BACKEND_DEVELOPER', label: 'Backend Developer', parentValue: 'TECHNOLOGY' },
  { type: 'ROLE', value: 'FULLSTACK_DEVELOPER', label: 'Full Stack Developer', parentValue: 'TECHNOLOGY' },
  { type: 'ROLE', value: 'MOBILE_DEVELOPER_ROLE', label: 'Mobile Developer', parentValue: 'TECHNOLOGY' },
  { type: 'ROLE', value: 'DATA_ANALYST', label: 'Data Analyst', parentValue: 'TECHNOLOGY' },
  { type: 'ROLE', value: 'DATA_SCIENTIST', label: 'Data Scientist', parentValue: 'TECHNOLOGY' },
  { type: 'ROLE', value: 'DEVOPS_ENGINEER', label: 'DevOps Engineer', parentValue: 'TECHNOLOGY' },
  { type: 'ROLE', value: 'IT_SUPPORT_OFFICER', label: 'IT Support Officer', parentValue: 'TECHNOLOGY' },
  { type: 'ROLE', value: 'NETWORK_ADMINISTRATOR', label: 'Network Administrator', parentValue: 'TECHNOLOGY' },
  { type: 'ROLE', value: 'UI_UX_DESIGNER', label: 'UI/UX Designer', parentValue: 'TECHNOLOGY' },
  { type: 'ROLE', value: 'QA_ENGINEER', label: 'QA Engineer', parentValue: 'TECHNOLOGY' },
  { type: 'ROLE', value: 'PRODUCT_MANAGER', label: 'Product Manager', parentValue: 'TECHNOLOGY' },
  { type: 'ROLE', value: 'MEDICAL_OFFICER', label: 'Medical Officer', parentValue: 'HEALTHCARE' },
  { type: 'ROLE', value: 'REGISTERED_NURSE', label: 'Registered Nurse', parentValue: 'HEALTHCARE' },
  { type: 'ROLE', value: 'CLINICAL_OFFICER_ROLE', label: 'Clinical Officer', parentValue: 'HEALTHCARE' },
  { type: 'ROLE', value: 'PHARMACIST', label: 'Pharmacist', parentValue: 'HEALTHCARE' },
  { type: 'ROLE', value: 'PUBLIC_HEALTH_OFFICER', label: 'Public Health Officer', parentValue: 'HEALTHCARE' },
  { type: 'ROLE', value: 'LECTURER', label: 'Lecturer', parentValue: 'EDUCATION' },
  { type: 'ROLE', value: 'PART_TIME_LECTURER', label: 'Part-Time Lecturer', parentValue: 'EDUCATION' },
  { type: 'ROLE', value: 'TEACHER', label: 'Teacher', parentValue: 'EDUCATION' },
  { type: 'ROLE', value: 'PRINCIPAL', label: 'School Principal', parentValue: 'EDUCATION' },
  { type: 'ROLE', value: 'CIVIL_ENGINEER_ROLE', label: 'Civil Engineer', parentValue: 'ENGINEERING' },
  { type: 'ROLE', value: 'ELECTRICAL_ENGINEER_ROLE', label: 'Electrical Engineer', parentValue: 'ENGINEERING' },
  { type: 'ROLE', value: 'MECHANICAL_ENGINEER_ROLE', label: 'Mechanical Engineer', parentValue: 'ENGINEERING' },
  { type: 'ROLE', value: 'HR_OFFICER', label: 'HR Officer', parentValue: 'HUMAN_RESOURCES' },
  { type: 'ROLE', value: 'HR_MANAGER', label: 'HR Manager', parentValue: 'HUMAN_RESOURCES' },
  { type: 'ROLE', value: 'RECRUITMENT_OFFICER', label: 'Recruitment Officer', parentValue: 'HUMAN_RESOURCES' },
  { type: 'ROLE', value: 'HR_ADMIN_ASSISTANT', label: 'HR & Admin Assistant', parentValue: 'HUMAN_RESOURCES' },
  { type: 'ROLE', value: 'MARKETING_OFFICER', label: 'Marketing Officer', parentValue: 'MARKETING' },
  { type: 'ROLE', value: 'DIGITAL_MARKETING_SPECIALIST', label: 'Digital Marketing Specialist', parentValue: 'MARKETING' },
  { type: 'ROLE', value: 'SOCIAL_MEDIA_MANAGER', label: 'Social Media Manager', parentValue: 'MARKETING' },
  { type: 'ROLE', value: 'ADMIN_ASSISTANT', label: 'Admin Assistant', parentValue: 'ADMINISTRATION' },
  { type: 'ROLE', value: 'OFFICE_MANAGER', label: 'Office Manager', parentValue: 'ADMINISTRATION' },
  { type: 'ROLE', value: 'PROJECT_OFFICER', label: 'Project Officer', parentValue: 'SOCIAL_WORK' },
  { type: 'ROLE', value: 'M_E_OFFICER', label: 'M&E Officer', parentValue: 'SOCIAL_WORK' },
  { type: 'ROLE', value: 'PROGRAM_OFFICER', label: 'Program Officer', parentValue: 'SOCIAL_WORK' },
  { type: 'ROLE', value: 'LOGISTICS_OFFICER', label: 'Logistics Officer', parentValue: 'SUPPLY_CHAIN' },
  { type: 'ROLE', value: 'PROCUREMENT_OFFICER', label: 'Procurement Officer', parentValue: 'SUPPLY_CHAIN' },
];

// ============================================================
// SPECIALIZATIONS
// ============================================================

const specializations: TaxonomyEntry[] = [
  // Health specializations
  { type: 'SPECIALIZATION', value: 'COMMUNITY_HEALTH', label: 'Community Health' },
  { type: 'SPECIALIZATION', value: 'COUNSELLING_PSYCHOLOGY', label: 'Counselling Psychology' },
  { type: 'SPECIALIZATION', value: 'HEALTH_RECORDS_INFORMATION_MANAGEMENT', label: 'Health Records & Information Management' },
  { type: 'SPECIALIZATION', value: 'SOCIAL_WORK_SPEC', label: 'Social Work' },
  { type: 'SPECIALIZATION', value: 'ENVIRONMENTAL_SCIENCES', label: 'Environmental Sciences' },
  { type: 'SPECIALIZATION', value: 'HIV_AIDS', label: 'HIV/AIDS Programming' },
  { type: 'SPECIALIZATION', value: 'MATERNAL_CHILD_HEALTH', label: 'Maternal & Child Health' },
  { type: 'SPECIALIZATION', value: 'NUTRITION_SPEC', label: 'Nutrition' },
  { type: 'SPECIALIZATION', value: 'MENTAL_HEALTH', label: 'Mental Health' },

  // Tech specializations
  { type: 'SPECIALIZATION', value: 'FINTECH', label: 'FinTech' },
  { type: 'SPECIALIZATION', value: 'HEALTHTECH', label: 'HealthTech' },
  { type: 'SPECIALIZATION', value: 'EDTECH', label: 'EdTech' },
  { type: 'SPECIALIZATION', value: 'AGRITECH', label: 'AgriTech' },
  { type: 'SPECIALIZATION', value: 'E_COMMERCE', label: 'E-Commerce' },
  { type: 'SPECIALIZATION', value: 'MOBILE_MONEY', label: 'Mobile Money / Payments', aliases: ['M-Pesa Integration', 'Mobile Payments'] },

  // Finance specializations
  { type: 'SPECIALIZATION', value: 'MICROFINANCE', label: 'Microfinance' },
  { type: 'SPECIALIZATION', value: 'ISLAMIC_FINANCE', label: 'Islamic Finance' },
  { type: 'SPECIALIZATION', value: 'DEBT_CAPITAL_MARKETS', label: 'Debt Capital Markets' },

  // Dev specializations
  { type: 'SPECIALIZATION', value: 'BLOCKCHAIN', label: 'Blockchain', aliases: ['Web3'] },
  { type: 'SPECIALIZATION', value: 'IOT', label: 'Internet of Things', aliases: ['IoT'] },
];

// ============================================================
// REGULATIONS
// ============================================================

const regulations: TaxonomyEntry[] = [
  { type: 'REGULATION', value: 'KRA_COMPLIANCE', label: 'KRA Compliance', aliases: ['Kenya Revenue Authority'] },
  { type: 'REGULATION', value: 'NSSF_COMPLIANCE', label: 'NSSF Compliance' },
  { type: 'REGULATION', value: 'NHIF_COMPLIANCE', label: 'NHIF Compliance' },
  { type: 'REGULATION', value: 'SHIF_COMPLIANCE', label: 'SHIF Compliance', aliases: ['Social Health Insurance Fund'] },
  { type: 'REGULATION', value: 'KNBS_STANDARDS', label: 'KNBS Standards' },
  { type: 'REGULATION', value: 'NCA_COMPLIANCE', label: 'NCA Compliance', aliases: ['National Construction Authority'] },
  { type: 'REGULATION', value: 'DATA_PROTECTION_ACT', label: 'Data Protection Act', aliases: ['ODPC', 'Kenya DPA'] },
  { type: 'REGULATION', value: 'CBK_REGULATIONS', label: 'CBK Regulations', aliases: ['Central Bank of Kenya'] },
  { type: 'REGULATION', value: 'CMA_REGULATIONS', label: 'CMA Regulations', aliases: ['Capital Markets Authority'] },
];

// ============================================================
// MAIN SEED FUNCTION
// ============================================================

async function main() {
  console.log('Seeding taxonomy...\n');

  const allEntries: TaxonomyEntry[] = [
    ...orgTypes,
    ...industries,
    ...categories,
    ...skills,
    ...tools,
    ...qualifications,
    ...certifications,
    ...roles,
    ...specializations,
    ...regulations,
  ];

  // Group by type for reporting
  const typeGroups = allEntries.reduce((acc, entry) => {
    if (!acc[entry.type]) acc[entry.type] = [];
    acc[entry.type].push(entry);
    return acc;
  }, {} as Record<string, TaxonomyEntry[]>);

  let totalInserted = 0;
  let aliasCount = 0;

  // Insert all taxonomy items in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // First pass: insert all items without parent resolution
    const idMap = new Map<string, string>(); // value -> id

    for (const entry of allEntries) {
      const item = await tx.taxonomyItem.upsert({
        where: { type_value: { type: entry.type, value: entry.value } },
        update: { label: entry.label, description: entry.description, isActive: true },
        create: {
          type: entry.type,
          value: entry.value,
          label: entry.label,
          description: entry.description,
          isActive: true,
        },
      });
      idMap.set(`${entry.type}:${entry.value}`, item.id);
      totalInserted++;
    }

    // Second pass: resolve parentIds for subcategories and roles
    for (const entry of allEntries) {
      if (entry.parentValue) {
        const parentId = idMap.get(`CATEGORY:${entry.parentValue}`);
        if (parentId) {
          await tx.taxonomyItem.update({
            where: { type_value: { type: entry.type, value: entry.value } },
            data: { parentId },
          });
        }
      }
    }

    // Third pass: insert aliases
    for (const entry of allEntries) {
      if (entry.aliases && entry.aliases.length > 0) {
        const itemId = idMap.get(`${entry.type}:${entry.value}`);
        if (!itemId) continue;

        for (const alias of entry.aliases) {
          await tx.taxonomyAlias.upsert({
            where: { taxonomyItemId_alias: { taxonomyItemId: itemId, alias } },
            update: {},
            create: { taxonomyItemId: itemId, alias },
          });
          aliasCount++;
        }
      }
    }

    return { idMap };
  });

  // Report
  console.log('Taxonomy seeded successfully!\n');
  for (const [type, entries] of Object.entries(typeGroups)) {
    console.log(`  ${type}: ${entries.length} items`);
  }
  console.log(`\nTotal taxonomy items: ${totalInserted}`);
  console.log(`Total aliases: ${aliasCount}`);
  console.log(`\nNext: run matching engine seed or connect auth.`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });