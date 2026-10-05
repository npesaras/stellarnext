import { createServerFn } from "@tanstack/react-start";
import type { QueryData } from "@supabase/supabase-js";
import { z } from "zod";

import { requireCurrentUser } from "@/lib/auth/auth.server";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { JobDetail } from "./job-model";
import { jobSearchSchema } from "./job-search-schema";

const jobColumns =
  "id, title, category, city, work_model, employment_type, salary_min, salary_max, about, responsibilities, requirements, nice_to_have, perks, promoted, posted_at, companies(name, about, verified)";

function selectJobs(supabase: ReturnType<typeof getSupabaseServerClient>) {
  return supabase.from("jobs").select(jobColumns);
}

type JoinedJob = QueryData<ReturnType<typeof selectJobs>>[number];

function toJobDetail(row: JoinedJob): JobDetail {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    city: row.city,
    workModel: row.work_model,
    employmentType: row.employment_type,
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    about: row.about,
    responsibilities: row.responsibilities ?? [],
    requirements: row.requirements ?? [],
    niceToHave: row.nice_to_have ?? [],
    perks: row.perks ?? [],
    promoted: row.promoted,
    postedAt: row.posted_at,
    companyName: row.companies?.name ?? "Employer",
    companyAbout: row.companies?.about ?? null,
    verified: row.companies?.verified ?? false,
  };
}

const searchSchema = z.object({
  q: z.string().trim().max(100).default(""),
  location: z.string().trim().max(100).default(""),
  page: z.coerce.number().int().min(1).max(1_000).default(1),
});

const listPageSize = 12;

function emptyPage(page: number, pageSize: number) {
  const jobs: JobDetail[] = [];
  return { jobs, count: 0, page, pageSize };
}

export const listJobsFn = createServerFn({ method: "GET" })
  .validator(searchSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const searchFilter = await getSearchFilter(supabase, data.q);
    if (data.q && !searchFilter) {
      return emptyPage(data.page, listPageSize);
    }
    const location = toLikeTerm(data.location);
    if (data.location && !location) return emptyPage(data.page, listPageSize);

    const filteredQuery = (head: boolean) => {
      let query = supabase.from("jobs").select(jobColumns, {
        count: "exact",
        head,
      });
      if (searchFilter) query = query.or(searchFilter);
      if (location) query = query.ilike("city", `%${location}%`);
      return query;
    };

    const first = (data.page - 1) * listPageSize;
    const {
      data: rows,
      count,
      error,
    } = await filteredQuery(false)
      .order("posted_at", { ascending: false })
      .order("id", { ascending: false })
      .range(first, first + listPageSize - 1);
    if (error?.code === "PGRST103") {
      const { count: actualCount, error: countError } =
        await filteredQuery(true);
      if (countError) throw countError;
      return { ...emptyPage(data.page, listPageSize), count: actualCount ?? 0 };
    }
    if (error) throw error;
    return {
      jobs: (rows ?? []).map(toJobDetail),
      count: count ?? 0,
      page: data.page,
      pageSize: listPageSize,
    };
  });

const searchPageSize = 9;

