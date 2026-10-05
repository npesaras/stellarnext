import { Link, createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  CheckCircle2,
  Search,
} from "lucide-react";

import { JobList } from "@/components/jobs/job-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  listApplicationsFn,
  listSavedJobsFn,
  searchJobsFn,
} from "@/lib/jobs/job.functions";
import { jobSearchSchema } from "@/lib/jobs/job-search-schema";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  loader: async ({ context }) => {
    if (context.user.accountType === "employer") {
      return { applications: [], saved: [], listings: { jobs: [] } };
    }
    const [applications, saved, listings] = await Promise.all([
      listApplicationsFn(),
      listSavedJobsFn(),
      searchJobsFn({ data: jobSearchSchema.parse({}) }),
    ]);
    return { applications, saved, listings };
  },
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard — StellarJob" }] }),
});

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const { applications, saved, listings } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState("");

  if (user.accountType === "employer") {
    return (
      <div className="flex flex-col gap-6 pb-24 lg:pb-0">
        <header>
          <Badge variant="secondary">Employer workspace</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Welcome back, {user.displayName?.split(" ")[0] ?? "there"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Keep your company information accurate for job seekers.
          </p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>
              {user.onboardingComplete
                ? "Your company profile is ready"
                : "Complete your company setup"}
            </CardTitle>
            <CardDescription>
              {user.onboardingComplete
                ? "Review your company details whenever they change."
                : "Add your company details before moving on to employer features."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/employer/onboarding">
                {user.onboardingComplete
                  ? "Review company profile"
                  : "Continue company setup"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const firstName = user.displayName?.split(" ")[0] ?? "there";
  const activeApplications = applications.filter(
    (item) => !["not_selected", "closed"].includes(item.status),
  ).length;
  const interviews = applications.filter(
    (item) => item.status === "interview",
  ).length;
  const reviewing = applications.filter(
    (item) => item.status === "reviewing",
  ).length;

  function searchJobs(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void navigate({
      to: "/search",
      search: jobSearchSchema.parse({ q: query }),
    });
  }

  return (
    <div className="flex flex-col gap-8 pb-24 lg:pb-0">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge variant="secondary">Your workspace</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Keep your profile fresh and your search moving.
          </p>
        </div>
        <Button asChild>
          <Link to="/search">
            Find your next role
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Active applications",
            value: activeApplications,
            icon: BriefcaseBusiness,
          },
          { label: "Saved roles", value: saved.length, icon: Bookmark },
          {
            label: "Total applications",
            value: applications.length,
            icon: BriefcaseBusiness,
          },
          { label: "Interviews", value: interviews, icon: CheckCircle2 },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{item.label}</CardDescription>
              <item.icon
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!user.onboardingComplete ? (
        <Card className="border-primary/20 bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle>Finish your profile to stand out</CardTitle>
            <CardDescription className="text-primary-foreground/75">
              Add your experience, education, and skills before applying.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" asChild>
              <Link to="/profile/onboarding">Continue profile setup</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Search open jobs</CardTitle>
          <CardDescription>
            Start with a job title or category, then refine by city, work model,
            salary, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={searchJobs}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <FieldGroup className="flex-1">
              <Field>
                <FieldLabel htmlFor="dashboard-search">Keywords</FieldLabel>
                <Input
                  id="dashboard-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search jobs"
                  maxLength={100}
                />
              </Field>
            </FieldGroup>
            <Button type="submit">
              <Search data-icon="inline-start" aria-hidden="true" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">
              Your opportunities
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              Keep your search moving
            </h2>
          </div>
          <Button variant="outline" asChild>
            <Link to="/search">See all</Link>
          </Button>
        </div>
        <Tabs defaultValue="recent" className="flex flex-col gap-3">
          <TabsList className="h-auto w-fit flex-wrap justify-start">
            <TabsTrigger value="recent">Recently posted</TabsTrigger>
            <TabsTrigger value="saved">Saved ({saved.length})</TabsTrigger>
            <TabsTrigger value="applied">
              Applied ({applications.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="recent">
            <JobList
              jobs={listings.jobs.slice(0, 3)}
              emptyMessage="No open jobs have been posted yet."
            />
          </TabsContent>
          <TabsContent value="saved">
            <JobList
              jobs={saved.slice(0, 3)}
              emptyMessage="You have not saved any jobs yet."
            />
          </TabsContent>
          <TabsContent value="applied">
            <JobList
              jobs={applications.slice(0, 3).map((item) => item.job)}
              emptyMessage="Your applications will appear here after you apply."
            />
          </TabsContent>
        </Tabs>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Recently saved</CardTitle>
              <CardDescription>Roles on your shortlist</CardDescription>
            </div>
            <Button variant="link" size="sm" asChild>
              <Link to="/saved">All saved</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {saved.length ? (
              <ul className="flex flex-col gap-3">
                {saved.slice(0, 3).map((job) => (
                  <li
                    key={job.id}
                    className="flex items-center justify-between gap-3 rounded-md border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{job.title}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {job.companyName}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/jobs/$jobId" params={{ jobId: job.id }}>
                        View
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Save roles you want to compare or apply for later.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Application activity</CardTitle>
              <CardDescription>
                Current status from your submitted applications
              </CardDescription>
            </div>
            <Button variant="link" size="sm" asChild>
              <Link to="/applications">Track all</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <dl className="grid grid-cols-3 gap-3">
              {[
                { label: "Submitted", value: applications.length },
                { label: "In review", value: reviewing },
                { label: "Interviews", value: interviews },
              ].map((item) => (
                <div key={item.label}>
                  <dd className="text-2xl font-semibold">{item.value}</dd>
                  <dt className="text-sm text-muted-foreground">
                    {item.label}
                  </dt>
                </div>
              ))}
            </dl>
            <div className="rounded-md bg-muted p-4">
              <p className="font-medium">Keep your profile current</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your profile details are reused across applications. Review them
                whenever your experience or skills change.
              </p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link to="/profile">Edit profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
