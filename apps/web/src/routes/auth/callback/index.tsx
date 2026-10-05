import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { completeAuthCallbackFn } from "@/lib/auth/auth.functions";

export const Route = createFileRoute("/auth/callback/")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === "string" ? search.code : "",
    redirect: typeof search.next === "string" ? search.next : undefined,
    authError:
      typeof search.error_description === "string"
        ? search.error_description
        : undefined,
  }),
  loaderDeps: ({ search }) => ({
    code: search.code,
    redirect: search.redirect,
    authError: search.authError,
  }),
  loader: async ({ deps }) => {
    if (!deps.code)
      return {
        redirectTo: null,
        error: deps.authError ?? "This sign-in link is invalid or has expired.",
      };
    try {
      const result = await completeAuthCallbackFn({
        data: { code: deps.code, redirect: deps.redirect },
      });
      return { redirectTo: result.redirectTo, error: null };
    } catch (error) {
      return {
        redirectTo: null,
        error:
          error instanceof Error
            ? error.message
            : "Could not verify this account.",
      };
    }
  },
  component: GoogleCallbackPage,
  head: () => ({ meta: [{ title: "Completing sign-in — StellarJob" }] }),
});

function GoogleCallbackPage() {
  const { redirectTo, error } = Route.useLoaderData();
  useEffect(() => {
    if (redirectTo) {
      sessionStorage.removeItem("stellarjob-pending-email");
      window.location.replace(redirectTo);
    }
  }, [redirectTo]);

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {error ? "Verification failed" : "Account verified"}
          </CardTitle>
          <CardDescription>
            {error ?? "Your account is ready. Redirecting you now…"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Button asChild>
              <Link to="/sign-in" search={{ mode: "signin" }}>
                Return to sign in
              </Link>
            </Button>
          ) : (
            <Spinner aria-label="Signing in" />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
