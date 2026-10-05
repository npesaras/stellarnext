import { redirect } from "@tanstack/react-router";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export type AccountType = "applicant" | "employer";

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string | null;
  accountType: AccountType;
  profileBasicsComplete: boolean;
  onboardingComplete: boolean;
};

export async function readCurrentUser(): Promise<CurrentUser | null> {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "display_name, account_type, first_name, last_name, city, country, onboarding_completed_at",
    )
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile) throw new Error("Your account profile could not be loaded.");

  const accountType =
    profile.account_type === "employer" ? "employer" : "applicant";
  let employerOnboardingComplete = false;
  if (accountType === "employer") {
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select(
        "name, company_type, country, state_province, address, onboarding_completed_at",
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (companyError) throw companyError;
    employerOnboardingComplete = Boolean(
      company?.onboarding_completed_at &&
      company.name?.trim() &&
      company.company_type?.trim() &&
      company.country?.trim() &&
      company.state_province?.trim() &&
      company.address?.trim(),
    );
  }

  return {
    id: user.id,
    email: user.email ?? "",
    displayName:
      profile.display_name ??
      (typeof user.user_metadata.display_name === "string"
        ? user.user_metadata.display_name
        : null),
    accountType,
    profileBasicsComplete: Boolean(
      profile.first_name?.trim() &&
      profile.last_name?.trim() &&
      profile.country?.trim(),
    ),
    onboardingComplete:
      accountType === "employer"
        ? employerOnboardingComplete
        : Boolean(
            profile.onboarding_completed_at &&
            profile.first_name?.trim() &&
            profile.last_name?.trim() &&
            profile.city?.trim() &&
            profile.country?.trim(),
          ),
  };
}

export async function requireCurrentUser() {
  const user = await readCurrentUser();

  if (!user) {
    throw redirect({ to: "/sign-in", search: { mode: "signin" } });
  }

  return user;
}

export function getPostAuthPath(user: CurrentUser) {
  if (user.accountType === "employer")
    return user.onboardingComplete ? "/dashboard" : "/employer/onboarding";
  if (!user.profileBasicsComplete) return "/onboarding/profile";
  if (!user.onboardingComplete) return "/profile/onboarding";
  return "/dashboard";
}
