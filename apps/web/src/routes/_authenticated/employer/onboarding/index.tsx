import {
  Link,
  createFileRoute,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Building2, CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { COMPANY_TYPES, COUNTRIES, PH_REGIONS } from "@/data/employer";
import {
  finishCompanyOnboardingFn,
  getCompanyFn,
  saveCompanyBasicsFn,
} from "@/lib/employer/company.functions";

export const Route = createFileRoute("/_authenticated/employer/onboarding/")({
  beforeLoad: ({ context }) => {
    if (context.user.accountType !== "employer")
      throw redirect({ to: "/dashboard" });
  },
  loader: () => getCompanyFn(),
  component: EmployerOnboardingPage,
  head: () => ({ meta: [{ title: "Company setup — StellarNext" }] }),
});

type Step = "basics" | "details" | "done";

function EmployerOnboardingPage() {
  const company = Route.useLoaderData();
  const saveBasics = useServerFn(saveCompanyBasicsFn);
  const finishSetup = useServerFn(finishCompanyOnboardingFn);
  const router = useRouter();
  const [step, setStep] = useState<Step>(
    company?.onboarding_completed_at ? "done" : company ? "details" : "basics",
  );
  const [pending, setPending] = useState(false);
  const [name, setName] = useState(company?.name ?? "");
  const [companyType, setCompanyType] = useState(
    company?.company_type ?? COMPANY_TYPES[0],
  );
  const [country, setCountry] = useState(company?.country ?? "Philippines");
  const [region, setRegion] = useState(company?.state_province ?? "");
  const [address, setAddress] = useState(company?.address ?? "");
  const [website, setWebsite] = useState(company?.website ?? "");
  const [size, setSize] = useState(company?.size ?? "");
  const [about, setAbout] = useState(company?.about ?? "");

  async function submitBasics(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      await saveBasics({
        data: { name, companyType, country, stateProvince: region, address },
      });
      await router.invalidate({ sync: true });
      setStep("details");
      toast.success("Company basics saved");
    } catch (caught) {
      toast.error("Could not save company basics", {
        description:
          caught instanceof Error ? caught.message : "Please try again.",
      });
    } finally {
      setPending(false);
    }
  }

  async function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      await finishSetup({ data: { website, size, about } });
      await router.invalidate({ sync: true });
      setStep("done");
      toast.success("Company profile completed");
    } catch (caught) {
      toast.error("Could not finish company setup", {
        description:
          caught instanceof Error ? caught.message : "Please try again.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-7 pb-24 lg:pb-0">
      <header>
        <Badge variant="secondary">Employer workspace</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Set up your company
        </h1>
        <p className="mt-2 text-muted-foreground">
          Help candidates understand your team before they apply.
        </p>
      </header>

      {step !== "done" ? (
        <div
          className="flex flex-col gap-3"
          aria-label="Company setup progress"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Step {step === "basics" ? 1 : 2} of 2
            </span>
            <span className="text-muted-foreground">
              {step === "basics" ? "Company basics" : "Optional details"}
            </span>
          </div>
          <Progress value={step === "basics" ? 50 : 100} />
        </div>
      ) : null}

      {step === "basics" ? (
        <Card>
          <CardHeader>
            <Building2 className="text-primary" aria-hidden="true" />
            <CardTitle>Company basics</CardTitle>
            <CardDescription>
              Save these required details now. You can return to finish later.
            </CardDescription>
          </CardHeader>
          <form onSubmit={submitBasics}>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="company-name">Company name</FieldLabel>
                  <Input
                    id="company-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    minLength={2}
                    maxLength={120}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="company-type">Company type</FieldLabel>
                  <Select value={companyType} onValueChange={setCompanyType}>
                    <SelectTrigger id="company-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {COMPANY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="company-country">Country</FieldLabel>
                    <Select
                      value={country}
                      onValueChange={(value) => {
                        setCountry(value);
                        setRegion("");
                      }}
                    >
                      <SelectTrigger id="company-country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {COUNTRIES.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="company-region">
                      State or province
                    </FieldLabel>
                    {country === "Philippines" ? (
                      <Select value={region} onValueChange={setRegion}>
                        <SelectTrigger id="company-region" aria-required="true">
                          <SelectValue placeholder="Select a region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {PH_REGIONS.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="company-region"
                        value={region}
                        onChange={(event) => setRegion(event.target.value)}
                        maxLength={100}
                        required
                      />
                    )}
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="company-address">
                    Business address
                  </FieldLabel>
                  <Input
                    id="company-address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    minLength={4}
                    maxLength={240}
                    required
                  />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="mt-6 justify-end">
              <Button type="submit" disabled={pending || !region.trim()}>
                {pending ? <Spinner data-icon="inline-start" /> : null}
                {pending ? "Saving…" : "Save and continue"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : null}

      {step === "details" ? (
        <Card>
          <CardHeader>
            <CardTitle>A bit more about your company</CardTitle>
            <CardDescription>
              These details are optional. You can update them later.
            </CardDescription>
          </CardHeader>
          <form onSubmit={submitDetails}>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="company-website">Website</FieldLabel>
                  <Input
                    id="company-website"
                    type="url"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    maxLength={240}
                    placeholder="https://company.example"
                  />
                  <FieldDescription>
                    A company website helps applicants learn more about you.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="company-size">Team size</FieldLabel>
                  <Input
                    id="company-size"
                    value={size}
                    onChange={(event) => setSize(event.target.value)}
                    maxLength={40}
                    placeholder="For example, 11–50"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="company-about">
                    About the company
                  </FieldLabel>
                  <Textarea
                    id="company-about"
                    rows={7}
                    value={about}
                    onChange={(event) => setAbout(event.target.value)}
                    maxLength={1200}
                    placeholder="Share what your company does and how your team works."
                  />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="mt-6 flex flex-wrap justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("basics")}
                disabled={pending}
              >
                <ArrowLeft data-icon="inline-start" aria-hidden="true" />
                Back
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Spinner data-icon="inline-start" /> : null}
                {pending ? "Finishing…" : "Finish setup"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : null}

      {step === "done" ? (
        <Card>
          <CardHeader>
            <CheckCircle2 className="text-success" aria-hidden="true" />
            <CardTitle>Company profile ready</CardTitle>
            <CardDescription>
              {name || "Your company"} has been saved to StellarNext.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You can revisit these details whenever your company information
              changes.
            </p>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
            <Button variant="outline" onClick={() => setStep("basics")}>
              Edit company details
            </Button>
          </CardFooter>
        </Card>
      ) : null}
    </div>
  );
}
