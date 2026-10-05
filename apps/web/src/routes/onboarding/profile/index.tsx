import {
  createFileRoute,
  redirect,
  useHydrated,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CircleAlert, UserRoundCheck } from "lucide-react";
import { useState, type FormEvent } from "react";

import { BrandMark } from "@/components/brand-mark";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { COUNTRIES } from "@/data/employer";
import {
  getProfileBasicsFn,
  saveProfileBasicsFn,
} from "@/lib/profile/profile.functions";

export const Route = createFileRoute("/onboarding/profile/")({
  beforeLoad: ({ context }) => {
    const user = context.user;
    if (!user) throw redirect({ to: "/sign-in", search: { mode: "signin" } });
    if (user.accountType === "employer")
      throw redirect({ to: "/employer/onboarding" });
    if (user.profileBasicsComplete) {
      throw redirect({
        to: user.onboardingComplete ? "/dashboard" : "/profile/onboarding",
      });
    }
  },
  loader: () => getProfileBasicsFn(),
  component: ProfileStartPage,
  head: () => ({ meta: [{ title: "Set up your profile — StellarJob" }] }),
});

function ProfileStartPage() {
  const profile = Route.useLoaderData();
  const hydrated = useHydrated();
  const saveBasics = useServerFn(saveProfileBasicsFn);
  const navigate = useNavigate();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const firstName = String(values.get("firstName") ?? "");
    const lastName = String(values.get("lastName") ?? "");
    const country = String(values.get("country") ?? "");
    setPending(true);
    setError("");
    try {
      await saveBasics({ data: { firstName, lastName, country } });
      await router.invalidate({ sync: true });
      await navigate({ to: "/profile/onboarding" });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not save your details.",
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
      <section className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-4 pb-16 pt-10 sm:pt-16">
        <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
          <UserRoundCheck aria-hidden="true" className="size-8" />
        </span>
        <Badge variant="secondary" className="mt-6">
          Step 1 of 2
        </Badge>
        <h1 className="mt-4 text-center text-3xl font-semibold tracking-tight">
          Welcome to StellarJob
        </h1>
        <p className="mt-3 text-center text-muted-foreground">
          Your account is ready. Start with a few personal details, then build
          your job-seeker profile.
        </p>
        <Card className="mt-8 w-full">
          <CardHeader>
            <CardTitle>Set up your profile</CardTitle>
            <CardDescription>
              Use your real name so employers can recognize your applications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive" className="mb-6">
                <CircleAlert aria-hidden="true" />
                <AlertTitle>Could not save</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <form onSubmit={submit}>
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="firstName">First name</FieldLabel>
                    <Input
                      id="firstName"
                      name="firstName"
                      autoComplete="given-name"
                      defaultValue={profile.first_name ?? ""}
                      maxLength={80}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                    <Input
                      id="lastName"
                      name="lastName"
                      autoComplete="family-name"
                      defaultValue={profile.last_name ?? ""}
                      maxLength={80}
                      required
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="country">Country</FieldLabel>
                  <Input
                    id="country"
                    name="country"
                    autoComplete="country-name"
                    list="country-suggestions"
                    defaultValue={profile.country ?? ""}
                    placeholder="Enter your country"
                    maxLength={100}
                    required
                  />
                  <datalist id="country-suggestions">
                    {COUNTRIES.filter((country) => country !== "Other").map(
                      (country) => (
                        <option key={country} value={country} />
                      ),
                    )}
                  </datalist>
                  <FieldDescription>
                    You can type a country if it is not in the suggestions.
                  </FieldDescription>
                </Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!hydrated || pending}
                >
                  {pending ? <Spinner data-icon="inline-start" /> : null}
                  {pending ? "Saving…" : "Continue"}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
