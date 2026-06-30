/**
 * Taxonomy seed script for the Kenyan job market.
 * Populates taxonomy_items with categories, subcategories, skills, tools,
 * qualifications, certifications, industries, and organization types.
 *
 * Usage: npx tsx prisma/seed-taxonomy.ts
 */

import { prisma } from '../src/lib/prisma';
import { TaxonomyType } from '@prisma/client';

// ============================================================
// TYPES
// ============================================================

type TaxonomySeedItem = {
  type: TaxonomyType;
  value: string;
  label: string;
  description?: string;
  parentId?: string;
};

// ============================================================
// ORGANIZATION TYPES
// ============================================================

const organizationTypes: Omit<TaxonomySeedItem, 'parentId'>[] = [
  { type: TaxonomyType.ORGANIZATION_TYPE, value: 'PRIVATE_COMPANY', label: 'Private Company', description: 'Privately held business entities registered in Kenya' },
  { type: TaxonomyType.ORGANIZATION_TYPE, value: 'PUBLIC_LISTED_COMPANY', label: 'Public Listed Company', description: 'Companies listed on the Nairobi Securities Exchange (NSE)' },
  { type: TaxonomyType.ORGANIZATION_TYPE, value: 'NATIONAL_GOVERNMENT', label: 'National Government', description: 'Ministries, departments, and agencies of the Government of Kenya' },
  { type: TaxonomyType.ORGANIZATION_TYPE, value: 'COUNTY_GOVERNMENT', label: 'County Government', description: 'Devolved county governments established under the 2010 Constitution' },
  { type: TaxonomyType.ORGANIZATION_TYPE, value: 'STATE_CORPORATION', label: 'State Corporation', description: 'Semi-autonomous government agencies and parastatals' },
  { type: TaxonomyType.ORGANIZATION_TYPE, value: 'REGULATORY_AUTHORITY', label: 'Regulatory Authority', description: 'Bodies such as CBK, CMA, NCA, KRA, etc.' },
  { type: TaxonomyType.ORGANIZATION_TYPE, value: 'NGO_LOCAL', label: 'Local NGO', description: 'Non-governmental organizations registered in Kenya' },
  { type: TaxonomyType.ORGANIZATION_TYPE, value: 'NGO_INTERNATIONAL', label: 'International NGO', description: 'INGOs and UN agencies operating in Kenya' },
  { type: TaxonomyType.ORGANIZATION_TYPE, value: 'UNIVERSITY', label: 'University', description: 'Public and private universities recognized by CUE' },
  { type: TaxonomyType.ORGANIZATION_TYPE, value: 'TVET_INSTITUTION', label: 'TVET Institution', description: 'Technical and Vocational Education and Training institutions registered with TVETA' },
  { type: TaxonomyType.ORGANIZATION_TYPE, value: 'STARTUP', label: 'Startup', description: 'Early-stage companies, often in tech and innovation hubs' },
  { type: TaxonomyType.ORGANIZATION_TYPE, value: 'FOUNDATION', label: 'Foundation', description: 'Philanthropic foundations and charitable trusts' },
  { type: TaxonomyType.ORGANIZATION_TYPE, value: 'COOPERATIVE_SOCIETY', label: 'Cooperative Society', description: 'SACCOs and cooperative societies registered under the Cooperative Societies Act' },
];

// ============================================================
// INDUSTRIES
// ============================================================

const industries: Omit<TaxonomySeedItem, 'parentId'>[] = [
  { type: TaxonomyType.INDUSTRY, value: 'BANKING', label: 'Banking', description: 'Commercial banking, microfinance, and SACCOs' },
  { type: TaxonomyType.INDUSTRY, value: 'TELECOMMUNICATIONS', label: 'Telecommunications', description: 'Mobile networks, internet service providers, and fibre operators' },
  { type: TaxonomyType.INDUSTRY, value: 'INSURANCE', label: 'Insurance', description: 'Life, health, and general insurance providers' },
  { type: TaxonomyType.INDUSTRY, value: 'MANUFACTURING', label: 'Manufacturing', description: 'Food processing, textiles, chemicals, and consumer goods' },
  { type: TaxonomyType.INDUSTRY, value: 'HEALTHCARE', label: 'Healthcare', description: 'Hospitals, clinics, pharmaceuticals, and medical supplies' },
  { type: TaxonomyType.INDUSTRY, value: 'EDUCATION', label: 'Education', description: 'Universities, TVETs, schools, and training institutions' },
  { type: TaxonomyType.INDUSTRY, value: 'GOVERNMENT_PUBLIC_ADMIN', label: 'Government & Public Administration', description: 'National and county government operations' },
  { type: TaxonomyType.INDUSTRY, value: 'INTERNATIONAL_DEVELOPMENT', label: 'International Development', description: 'Development agencies, UN bodies, and bilateral donors' },
  { type: TaxonomyType.INDUSTRY, value: 'NON_PROFIT', label: 'Non-Profit', description: 'NGOs, CSOs, and community-based organizations' },
  { type: TaxonomyType.INDUSTRY, value: 'RETAIL', label: 'Retail', description: 'Supermarkets, shops, and e-commerce platforms' },
  { type: TaxonomyType.INDUSTRY, value: 'AGRICULTURE', label: 'Agriculture', description: 'Crop farming, livestock, horticulture, and agribusiness' },
  { type: TaxonomyType.INDUSTRY, value: 'CONSTRUCTION', label: 'Construction', description: 'Building, infrastructure, and real estate development' },
  { type: TaxonomyType.INDUSTRY, value: 'ENERGY', label: 'Energy', description: 'Geothermal, solar, wind, and petroleum' },
  { type: TaxonomyType.INDUSTRY, value: 'TOURISM_HOSPITALITY', label: 'Tourism & Hospitality', description: 'Hotels, travel agencies, tour operators, and restaurants' },
  { type: TaxonomyType.INDUSTRY, value: 'LOGISTICS', label: 'Logistics', description: 'Freight, clearing & forwarding, and last-mile delivery' },
  { type: TaxonomyType.INDUSTRY, value: 'MEDIA', label: 'Media', description: 'Broadcast, print, digital media, and advertising agencies' },
  { type: TaxonomyType.INDUSTRY, value: 'REAL_ESTATE', label: 'Real Estate', description: 'Property management, valuation, and estate agency' },
  { type: TaxonomyType.INDUSTRY, value: 'FINTECH', label: 'Fintech', description: 'Mobile money, digital lending, payments, and insurtech' },
  { type: TaxonomyType.INDUSTRY, value: 'MINING', label: 'Mining', description: 'Mineral extraction, quarrying, and gemstone mining' },
  { type: TaxonomyType.INDUSTRY, value: 'WATER_SANITATION', label: 'Water & Sanitation', description: 'Water supply, wastewater treatment, and borehole drilling' },
];

// ============================================================
// CATEGORIES
// ============================================================

