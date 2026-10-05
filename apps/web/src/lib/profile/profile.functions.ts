import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireCurrentUser } from "@/lib/auth/auth.server";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

const optionalText = z.string().trim().max(500).optional().default("");

const experienceSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(120),
  city: z.string().trim().max(100).default(""),
  country: z.string().trim().max(100).default(""),
  isCurrent: z.boolean().default(false),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  description: z.string().trim().max(1000).default(""),
});

const educationSchema = z.object({
  id: z.uuid().optional(),
  degree: z.string().trim().min(2).max(120),
  school: z.string().trim().min(2).max(160),
  fieldOfStudy: z.string().trim().max(120).default(""),
  city: z.string().trim().max(100).default(""),
  country: z.string().trim().max(100).default(""),
  isCurrent: z.boolean().default(false),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

const certificationSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2).max(160),
  issuer: z.string().trim().max(160).default(""),
});

const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  headline: z.string().trim().max(140).default(""),
  city: optionalText,
  country: optionalText,
  streetAddress: z.string().trim().max(240).default(""),
  postalCode: z.string().trim().max(30).default(""),
  phone: z.string().trim().max(40).default(""),
  summary: z.string().trim().max(1200).default(""),
  skills: z.array(z.string().trim().min(1).max(60)).max(30),
  experiences: z.array(experienceSchema).max(12),
  education: z.array(educationSchema).max(8),
  certifications: z.array(certificationSchema).max(20),
  completeOnboarding: z.boolean().default(false),
  wizardStep: z
    .enum([
      "name",
      "location",
      "experience",
      "education",
      "certifications",
      "skills",
      "review",
    ])
    .optional(),
});

const profileBasicsSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  country: z.string().trim().min(2).max(100),
});

export const getProfileBasicsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireCurrentUser();
    if (user.accountType !== "applicant")
      throw new Error("Applicant profile required.");
    const { data, error } = await getSupabaseServerClient()
      .from("profiles")
      .select("first_name, last_name, country")
      .eq("id", user.id)
      .single();
    if (error) throw error;
    return data;
  },
);

export const saveProfileBasicsFn = createServerFn({ method: "POST" })
  .validator(profileBasicsSchema)
  .handler(async ({ data }) => {
    const user = await requireCurrentUser();
    if (user.accountType !== "applicant")
      throw new Error("Applicant profile required.");
    const { error } = await getSupabaseServerClient()
      .from("profiles")
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        display_name: `${data.firstName} ${data.lastName}`,
        country: data.country,
      })
      .eq("id", user.id)
      .select("id")
      .single();
    if (error) throw error;
    return { ok: true as const };
  });

export const getProfileFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireCurrentUser();
    if (user.accountType !== "applicant")
      throw new Error("Applicant profile required.");
    const supabase = getSupabaseServerClient();
    const [profile, experience, education, skills, certifications] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("experience")
          .select(
            "id, title, company, city, country, is_current, start_date, end_date, description",
          )
          .eq("user_id", user.id)
          .order("sort_order"),
        supabase
          .from("education")
          .select(
            "id, degree, school, field_of_study, city, country, is_current, start_date, end_date",
          )
          .eq("user_id", user.id),
        supabase
          .from("skills")
          .select("id, label")
          .eq("user_id", user.id)
          .order("sort_order"),
        supabase
          .from("certifications")
          .select("id, name, issuer, issued_year")
          .eq("user_id", user.id)
          .order("sort_order"),
      ]);

    const firstError = [
      profile.error,
      experience.error,
      education.error,
      skills.error,
      certifications.error,
    ].find(Boolean);
    if (firstError) throw firstError;

    return {
      profile: profile.data,
      experience: experience.data ?? [],
      education: education.data ?? [],
      skills: skills.data ?? [],
      certifications: certifications.data ?? [],
    };
  },
);

