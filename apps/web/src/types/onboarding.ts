export type Experience = {
  id?: string;
  title: string;
  company: string;
  country: string;
  city: string;
  is_current: boolean;
  start_date: string | null; // YYYY-MM-01
  end_date: string | null;
  description: string;
};

export type Education = {
  id?: string;
  level: string;
  field_of_study: string;
  school: string;
  country: string;
  city: string;
  is_current: boolean;
  start_date: string | null;
  end_date: string | null;
};

export type Certification = { id?: string; name: string; issuer: string };

export type OnboardingStepKey =
  | "name"
  | "location"
  | "experience"
  | "education"
  | "certifications"
  | "skills"
  | "review"
  | "done";
