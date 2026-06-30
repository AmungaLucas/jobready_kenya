'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Briefcase,
  GraduationCap,
  Settings,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Search,
} from 'lucide-react';
import { useCounties } from '@/lib/use-counties';

// ============================================================
// Types
// ============================================================

interface WorkExperience {
  employerName: string;
  roleTitle: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

interface Education {
  institution: string;
  fieldOfStudy: string;
  level: string;
  startYear: string;
  endYear: string;
  status: string;
}

interface Skill {
  skillId: string;
  skillName: string;
  proficiency: string;
}

interface TaxonomyItem {
  id: string;
  type: string;
  value: string;
  label: string;
}

const STEPS = [
  { number: 1, label: 'Personal Info', icon: User },
  { number: 2, label: 'Professional', icon: Briefcase },
  { number: 3, label: 'Education & Skills', icon: GraduationCap },
  { number: 4, label: 'Preferences', icon: Settings },
];

const SENIORITY_OPTIONS = ['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'EXECUTIVE'];

const SENIORITY_LABELS: Record<string, string> = {
  ENTRY: 'Entry Level',
  JUNIOR: 'Junior',
  MID: 'Mid-Level',
  SENIOR: 'Senior',
  EXECUTIVE: 'Executive',
};

const QUALIFICATION_OPTIONS = ['CERTIFICATE', 'DIPLOMA', 'BACHELOR', 'MASTER', 'PHD', 'OTHER'];

const QUALIFICATION_LABELS: Record<string, string> = {
  CERTIFICATE: 'Certificate',
  DIPLOMA: 'Diploma',
  BACHELOR: 'Bachelor\'s Degree',
  MASTER: 'Master\'s Degree',
  PHD: 'Doctorate (PhD)',
  OTHER: 'Other',
};

const EDUCATION_STATUS_OPTIONS = ['COMPLETED', 'ONGOING'];

const PROFICIENCY_OPTIONS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

const PROFICIENCY_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
};

const REMOTE_OPTIONS = [
  { value: 'ONSITE', label: 'On-site' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'ANY', label: 'Any / Flexible' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'IMMEDIATE', label: 'Immediately available' },
  { value: 'NOTICE_PERIOD', label: 'Serving notice period' },
  { value: 'UNAVAILABLE', label: 'Not currently available' },
];

// ============================================================
// Sub-components
// ============================================================

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isUpcoming = currentStep < step.number;

          return (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-md'
                      : isActive
                      ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-100'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isActive
                      ? 'text-emerald-700'
                      : isCompleted
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 mt-[-1.25rem] transition-colors duration-300 ${
                    currentStep > step.number ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InputField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function FormInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 ${
        error ? 'border-red-300 bg-red-50/50' : 'border-gray-300 bg-white'
      }`}
    />
  );
}

// ============================================================
// Step components
// ============================================================

function Step1Personal({
  firstName,
  lastName,
  phone,
  locationCounty,
  counties,
  countiesLoading,
  errors,
  onChange,
}: {
  firstName: string;
  lastName: string;
  phone: string;
  locationCounty: string;
  counties: { county: string; slug: string }[];
  countiesLoading: boolean;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
        <p className="text-sm text-gray-500 mt-1">
          Tell us about yourself so employers can find you.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="First Name" error={errors.firstName} required>
          <FormInput
            value={firstName}
            onChange={(v) => onChange('firstName', v)}
            placeholder="e.g. James"
            error={errors.firstName}
          />
        </InputField>

        <InputField label="Last Name" error={errors.lastName} required>
          <FormInput
            value={lastName}
            onChange={(v) => onChange('lastName', v)}
            placeholder="e.g. Mito"
            error={errors.lastName}
          />
        </InputField>

        <InputField label="Phone Number" error={errors.phone}>
          <FormInput
            value={phone}
            onChange={(v) => onChange('phone', v)}
            placeholder="e.g. 0712 345 678"
            type="tel"
            error={errors.phone}
          />
        </InputField>

        <InputField label="County / Location" error={errors.locationCounty}>
          <select
            value={locationCounty}
            onChange={(e) => onChange('locationCounty', e.target.value)}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 ${
              errors.locationCounty ? 'border-red-300 bg-red-50/50' : 'border-gray-300 bg-white'
            }`}
          >
            <option value="">Select your county</option>
            {countiesLoading ? (
              <option disabled>Loading counties...</option>
            ) : (
              counties.map((c) => (
                <option key={c.slug} value={c.county}>
                  {c.county}
                </option>
              ))
            )}
          </select>
        </InputField>
      </div>
    </div>
  );
}