const categories: Omit<TaxonomySeedItem, 'parentId'>[] = [
  { type: TaxonomyType.CATEGORY, value: 'FINANCE_ACCOUNTING', label: 'Finance & Accounting', description: 'Financial management, accounting, audit, and tax roles' },
  { type: TaxonomyType.CATEGORY, value: 'HUMAN_RESOURCES', label: 'Human Resources', description: 'Recruitment, talent management, and employee relations' },
  { type: TaxonomyType.CATEGORY, value: 'INFORMATION_TECHNOLOGY', label: 'Information Technology', description: 'Software development, infrastructure, and IT support' },
  { type: TaxonomyType.CATEGORY, value: 'EDUCATION_TRAINING', label: 'Education & Training', description: 'Teaching, lecturing, curriculum development, and TVET' },
  { type: TaxonomyType.CATEGORY, value: 'HEALTHCARE_MEDICAL', label: 'Healthcare & Medical', description: 'Clinical, nursing, pharmacy, and public health roles' },
  { type: TaxonomyType.CATEGORY, value: 'ENGINEERING', label: 'Engineering', description: 'Civil, electrical, mechanical, and other engineering disciplines' },
  { type: TaxonomyType.CATEGORY, value: 'MARKETING_COMMUNICATIONS', label: 'Marketing & Communications', description: 'Digital marketing, PR, branding, and content creation' },
  { type: TaxonomyType.CATEGORY, value: 'PROCUREMENT_SUPPLY_CHAIN', label: 'Procurement & Supply Chain', description: 'Purchasing, logistics, warehousing, and inventory management' },
  { type: TaxonomyType.CATEGORY, value: 'LEGAL', label: 'Legal', description: 'Corporate law, litigation, compliance, and conveyancing' },
  { type: TaxonomyType.CATEGORY, value: 'ADMINISTRATION', label: 'Administration', description: 'Office administration, secretarial, and data entry roles' },
  { type: TaxonomyType.CATEGORY, value: 'SALES_BUSINESS_DEVELOPMENT', label: 'Sales & Business Development', description: 'Sales, account management, and business growth' },
  { type: TaxonomyType.CATEGORY, value: 'LOGISTICS_TRANSPORT', label: 'Logistics & Transport', description: 'Freight, fleet management, clearing & forwarding' },
  { type: TaxonomyType.CATEGORY, value: 'AGRICULTURE_AGRIBUSINESS', label: 'Agriculture & Agribusiness', description: 'Farming, agronomy, veterinary, and food science' },
  { type: TaxonomyType.CATEGORY, value: 'GOVERNMENT_PUBLIC_ADMIN', label: 'Government & Public Administration', description: 'Public policy, governance, and county administration' },
  { type: TaxonomyType.CATEGORY, value: 'MEDIA_CREATIVE', label: 'Media & Creative', description: 'Journalism, graphic design, video production, and photography' },
  { type: TaxonomyType.CATEGORY, value: 'CUSTOMER_SERVICE', label: 'Customer Service', description: 'Call centres, customer success, and client relations' },
  { type: TaxonomyType.CATEGORY, value: 'RESEARCH_DATA_ANALYTICS', label: 'Research & Data Analytics', description: 'Research, monitoring & evaluation, and data analysis' },
  { type: TaxonomyType.CATEGORY, value: 'CONSTRUCTION_REAL_ESTATE', label: 'Construction & Real Estate', description: 'Building construction, project management, and property' },
  { type: TaxonomyType.CATEGORY, value: 'SOCIAL_WORK_COMMUNITY_DEVELOPMENT', label: 'Social Work & Community Development', description: 'Community development, social work, and counselling' },
];

// ============================================================
// SUBCATEGORIES (organized by parent category value)
// ============================================================

