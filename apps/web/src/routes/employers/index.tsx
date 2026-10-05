import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";

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
import { listVerifiedCompaniesFn } from "@/lib/employer/public.functions";

export const Route = createFileRoute("/employers/")({
  loader: () => listVerifiedCompaniesFn(),
  component: EmployersPage,
  head: () => ({ meta: [{ title: "Hire talent — StellarJob" }] }),
});

function EmployersPage() {
  const { user } = Route.useRouteContext();
  const companies = Route.useLoaderData();

  return (
    <PublicPage user={user}>
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <Badge variant="secondary">For hiring teams</Badge>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-6xl">
              Introduce your team to people looking for their next role.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Create a company profile that helps applicants understand the
              organization behind a role.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link
                  to="/sign-in"
                  search={{ mode: "signup", role: "employer" }}
                >
                  Create employer account
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">How we work</Link>
              </Button>
            </div>
          </div>
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-2xl">
                A clearer company presence
              </CardTitle>
              <CardDescription className="text-primary-foreground/75">
                Give candidates useful context about who you are and where your
                team works.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {[
                "One company profile",
                "Your location and website",
                "A description of your team",
              ].map((item) => (
                <p key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="size-5" aria-hidden="true" />
                  {item}
                </p>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Start with a company candidates can recognize
          </h2>
          <p className="mt-3 text-muted-foreground">
            The employer account flow begins with a clear company profile. Your
            details can be updated as your organization changes.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Choose an employer account",
              description:
                "Select the hiring path when creating your StellarJob account.",
            },
            {
              title: "Describe your organization",
              description:
                "Add your company name, location, website, and an introduction.",
            },
            {
              title: "Keep your profile current",
              description:
                "Return to your company details whenever your team changes.",
            },
          ].map((step, index) => (
            <Card key={step.title}>
              <CardHeader>
                <Badge variant="secondary" className="w-fit">
                  Step {index + 1}
                </Badge>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Verified employers
          </p>
          {companies.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center gap-2 rounded-lg border bg-background p-3 text-sm font-medium"
                >
                  <span className="flex size-7 items-center justify-center rounded-md bg-secondary text-xs text-primary">
                    {company.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate">{company.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No verified employers to show yet.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">People and roles</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            The details that make a better match
          </h2>
          <p className="mt-3 text-muted-foreground">
            Applicant profiles are designed to put relevant information in one
            place, while job listings give candidates a clearer view of the
            work.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Experience",
              description:
                "Applicants can record previous roles and the work they have done.",
            },
            {
              title: "Education",
              description:
                "Education and certifications sit alongside career experience.",
            },
            {
              title: "Skills",
              description:
                "A reusable skills profile helps applicants describe what they can do.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
          <Badge variant="secondary">Get started</Badge>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Put your company on StellarJob
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Start with a company profile that tells applicants who you are and
            where you work.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              {user ? (
                <Link to="/dashboard">Open your workspace</Link>
              ) : (
                <Link
                  to="/sign-in"
                  search={{ mode: "signup", role: "employer" }}
                >
                  Create employer account
                </Link>
              )}
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/about">About StellarJob</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
