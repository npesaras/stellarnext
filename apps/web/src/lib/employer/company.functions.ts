import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireCurrentUser } from "@/lib/auth/auth.server";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

const companyBasicsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  companyType: z.string().trim().min(2).max(80),
  country: z.string().trim().min(2).max(80),
  stateProvince: z.string().trim().min(2).max(100),
  address: z.string().trim().min(4).max(240),
});

const companyDetailsSchema = z.object({
  website: z.union([
    z.literal(""),
    z
      .url()
      .max(240)
      .refine(
        (value) => ["http:", "https:"].includes(new URL(value).protocol),
        "Use an http or https website URL.",
      ),
  ]),
  size: z.string().trim().max(40),
  about: z.string().trim().max(1200),
});

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "company"
  );
}

export const getCompanyFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireCurrentUser();
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
);

export const saveCompanyBasicsFn = createServerFn({ method: "POST" })
  .validator(companyBasicsSchema)
  .handler(async ({ data }) => {
    const user = await requireCurrentUser();
    if (user.accountType !== "employer")
      throw new Error("Only employer accounts can manage a company.");

    const supabase = getSupabaseServerClient();
    const { data: existing, error: lookupError } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lookupError) throw lookupError;

    const payload = {
      name: data.name,
      company_type: data.companyType,
      country: data.country,
      state_province: data.stateProvince,
      address: data.address,
    };

    const query = existing
      ? supabase
          .from("companies")
          .update(payload)
          .eq("id", existing.id)
          .eq("owner_id", user.id)
      : supabase.from("companies").insert({
          ...payload,
          owner_id: user.id,
          slug: `${slugify(data.name)}-${crypto.randomUUID().slice(0, 6)}`,
        });
    const { error } = await query.select("id").single();
    if (error) throw error;

    return { ok: true as const };
  });

export const finishCompanyOnboardingFn = createServerFn({ method: "POST" })
  .validator(companyDetailsSchema)
  .handler(async ({ data }) => {
    const user = await requireCurrentUser();
    if (user.accountType !== "employer")
      throw new Error("Only employer accounts can manage a company.");

    const supabase = getSupabaseServerClient();
    const { data: existing, error: lookupError } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (!existing)
      throw new Error("Save your company basics before completing setup.");

    const { error } = await supabase
      .from("companies")
      .update({
        website: data.website || null,
        size: data.size || null,
        about: data.about || null,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("owner_id", user.id)
      .select("id")
      .single();
    if (error) throw error;

    return { ok: true as const };
  });