const subcategoriesByParent: Record<string, Omit<TaxonomySeedItem, 'parentId'>[]> = {
  FINANCE_ACCOUNTING: [
    { type: TaxonomyType.SUBCATEGORY, value: 'ACCOUNTING', label: 'Accounting', description: 'General accounting and bookkeeping' },
    { type: TaxonomyType.SUBCATEGORY, value: 'ACCOUNTS_PAYABLE', label: 'Accounts Payable', description: 'Managing creditor payments and supplier invoices' },
    { type: TaxonomyType.SUBCATEGORY, value: 'FINANCIAL_REPORTING', label: 'Financial Reporting', description: 'Preparing financial statements and management reports' },
    { type: TaxonomyType.SUBCATEGORY, value: 'AUDIT', label: 'Audit', description: 'Internal and external audit functions' },
    { type: TaxonomyType.SUBCATEGORY, value: 'TAX_COMPLIANCE', label: 'Tax & Compliance', description: 'KRA tax filing, PAYE, VAT, and withholding tax' },
    { type: TaxonomyType.SUBCATEGORY, value: 'PAYROLL', label: 'Payroll', description: 'Salary processing, NSSF, NHIF/SHIF deductions' },
    { type: TaxonomyType.SUBCATEGORY, value: 'TREASURY', label: 'Treasury', description: 'Cash management, liquidity, and treasury operations' },
    { type: TaxonomyType.SUBCATEGORY, value: 'CREDIT_CONTROL', label: 'Credit Control', description: 'Debt collection, credit risk assessment, and receivables management' },
  ],

  HUMAN_RESOURCES: [
    { type: TaxonomyType.SUBCATEGORY, value: 'RECRUITMENT', label: 'Recruitment', description: 'Talent acquisition, job advertising, and candidate selection' },
    { type: TaxonomyType.SUBCATEGORY, value: 'HR_GENERALIST', label: 'HR Generalist', description: 'Broad HR functions across the employee lifecycle' },
    { type: TaxonomyType.SUBCATEGORY, value: 'TALENT_MANAGEMENT', label: 'Talent Management', description: 'Succession planning, talent pipelines, and workforce planning' },
    { type: TaxonomyType.SUBCATEGORY, value: 'COMPENSATION_BENEFITS', label: 'Compensation & Benefits', description: 'Salary structuring, benefits administration, and job evaluation' },
    { type: TaxonomyType.SUBCATEGORY, value: 'HR_OPERATIONS', label: 'HR Operations', description: 'HRIS management, policies, and compliance' },
    { type: TaxonomyType.SUBCATEGORY, value: 'EMPLOYEE_RELATIONS', label: 'Employee Relations', description: 'Disciplinary processes, grievances, and labour relations' },
    { type: TaxonomyType.SUBCATEGORY, value: 'TRAINING_DEVELOPMENT', label: 'Training & Development', description: 'Capacity building, L&D programmes, and mentorship' },
  ],

  INFORMATION_TECHNOLOGY: [
    { type: TaxonomyType.SUBCATEGORY, value: 'SOFTWARE_DEVELOPMENT', label: 'Software Development', description: 'Custom software, backend systems, and application development' },
    { type: TaxonomyType.SUBCATEGORY, value: 'WEB_DEVELOPMENT', label: 'Web Development', description: 'Frontend, backend, and full-stack web applications' },
    { type: TaxonomyType.SUBCATEGORY, value: 'MOBILE_DEVELOPMENT', label: 'Mobile Development', description: 'Android, iOS, and cross-platform mobile apps' },
    { type: TaxonomyType.SUBCATEGORY, value: 'DATABASE_ADMINISTRATION', label: 'Database Administration', description: 'MySQL, PostgreSQL, MongoDB, and data architecture' },
    { type: TaxonomyType.SUBCATEGORY, value: 'IT_SUPPORT', label: 'IT Support', description: 'Helpdesk, hardware troubleshooting, and end-user support' },
    { type: TaxonomyType.SUBCATEGORY, value: 'CYBERSECURITY', label: 'Cybersecurity', description: 'Information security, penetration testing, and compliance' },
    { type: TaxonomyType.SUBCATEGORY, value: 'DATA_ENGINEERING', label: 'Data Engineering', description: 'ETL pipelines, data warehousing, and big data infrastructure' },
    { type: TaxonomyType.SUBCATEGORY, value: 'NETWORK_ADMINISTRATION', label: 'Network Administration', description: 'LAN/WAN, firewalls, VPNs, and network infrastructure' },
    { type: TaxonomyType.SUBCATEGORY, value: 'DEVOPS', label: 'DevOps', description: 'CI/CD, cloud infrastructure, and site reliability engineering' },
    { type: TaxonomyType.SUBCATEGORY, value: 'QUALITY_ASSURANCE', label: 'Quality Assurance', description: 'Manual and automated testing, QA processes' },
  ],

  EDUCATION_TRAINING: [
    { type: TaxonomyType.SUBCATEGORY, value: 'LECTURING', label: 'Lecturing', description: 'University and college-level teaching' },
    { type: TaxonomyType.SUBCATEGORY, value: 'TVET_TRAINING', label: 'TVET Training', description: 'Technical and vocational skills instruction' },
    { type: TaxonomyType.SUBCATEGORY, value: 'CURRICULUM_DEVELOPMENT', label: 'Curriculum Development', description: 'Designing and reviewing curricula aligned to KICD/CUE standards' },
    { type: TaxonomyType.SUBCATEGORY, value: 'EDUCATIONAL_ADMINISTRATION', label: 'Educational Administration', description: 'School management, deanship, and academic leadership' },
    { type: TaxonomyType.SUBCATEGORY, value: 'EARLY_CHILDHOOD_DEVELOPMENT', label: 'Early Childhood Development', description: 'Pre-primary and nursery education' },
    { type: TaxonomyType.SUBCATEGORY, value: 'SPECIAL_NEEDS_EDUCATION', label: 'Special Needs Education', description: 'Inclusive education for learners with disabilities' },
  ],

  HEALTHCARE_MEDICAL: [
    { type: TaxonomyType.SUBCATEGORY, value: 'MEDICAL_DOCTOR', label: 'Medical Doctor', description: 'Physicians and clinical specialists' },
    { type: TaxonomyType.SUBCATEGORY, value: 'NURSING', label: 'Nursing', description: 'Registered nurses and nursing officers' },
    { type: TaxonomyType.SUBCATEGORY, value: 'CLINICAL_OFFICERS', label: 'Clinical Officers', description: 'Mid-level medical practitioners unique to East Africa' },
    { type: TaxonomyType.SUBCATEGORY, value: 'PHARMACY', label: 'Pharmacy', description: 'Pharmacists and pharmaceutical technologists' },
    { type: TaxonomyType.SUBCATEGORY, value: 'PUBLIC_HEALTH', label: 'Public Health', description: 'Community health, epidemiology, and health promotion' },
    { type: TaxonomyType.SUBCATEGORY, value: 'MEDICAL_LABORATORY', label: 'Medical Laboratory', description: 'Lab technologists and scientists' },
    { type: TaxonomyType.SUBCATEGORY, value: 'NUTRITION_DIETETICS', label: 'Nutrition & Dietetics', description: 'Nutritional assessment and dietary planning' },
    { type: TaxonomyType.SUBCATEGORY, value: 'HEALTH_RECORDS', label: 'Health Records & ICT', description: 'Health information management systems' },
    { type: TaxonomyType.SUBCATEGORY, value: 'HEALTH_ADMINISTRATION', label: 'Health Administration', description: 'Hospital management and health systems governance' },
  ],

  ENGINEERING: [
    { type: TaxonomyType.SUBCATEGORY, value: 'CIVIL_ENGINEERING', label: 'Civil Engineering', description: 'Structural, geotechnical, and transportation engineering' },
    { type: TaxonomyType.SUBCATEGORY, value: 'ELECTRICAL_ENGINEERING', label: 'Electrical Engineering', description: 'Power systems, electrical installation, and maintenance' },
    { type: TaxonomyType.SUBCATEGORY, value: 'MECHANICAL_ENGINEERING', label: 'Mechanical Engineering', description: 'Plant maintenance, HVAC, and manufacturing systems' },
    { type: TaxonomyType.SUBCATEGORY, value: 'CHEMICAL_ENGINEERING', label: 'Chemical Engineering', description: 'Process engineering, oil & gas, and manufacturing' },
    { type: TaxonomyType.SUBCATEGORY, value: 'ENVIRONMENTAL_ENGINEERING', label: 'Environmental Engineering', description: 'Water treatment, waste management, and EIA' },
    { type: TaxonomyType.SUBCATEGORY, value: 'GEOMATIC_ENGINEERING', label: 'Geomatic / Surveying Engineering', description: 'Land surveying, GIS, and geospatial analysis' },
    { type: TaxonomyType.SUBCATEGORY, value: 'AGRICULTURAL_ENGINEERING', label: 'Agricultural Engineering', description: 'Irrigation, farm machinery, and post-harvest technology' },
  ],

  MARKETING_COMMUNICATIONS: [
    { type: TaxonomyType.SUBCATEGORY, value: 'DIGITAL_MARKETING', label: 'Digital Marketing', description: 'SEO, SEM, social media, and online advertising' },
    { type: TaxonomyType.SUBCATEGORY, value: 'CONTENT_MARKETING', label: 'Content Marketing', description: 'Blog writing, content strategy, and copywriting' },
    { type: TaxonomyType.SUBCATEGORY, value: 'SOCIAL_MEDIA_MANAGEMENT', label: 'Social Media Management', description: 'Facebook, Twitter/X, Instagram, TikTok management' },
    { type: TaxonomyType.SUBCATEGORY, value: 'PUBLIC_RELATIONS', label: 'Public Relations', description: 'Media relations, press releases, and crisis communication' },
    { type: TaxonomyType.SUBCATEGORY, value: 'BRAND_MANAGEMENT', label: 'Brand Management', description: 'Brand strategy, positioning, and identity' },
    { type: TaxonomyType.SUBCATEGORY, value: 'EVENT_MANAGEMENT', label: 'Event Management', description: 'Corporate events, activations, and exhibitions' },
  ],

  PROCUREMENT_SUPPLY_CHAIN: [
    { type: TaxonomyType.SUBCATEGORY, value: 'PROCUREMENT', label: 'Procurement', description: 'Sourcing, vendor management, and purchase orders' },
    { type: TaxonomyType.SUBCATEGORY, value: 'SUPPLY_CHAIN_MANAGEMENT', label: 'Supply Chain Management', description: 'End-to-end supply chain planning and execution' },
    { type: TaxonomyType.SUBCATEGORY, value: 'LOGISTICS', label: 'Logistics', description: 'Transportation, distribution, and last-mile delivery' },
    { type: TaxonomyType.SUBCATEGORY, value: 'WAREHOUSING', label: 'Warehousing', description: 'Inventory management, storage, and distribution centres' },
    { type: TaxonomyType.SUBCATEGORY, value: 'IMPORT_EXPORT', label: 'Import & Export', description: 'Customs clearance, freight forwarding, and trade compliance' },
    { type: TaxonomyType.SUBCATEGORY, value: 'FLEET_MANAGEMENT', label: 'Fleet Management', description: 'Vehicle tracking, maintenance, and dispatch' },
    { type: TaxonomyType.SUBCATEGORY, value: 'CONTRACT_MANAGEMENT', label: 'Contract Management', description: 'Supplier contracts, SLAs, and vendor performance' },
  ],

  LEGAL: [
    { type: TaxonomyType.SUBCATEGORY, value: 'CORPORATE_LAW', label: 'Corporate Law', description: 'Company secretarial, governance, and mergers' },
    { type: TaxonomyType.SUBCATEGORY, value: 'LITIGATION', label: 'Litigation', description: 'Civil and criminal court representation' },
    { type: TaxonomyType.SUBCATEGORY, value: 'COMPLIANCE_REGULATORY', label: 'Compliance & Regulatory', description: 'Regulatory compliance, AML/KYC, and licensing' },
    { type: TaxonomyType.SUBCATEGORY, value: 'CONVEYANCING', label: 'Conveyancing', description: 'Property transfer, land registration, and title searches' },
    { type: TaxonomyType.SUBCATEGORY, value: 'LABOUR_LAW', label: 'Labour Law', description: 'Employment contracts, disputes, and labour relations' },
    { type: TaxonomyType.SUBCATEGORY, value: 'INTELLECTUAL_PROPERTY', label: 'Intellectual Property', description: 'Trademarks, patents, copyrights, and KIPI registration' },
  ],

  ADMINISTRATION: [
    { type: TaxonomyType.SUBCATEGORY, value: 'OFFICE_ADMINISTRATION', label: 'Office Administration', description: 'General office management and coordination' },
    { type: TaxonomyType.SUBCATEGORY, value: 'RECEPTION_FRONT_DESK', label: 'Reception & Front Desk', description: 'Visitor management, switchboard, and first impressions' },
    { type: TaxonomyType.SUBCATEGORY, value: 'DATA_ENTRY', label: 'Data Entry', description: 'Typing, data capture, and records digitization' },
    { type: TaxonomyType.SUBCATEGORY, value: 'SECRETARIAL', label: 'Secretarial', description: 'Executive assistance, minute-taking, and diary management' },
    { type: TaxonomyType.SUBCATEGORY, value: 'FILING_RECORDS_MANAGEMENT', label: 'Filing & Records Management', description: 'Document management, archiving, and registry' },
    { type: TaxonomyType.SUBCATEGORY, value: 'DRIVING_MESSENGER', label: 'Driving & Messenger', description: ' chauffeur services, mail dispatch, and errands' },
  ],

  SALES_BUSINESS_DEVELOPMENT: [
    { type: TaxonomyType.SUBCATEGORY, value: 'BUSINESS_DEVELOPMENT', label: 'Business Development', description: 'Strategic partnerships, market expansion, and proposals' },
    { type: TaxonomyType.SUBCATEGORY, value: 'DIRECT_SALES', label: 'Direct Sales', description: 'Field sales, cold calling, and lead conversion' },
    { type: TaxonomyType.SUBCATEGORY, value: 'ACCOUNT_MANAGEMENT', label: 'Account Management', description: 'Key account handling and client retention' },
    { type: TaxonomyType.SUBCATEGORY, value: 'REAL_ESTATE_SALES', label: 'Real Estate Sales', description: 'Property selling and estate agency' },
    { type: TaxonomyType.SUBCATEGORY, value: 'INSURANCE_SALES', label: 'Insurance Sales', description: 'Life and general insurance agent roles' },
    { type: TaxonomyType.SUBCATEGORY, value: 'B2B_SALES', label: 'B2B Sales', description: 'Corporate and institutional sales' },
  ],

  LOGISTICS_TRANSPORT: [
    { type: TaxonomyType.SUBCATEGORY, value: 'FREIGHT_FORWARDING', label: 'Freight Forwarding', description: 'Air, sea, and road freight management' },
    { type: TaxonomyType.SUBCATEGORY, value: 'CUSTOMS_CLEARANCE', label: 'Customs Clearance', description: 'KRA customs processes, CDS, and tariff classification' },
    { type: TaxonomyType.SUBCATEGORY, value: 'TRANSPORT_MANAGEMENT', label: 'Transport Management', description: 'Fleet operations, routing, and scheduling' },
    { type: TaxonomyType.SUBCATEGORY, value: 'LAST_MILE_DELIVERY', label: 'Last-Mile Delivery', description: 'E-commerce delivery and dispatch riding' },
    { type: TaxonomyType.SUBCATEGORY, value: 'WAREHOUSE_OPERATIONS', label: 'Warehouse Operations', description: 'Pick/pack, stock control, and dispatch' },
  ],

  AGRICULTURE_AGRIBUSINESS: [
    { type: TaxonomyType.SUBCATEGORY, value: 'AGRONOMY', label: 'Agronomy', description: 'Crop science, soil management, and agronomic practices' },
    { type: TaxonomyType.SUBCATEGORY, value: 'VETERINARY', label: 'Veterinary', description: 'Animal health, livestock management, and vet services' },
    { type: TaxonomyType.SUBCATEGORY, value: 'AGRIBUSINESS_MANAGEMENT', label: 'Agribusiness Management', description: 'Agricultural value chains, marketing, and farm management' },
    { type: TaxonomyType.SUBCATEGORY, value: 'FOOD_SCIENCE', label: 'Food Science', description: 'Food processing, quality control, and safety standards' },
    { type: TaxonomyType.SUBCATEGORY, value: 'HORTICULTURE', label: 'Horticulture', description: 'Floriculture, fruits, vegetables, and export crops' },
    { type: TaxonomyType.SUBCATEGORY, value: 'AGRICULTURAL_EXTENSION', label: 'Agricultural Extension', description: 'Farmer training, outreach, and technology transfer' },
  ],

  GOVERNMENT_PUBLIC_ADMIN: [
    { type: TaxonomyType.SUBCATEGORY, value: 'PUBLIC_POLICY', label: 'Public Policy', description: 'Policy analysis, formulation, and implementation' },
    { type: TaxonomyType.SUBCATEGORY, value: 'GOVERNANCE', label: 'Governance', description: 'Public sector governance, ethics, and accountability' },
    { type: TaxonomyType.SUBCATEGORY, value: 'COUNTY_ADMINISTRATION', label: 'County Administration', description: 'County executive and assembly operations' },
    { type: TaxonomyType.SUBCATEGORY, value: 'DISASTER_MANAGEMENT', label: 'Disaster Management', description: 'Emergency preparedness, response, and recovery' },
    { type: TaxonomyType.SUBCATEGORY, value: 'PUBLIC_FINANCE', label: 'Public Finance', description: 'Budgeting, IFMIS, and public expenditure management' },
    { type: TaxonomyType.SUBCATEGORY, value: 'URBAN_PLANNING', label: 'Urban Planning', description: 'Spatial planning, zoning, and county development plans' },
  ],

  MEDIA_CREATIVE: [
    { type: TaxonomyType.SUBCATEGORY, value: 'JOURNALISM', label: 'Journalism', description: 'News reporting, editing, and investigative journalism' },
    { type: TaxonomyType.SUBCATEGORY, value: 'GRAPHIC_DESIGN', label: 'Graphic Design', description: 'Visual design, branding materials, and print design' },
    { type: TaxonomyType.SUBCATEGORY, value: 'VIDEO_PRODUCTION', label: 'Video Production', description: 'Filming, editing, and post-production' },
    { type: TaxonomyType.SUBCATEGORY, value: 'PHOTOGRAPHY', label: 'Photography', description: 'Commercial, event, and editorial photography' },
    { type: TaxonomyType.SUBCATEGORY, value: 'UI_UX_DESIGN', label: 'UI/UX Design', description: 'User interface and user experience design for digital products' },
    { type: TaxonomyType.SUBCATEGORY, value: 'COPYWRITING', label: 'Copywriting', description: 'Advertising copy, scripts, and creative writing' },
    { type: TaxonomyType.SUBCATEGORY, value: 'BROADCAST_MEDIA', label: 'Broadcast Media', description: 'Radio and television production and presentation' },
  ],

  CUSTOMER_SERVICE: [
    { type: TaxonomyType.SUBCATEGORY, value: 'CALL_CENTRE', label: 'Call Centre', description: 'Inbound and outbound call centre operations' },
    { type: TaxonomyType.SUBCATEGORY, value: 'CUSTOMER_SUCCESS', label: 'Customer Success', description: 'Onboarding, retention, and customer satisfaction' },
    { type: TaxonomyType.SUBCATEGORY, value: 'CLIENT_RELATIONS', label: 'Client Relations', description: 'Account support, complaint resolution, and client care' },
    { type: TaxonomyType.SUBCATEGORY, value: 'TECHNICAL_SUPPORT', label: 'Technical Support', description: 'Product support, troubleshooting, and issue resolution' },
    { type: TaxonomyType.SUBCATEGORY, value: 'FRONT_OFFICE', label: 'Front Office', description: 'Reception, guest services, and customer-facing operations' },
  ],

  RESEARCH_DATA_ANALYTICS: [
    { type: TaxonomyType.SUBCATEGORY, value: 'MONITORING_EVALUATION', label: 'Monitoring & Evaluation', description: 'Project M&E, logic models, and donor reporting' },
    { type: TaxonomyType.SUBCATEGORY, value: 'DATA_ANALYSIS', label: 'Data Analysis', description: 'Statistical analysis, data mining, and insights generation' },
    { type: TaxonomyType.SUBCATEGORY, value: 'RESEARCH', label: 'Research', description: 'Qualitative and quantitative research methodologies' },
    { type: TaxonomyType.SUBCATEGORY, value: 'BUSINESS_INTELLIGENCE', label: 'Business Intelligence', description: 'BI dashboards, reporting, and data-driven strategy' },
    { type: TaxonomyType.SUBCATEGORY, value: 'SURVEY_DATA_COLLECTION', label: 'Survey & Data Collection', description: 'Questionnaire design, field data collection, and ODK/KoboToolbox' },
    { type: TaxonomyType.SUBCATEGORY, value: 'GEOGRAPHIC_INFORMATION_SYSTEMS', label: 'Geographic Information Systems', description: 'GIS mapping, spatial analysis, and remote sensing' },
  ],

  CONSTRUCTION_REAL_ESTATE: [
    { type: TaxonomyType.SUBCATEGORY, value: 'PROJECT_MANAGEMENT_CONSTRUCTION', label: 'Construction Project Management', description: 'Site supervision, project planning, and contractor management' },
    { type: TaxonomyType.SUBCATEGORY, value: 'QUANTITY_SURVEYING', label: 'Quantity Surveying', description: 'Cost estimation, BOQ preparation, and contract administration' },
    { type: TaxonomyType.SUBCATEGORY, value: 'ARCHITECTURE', label: 'Architecture', description: 'Building design, space planning, and architectural drafting' },
    { type: TaxonomyType.SUBCATEGORY, value: 'PROPERTY_MANAGEMENT', label: 'Property Management', description: 'Tenant relations, rent collection, and property maintenance' },
    { type: TaxonomyType.SUBCATEGORY, value: 'REAL_ESTATE_VALUATION', label: 'Real Estate Valuation', description: 'Property valuation, appraisals, and market analysis' },
    { type: TaxonomyType.SUBCATEGORY, value: 'SITE_SUPERVISION', label: 'Site Supervision', description: 'Foreman, site clerk, and construction supervision' },
  ],

  SOCIAL_WORK_COMMUNITY_DEVELOPMENT: [
    { type: TaxonomyType.SUBCATEGORY, value: 'COMMUNITY_DEVELOPMENT', label: 'Community Development', description: 'Grassroots mobilization, participatory development, and community organizing' },
    { type: TaxonomyType.SUBCATEGORY, value: 'SOCIAL_WORK', label: 'Social Work', description: 'Case management, child protection, and family support' },
    { type: TaxonomyType.SUBCATEGORY, value: 'COUNSELLING', label: 'Counselling', description: 'Psychological counselling, trauma support, and psychosocial care' },
    { type: TaxonomyType.SUBCATEGORY, value: 'PROGRAMME_MANAGEMENT', label: 'Programme Management', description: 'NGO programme design, implementation, and donor coordination' },
    { type: TaxonomyType.SUBCATEGORY, value: 'GENDER_DEVELOPMENT', label: 'Gender & Development', description: 'Gender mainstreaming, women empowerment, and GBV response' },
    { type: TaxonomyType.SUBCATEGORY, value: 'YOUTH_DEVELOPMENT', label: 'Youth Development', description: 'Youth empowerment, mentorship, and skills building' },
  ],
};

