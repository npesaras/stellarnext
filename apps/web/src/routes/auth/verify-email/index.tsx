import { Link, createFileRoute, useHydrated } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CircleAlert, MailCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { BrandMark } from "@/components/brand-mark";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { resendSignupEmailFn } from "@/lib/auth/auth.functions";

export const Route = createFileRoute("/auth/verify-email/")({
  component: VerifyEmailPage,
  head: () => ({ meta: [{ title: "Verify your email — StellarJob" }] }),
});

function VerifyEmailPage() {
  const hydrated = useHydrated();
  const resend = useServerFn(resendSignupEmailFn);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setEmail(sessionStorage.getItem("stellarjob-pending-email") ?? "");
  }, []);

  async function sendAgain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setNotice("");
    setError("");
    try {
      await resend({ data: { email } });
      sessionStorage.setItem("stellarjob-pending-email", email);
      setNotice(
        "If this address has a pending account, another verification email is on its way.",
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not resend the email.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="px-6 py-6 sm:px-10">
        <BrandMark />
      </header>
      <section className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-4 pb-16 pt-16 text-center sm:pt-28">
        <span className="flex size-20 items-center justify-center rounded-full bg-secondary text-primary">
          <MailCheck aria-hidden="true" className="size-10" />
        </span>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight">
          Verify your email to continue
        </h1>
        <p className="mt-4 text-muted-foreground">
          We sent a confirmation link to your email address. Open it to activate
          your account, then we’ll help you set up your profile.
        </p>
        <form className="mt-8 w-full max-w-sm text-left" onSubmit={sendAgain}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="verification-email">
                Email address
              </FieldLabel>
              <Input
                id="verification-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                maxLength={255}
                required
              />
              <FieldDescription>
                Check your spam folder if the message is missing.
              </FieldDescription>
            </Field>
            <Button
              type="submit"
              variant="outline"
              disabled={!hydrated || pending}
            >
              {pending ? <Spinner data-icon="inline-start" /> : null}
              Send again
            </Button>
          </FieldGroup>
        </form>
        {notice ? (
          <Alert className="mt-6 text-left">
            <AlertTitle>Email requested</AlertTitle>
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        ) : null}
        {error ? (
          <Alert variant="destructive" className="mt-6 text-left">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>Could not send</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <p className="mt-8 text-sm text-muted-foreground">
          Already verified?{" "}
          <Link
            to="/sign-in"
            search={{ mode: "signin" }}
            className="font-medium text-primary underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