export const saveProfileFn = createServerFn({ method: "POST" })
  .validator(profileSchema)
  .handler(async ({ data }) => {
    const user = await requireCurrentUser();
    if (user.accountType !== "applicant")
      throw new Error("Applicant profile required.");
    if (
      data.completeOnboarding &&
      (!data.city.trim() || !data.country.trim())
    ) {
      throw new Error(
        "Add your city and country before finishing your profile.",
      );
    }
    const supabase = getSupabaseServerClient();
    if (data.wizardStep === "name") {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          display_name: `${data.firstName} ${data.lastName}`.trim(),
          headline: data.headline || null,
          summary: data.summary || null,
        })
        .eq("id", user.id)
        .select("id")
        .single();
      if (error) throw error;
      return {
        ok: true as const,
        experienceIds: [],
        educationIds: [],
        certificationIds: [],
      };
    }
    if (data.wizardStep === "location") {
      const { error } = await supabase
        .from("profiles")
        .update({
          city: data.city || null,
          country: data.country || null,
          street_address: data.streetAddress || null,
          postal_code: data.postalCode || null,
          phone: data.phone || null,
        })
        .eq("id", user.id)
        .select("id")
        .single();
      if (error) throw error;
      return {
        ok: true as const,
        experienceIds: [],
        educationIds: [],
        certificationIds: [],
      };
    }
    if (data.wizardStep === "review") {
      const { data: stored, error: readError } = await supabase
        .from("profiles")
        .select("first_name, last_name, city, country")
        .eq("id", user.id)
        .single();
      if (readError) throw readError;
      if (
        !stored.first_name?.trim() ||
        !stored.last_name?.trim() ||
        !stored.city?.trim() ||
        !stored.country?.trim()
      ) {
        throw new Error(
          "Complete your name and location before finishing your profile.",
        );
      }
      if (data.completeOnboarding) {
        const { error } = await supabase
          .from("profiles")
          .update({ onboarding_completed_at: new Date().toISOString() })
          .eq("id", user.id)
          .select("id")
          .single();
        if (error) throw error;
      }
      return {
        ok: true as const,
        experienceIds: [],
        educationIds: [],
        certificationIds: [],
      };
    }

    const saveExperience = !data.wizardStep || data.wizardStep === "experience";
    const saveEducation = !data.wizardStep || data.wizardStep === "education";
    const saveCertifications =
      !data.wizardStep || data.wizardStep === "certifications";
    const saveSkills = !data.wizardStep || data.wizardStep === "skills";
    const displayName = `${data.firstName} ${data.lastName}`.trim();
    const { error: profileError } = !data.wizardStep
      ? await supabase
          .from("profiles")
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            display_name: displayName,
            headline: data.headline || null,
            city: data.city || null,
            country: data.country || null,
            street_address: data.streetAddress || null,
            postal_code: data.postalCode || null,
            phone: data.phone || null,
            summary: data.summary || null,
          })
          .eq("id", user.id)
          .select("id")
          .single()
      : { error: null };
    if (profileError) throw profileError;

    const [
      existingExperience,
      existingEducation,
      existingCertifications,
      existingSkills,
    ] = await Promise.all([
      saveExperience
        ? supabase.from("experience").select("id").eq("user_id", user.id)
        : Promise.resolve({ data: [] as Array<{ id: string }>, error: null }),
      saveEducation
        ? supabase.from("education").select("id").eq("user_id", user.id)
        : Promise.resolve({ data: [] as Array<{ id: string }>, error: null }),
      saveCertifications
        ? supabase.from("certifications").select("id").eq("user_id", user.id)
        : Promise.resolve({ data: [] as Array<{ id: string }>, error: null }),
      saveSkills
        ? supabase.from("skills").select("id, label").eq("user_id", user.id)
        : Promise.resolve({
            data: [] as Array<{ id: string; label: string }>,
            error: null,
          }),
    ]);
    const readError = [
      existingExperience.error,
      existingEducation.error,
      existingCertifications.error,
      existingSkills.error,
    ].find(Boolean);
    if (readError) throw readError;

    function validateOwnedIds(
      submitted: Array<{ id?: string }>,
      owned: Array<{ id: string }>,
    ) {
      const ownedIds = new Set(owned.map((row) => row.id));
      if (submitted.some((row) => row.id && !ownedIds.has(row.id))) {
        throw new Error(
          "A profile entry no longer belongs to this account. Reload and try again.",
        );
      }
      const submittedIds = new Set(
        submitted.map((row) => row.id).filter(Boolean),
      );
      return owned
        .filter((row) => !submittedIds.has(row.id))
        .map((row) => row.id);
    }

    const removedExperience = saveExperience
      ? validateOwnedIds(data.experiences, existingExperience.data ?? [])
      : [];
    const removedEducation = saveEducation
      ? validateOwnedIds(data.education, existingEducation.data ?? [])
      : [];
    const removedCertifications = saveCertifications
      ? validateOwnedIds(data.certifications, existingCertifications.data ?? [])
      : [];

    const experienceIds: string[] = [];
    const educationIds: string[] = [];
    const certificationIds: string[] = [];

    for (const [index, item] of (saveExperience
      ? data.experiences
      : []
    ).entries()) {
      const payload = {
        title: item.title,
        company: item.company,
        city: item.city || null,
        country: item.country || null,
        is_current: item.isCurrent,
        start_date: item.startDate,
        end_date: item.isCurrent ? null : item.endDate,
        description: item.description || null,
        sort_order: index,
      };
      const { data: saved, error } = item.id
        ? await supabase
            .from("experience")
            .update(payload)
            .eq("id", item.id)
            .eq("user_id", user.id)
            .select("id")
            .single()
        : await supabase
            .from("experience")
            .insert({ ...payload, user_id: user.id })
            .select("id")
            .single();
      if (error) throw error;
      experienceIds.push(saved.id);
    }
    for (const item of saveEducation ? data.education : []) {
      const payload = {
        degree: item.degree,
        level: item.degree,
        school: item.school,
        field_of_study: item.fieldOfStudy || null,
        city: item.city || null,
        country: item.country || null,
        is_current: item.isCurrent,
        start_date: item.startDate,
        end_date: item.isCurrent ? null : item.endDate,
      };
      const { data: saved, error } = item.id
        ? await supabase
            .from("education")
            .update(payload)
            .eq("id", item.id)
            .eq("user_id", user.id)
            .select("id")
            .single()
        : await supabase
            .from("education")
            .insert({ ...payload, user_id: user.id })
            .select("id")
            .single();
      if (error) throw error;
      educationIds.push(saved.id);
    }
    for (const [index, item] of (saveCertifications
      ? data.certifications
      : []
    ).entries()) {
      const payload = {
        name: item.name,
        issuer: item.issuer || null,
        sort_order: index,
      };
      const { data: saved, error } = item.id
        ? await supabase
            .from("certifications")
            .update(payload)
            .eq("id", item.id)
            .eq("user_id", user.id)
            .select("id")
            .single()
        : await supabase
            .from("certifications")
            .insert({ ...payload, user_id: user.id })
            .select("id")
            .single();
      if (error) throw error;
      certificationIds.push(saved.id);
    }

    const skillLabels = [
      ...new Set(data.skills.map((label) => label.trim()).filter(Boolean)),
    ];
    const ownedSkills = existingSkills.data ?? [];
    for (const [index, label] of (saveSkills ? skillLabels : []).entries()) {
      const existing = ownedSkills.find((row) => row.label === label);
      const { error } = existing
        ? await supabase
            .from("skills")
            .update({ sort_order: index })
            .eq("id", existing.id)
            .eq("user_id", user.id)
        : await supabase
            .from("skills")
            .insert({ user_id: user.id, label, sort_order: index });
      if (error) throw error;
    }

    for (const [table, ids] of [
      ["experience", removedExperience],
      ["education", removedEducation],
      ["certifications", removedCertifications],
    ] as const) {
      if (!ids.length) continue;
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("user_id", user.id)
        .in("id", ids);
      if (error) throw error;
    }
    const removedSkills = (saveSkills ? ownedSkills : [])
      .filter((row) => !skillLabels.includes(row.label))
      .map((row) => row.id);
    if (removedSkills.length) {
      const { error } = await supabase
        .from("skills")
        .delete()
        .eq("user_id", user.id)
        .in("id", removedSkills);
      if (error) throw error;
    }

    if (data.completeOnboarding) {
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw error;
    }

    return { ok: true as const, experienceIds, educationIds, certificationIds };
  });