// ============================================================
// SKILLS (100+ Kenyan-market-relevant skills)
// ============================================================

const skills: Omit<TaxonomySeedItem, 'parentId'>[] = [
  // --- Finance & Accounting Skills ---
  { type: TaxonomyType.SKILL, value: 'ACCOUNTS_PAYABLE_MANAGEMENT', label: 'Accounts Payable Management', description: 'Processing supplier invoices and managing creditor payments' },
  { type: TaxonomyType.SKILL, value: 'BANK_RECONCILIATION', label: 'Bank Reconciliation', description: 'Reconciling bank statements with ledger records' },
  { type: TaxonomyType.SKILL, value: 'FINANCIAL_REPORTING', label: 'Financial Reporting', description: 'Preparing IFRS-compliant financial statements' },
  { type: TaxonomyType.SKILL, value: 'INVOICE_PROCESSING', label: 'Invoice Processing', description: 'Verifying, approving, and recording invoices' },
  { type: TaxonomyType.SKILL, value: 'AUDIT_SUPPORT', label: 'Audit Support', description: 'Assisting internal and external auditors with documentation' },
  { type: TaxonomyType.SKILL, value: 'BUDGETING', label: 'Budgeting', description: 'Preparing and managing organizational budgets' },
  { type: TaxonomyType.SKILL, value: 'TAX_COMPLIANCE', label: 'Tax Compliance', description: 'KRA returns, PAYE, VAT, and withholding tax' },
  { type: TaxonomyType.SKILL, value: 'PAYROLL_MANAGEMENT', label: 'Payroll Management', description: 'Processing salaries, statutory deductions (NSSF, NHIF/SHIF, NITA)' },
  { type: TaxonomyType.SKILL, value: 'CREDIT_ANALYSIS', label: 'Credit Analysis', description: 'Evaluating creditworthiness and managing credit risk' },
  { type: TaxonomyType.SKILL, value: 'FORECASTING', label: 'Financial Forecasting', description: 'Revenue and expenditure forecasting' },
  { type: TaxonomyType.SKILL, value: 'COST_ACCOUNTING', label: 'Cost Accounting', description: 'Job costing, marginal costing, and cost control' },
  { type: TaxonomyType.SKILL, value: 'CASH_FLOW_MANAGEMENT', label: 'Cash Flow Management', description: 'Managing liquidity and cash flow projections' },
  { type: TaxonomyType.SKILL, value: 'GRANT_MANAGEMENT', label: 'Grant Management', description: 'Donor fund management, reporting, and compliance' },
  { type: TaxonomyType.SKILL, value: 'IFRS_KAS', label: 'IFRS / KAS', description: 'International Financial Reporting Standards and Kenya Accounting Standards' },

  // --- IT & Software Development Skills ---
  { type: TaxonomyType.SKILL, value: 'PYTHON', label: 'Python', description: 'General-purpose programming language for web, data, and automation' },
  { type: TaxonomyType.SKILL, value: 'JAVASCRIPT', label: 'JavaScript', description: 'Core web programming language for frontend and backend' },
  { type: TaxonomyType.SKILL, value: 'REACT', label: 'React', description: 'Frontend JavaScript library for building user interfaces' },
  { type: TaxonomyType.SKILL, value: 'NODE_JS', label: 'Node.js', description: 'Server-side JavaScript runtime' },
  { type: TaxonomyType.SKILL, value: 'SQL', label: 'SQL', description: 'Database querying and management (MySQL, PostgreSQL)' },
  { type: TaxonomyType.SKILL, value: 'TYPESCRIPT', label: 'TypeScript', description: 'Typed superset of JavaScript' },
  { type: TaxonomyType.SKILL, value: 'HTML_CSS', label: 'HTML & CSS', description: 'Core web technologies for page structure and styling' },
  { type: TaxonomyType.SKILL, value: 'GIT', label: 'Git', description: 'Version control system for source code management' },
  { type: TaxonomyType.SKILL, value: 'DOCKER', label: 'Docker', description: 'Containerization and container orchestration' },
  { type: TaxonomyType.SKILL, value: 'AWS', label: 'AWS', description: 'Amazon Web Services cloud platform' },
  { type: TaxonomyType.SKILL, value: 'AZURE', label: 'Microsoft Azure', description: 'Microsoft cloud platform and services' },
  { type: TaxonomyType.SKILL, value: 'REST_API_DESIGN', label: 'REST API Design', description: 'Designing and building RESTful APIs' },
  { type: TaxonomyType.SKILL, value: 'GRAPHQL', label: 'GraphQL', description: 'Query language for APIs' },
  { type: TaxonomyType.SKILL, value: 'LINUX_ADMINISTRATION', label: 'Linux Administration', description: 'Linux server management and shell scripting' },
  { type: TaxonomyType.SKILL, value: 'AGILE_SCRUM', label: 'Agile & Scrum', description: 'Agile project management and Scrum framework' },
  { type: TaxonomyType.SKILL, value: 'NEXT_JS', label: 'Next.js', description: 'React framework for production-grade web apps' },
  { type: TaxonomyType.SKILL, value: 'FLUTTER', label: 'Flutter', description: 'Cross-platform mobile app development framework' },
  { type: TaxonomyType.SKILL, value: 'REACT_NATIVE', label: 'React Native', description: 'Cross-platform mobile development using React' },
  { type: TaxonomyType.SKILL, value: 'TAILWIND_CSS', label: 'Tailwind CSS', description: 'Utility-first CSS framework for rapid UI development' },
  { type: TaxonomyType.SKILL, value: 'MACHINE_LEARNING', label: 'Machine Learning', description: 'Building and deploying ML models' },
  { type: TaxonomyType.SKILL, value: 'DATA_ENGINEERING_SKILLS', label: 'Data Engineering', description: 'Building ETL pipelines and data infrastructure' },
  { type: TaxonomyType.SKILL, value: 'CYBERSECURITY_FUNDAMENTALS', label: 'Cybersecurity Fundamentals', description: 'Network security, encryption, and threat assessment' },
  { type: TaxonomyType.SKILL, value: 'CI_CD', label: 'CI/CD', description: 'Continuous integration and continuous deployment pipelines' },
  { type: TaxonomyType.SKILL, value: 'TERRAFORM', label: 'Terraform', description: 'Infrastructure as Code for cloud provisioning' },
  { type: TaxonomyType.SKILL, value: 'KUBERNETES', label: 'Kubernetes', description: 'Container orchestration and management' },

  // --- HR Skills ---
  { type: TaxonomyType.SKILL, value: 'CANDIDATE_SCREENING', label: 'Candidate Screening', description: 'Reviewing CVs and shortlisting candidates' },
  { type: TaxonomyType.SKILL, value: 'PERFORMANCE_MANAGEMENT', label: 'Performance Management', description: 'Appraisals, KPIs, and performance improvement plans' },
  { type: TaxonomyType.SKILL, value: 'RECRUITMENT', label: 'Recruitment', description: 'Full-cycle recruitment from sourcing to onboarding' },
  { type: TaxonomyType.SKILL, value: 'ONBOARDING', label: 'Employee Onboarding', description: 'New hire orientation and integration' },
  { type: TaxonomyType.SKILL, value: 'EMPLOYEE_RELATIONS', label: 'Employee Relations', description: 'Managing workplace dynamics and labour issues' },
  { type: TaxonomyType.SKILL, value: 'COMPENSATION_ANALYSIS', label: 'Compensation Analysis', description: 'Salary benchmarking and pay structure design' },
  { type: TaxonomyType.SKILL, value: 'TRAINING_NEEDS_ANALYSIS', label: 'Training Needs Analysis', description: 'Identifying skill gaps and designing training programmes' },
  { type: TaxonomyType.SKILL, value: 'HRIS_MANAGEMENT', label: 'HRIS Management', description: 'Managing human resource information systems' },

  // --- Education Skills ---
  { type: TaxonomyType.SKILL, value: 'CURRICULUM_DEVELOPMENT_SKILL', label: 'Curriculum Development', description: 'Designing and aligning curricula to KICD/CUE standards' },
  { type: TaxonomyType.SKILL, value: 'LESSON_PLANNING', label: 'Lesson Planning', description: 'Creating structured lesson plans and learning materials' },
  { type: TaxonomyType.SKILL, value: 'CLASSROOM_MANAGEMENT', label: 'Classroom Management', description: 'Maintaining discipline and engagement in learning environments' },
  { type: TaxonomyType.SKILL, value: 'ASSESSMENT_EVALUATION', label: 'Assessment & Evaluation', description: 'Designing tests, rubrics, and grading systems' },
  { type: TaxonomyType.SKILL, value: 'PEDAGOGY', label: 'Pedagogy', description: 'Teaching methods and instructional strategies' },
  { type: TaxonomyType.SKILL, value: 'E_LEARNING_DELIVERY', label: 'E-Learning Delivery', description: 'Online teaching using LMS platforms (Moodle, Google Classroom)' },
  { type: TaxonomyType.SKILL, value: 'MENTORSHIP', label: 'Mentorship', description: 'Student mentoring and academic advising' },

  // --- Administration Skills ---
  { type: TaxonomyType.SKILL, value: 'DATA_ENTRY', label: 'Data Entry', description: 'Fast and accurate typing and data capture' },
  { type: TaxonomyType.SKILL, value: 'FILE_MANAGEMENT', label: 'File Management', description: 'Organizing and maintaining physical and digital records' },
  { type: TaxonomyType.SKILL, value: 'SCHEDULING', label: 'Scheduling', description: 'Calendar management, meeting coordination, and diary keeping' },
  { type: TaxonomyType.SKILL, value: 'OFFICE_MANAGEMENT', label: 'Office Management', description: 'Running day-to-day office operations and supplies' },
  { type: TaxonomyType.SKILL, value: 'CORRESPONDENCE', label: 'Correspondence', description: 'Drafting letters, emails, and official communications' },
  { type: TaxonomyType.SKILL, value: 'MINUTE_TAKING', label: 'Minute Taking', description: 'Recording proceedings of meetings and conferences' },
  { type: TaxonomyType.SKILL, value: 'TRAVEL_ARRANGEMENTS', label: 'Travel Arrangements', description: 'Booking flights, hotels, and travel logistics' },

  // --- Marketing Skills ---
  { type: TaxonomyType.SKILL, value: 'SEO', label: 'Search Engine Optimization (SEO)', description: 'Improving website visibility in search engines' },
  { type: TaxonomyType.SKILL, value: 'SEM', label: 'Search Engine Marketing (SEM)', description: 'Paid search advertising (Google Ads)' },
  { type: TaxonomyType.SKILL, value: 'SOCIAL_MEDIA_MARKETING', label: 'Social Media Marketing', description: 'Managing brand presence on social platforms' },
  { type: TaxonomyType.SKILL, value: 'CONTENT_CREATION', label: 'Content Creation', description: 'Writing blogs, articles, and marketing copy' },
  { type: TaxonomyType.SKILL, value: 'EMAIL_MARKETING', label: 'Email Marketing', description: 'Designing and executing email campaigns' },
  { type: TaxonomyType.SKILL, value: 'BRAND_STRATEGY', label: 'Brand Strategy', description: 'Developing and executing brand positioning' },
  { type: TaxonomyType.SKILL, value: 'INFLUENCER_MARKETING', label: 'Influencer Marketing', description: 'Partnering with social media influencers' },

  // --- Legal Skills ---
  { type: TaxonomyType.SKILL, value: 'LEGAL_DRAFTING', label: 'Legal Drafting', description: 'Preparing contracts, agreements, and legal documents' },
  { type: TaxonomyType.SKILL, value: 'CONVEYANCING', label: 'Conveyancing', description: 'Property transfers and land registration processes' },
  { type: TaxonomyType.SKILL, value: 'LEGAL_RESEARCH', label: 'Legal Research', description: 'Statutory and case law research' },
  { type: TaxonomyType.SKILL, value: 'COMPLIANCE_MANAGEMENT', label: 'Compliance Management', description: 'Ensuring regulatory compliance and risk mitigation' },

  // --- Procurement & Supply Chain Skills ---
  { type: TaxonomyType.SKILL, value: 'PROCUREMENT_MANAGEMENT', label: 'Procurement Management', description: 'Strategic sourcing, vendor evaluation, and purchase order management' },
  { type: TaxonomyType.SKILL, value: 'INVENTORY_MANAGEMENT', label: 'Inventory Management', description: 'Stock control, reorder levels, and warehouse management' },
  { type: TaxonomyType.SKILL, value: 'LOGISTICS_COORDINATION', label: 'Logistics Coordination', description: 'Coordinating shipments, transport, and delivery schedules' },
  { type: TaxonomyType.SKILL, value: 'SUPPLIER_MANAGEMENT', label: 'Supplier Management', description: 'Vendor onboarding, performance review, and negotiations' },
  { type: TaxonomyType.SKILL, value: 'CUSTOMS_PROCEDURES', label: 'Customs Procedures', description: 'Kenya Revenue Authority customs clearance and documentation' },

  // --- Healthcare Skills ---
  { type: TaxonomyType.SKILL, value: 'PATIENT_CARE', label: 'Patient Care', description: 'Direct patient care and clinical assessment' },
  { type: TaxonomyType.SKILL, value: 'CLINICAL_ASSESSMENT', label: 'Clinical Assessment', description: 'Diagnosing and evaluating patient conditions' },
  { type: TaxonomyType.SKILL, value: 'PHARMACOLOGY', label: 'Pharmacology', description: 'Drug dispensing, interactions, and pharmaceutical knowledge' },
  { type: TaxonomyType.SKILL, value: 'EPIDEMIOLOGY', label: 'Epidemiology', description: 'Disease surveillance, outbreak investigation, and public health data' },
  { type: TaxonomyType.SKILL, value: 'MATERNAL_CHILD_HEALTH', label: 'Maternal & Child Health', description: 'Antenatal care, delivery, and child immunization' },
  { type: TaxonomyType.SKILL, value: 'HEALTH_RECORDS_MANAGEMENT', label: 'Health Records Management', description: 'Managing patient records and health information systems' },

  // --- Engineering Skills ---
  { type: TaxonomyType.SKILL, value: 'AUTO_CAD', label: 'AutoCAD', description: 'Computer-aided design and drafting' },
  { type: TaxonomyType.SKILL, value: 'STRUCTURAL_DESIGN', label: 'Structural Design', description: 'Designing safe and compliant structures' },
  { type: TaxonomyType.SKILL, value: 'PROJECT_MANAGEMENT_ENGINEERING', label: 'Engineering Project Management', description: 'Managing engineering projects from conception to handover' },
  { type: TaxonomyType.SKILL, value: 'SITE_SUPERVISION', label: 'Site Supervision', description: 'Overseeing construction works and quality control' },
  { type: TaxonomyType.SKILL, value: 'BOQ_PREPARATION', label: 'BOQ Preparation', description: 'Preparing Bills of Quantities for construction projects' },

  // --- Research & Data Analytics Skills ---
  { type: TaxonomyType.SKILL, value: 'MONITORING_EVALUATION', label: 'Monitoring & Evaluation', description: 'Designing M&E frameworks, logframes, and theory of change' },
  { type: TaxonomyType.SKILL, value: 'DATA_VISUALIZATION', label: 'Data Visualization', description: 'Creating charts, dashboards, and visual reports' },
  { type: TaxonomyType.SKILL, value: 'STATISTICAL_ANALYSIS', label: 'Statistical Analysis', description: 'Using statistical methods for data interpretation' },
  { type: TaxonomyType.SKILL, value: 'QUALITATIVE_RESEARCH', label: 'Qualitative Research', description: 'Interviews, focus groups, and thematic analysis' },
  { type: TaxonomyType.SKILL, value: 'QUANTITATIVE_RESEARCH', label: 'Quantitative Research', description: 'Surveys, sampling, and statistical inference' },
  { type: TaxonomyType.SKILL, value: 'GIS_MAPPING', label: 'GIS Mapping', description: 'Geospatial data analysis and map creation' },
  { type: TaxonomyType.SKILL, value: 'REPORT_WRITING', label: 'Report Writing', description: 'Writing professional and donor-compliant reports' },

  // --- Project Management & Soft Skills ---
  { type: TaxonomyType.SKILL, value: 'PROJECT_MANAGEMENT', label: 'Project Management', description: 'Planning, executing, and closing projects' },
  { type: TaxonomyType.SKILL, value: 'STAKEHOLDER_MANAGEMENT', label: 'Stakeholder Management', description: 'Managing expectations of donors, clients, and partners' },
  { type: TaxonomyType.SKILL, value: 'RISK_MANAGEMENT', label: 'Risk Management', description: 'Identifying, assessing, and mitigating risks' },
  { type: TaxonomyType.SKILL, value: 'PROPOSAL_WRITING', label: 'Proposal Writing', description: 'Writing winning grant proposals and business proposals' },
  { type: TaxonomyType.SKILL, value: 'TEAM_LEADERSHIP', label: 'Team Leadership', description: 'Leading, motivating, and developing teams' },
  { type: TaxonomyType.SKILL, value: 'PRESENTATION_SKILLS', label: 'Presentation Skills', description: 'Delivering effective presentations and public speaking' },
  { type: TaxonomyType.SKILL, value: 'COMMUNITY_MOBILIZATION', label: 'Community Mobilization', description: 'Engaging communities for participatory development' },
  { type: TaxonomyType.SKILL, value: 'PROBLEM_SOLVING', label: 'Problem Solving', description: 'Analytical thinking and creative problem resolution' },
  { type: TaxonomyType.SKILL, value: 'CRITICAL_THINKING', label: 'Critical Thinking', description: 'Objective analysis and sound judgment' },
  { type: TaxonomyType.SKILL, value: 'NEGOTIATION', label: 'Negotiation', description: 'Reaching agreements through effective negotiation' },
  { type: TaxonomyType.SKILL, value: 'BUSINESS_ANALYSIS', label: 'Business Analysis', description: 'Requirements gathering, process mapping, and solution design' },
  { type: TaxonomyType.SKILL, value: 'PRODUCT_MANAGEMENT', label: 'Product Management', description: 'Product strategy, roadmaps, and user stories' },
  { type: TaxonomyType.SKILL, value: 'UI_UX_DESIGN', label: 'UI/UX Design', description: 'Designing user interfaces and experiences' },
  { type: TaxonomyType.SKILL, value: 'TECHNICAL_WRITING', label: 'Technical Writing', description: 'Writing technical documentation and user manuals' },
  { type: TaxonomyType.SKILL, value: 'CHANGE_MANAGEMENT', label: 'Change Management', description: 'Leading organizational change and transformation' },
];

