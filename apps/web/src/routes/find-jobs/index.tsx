import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
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

export const Route = createFileRoute("/find-jobs/")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { q?: string; location?: string; page?: number } => ({
    ...(typeof search.q === "string" && search.q
      ? { q: search.q.slice(0, 100) }
      : {}),
    ...(typeof search.location === "string" && search.location
      ? { location: search.location.slice(0, 100) }
      : {}),
    ...(Number.isInteger(Number(search.page)) &&
    Number(search.page) >= 1 &&
    Number(search.page) <= 1_000
      ? { page: Number(search.page) }
      : {}),
  }),
  loaderDeps: ({ search }) => ({
    q: search.q ?? "",
    location: search.location ?? "",
    page: search.page ?? 1,
  }),
  loader: async ({ deps }) => {
    const [jobResults, companies] = await Promise.all([
      listJobsFn({ data: deps }),
      listVerifiedCompaniesFn(),
    ]);
    return {
      jobs: jobResults.jobs,
      count: jobResults.count,
      pageSize: jobResults.pageSize,
      companies,
    };
  },
  component: FindJobsPage,
  head: () => ({ meta: [{ title: "Find jobs — StellarJob" }] }),
});

function FindJobsPage() {
  const { user } = Route.useRouteContext();
  const { q, location, page = 1 } = Route.useSearch();
  const { jobs, count, pageSize, companies } = Route.useLoaderData();
  const totalPages = Math.ceil(count / pageSize);
  const firstResult = jobs.length ? (page - 1) * pageSize + 1 : 0;
  const lastResult = jobs.length ? Math.min(page * pageSize, count) : 0;
  const categories = [
    ...new Set(
      jobs
        .map((job) => job.category)
        .filter((category): category is string => Boolean(category)),
    ),
  ]
    .sort((left, right) => left.localeCompare(right))
    .slice(0, 12);

  return (
    <PublicPage user={user}>
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <Badge variant="secondary">Live opportunities</Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Find your next role
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Search the roles currently available on StellarJob by title,
            keyword, company, or location.
          </p>
          <Card className="mt-8">
            <CardContent>
              <form
                action="/find-jobs"
                method="get"
                className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
              >
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    className="pl-9"
                    name="q"
                    defaultValue={q ?? ""}
                    placeholder="Job title or keyword"
                    aria-label="Job title or keyword"
                  />
                </div>
                <Input
                  name="location"
                  defaultValue={location ?? ""}
                  placeholder="Location"
                  aria-label="Location"
                />
                <Button type="submit">
                  <SlidersHorizontal
                    data-icon="inline-start"
                    aria-hidden="true"
                  />
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-primary">Latest listings</p>
            <h2 className="mt-1 text-2xl font-semibold">
              {count} {q || location ? "matching" : "open"} roles
            </h2>
            {jobs.length ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Showing {firstResult}–{lastResult}
              </p>
            ) : null}
          </div>
        </div>
        {count > 0 && !jobs.length ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              This page is past the available results.
            </p>
            <Button variant="outline" asChild>
              <Link to="/find-jobs" search={{ q, location, page: totalPages }}>
                Go to the last results page
              </Link>
            </Button>
          </div>
        ) : (
          <JobList
            jobs={jobs}
            emptyMessage={
              q || location
                ? "No jobs match this search yet."
                : "No open jobs have been posted yet."
            }
          />
        )}
        {totalPages > 1 ? (
          <nav
            aria-label="Job listing pages"
            className="flex items-center justify-center gap-3"
          >
            {page > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  to="/find-jobs"
                  search={{ q, location, page: Math.min(page - 1, totalPages) }}
                >
                  <ChevronLeft data-icon="inline-start" aria-hidden="true" />
                  Previous
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <Button variant="outline" size="sm" asChild>
                <Link to="/find-jobs" search={{ q, location, page: page + 1 }}>
                  Next
                  <ChevronRight data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            )}
          </nav>
        ) : null}
      </section>

      <section className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-medium text-primary">
              Your StellarJob journey
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              One clear path from search to offer
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {JOURNEY_STEPS.map((step, index) => (
              <Card key={step.key}>
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">
                    Step {index + 1}
                  </Badge>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Browse by category</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Find work that fits what you do
          </h2>
          <p className="mt-3 text-muted-foreground">
            These categories come from the roles currently shown above. Choose
            one to search related openings across all locations.
          </p>
        </div>
        {categories.length ? (
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button key={category} variant="outline" asChild>
                <Link to="/find-jobs" search={{ q: category }}>
                  {category}
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No categories are available for these search results yet.
          </p>
        )}
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">Employer network</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Get to know the teams behind the roles
            </h2>
            <p className="mt-3 text-muted-foreground">
              Verified companies shown here are read from the current employer
              network.
            </p>
          </div>
          {companies.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {companies.map((company) => (
                <Card key={company.id}>
                  <CardContent className="flex items-center gap-4 pt-6">
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary"
                      aria-hidden="true"
                    >
                      <Building2 />
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
              No verified companies are visible yet.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
        <Badge variant="secondary">Your next step</Badge>
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Keep your search and applications together
        </h2>
        <p className="max-w-xl text-muted-foreground">
          Build a reusable profile, save interesting roles, and return to your
          application history whenever you need it.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            {user ? (
              <Link to="/dashboard">Open your workspace</Link>
            ) : (
              <Link
                to="/sign-in"
                search={{ mode: "signup", role: "applicant" }}
              >
                Create your profile
              </Link>
            )}
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/employers">For employers</Link>
          </Button>
        </div>
      </section>
    </PublicPage>
  );
}