/** A URL-safe, literal term for PostgREST's OR filter grammar. */
function toSearchTerm(value: string) {
  return value
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toLikeTerm(value: string) {
  return value.replace(/[%_\\]/g, "").trim();
}

async function getSearchFilter(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  value: string,
) {
  const term = toSearchTerm(value);
  if (!term) return null;

  const pattern = `%${term}%`;
  const { data: companies, error } = await supabase
    .from("companies")
    .select("id")
    .ilike("name", pattern);
  if (error) throw error;

  const clauses = [
    `title.ilike.${pattern}`,
    `category.ilike.${pattern}`,
    `about.ilike.${pattern}`,
  ];
  if (companies?.length) {
    clauses.push(`company_id.in.(${companies.map(({ id }) => id).join(",")})`);
  }
  return clauses.join(",");
}

export const searchJobsFn = createServerFn({ method: "GET" })
  .validator(jobSearchSchema)
  .handler(async ({ data }) => {
    await requireCurrentUser();
    const supabase = getSupabaseServerClient();

    const searchFilter = await getSearchFilter(supabase, data.q);
    if (data.q && !searchFilter) {
      return emptyPage(data.page, searchPageSize);
    }
    const location = toLikeTerm(data.location);
    if (data.location && !location) return emptyPage(data.page, searchPageSize);
    const postedSince = data.postedWithinDays
      ? new Date(Date.now() - data.postedWithinDays * 86_400_000).toISOString()
      : null;

    const filteredQuery = (head: boolean) => {
      let query = supabase.from("jobs").select(jobColumns, {
        count: "exact",
        head,
      });
      if (searchFilter) query = query.or(searchFilter);
      if (location) query = query.ilike("city", `%${location}%`);
      if (data.workModels.length) {
        query = query.in("work_model", data.workModels);
      }
      if (data.employmentTypes.length) {
        query = query.in("employment_type", data.employmentTypes);
      }
      if (data.minSalary) {
        query = query.or(
          `salary_min.gte.${data.minSalary},salary_max.gte.${data.minSalary}`,
        );
      }
      if (postedSince) query = query.gte("posted_at", postedSince);
      return query;
    };

    let query = filteredQuery(false);

    if (data.sort === "salary_high" || data.sort === "salary_low") {
      query = query.order("salary_min", {
        ascending: data.sort === "salary_low",
        nullsFirst: false,
      });
    } else {
      query = query.order("posted_at", {
        ascending: data.sort === "oldest",
      });
    }
    query = query.order("id", { ascending: false });
    const first = (data.page - 1) * searchPageSize;
    const {
      data: rows,
      count,
      error,
    } = await query.range(first, first + searchPageSize - 1);
    if (error?.code === "PGRST103") {
      const { count: actualCount, error: countError } =
        await filteredQuery(true);
      if (countError) throw countError;
      return {
        ...emptyPage(data.page, searchPageSize),
        count: actualCount ?? 0,
      };
    }
    if (error) throw error;
    return {
      jobs: (rows ?? []).map(toJobDetail),
      count: count ?? 0,
      page: data.page,
      pageSize: searchPageSize,
    };
  });

export const getJobFn = createServerFn({ method: "GET" })
  .validator(z.object({ jobId: z.string().min(1).max(100) }))
  .handler(async ({ data }) => {
    if (!z.uuid().safeParse(data.jobId).success) return null;
    const supabase = getSupabaseServerClient();
    const { data: row, error } = await selectJobs(supabase)
      .eq("id", data.jobId)
      .maybeSingle();
    if (error) throw error;
    return row ? toJobDetail(row) : null;
  });

async function requireApplicant() {
  const user = await requireCurrentUser();
  if (user.accountType !== "applicant") {
    throw new Error(
      "Only applicants can access job applications and saved jobs.",
    );
  }
  return user;
}

export const listSavedJobsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireApplicant();
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("saved_jobs")
      .select("job_id")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false });
    if (error) throw error;
    const ids = (data ?? []).map((item) => item.job_id);
    if (!ids.length) return [];
    const { data: jobs, error: jobsError } = await selectJobs(supabase).in(
      "id",
      ids,
    );
    if (jobsError) throw jobsError;
    const byId = new Map((jobs ?? []).map((row) => [row.id, toJobDetail(row)]));
    return ids.flatMap((id) => {
      const job = byId.get(id);
      return job ? [job] : [];
    });
  },
);

export const isJobSavedFn = createServerFn({ method: "GET" })
  .validator(z.object({ jobId: z.uuid() }))
  .handler(async ({ data }) => {
    const user = await requireApplicant();
    const supabase = getSupabaseServerClient();
    const { data: row, error } = await supabase
      .from("saved_jobs")
      .select("id")
      .eq("user_id", user.id)
      .eq("job_id", data.jobId)
      .maybeSingle();
    if (error) throw error;
    return Boolean(row);
  });

export const toggleSavedJobFn = createServerFn({ method: "POST" })
  .validator(z.object({ jobId: z.uuid() }))
  .handler(async ({ data }) => {
    const user = await requireApplicant();
    const supabase = getSupabaseServerClient();
    const { data: existing, error: lookupError } = await supabase
      .from("saved_jobs")
      .select("id")
      .eq("user_id", user.id)
      .eq("job_id", data.jobId)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) {
      const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("id", existing.id)
        .eq("user_id", user.id);
      if (error) throw error;
      return { saved: false };
    }
    const { error } = await supabase
      .from("saved_jobs")
      .insert({ user_id: user.id, job_id: data.jobId });
    if (error) throw error;
    return { saved: true };
  });

export const listApplicationsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireApplicant();
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("applications")
      .select(
        "id, job_id, status, submitted_at, next_action_at, next_action_label",
      )
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false });
    if (error) throw error;
    const ids = [...new Set((data ?? []).map((item) => item.job_id))];
    if (!ids.length) return [];
    const { data: jobs, error: jobsError } = await selectJobs(supabase).in(
      "id",
      ids,
    );
    if (jobsError) throw jobsError;
    const byId = new Map((jobs ?? []).map((row) => [row.id, toJobDetail(row)]));
    return (data ?? []).flatMap((item) => {
      const job = byId.get(item.job_id);
      return job ? [{ ...item, job }] : [];
    });
  },
);

export const submitApplicationFn = createServerFn({ method: "POST" })
  .validator(z.object({ jobId: z.uuid(), note: z.string().trim().max(2000) }))
  .handler(async ({ data }) => {
    const user = await requireCurrentUser();
    if (user.accountType !== "applicant") {
      throw new Error("Only applicants can apply for jobs.");
    }
    if (!user.onboardingComplete) {
      throw new Error("Complete your profile before applying.");
    }
    const supabase = getSupabaseServerClient();
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", data.jobId)
      .maybeSingle();
    if (jobError) throw jobError;
    if (!job) throw new Error("This job is no longer available.");
    const { error } = await supabase.from("applications").insert({
      user_id: user.id,
      job_id: job.id,
      note: data.note || null,
    });
    if (error?.code === "23505")
      throw new Error("You have already applied for this role.");
    if (error) throw error;
    return { ok: true as const };
  });