// ============================================================
// TOOLS (30+ tools commonly used in Kenya)
// ============================================================

const tools: Omit<TaxonomySeedItem, 'parentId'>[] = [
  // --- Finance & Accounting Tools ---
  { type: TaxonomyType.TOOL, value: 'EXCEL', label: 'Microsoft Excel', description: 'Spreadsheet application for data analysis and financial modelling' },
  { type: TaxonomyType.TOOL, value: 'GOOGLE_SHEETS', label: 'Google Sheets', description: 'Cloud-based spreadsheet for collaboration' },
  { type: TaxonomyType.TOOL, value: 'QUICKBOOKS', label: 'QuickBooks', description: 'Accounting software for small and medium businesses' },
  { type: TaxonomyType.TOOL, value: 'SAGE_PASTEL', label: 'Sage Pastel', description: 'Widely-used accounting software in Kenyan SMEs' },
  { type: TaxonomyType.TOOL, value: 'POWER_BI', label: 'Microsoft Power BI', description: 'Business intelligence and data visualization platform' },
  { type: TaxonomyType.TOOL, value: 'TABLEAU', label: 'Tableau', description: 'Data visualization and business intelligence tool' },
  { type: TaxonomyType.TOOL, value: 'SAP', label: 'SAP', description: 'Enterprise resource planning (ERP) software' },
  { type: TaxonomyType.TOOL, value: 'ORACLE', label: 'Oracle', description: 'Database management and enterprise software' },
  { type: TaxonomyType.TOOL, value: 'ERP_SYSTEMS', label: 'ERP Systems', description: 'Enterprise resource planning systems (Odoo, SAP, Oracle)' },
  { type: TaxonomyType.TOOL, value: 'TALLY', label: 'Tally', description: 'Accounting software popular with Indian-linked businesses in Kenya' },
  { type: TaxonomyType.TOOL, value: 'PASTEL_EVOLUTION', label: 'Pastel Evolution', description: 'Sage Pastel Evolution ERP for mid-sized businesses' },

  // --- Communication & Collaboration Tools ---
  { type: TaxonomyType.TOOL, value: 'SLACK', label: 'Slack', description: 'Team messaging and collaboration platform' },
  { type: TaxonomyType.TOOL, value: 'MICROSOFT_TEAMS', label: 'Microsoft Teams', description: 'Unified communication and collaboration platform' },
  { type: TaxonomyType.TOOL, value: 'GOOGLE_WORKSPACE', label: 'Google Workspace', description: 'Gmail, Drive, Docs, Sheets, and Calendar' },
  { type: TaxonomyType.TOOL, value: 'ZOOM', label: 'Zoom', description: 'Video conferencing and virtual meetings' },

  // --- Marketing Tools ---
  { type: TaxonomyType.TOOL, value: 'MAILCHIMP', label: 'Mailchimp', description: 'Email marketing and automation platform' },
  { type: TaxonomyType.TOOL, value: 'SALESFORCE', label: 'Salesforce', description: 'Customer relationship management (CRM) platform' },
  { type: TaxonomyType.TOOL, value: 'HUBSPOT', label: 'HubSpot', description: 'Inbound marketing, sales, and CRM platform' },
  { type: TaxonomyType.TOOL, value: 'GOOGLE_ANALYTICS', label: 'Google Analytics', description: 'Web analytics and user behaviour tracking' },
  { type: TaxonomyType.TOOL, value: 'GOOGLE_ADS', label: 'Google Ads', description: 'Online advertising platform (Search, Display, YouTube)' },
  { type: TaxonomyType.TOOL, value: 'META_BUSINESS_SUITE', label: 'Meta Business Suite', description: 'Facebook and Instagram advertising and management' },
  { type: TaxonomyType.TOOL, value: 'CANVA', label: 'Canva', description: 'Online graphic design tool for non-designers' },

  // --- Development Tools ---
  { type: TaxonomyType.TOOL, value: 'JIRA', label: 'Jira', description: 'Project and issue tracking for software development' },
  { type: TaxonomyType.TOOL, value: 'GITHUB', label: 'GitHub', description: 'Code hosting, version control, and collaboration' },
  { type: TaxonomyType.TOOL, value: 'FIGMA', label: 'Figma', description: 'Collaborative UI/UX design tool' },
  { type: TaxonomyType.TOOL, value: 'ADOBE_PHOTOSHOP', label: 'Adobe Photoshop', description: 'Professional image editing and design' },
  { type: TaxonomyType.TOOL, value: 'VS_CODE', label: 'Visual Studio Code', description: 'Popular code editor for web development' },
  { type: TaxonomyType.TOOL, value: 'POSTMAN', label: 'Postman', description: 'API testing and documentation tool' },
  { type: TaxonomyType.TOOL, value: 'VERCEL', label: 'Vercel', description: 'Deployment platform for frontend applications' },

  // --- Data & Research Tools ---
  { type: TaxonomyType.TOOL, value: 'SPSS', label: 'SPSS', description: 'Statistical analysis software used in research' },
  { type: TaxonomyType.TOOL, value: 'STATA', label: 'Stata', description: 'Statistical software for data science and research' },
  { type: TaxonomyType.TOOL, value: 'R_STUDIO', label: 'R Studio', description: 'Integrated development environment for R' },
  { type: TaxonomyType.TOOL, value: 'MATLAB', label: 'MATLAB', description: 'Numerical computing and engineering simulation' },
  { type: TaxonomyType.TOOL, value: 'KOBO_TOOLBOX', label: 'KoboToolbox', description: 'Mobile data collection tool widely used in Kenya' },
  { type: TaxonomyType.TOOL, value: 'ODK', label: 'ODK (Open Data Kit)', description: 'Open-source mobile data collection' },

  // --- Engineering & Construction Tools ---
  { type: TaxonomyType.TOOL, value: 'AUTOCAD', label: 'AutoCAD', description: 'Computer-aided design for engineering and architecture' },
  { type: TaxonomyType.TOOL, value: 'MS_PROJECT', label: 'Microsoft Project', description: 'Project scheduling and resource management' },
  { type: TaxonomyType.TOOL, value: 'ARCGIS', label: 'ArcGIS', description: 'Geographic information system for mapping and analysis' },
];

