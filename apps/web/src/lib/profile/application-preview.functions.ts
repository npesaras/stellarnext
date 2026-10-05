import { createServerFn } from "@tanstack/react-start";

import { requireCurrentUser } from "@/lib/auth/auth.server";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export const getApplicationProfilePreviewFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const user = await requireCurrentUser();
  if (user.accountType !== "applicant")
    throw new Error("Only applicants can review an application profile.");

  const { data, error } = await getSupabaseServerClient()
    .from("profiles")
    .select("first_name, last_name, headline, city, country, cv_url")
    .eq("id", user.id)
    .single();
  if (error) throw error;
  return data;
});
