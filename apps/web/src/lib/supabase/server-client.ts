import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import type { Database } from "@stellarjob/supabase";

function readSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  return { url, publishableKey };
}

export function isSupabaseConfigured() {
  const { url, publishableKey } = readSupabaseConfig();
  if (!url || !publishableKey) return false;
  if (url.includes("PleaseChangeMe") || url.includes("your-project"))
    return false;
  if (
    publishableKey.includes("PleaseChangeMe") ||
    publishableKey.includes("your_key")
  )
    return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" ||
      (parsed.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(parsed.hostname))
    );
  } catch {
    return false;
  }
}

export function getSupabaseServerClient() {
  const { url, publishableKey } = readSupabaseConfig();

  if (!isSupabaseConfigured() || !url || !publishableKey) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({
          name,
          value,
        }));
      },
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) => {
          setCookie(name, value, options);
        });
      },
    },
  });
}
