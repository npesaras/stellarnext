import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  FileUser,
  ListChecks,
} from "lucide-react";

import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/about/")({
  component: AboutPage,
  head: () => ({ meta: [{ title: "About — StellarJob" }] }),
});

function AboutPage() {
  const { user } = Route.useRouteContext();

  return (
    <PublicPage user={user}>
      <section className="border-b bg-card">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <Badge variant="secondary">Our mission</Badge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            Make every career start count.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            StellarJob brings job seekers and employers together through live
            opportunities, reusable profiles, and transparent application
            tracking.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <BriefcaseBusiness
                className="mb-3 size-8 text-primary"
                aria-hidden="true"
              />
              <CardTitle>Explore live roles</CardTitle>
              <CardDescription>
                Listings come from employers in the connected database.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <FileUser
                className="mb-3 size-8 text-primary"
                aria-hidden="true"
              />
              <CardTitle>Build one profile</CardTitle>
              <CardDescription>
                Keep your experience, education, and skills in one place.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <ListChecks
                className="mb-3 size-8 text-primary"
                aria-hidden="true"
              />
              <CardTitle>Track applications</CardTitle>
              <CardDescription>
                Review your saved roles and submitted applications.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">Our approach</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Career moves deserve a clearer process
            </h2>
            <p className="mt-3 text-muted-foreground">
              Finding a role is not only about reading a listing. Applicants
              need a reliable way to present their work, remember promising
              jobs, and see what they have already applied for.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <Badge variant="secondary" className="w-fit">
                  For applicants
                </Badge>
                <CardTitle>Build a profile you can reuse</CardTitle>
                <CardDescription>
                  Bring experience, education, certifications, and skills into
                  one profile. Use it as the starting point for applications and
                  keep it current as your career grows.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Badge variant="secondary" className="w-fit">
                  For employers
                </Badge>
                <CardTitle>Put the organization in context</CardTitle>
                <CardDescription>
                  Employer accounts can keep their company name, location,
                  website, and introduction together. A listing can also show
                  the company introduction to applicants.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">
            What guides the product
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Useful details, honest progress
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Current opportunities",
              description:
                "Job lists are drawn from the connected database, not a catalogue of placeholder roles.",
            },
            {
              title: "One application history",
              description:
                "Submitted applications and saved jobs live with your account so you can revisit them.",
            },
            {
              title: "Clear next actions",
              description:
                "The interface points to a profile, a role, or an application instead of a dead-end button.",
            },
          ].map((principle) => (
            <Card key={principle.title}>
              <CardHeader>
                <CardTitle>{principle.title}</CardTitle>
                <CardDescription>{principle.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
          <Badge variant="secondary">Explore StellarJob</Badge>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            See where your next step could lead
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Browse the roles available now or see how an employer can introduce
            their organization.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/find-jobs">
                Find jobs
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/employers">For employers</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