// ============================================================
// QUALIFICATIONS
// ============================================================

const qualifications: Omit<TaxonomySeedItem, 'parentId'>[] = [
  { type: TaxonomyType.QUALIFICATION, value: 'BACHELOR_DEGREE', label: "Bachelor's Degree", description: 'Undergraduate degree from a recognized university' },
  { type: TaxonomyType.QUALIFICATION, value: 'MASTER_DEGREE', label: "Master's Degree", description: 'Postgraduate degree (MA, MSc, MBA)' },
  { type: TaxonomyType.QUALIFICATION, value: 'PHD', label: 'Doctorate (PhD)', description: 'Highest academic degree' },
  { type: TaxonomyType.QUALIFICATION, value: 'DIPLOMA', label: 'Diploma', description: 'Post-secondary diploma from a recognized institution' },
  { type: TaxonomyType.QUALIFICATION, value: 'CERTIFICATE', label: 'Certificate', description: 'Post-secondary certificate or professional certificate' },
  { type: TaxonomyType.QUALIFICATION, value: 'CPA', label: 'CPA (Certified Public Accountant)', description: 'ICPAK-certified accounting qualification' },
  { type: TaxonomyType.QUALIFICATION, value: 'ACCA', label: 'ACCA (Association of Chartered Certified Accountants)', description: 'International accounting qualification' },
  { type: TaxonomyType.QUALIFICATION, value: 'CFA', label: 'CFA (Chartered Financial Analyst)', description: 'Investment management and financial analysis' },
  { type: TaxonomyType.QUALIFICATION, value: 'CIM', label: 'CIM (Chartered Institute of Marketing)', description: 'Professional marketing qualification' },
  { type: TaxonomyType.QUALIFICATION, value: 'CHRP', label: 'CHRP (Certified Human Resource Professional)', description: 'IHRM-certified HR professional qualification' },
  { type: TaxonomyType.QUALIFICATION, value: 'CIS', label: 'CIS (Certified Investment & Securities Analyst)', description: 'Investment analysis qualification' },
  { type: TaxonomyType.QUALIFICATION, value: 'CISA', label: 'CISA (Certified Information Systems Auditor)', description: 'IT audit and assurance qualification' },
  { type: TaxonomyType.QUALIFICATION, value: 'PMP', label: 'PMP (Project Management Professional)', description: 'PMI-certified project management' },
  { type: TaxonomyType.QUALIFICATION, value: 'PRINCE2', label: 'PRINCE2', description: 'Project management methodology certification' },
  { type: TaxonomyType.QUALIFICATION, value: 'PROFESSIONAL_CERTIFICATE', label: 'Professional Certificate', description: 'Industry-recognized professional certificate' },
  { type: TaxonomyType.QUALIFICATION, value: 'CIPS', label: 'CIPS (Chartered Institute of Procurement & Supply)', description: 'Professional procurement and supply qualification' },
  { type: TaxonomyType.QUALIFICATION, value: 'KCSE', label: 'Kenya Certificate of Secondary Education (KCSE)', description: 'National secondary school examination' },
  { type: TaxonomyType.QUALIFICATION, value: 'TVETA_CERTIFICATE', label: 'TVETA Certificate', description: 'Technical/vocational qualification from TVETA-accredited institution' },
];

