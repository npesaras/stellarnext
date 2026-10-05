import type { JobDetail } from "@/lib/jobs/job-model";

export function formatSalary(min: number | null, max: number | null) {
  const peso = (value: number) => `₱${value.toLocaleString("en-PH")}`;
  if (min !== null && max !== null) return `${peso(min)} – ${peso(max)}`;
  if (min !== null) return `From ${peso(min)}`;
  if (max !== null) return `Up to ${peso(max)}`;
  return "Salary not listed";
}

export function formatWorkModel(value: JobDetail["workModel"]) {
  if (value === "onsite") return "On-site";
  return value ?? "Work model not listed";
}

export function formatEmploymentType(value: JobDetail["employmentType"]) {
  return value?.replaceAll("_", " ") ?? "Type not listed";
}

export function jobLocationLabel(value: JobDetail["city"]) {
  return value?.trim() || "Location not listed";
}
