import { z } from "zod";

export const jobSearchSchema = z.object({
  q: z.string().trim().max(100).default("").catch(""),
  location: z.string().trim().max(100).default("").catch(""),
  workModels: z
    .array(z.enum(["remote", "hybrid", "onsite"]))
    .max(3)
    .default([])
    .catch([]),
  employmentTypes: z
    .array(z.enum(["full_time", "part_time", "contract", "internship"]))
    .max(4)
    .default([])
    .catch([]),
  minSalary: z.coerce.number().int().min(0).max(10_000_000).default(0).catch(0),
  postedWithinDays: z
    .union([z.literal(1), z.literal(7), z.literal(30)])
    .nullable()
    .default(null)
    .catch(null),
  sort: z
    .enum(["newest", "oldest", "salary_high", "salary_low"])
    .default("newest")
    .catch("newest"),
  page: z.coerce.number().int().min(1).max(1_000).default(1).catch(1),
});

export type JobSearch = z.infer<typeof jobSearchSchema>;
