import {
  Link,
  createFileRoute,
  useHydrated,
  useRouter,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  CircleAlert,
  Eye,
  EyeOff,
  UserRoundSearch,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { BrandMark } from "@/components/brand-mark";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  signInFn,
  signUpFn,
  startGoogleOAuthFn,
} from "@/lib/auth/auth.functions";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";
type AccountType = "applicant" | "employer";
type AuthStep = "role" | "email" | "password";
type AuthSearch = { mode?: AuthMode; redirect?: string; role?: AccountType };

export const Route = createFileRoute("/sign-in/")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search.mode === "signup" ? "signup" : "signin",
    ...(typeof search.redirect === "string"
      ? { redirect: search.redirect }
      : {}),
    ...(search.role === "applicant" || search.role === "employer"
      ? { role: search.role }
      : {}),
  }),
  component: SignInPage,
  head: () => ({ meta: [{ title: "Join or sign in — StellarNext" }] }),
});

function SignInPage() {
  const search = Route.useSearch();
  const mode = search.mode ?? "signin";
  const hydrated = useHydrated();
  const router = useRouter();
  const signIn = useServerFn(signInFn);
  const signUp = useServerFn(signUpFn);
  const startGoogleOAuth = useServerFn(startGoogleOAuthFn);
  const [step, setStep] = useState<AuthStep>(
    mode === "signup" ? "role" : "email",
  );
  const [accountType, setAccountType] = useState<AccountType | null>(
    search.role ?? null,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setStep(mode === "signup" ? "role" : "email");
    setAccountType(search.role ?? null);
    setError("");
  }, [mode, search.role]);

  const passwordChecks = [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "At least 1 number", passed: /\d/.test(password) },
    {
      label: "At least 1 special character",
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ];
  const strongPassword = passwordChecks.every((check) => check.passed);

  function continueWithEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStep("password");
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedType = accountType;
    if (mode === "signup" && (!selectedType || !strongPassword)) return;
    setPending(true);
    setError("");
    try {
      const result =
        mode === "signin"
          ? await signIn({
              data: { email, password, redirect: search.redirect },
            })
          : await signUp({
              data: {
                email,
                password,
                accountType: selectedType ?? "applicant",
                redirect: search.redirect,
              },
            });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      if ("needsEmailConfirmation" in result && result.needsEmailConfirmation) {
        sessionStorage.setItem("stellarjob-pending-email", email);
        window.location.assign(result.redirectTo);
        return;
      }
      await router.invalidate({ sync: true });
      window.location.assign(result.redirectTo);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not continue. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function handleGoogle() {
    setPending(true);
    setError("");
    try {
      const { url } = await startGoogleOAuth({
        data: {
          mode,
          accountType: accountType ?? "applicant",
          redirect: search.redirect,
        },
      });
      window.location.assign(url);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Google sign-in failed.",
      );
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="px-6 py-6 sm:px-10">
        <BrandMark />
      </header>
      <section className="flex flex-1 justify-center px-4 pb-16 pt-12 sm:pt-20">
        {mode === "signup" && step === "role" ? (
          <div className="w-full max-w-3xl text-center">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              How will you use StellarNext?
            </h1>
            <p className="mt-3 text-muted-foreground">
              Choose the workspace you want to create.
            </p>
            <FieldSet className="mt-10">
              <FieldLegend className="sr-only">Account type</FieldLegend>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    value: "applicant" as const,
                    title: "I'm looking for work",
                    description: "Build a profile and apply for jobs.",
                    Icon: UserRoundSearch,
                  },
                  {
                    value: "employer" as const,
                    title: "I'm hiring talent",
                    description:
                      "Set up a company profile for your hiring workspace.",
                    Icon: BriefcaseBusiness,
                  },
                ].map(({ value, title, description, Icon }) => (
                  <label
                    key={value}
                    className={cn(
                      "flex min-h-44 cursor-pointer flex-col rounded-xl border bg-card p-6 text-left transition-colors hover:border-primary focus-within:ring-2 focus-within:ring-ring",
                      accountType === value && "border-primary bg-secondary/50",
                    )}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value={value}
                      checked={accountType === value}
                      onChange={() => setAccountType(value)}
                      className="sr-only"
                    />
                    <span className="flex items-start justify-between">
                      <Icon aria-hidden="true" className="size-7" />
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex size-5 items-center justify-center rounded-full border",
                          accountType === value && "border-primary",
                        )}
                      >
                        {accountType === value ? (
                          <span className="size-2.5 rounded-full bg-primary" />
                        ) : null}
                      </span>
                    </span>
                    <span className="mt-6 text-lg font-semibold">{title}</span>
                    <span className="mt-1 text-sm text-muted-foreground">
                      {description}
                    </span>
                  </label>
                ))}
              </div>
            </FieldSet>
            <Button
              className="mt-8 min-w-52"
              disabled={!accountType || !hydrated}
              onClick={() => setStep("email")}
            >
              Create account
            </Button>
            <p className="mt-5 text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/sign-in"
                search={{ mode: "signin" }}
                className="font-medium text-primary underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        ) : (
          <div className="w-full max-w-lg">
            <Card className="shadow-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {mode === "signup" ? "Let's get started" : "Welcome back"}
                </CardTitle>
                <CardDescription>
                  {mode === "signup"
                    ? "Create your StellarNext account to get started."
                    : "Sign in to manage your profile and applications."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {error ? (
                  <Alert variant="destructive">
                    <CircleAlert aria-hidden="true" />
                    <AlertTitle>We could not continue</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
                {step === "email" ? (
                  <>
                    <form onSubmit={continueWithEmail}>
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="email">Email</FieldLabel>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            required
                            maxLength={255}
                          />
                        </Field>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={!hydrated}
                        >
                          Continue
                        </Button>
                      </FieldGroup>
                    </form>
                    {mode === "signin" || accountType === "applicant" ? (
                      <>
                        <p className="text-center text-sm text-muted-foreground">
                          or continue with
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          disabled={!hydrated || pending}
                          onClick={handleGoogle}
                        >
                          {pending ? (
                            <Spinner data-icon="inline-start" />
                          ) : null}{" "}
                          Google
                        </Button>
                      </>
                    ) : null}
                  </>
                ) : (
                  <form onSubmit={submitPassword}>
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Email</FieldLabel>
                        <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3 text-sm">
                          <span className="truncate">{email}</span>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={() => setStep("email")}
                          >
                            Edit
                          </Button>
                        </div>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="password">
                          {mode === "signup" ? "Create a password" : "Password"}
                        </FieldLabel>
                        <div className="flex gap-2">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete={
                              mode === "signup"
                                ? "new-password"
                                : "current-password"
                            }
                            value={password}
                            onChange={(event) =>
                              setPassword(event.target.value)
                            }
                            minLength={mode === "signup" ? 8 : 1}
                            maxLength={128}
                            required
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            onClick={() => setShowPassword((value) => !value)}
                          >
                            {showPassword ? (
                              <EyeOff aria-hidden="true" />
                            ) : (
                              <Eye aria-hidden="true" />
                            )}
                          </Button>
                        </div>
                        {mode === "signup" ? (
                          <FieldDescription>
                            <ul className="mt-2 flex flex-col gap-1">
                              {passwordChecks.map((check) => (
                                <li
                                  key={check.label}
                                  className={cn(
                                    "flex items-center gap-2",
                                    check.passed && "text-success",
                                  )}
                                >
                                  <Check
                                    aria-hidden="true"
                                    className="size-4"
                                  />{" "}
                                  {check.label}
                                </li>
                              ))}
                            </ul>
                          </FieldDescription>
                        ) : null}
                      </Field>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={
                          !hydrated ||
                          pending ||
                          (mode === "signup" && !strongPassword)
                        }
                      >
                        {pending ? <Spinner data-icon="inline-start" /> : null}
                        {pending
                          ? "Please wait…"
                          : mode === "signup"
                            ? "Create account"
                            : "Sign in"}
                      </Button>
                    </FieldGroup>
                  </form>
                )}
                {mode === "signup" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="self-start"
                    onClick={() => {
                      setStep("role");
                      setError("");
                    }}
                  >
                    <ArrowLeft data-icon="inline-start" aria-hidden="true" />{" "}
                    Change account type
                  </Button>
                ) : null}
              </CardContent>
            </Card>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signup"
                ? "Already have an account?"
                : "New to StellarNext?"}{" "}
              <Link
                to="/sign-in"
                search={{ mode: mode === "signup" ? "signin" : "signup" }}
                className="font-medium text-primary underline underline-offset-4"
              >
                {mode === "signup" ? "Sign in" : "Create an account"}
              </Link>
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
