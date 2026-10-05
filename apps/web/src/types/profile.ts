export type ProfileRow = {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  headline: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  avatar_url: string | null;
  summary: string | null;
  min_salary: number | null;
  work_model_prefs: string[] | null;
  locations: string[] | null;
  cv_url: string | null;
  cv_updated_at: string | null;
};

export type ExperienceRow = {
  id: string;
  title: string | null;
  company: string | null;
  city: string | null;
  country: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean | null;
  description: string | null;
};

export type EducationRow = {
  id: string;
  school: string | null;
  degree: string | null;
  field_of_study: string | null;
  start_year: number | null;
  end_year: number | null;
};

export type SkillRow = { id: string; label: string };
export type CertRow = {
  id: string;
  name: string;
  issuer: string | null;
  issued_year: number | null;
};

export type CompanyRow = {
  id: string;
  name: string | null;
  company_type: string | null;
  country: string | null;
  state_province: string | null;
  address: string | null;
  website: string | null;
  about: string | null;
  size: string | null;
  onboarding_completed_at: string | null;
};
