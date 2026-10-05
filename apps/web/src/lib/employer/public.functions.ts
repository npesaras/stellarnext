import { createServerFn } from "@tanstack/react-start";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export const listVerifiedCompaniesFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id, name")
    .eq("verified", true)
    .order("name")
    .limit(12);
  if (error) throw error;
  return data ?? [];
});
