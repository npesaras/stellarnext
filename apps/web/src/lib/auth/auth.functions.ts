import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import {
  getPostAuthPath,
  readCurrentUser,
  type AccountType,
  type CurrentUser,
} from "./auth.server";
import {
  getSupabaseServerClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server-client";

const credentialsSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(1).max(128),
  redirect: z.string().optional(),
});

const signUpSchema = credentialsSchema.extend({
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/\d/, "Add at least one number.")
    .regex(/[^A-Za-z0-9]/, "Add at least one special character."),
  accountType: z.enum(["applicant", "employer"]),
});

function safeRedirect(value: string | undefined) {
  if (
    !value?.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("\0")
  )
    return null;
  return value;
}

function postAuthRedirect(user: CurrentUser, requested: string | undefined) {
  if (
    !user.onboardingComplete ||
    (user.accountType === "applicant" && !user.profileBasicsComplete)
  ) {
    return getPostAuthPath(user);
  }
  return safeRedirect(requested) ?? getPostAuthPath(user);
}

function friendlyAuthError(message: string) {
  if (message.toLowerCase().includes("invalid login")) {
    return "The email or password is incorrect.";
  }
  if (message.toLowerCase().includes("already registered")) {
    return "An account already exists for this email.";
  }
  return message;
}

export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(
  async () => {
    if (!isSupabaseConfigured()) return null;
    return readCurrentUser();
  },
);

export const signInFn = createServerFn({ method: "POST" })
  .validator(credentialsSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error)
      return { ok: false as const, message: friendlyAuthError(error.message) };

    const user = await readCurrentUser();
    if (!user)
      return { ok: false as const, message: "We could not load your account." };

    return {
      ok: true as const,
      redirectTo: postAuthRedirect(user, data.redirect),
    };
  });

export const signUpFn = createServerFn({ method: "POST" })
  .validator(signUpSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const accountType: AccountType = data.accountType;
    const callback = new URL("/auth/callback", getRequest().url);
    const next = safeRedirect(data.redirect);
    if (next) callback.searchParams.set("next", next);
    const { data: auth, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: callback.toString(),
        data: { account_type: accountType },
      },
    });

    if (error)
      return { ok: false as const, message: friendlyAuthError(error.message) };

    if (auth.user && auth.session) {
      return {
        ok: true as const,
        needsEmailConfirmation: false,
        redirectTo:
          accountType === "employer"
            ? "/employer/onboarding"
            : "/onboarding/profile",
      };
    }

    return {
      ok: true as const,
      needsEmailConfirmation: true,
      redirectTo: "/auth/verify-email",
    };
  });

export const resendSignupEmailFn = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.email().max(255) }))
  .handler(async ({ data }) => {
    const callback = new URL("/auth/callback", getRequest().url);
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: data.email,
      options: { emailRedirectTo: callback.toString() },
    });
    if (error) throw new Error(friendlyAuthError(error.message));
    return { ok: true as const };
  });

const googleSchema = z.object({
  mode: z.enum(["signin", "signup"]),
  accountType: z.enum(["applicant", "employer"]),
  redirect: z.string().optional(),
});

export const startGoogleOAuthFn = createServerFn({ method: "POST" })
  .validator(googleSchema)
  .handler(async ({ data }) => {
    if (data.mode === "signup" && data.accountType === "employer") {
      throw new Error(
        "Employers can create an account with email and password.",
      );
    }
    const supabase = getSupabaseServerClient();
    const callback = new URL("/auth/callback", getRequest().url);
    const next = safeRedirect(data.redirect);
    if (next) callback.searchParams.set("next", next);
    const { data: result, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString(), skipBrowserRedirect: true },
    });
    if (error) throw error;
    if (!result.url) throw new Error("Google sign-in did not return a URL.");
    return { url: result.url };
  });

export const completeAuthCallbackFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: z.string().min(1).max(2048),
      redirect: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: auth, error } = await supabase.auth.exchangeCodeForSession(
      data.code,
    );
    if (error || !auth.user)
      throw error ?? new Error("Could not complete account verification.");
    const user = await readCurrentUser();
    if (!user)
      throw new Error("Could not load your account after verification.");
    return { redirectTo: postAuthRedirect(user, data.redirect) };
  });

export const signOutFn = createServerFn({ method: "POST" }).handler(
  async () => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { ok: true as const };
  },
);
