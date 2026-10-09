import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Search,
  Users,
} from "lucide-react";

import { JobList } from "@/components/jobs/job-list";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { JOURNEY_STEPS } from "@/data/find-jobs";
import { listVerifiedCompaniesFn } from "@/lib/employer/public.functions";
import { listJobsFn } from "@/lib/jobs/job.functions";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [jobResults, companies] = await Promise.all([
      listJobsFn({ data: { q: "", location: "" } }),
      listVerifiedCompaniesFn(),
    ]);
    return { jobs: jobResults.jobs, companies };
  },
  component: HomePage,
  head: () => ({
    meta: [{ title: "StellarNext — Find work that pays and matters" }],
  }),
});

const outcomes = [
  {
    value: "One profile",
    label: "Experience, skills, and certifications together",
    icon: Users,
  },
  {
    value: "Role search",
    label: "Explore openings by title and location",
    icon: Building2,
  },
  {
    value: "Clear history",
    label: "Track saved roles and applications",
    icon: BriefcaseBusiness,
  },
];

const pillars = [
  {
    title: "For applicants",
    description:
      "Keep your experience, education, and skills together, then follow your submitted applications in one place.",
  },
  {
    title: "For employers",
    description:
      "Create a company profile so candidates can learn about the organization behind a role.",
  },
  {
    title: "For every next step",
    description:
      "Search current listings by role or location and return to the opportunities you saved.",
  },
];

const employerSteps = [
  {
    title: "Join as an employer",
    description: "Choose the hiring account type when you create an account.",
  },
  {
    title: "Set up your company",
    description: "Add the details that help applicants understand your team.",
  },
  {
    title: "Keep details current",
    description: "Return to your company profile when information changes.",
  },
];

function HomePage() {
  const { user } = Route.useRouteContext();
  const { jobs, companies } = Route.useLoaderData();

  return (
    <PublicPage user={user}>
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
          <div className="flex flex-col gap-7">
            <Badge variant="secondary">Careers built for the Philippines</Badge>
            <div className="flex flex-col gap-5">
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
                Find work that pays, grows, and matters.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Discover live opportunities, apply with one trusted profile, and
                know where every application stands.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="/find-jobs">
                  Explore open roles
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/employers">I am hiring</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {[
                "Live job listings",
                "Transparent status tracking",
                "One reusable profile",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle2
                    className="size-4 text-success"
                    aria-hidden="true"
                  />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <Card className="border-primary/15 shadow-xl shadow-primary/5">
            <CardHeader>
              <CardTitle>Start your search</CardTitle>
              <CardDescription>
                Search early-career and experienced roles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action="/find-jobs"
                method="get"
                className="flex flex-col gap-4"
              >
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    className="pl-9"
                    name="q"
                    placeholder="Role, skill, or company"
                    aria-label="Role, skill, or company"
                  />
                </div>
                <Input
                  name="location"
                  placeholder="City or region"
                  aria-label="City or region"
                />
                <Button className="w-full" type="submit">
                  Search jobs
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          {outcomes.map((outcome) => (
            <div
              key={outcome.label}
              className="flex items-center gap-4 sm:justify-center"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-primary">
                <outcome.icon aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-semibold">{outcome.value}</p>
                <p className="text-sm text-muted-foreground">{outcome.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-primary">
              Fresh opportunities
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">
              Open roles worth exploring
            </h2>
          </div>
          <Button variant="outline" asChild>
            <Link to="/find-jobs">View all jobs</Link>
          </Button>
        </div>
        <JobList jobs={jobs.slice(0, 6)} />
      </section>

      {jobs.length > 6 && (
        <section className="border-y bg-card">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-primary">
                  Keep exploring
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  More roles to consider
                </h2>
              </div>
              <Button variant="outline" asChild>
                <Link to="/find-jobs">Browse all roles</Link>
              </Button>
            </div>
            <JobList jobs={jobs.slice(6, 12)} />
          </div>
        </section>
      )}

      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Why StellarNext</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            One place for the work around finding work
          </h2>
          <p className="mt-3 text-muted-foreground">
            The search, your profile, and your application history should work
            together.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.title}>
              <CardHeader>
                <CardTitle>{pillar.title}</CardTitle>
                <CardDescription>{pillar.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">How it works</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              A clear starting point for both sides
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Looking for work</CardTitle>
                <CardDescription>
                  Move from your first search to an application you can track.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="flex flex-col gap-5">
                  {[JOURNEY_STEPS[0], JOURNEY_STEPS[2], JOURNEY_STEPS[3]].map(
                    (step, index) => (
                      <li key={step.key} className="flex gap-4">
                        <Badge variant="secondary" className="h-fit">
                          {index + 1}
                        </Badge>
                        <div>
                          <h3 className="font-medium">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {step.desc}
                          </p>
                        </div>
                      </li>
                    ),
                  )}
                </ol>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Building a company presence</CardTitle>
                <CardDescription>
                  Set up the information applicants need to recognize your team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="flex flex-col gap-5">
                  {employerSteps.map((step, index) => (
                    <li key={step.title} className="flex gap-4">
                      <Badge variant="secondary" className="h-fit">
                        {index + 1}
                      </Badge>
                      <div>
                        <h3 className="font-medium">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Our network</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Verified companies on StellarNext
          </h2>
          <p className="mt-3 text-muted-foreground">
            Explore the organizations currently visible in our employer network.
          </p>
        </div>
        {companies.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {companies.map((company) => (
              <Card key={company.id}>
                <CardContent className="flex items-center gap-3 pt-6">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary font-semibold text-primary"
                    aria-hidden="true"
                  >
                    {company.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 truncate font-medium">
                    {company.name}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Verified companies will appear here when available.
          </p>
        )}
        <div>
          <Button variant="outline" asChild>
            <Link to="/employers">Explore the employer network</Link>
          </Button>
        </div>
      </section>

      <section className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
          <Badge variant="secondary">Get started</Badge>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Your next opportunity starts here
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Explore what is open now, or create an account to save roles and
            follow your applications.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/find-jobs">Browse open roles</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              {user ? (
                <Link to="/dashboard">Open your workspace</Link>
              ) : (
                <Link to="/sign-in" search={{ mode: "signup" }}>
                  Create an account
                </Link>
              )}
            </Button>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