// ============================================================
// MAIN SEED FUNCTION
// ============================================================

async function seedTaxonomy() {
  console.log('🔄 Seeding taxonomy items...\n');

  // Step 1: Clear existing taxonomy items
  const deleted = await prisma.taxonomyItem.deleteMany({});
  console.log(`🗑️  Cleared ${deleted.count} existing taxonomy items\n`);

  // Step 2: Create parent items (organization types, industries, categories)
  const parentItems: Omit<TaxonomySeedItem, 'parentId'>[] = [
    ...organizationTypes,
    ...industries,
    ...categories,
  ];

  // Build the createMany data
  const parentData = parentItems.map((item) => ({
    type: item.type,
    value: item.value,
    label: item.label,
    description: item.description ?? null,
    isActive: true,
    parentId: null,
  }));

  const parentResult = await prisma.taxonomyItem.createMany({
    data: parentData,
    skipDuplicates: true,
  });
  console.log(`✅ Created ${parentResult.count} parent items (org types, industries, categories)\n`);

  // Step 3: Fetch all parent items to build the value → id map
  const createdParents = await prisma.taxonomyItem.findMany({
    where: {
      type: { in: [TaxonomyType.ORGANIZATION_TYPE, TaxonomyType.INDUSTRY, TaxonomyType.CATEGORY] },
    },
  });

  const valueToId = new Map<string, string>();
  for (const item of createdParents) {
    valueToId.set(item.value, item.id);
  }

  // Step 4: Create subcategories with parentId references
  const subcategoryData: {
    type: TaxonomyType;
    value: string;
    label: string;
    description: string | null;
    isActive: boolean;
    parentId: string;
  }[] = [];

  for (const [parentValue, children] of Object.entries(subcategoriesByParent)) {
    const parentId = valueToId.get(parentValue);
    if (!parentId) {
      console.warn(`⚠️  Warning: Could not find parent category with value "${parentValue}"`);
      continue;
    }
    for (const child of children) {
      subcategoryData.push({
        type: child.type,
        value: child.value,
        label: child.label,
        description: child.description ?? null,
        isActive: true,
        parentId,
      });
    }
  }

  const subcategoryResult = await prisma.taxonomyItem.createMany({
    data: subcategoryData,
    skipDuplicates: true,
  });
  console.log(`✅ Created ${subcategoryResult.count} subcategory items\n`);

  // Step 5: Create non-hierarchical items (skills, tools, qualifications)
  const flatItems: Omit<TaxonomySeedItem, 'parentId'>[] = [...skills, ...tools, ...qualifications];

  const flatData = flatItems.map((item) => ({
    type: item.type,
    value: item.value,
    label: item.label,
    description: item.description ?? null,
    isActive: true,
    parentId: null,
  }));

  // Process in batches of 100 to avoid hitting query limits
  let flatCreated = 0;
  const BATCH_SIZE = 100;
  for (let i = 0; i < flatData.length; i += BATCH_SIZE) {
    const batch = flatData.slice(i, i + BATCH_SIZE);
    const result = await prisma.taxonomyItem.createMany({
      data: batch,
      skipDuplicates: true,
    });
    flatCreated += result.count;
  }
  console.log(`✅ Created ${flatCreated} flat items (skills, tools, qualifications)\n`);

  // Step 6: Summary
  const totalCreated = parentResult.count + subcategoryResult.count + flatCreated;

  const counts = await prisma.taxonomyItem.groupBy({
    by: ['type'],
    _count: { type: true },
    orderBy: { type: 'asc' },
  });

  console.log('📊 Taxonomy Summary:');
  console.log('─'.repeat(50));
  for (const count of counts) {
    console.log(`   ${count.type.padEnd(30)} ${String(count._count.type).padStart(5)}`);
  }
  console.log('─'.repeat(50));
  console.log(`   ${'TOTAL'.padEnd(30)} ${String(totalCreated).padStart(5)}`);
  console.log();

  return {
    totalCreated,
    parentCount: parentResult.count,
    subcategoryCount: subcategoryResult.count,
    flatCount: flatCreated,
    typeBreakdown: counts.map((c) => ({ type: c.type, count: c._count.type })),
  };
}

// ============================================================
// MAIN (entry point)
// ============================================================

async function main() {
  try {
    const result = await seedTaxonomy();
    console.log('🎉 Taxonomy seeding completed successfully!');
    console.log(`   Total items created: ${result.totalCreated}`);
  } catch (error) {
    console.error('❌ Error seeding taxonomy:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Allow running directly via `npx tsx prisma/seed-taxonomy.ts`
if (typeof require !== 'undefined' && require.main === module) {
  main();
}

export { seedTaxonomy, main };