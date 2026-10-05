import type { Database } from "@stellarjob/supabase";

type JobRow = Database["public"]["Tables"]["jobs"]["Row"];

export type JobDetail = {
  id: string;
  title: string;
  category: JobRow["category"];
  city: JobRow["city"];
  workModel: JobRow["work_model"];
  employmentType: JobRow["employment_type"];
  salaryMin: number | null;
  salaryMax: number | null;
  about: string | null;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  perks: string[];
  promoted: boolean;
  postedAt: JobRow["posted_at"];
  companyName: string;
  companyAbout: string | null;
  verified: boolean;
};