function Step2Professional({
  primaryCategoryId,
  seniorityLevel,
  totalExperienceYears,
  workExperiences,
  categories,
  categoriesLoading,
  errors,
  onChange,
}: {
  primaryCategoryId: string;
  seniorityLevel: string;
  totalExperienceYears: string;
  workExperiences: WorkExperience[];
  categories: TaxonomyItem[];
  categoriesLoading: boolean;
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
}) {
  const addExperience = () => {
    onChange('workExperiences', [
      ...workExperiences,
      { employerName: '', roleTitle: '', startDate: '', endDate: '', isCurrent: false, description: '' },
    ]);
  };

  const removeExperience = (index: number) => {
    onChange(
      'workExperiences',
      workExperiences.filter((_, i) => i !== index)
    );
  };

  const updateExperience = (index: number, field: keyof WorkExperience, value: any) => {
    const updated = [...workExperiences];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'isCurrent' && value) {
      updated[index].endDate = '';
    }
    onChange('workExperiences', updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Professional Profile</h2>
        <p className="text-sm text-gray-500 mt-1">
          Share your professional background and experience.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Primary Job Category" error={errors.primaryCategoryId}>
          <select
            value={primaryCategoryId}
            onChange={(e) => onChange('primaryCategoryId', e.target.value)}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 ${
              errors.primaryCategoryId ? 'border-red-300 bg-red-50/50' : 'border-gray-300 bg-white'
            }`}
          >
            <option value="">Select a category</option>
            {categoriesLoading ? (
              <option disabled>Loading...</option>
            ) : (
              categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))
            )}
          </select>
        </InputField>

        <InputField label="Seniority Level" error={errors.seniorityLevel}>
          <select
            value={seniorityLevel}
            onChange={(e) => onChange('seniorityLevel', e.target.value)}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 ${
              errors.seniorityLevel ? 'border-red-300 bg-red-50/50' : 'border-gray-300 bg-white'
            }`}
          >
            <option value="">Select level</option>
            {SENIORITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {SENIORITY_LABELS[opt]}
              </option>
            ))}
          </select>
        </InputField>

        <InputField label="Total Experience (Years)">
          <FormInput
            value={totalExperienceYears}
            onChange={(v) => onChange('totalExperienceYears', v)}
            placeholder="e.g. 5"
            type="number"
            error={errors.totalExperienceYears}
          />
        </InputField>
      </div>

      {/* Work Experience Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">Work Experience</h3>
          <button
            type="button"
            onClick={addExperience}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </button>
        </div>

        {workExperiences.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
            <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No work experience added yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Click &ldquo;Add Experience&rdquo; to get started.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {workExperiences.map((exp, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Experience #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField label="Employer Name">
                  <FormInput
                    value={exp.employerName}
                    onChange={(v) => updateExperience(index, 'employerName', v)}
                    placeholder="e.g. Safaricom"
                  />
                </InputField>

                <InputField label="Role / Job Title">
                  <FormInput
                    value={exp.roleTitle}
                    onChange={(v) => updateExperience(index, 'roleTitle', v)}
                    placeholder="e.g. Software Engineer"
                  />
                </InputField>

                <InputField label="Start Date">
                  <FormInput
                    value={exp.startDate}
                    onChange={(v) => updateExperience(index, 'startDate', v)}
                    placeholder="e.g. 2022-01"
                    type="month"
                  />
                </InputField>

                <InputField label="End Date">
                  {exp.isCurrent ? (
                    <div className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-sm text-gray-500">
                      Currently working here
                    </div>
                  ) : (
                    <FormInput
                      value={exp.endDate}
                      onChange={(v) => updateExperience(index, 'endDate', v)}
                      placeholder="e.g. 2024-06"
                      type="month"
                    />
                  )}
                </InputField>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.isCurrent}
                      onChange={(e) => updateExperience(index, 'isCurrent', e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    I currently work here
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <InputField label="Description">
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      placeholder="Describe your key responsibilities and achievements..."
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
                    />
                  </InputField>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3EducationSkills({
  educations,
  skills,
  skillSearchQuery,
  skillSuggestions,
  skillSuggestionsLoading,
  showSkillSuggestions,
  errors,
  onChange,
}: {
  educations: Education[];
  skills: Skill[];
  skillSearchQuery: string;
  skillSuggestions: TaxonomyItem[];
  skillSuggestionsLoading: boolean;
  showSkillSuggestions: boolean;
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
}) {
  const addEducation = () => {
    onChange('educations', [
      ...educations,
      { institution: '', fieldOfStudy: '', level: '', startYear: '', endYear: '', status: 'COMPLETED' },
    ]);
  };

  const removeEducation = (index: number) => {
    onChange('educations', educations.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    onChange('educations', updated);
  };

  const addSkill = (item: TaxonomyItem) => {
    if (skills.some((s) => s.skillId === item.id)) return;
    onChange('skills', [...skills, { skillId: item.id, skillName: item.label, proficiency: 'INTERMEDIATE' }]);
    onChange('skillSearchQuery', '');
    onChange('showSkillSuggestions', false);
  };

  const addCustomSkill = () => {
    const name = skillSearchQuery.trim();
    if (!name) return;
    if (skills.some((s) => s.skillName.toLowerCase() === name.toLowerCase())) return;
    const id = `custom-${Date.now()}`;
    onChange('skills', [...skills, { skillId: id, skillName: name, proficiency: 'INTERMEDIATE' }]);
    onChange('skillSearchQuery', '');
    onChange('showSkillSuggestions', false);
  };

  const removeSkill = (index: number) => {
    onChange('skills', skills.filter((_, i) => i !== index));
  };

  const updateSkillProficiency = (index: number, proficiency: string) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], proficiency };
    onChange('skills', updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Education & Skills</h2>
        <p className="text-sm text-gray-500 mt-1">
          Add your educational background and skills.
        </p>
      </div>

      {/* Education Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">Education</h3>
          <button
            type="button"
            onClick={addEducation}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </button>
        </div>

        {educations.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
            <GraduationCap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No education added yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {educations.map((edu, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Education #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField label="Institution">
                  <FormInput
                    value={edu.institution}
                    onChange={(v) => updateEducation(index, 'institution', v)}
                    placeholder="e.g. University of Nairobi"
                  />
                </InputField>

                <InputField label="Field of Study">
                  <FormInput
                    value={edu.fieldOfStudy}
                    onChange={(v) => updateEducation(index, 'fieldOfStudy', v)}
                    placeholder="e.g. Computer Science"
                  />
                </InputField>

                <InputField label="Qualification Level">
                  <select
                    value={edu.level}
                    onChange={(e) => updateEducation(index, 'level', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    <option value="">Select level</option>
                    {QUALIFICATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {QUALIFICATION_LABELS[opt]}
                      </option>
                    ))}
                  </select>
                </InputField>

                <InputField label="Status">
                  <select
                    value={edu.status}
                    onChange={(e) => updateEducation(index, 'status', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    {EDUCATION_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt === 'COMPLETED' ? 'Completed' : 'Ongoing'}
                      </option>
                    ))}
                  </select>
                </InputField>

                <InputField label="Start Year">
                  <FormInput
                    value={edu.startYear}
                    onChange={(v) => updateEducation(index, 'startYear', v)}
                    placeholder="e.g. 2018"
                    type="number"
                  />
                </InputField>

                <InputField label="End Year">
                  <FormInput
                    value={edu.endYear}
                    onChange={(v) => updateEducation(index, 'endYear', v)}
                    placeholder="e.g. 2022"
                    type="number"
                  />
                </InputField>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Section */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-800">Skills</h3>

        {/* Skill search / autocomplete */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={skillSearchQuery}
              onChange={(e) => {
                onChange('skillSearchQuery', e.target.value);
                onChange('showSkillSuggestions', e.target.value.length > 0);
              }}
              onFocus={() => {
                if (skillSearchQuery.length > 0) onChange('showSkillSuggestions', true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (skillSuggestions.length === 0 && skillSearchQuery.trim()) {
                    addCustomSkill();
                  }
                }
              }}
              placeholder="Search for a skill or type a custom one..."
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          {/* Autocomplete dropdown */}
          {showSkillSuggestions && skillSearchQuery.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
              {skillSuggestionsLoading && (
                <div className="px-3 py-2 text-sm text-gray-400 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Searching...
                </div>
              )}
              {!skillSuggestionsLoading && skillSuggestions.length === 0 && (
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="w-full px-3 py-2.5 text-sm text-left text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  Add &ldquo;{skillSearchQuery}&rdquo; as a custom skill
                </button>
              )}
              {skillSuggestions
                .filter((s) => !skills.some((existing) => existing.skillId === s.id))
                .slice(0, 8)
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addSkill(item)}
                    className="w-full px-3 py-2.5 text-sm text-left text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {item.label}
                  </button>
                ))}
              {!skillSuggestionsLoading &&
                skillSuggestions.length > 0 &&
                skillSuggestions.filter((s) => !skills.some((existing) => existing.skillId === s.id))
                  .length === 0 && (
                  <div className="px-3 py-2.5 text-sm text-gray-400">
                    All matching skills already added
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Added skills list */}
        {skills.length === 0 && (
          <p className="text-sm text-gray-400">
            No skills added yet. Start typing above to search or add a custom skill.
          </p>
        )}

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <div
                key={skill.skillId}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm"
              >
                <span className="text-emerald-800 font-medium">{skill.skillName}</span>
                <select
                  value={skill.proficiency}
                  onChange={(e) => updateSkillProficiency(index, e.target.value)}
                  className="bg-transparent border-none text-xs text-emerald-600 font-medium focus:outline-none cursor-pointer"
                >
                  {PROFICIENCY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {PROFICIENCY_LABELS[p]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="text-emerald-400 hover:text-red-500 transition-colors ml-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {errors.skills && <p className="text-xs text-red-500">{errors.skills}</p>}
      </div>
    </div>
  );
}

function Step4Preferences({
  preferredLocations,
  expectedSalaryMin,
  expectedSalaryMax,
  remotePreference,
  availabilityStatus,
  willingToRelocate,
  counties,
  countiesLoading,
  errors,
  onChange,
}: {
  preferredLocations: string[];
  expectedSalaryMin: string;
  expectedSalaryMax: string;
  remotePreference: string;
  availabilityStatus: string;
  willingToRelocate: boolean;
  counties: { county: string; slug: string }[];
  countiesLoading: boolean;
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
}) {
  const toggleLocation = (county: string) => {
    if (preferredLocations.includes(county)) {
      onChange('preferredLocations', preferredLocations.filter((c) => c !== county));
    } else {
      onChange('preferredLocations', [...preferredLocations, county]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Job Preferences</h2>
        <p className="text-sm text-gray-500 mt-1">
          Help us match you with the right opportunities.
        </p>
      </div>

      {/* Salary Range */}
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-3">Expected Salary (KES / month)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Minimum" error={errors.expectedSalaryMin}>
            <FormInput
              value={expectedSalaryMin}
              onChange={(v) => onChange('expectedSalaryMin', v)}
              placeholder="e.g. 50000"
              type="number"
              error={errors.expectedSalaryMin}
            />
          </InputField>
          <InputField label="Maximum" error={errors.expectedSalaryMax}>
            <FormInput
              value={expectedSalaryMax}
              onChange={(v) => onChange('expectedSalaryMax', v)}
              placeholder="e.g. 150000"
              type="number"
              error={errors.expectedSalaryMax}
            />
          </InputField>
        </div>
      </div>

      {/* Remote Preference */}
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-3">Work Arrangement</h3>
        <div className="grid grid-cols-2 gap-3">
          {REMOTE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('remotePreference', opt.value)}
              className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                remotePreference === opt.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-3">Availability</h3>
        <div className="space-y-2">
          {AVAILABILITY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm cursor-pointer transition-all ${
                availabilityStatus === opt.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="availability"
                value={opt.value}
                checked={availabilityStatus === opt.value}
                onChange={(e) => onChange('availabilityStatus', e.target.value)}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Willing to Relocate */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={willingToRelocate}
            onChange={(e) => onChange('willingToRelocate', e.target.checked)}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-5 h-5"
          />
          <div>
            <span className="text-sm font-semibold text-gray-700">Willing to relocate</span>
            <p className="text-xs text-gray-400">Open to moving to a different county for the right job</p>
          </div>
        </label>
      </div>

      {/* Preferred Locations (multi-select) */}
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-3">Preferred Locations</h3>
        <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 custom-scrollbar">
          {countiesLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading counties...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-1">
              {counties.map((c) => {
                const isSelected = preferredLocations.includes(c.county);
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => toggleLocation(c.county)}
                    className={`rounded-md px-3 py-2 text-xs font-medium transition-all text-left ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {isSelected && <Check className="w-3 h-3" />}
                      {c.county}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {preferredLocations.length > 0 && (
          <p className="mt-2 text-xs text-gray-500">
            {preferredLocations.length} location{preferredLocations.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function OnboardingPage() {
  const router = useRouter();
  const { counties, loading: countiesLoading } = useCounties();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Step 1
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [locationCounty, setLocationCounty] = useState('');

  // Step 2
  const [primaryCategoryId, setPrimaryCategoryId] = useState('');
  const [seniorityLevel, setSeniorityLevel] = useState('');
  const [totalExperienceYears, setTotalExperienceYears] = useState('');
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [categories, setCategories] = useState<TaxonomyItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Step 3
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<TaxonomyItem[]>([]);
  const [skillSuggestionsLoading, setSkillSuggestionsLoading] = useState(false);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);

  // Step 4
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [expectedSalaryMin, setExpectedSalaryMin] = useState('');
  const [expectedSalaryMax, setExpectedSalaryMax] = useState('');
  const [remotePreference, setRemotePreference] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('');
  const [willingToRelocate, setWillingToRelocate] = useState(false);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Ref for clicking outside skill suggestions
  const skillInputRef = useRef<HTMLDivElement>(null);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/taxonomy?type=CATEGORY&limit=100');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch {
        // Categories are optional
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // Fetch existing candidate data on mount
  useEffect(() => {
    async function fetchCandidate() {
      try {
        const res = await fetch('/api/candidates/me');
        if (res.ok) {
          const data = await res.json();
          const candidate = data.candidate || data;
          if (candidate) {
            if (candidate.firstName) setFirstName(candidate.firstName);
            if (candidate.lastName) setLastName(candidate.lastName);
            if (candidate.phone) setPhone(candidate.phone);
            if (candidate.locationCounty) setLocationCounty(candidate.locationCounty);
            if (candidate.profile) {
              if (candidate.profile.primaryCategoryId) setPrimaryCategoryId(candidate.profile.primaryCategoryId);
              if (candidate.profile.seniorityLevel) setSeniorityLevel(candidate.profile.seniorityLevel);
              if (candidate.profile.totalExperienceYears) setTotalExperienceYears(String(candidate.profile.totalExperienceYears));
            }
            if (candidate.preferences) {
              if (candidate.preferences.preferredLocations) {
                try {
                  const locs = JSON.parse(candidate.preferences.preferredLocations);
                  if (Array.isArray(locs)) setPreferredLocations(locs);
                } catch { /* ignore */ }
              }
              if (candidate.preferences.expectedSalaryMin) setExpectedSalaryMin(String(candidate.preferences.expectedSalaryMin));
              if (candidate.preferences.expectedSalaryMax) setExpectedSalaryMax(String(candidate.preferences.expectedSalaryMax));
              if (candidate.preferences.remotePreference) setRemotePreference(candidate.preferences.remotePreference);
            }
          }
        }
      } catch {
        // Silently handle — user may not be logged in yet
      } finally {
        setInitialLoading(false);
      }
    }
    fetchCandidate();
  }, []);

  // Skill search debounce
  const skillSearchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleSkillSearchChange = useCallback(
    (query: string) => {
      setSkillSearchQuery(query);
      setShowSkillSuggestions(query.length > 0);

      if (skillSearchTimerRef.current) clearTimeout(skillSearchTimerRef.current);

      if (query.length < 2) {
        setSkillSuggestions([]);
        setSkillSuggestionsLoading(false);
        return;
      }

      setSkillSuggestionsLoading(true);
      skillSearchTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/taxonomy?type=SKILL&search=${encodeURIComponent(query)}&limit=10`);
          if (res.ok) {
            const data = await res.json();
            setSkillSuggestions(data);
          }
        } catch {
          // Silently handle
        } finally {
          setSkillSuggestionsLoading(false);
        }
      }, 300);
    },
    []
  );

  // Click outside to close skill suggestions
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (skillInputRef.current && !skillInputRef.current.contains(e.target as Node)) {
        setShowSkillSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validation
  function validateStep(step: number): boolean {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!firstName.trim()) newErrors.firstName = 'First name is required';
      if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    }

    if (step === 2) {
      if (totalExperienceYears && isNaN(Number(totalExperienceYears))) {
        newErrors.totalExperienceYears = 'Must be a valid number';
      }
    }

    if (step === 4) {
      if (expectedSalaryMin && isNaN(Number(expectedSalaryMin))) {
        newErrors.expectedSalaryMin = 'Must be a valid number';
      }
      if (expectedSalaryMax && isNaN(Number(expectedSalaryMax))) {
        newErrors.expectedSalaryMax = 'Must be a valid number';
      }
      if (
        expectedSalaryMin &&
        expectedSalaryMax &&
        Number(expectedSalaryMin) > Number(expectedSalaryMax)
      ) {
        newErrors.expectedSalaryMax = 'Max salary should be greater than min';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Submit step to API
  async function submitStep(step: number) {
    setSubmitting(true);
    setError(null);

    try {
      let body: Record<string, unknown> = { step };

      if (step === 1) {
        body.data = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
          locationCounty: locationCounty || undefined,
        };
      } else if (step === 2) {
        body.data = {
          primaryCategoryId: primaryCategoryId || undefined,
          seniorityLevel: seniorityLevel || undefined,
          totalExperienceYears: totalExperienceYears ? Number(totalExperienceYears) : undefined,
          workExperiences: workExperiences.filter((e) => e.employerName.trim() || e.roleTitle.trim()).map((e) => ({
            employerName: e.employerName.trim() || undefined,
            roleTitle: e.roleTitle.trim() || undefined,
            startDate: e.startDate || undefined,
            endDate: e.endDate || undefined,
            isCurrent: e.isCurrent,
            description: e.description.trim() || undefined,
          })),
        };
      } else if (step === 3) {
        body.data = {
          educations: educations.filter((e) => e.institution.trim() || e.fieldOfStudy.trim()).map((e) => ({
            institution: e.institution.trim() || undefined,
            fieldOfStudy: e.fieldOfStudy.trim() || undefined,
            level: e.level || undefined,
            status: e.status || 'COMPLETED',
            startYear: e.startYear ? Number(e.startYear) : undefined,
            endYear: e.endYear ? Number(e.endYear) : undefined,
          })),
          skills: skills.map((s) => ({
            skillId: s.skillId,
            proficiency: s.proficiency || 'INTERMEDIATE',
            source: s.skillId.startsWith('custom-') ? 'USER_ADDED' : 'USER_SELECTED',
          })),
        };
      } else if (step === 4) {
        body.data = {
          preferredLocations: preferredLocations.length > 0 ? preferredLocations : undefined,
          expectedSalaryMin: expectedSalaryMin ? Number(expectedSalaryMin) : undefined,
          expectedSalaryMax: expectedSalaryMax ? Number(expectedSalaryMax) : undefined,
          remotePreference: remotePreference || undefined,
        };
      }

      const res = await fetch('/api/candidates/me/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Submission failed' }));
        throw new Error(errData.error || 'Submission failed');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => Math.min(prev + 1, 4));
    setError(null);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handlePrev() {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleFinish() {
    if (!validateStep(4)) return;

    const success = await submitStep(4);
    if (success) {
      router.push('/account');
    }
  }

  // Unified onChange for step components
  function handleChange(field: string, value: any) {
    // Step 1
    if (field === 'firstName') setFirstName(value);
    else if (field === 'lastName') setLastName(value);
    else if (field === 'phone') setPhone(value);
    else if (field === 'locationCounty') setLocationCounty(value);
    // Step 2
    else if (field === 'primaryCategoryId') setPrimaryCategoryId(value);
    else if (field === 'seniorityLevel') setSeniorityLevel(value);
    else if (field === 'totalExperienceYears') setTotalExperienceYears(value);
    else if (field === 'workExperiences') setWorkExperiences(value);
    // Step 3
    else if (field === 'educations') setEducations(value);
    else if (field === 'skills') setSkills(value);
    else if (field === 'skillSearchQuery') handleSkillSearchChange(value);
    else if (field === 'showSkillSuggestions') setShowSkillSuggestions(value);
    // Step 4
    else if (field === 'preferredLocations') setPreferredLocations(value);
    else if (field === 'expectedSalaryMin') setExpectedSalaryMin(value);
    else if (field === 'expectedSalaryMax') setExpectedSalaryMax(value);
    else if (field === 'remotePreference') setRemotePreference(value);
    else if (field === 'availabilityStatus') setAvailabilityStatus(value);
    else if (field === 'willingToRelocate') setWillingToRelocate(value);
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Complete Your Profile
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Set up your profile in 4 easy steps to unlock personalized job matches.
        </p>
      </div>

      {/* Stepper */}
      <Stepper currentStep={currentStep} />

      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <span className="font-medium">Error:</span>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            &times;
          </button>
        </div>
      )}

      {/* Step content */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-8 shadow-sm">
        {currentStep === 1 && (
          <Step1Personal
            firstName={firstName}
            lastName={lastName}
            phone={phone}
            locationCounty={locationCounty}
            counties={counties}
            countiesLoading={countiesLoading}
            errors={errors}
            onChange={handleChange}
          />
        )}

        {currentStep === 2 && (
          <Step2Professional
            primaryCategoryId={primaryCategoryId}
            seniorityLevel={seniorityLevel}
            totalExperienceYears={totalExperienceYears}
            workExperiences={workExperiences}
            categories={categories}
            categoriesLoading={categoriesLoading}
            errors={errors}
            onChange={handleChange}
          />
        )}

        {currentStep === 3 && (
          <div ref={skillInputRef}>
            <Step3EducationSkills
              educations={educations}
              skills={skills}
              skillSearchQuery={skillSearchQuery}
              skillSuggestions={skillSuggestions}
              skillSuggestionsLoading={skillSuggestionsLoading}
              showSkillSuggestions={showSkillSuggestions}
              errors={errors}
              onChange={handleChange}
            />
          </div>
        )}

        {currentStep === 4 && (
          <Step4Preferences
            preferredLocations={preferredLocations}
            expectedSalaryMin={expectedSalaryMin}
            expectedSalaryMax={expectedSalaryMax}
            remotePreference={remotePreference}
            availabilityStatus={availabilityStatus}
            willingToRelocate={willingToRelocate}
            counties={counties}
            countiesLoading={countiesLoading}
            errors={errors}
            onChange={handleChange}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 gap-3">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentStep === 1
              ? 'invisible'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <span className="text-xs text-gray-400">
          Step {currentStep} of 4
        </span>

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Complete
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
