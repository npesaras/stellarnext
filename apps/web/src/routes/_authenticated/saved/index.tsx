import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";

import { JobList } from "@/components/jobs/job-list";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { listSavedJobsFn } from "@/lib/jobs/job.functions";

export const Route = createFileRoute("/_authenticated/saved/")({
  beforeLoad: ({ context }) => {
    if (context.user.accountType !== "applicant")
      throw redirect({ to: "/dashboard" });
  },
  loader: () => listSavedJobsFn(),
  component: SavedJobsPage,
  head: () => ({ meta: [{ title: "Saved jobs — StellarJob" }] }),
});

function SavedJobsPage() {
  const jobs = Route.useLoaderData();
  return (
    <div className="flex flex-col gap-7 pb-24 lg:pb-0">
      <header>
        <p className="text-sm font-medium text-primary">Your shortlist</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Saved jobs
        </h1>
        <p className="mt-1 text-muted-foreground">
          Come back to promising roles when you are ready to apply.
        </p>
      </header>
      {jobs.length ? (
        <JobList jobs={jobs} />
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Bookmark aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No saved jobs yet</EmptyTitle>
            <EmptyDescription>
              Save a role to keep it close while you compare opportunities.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to="/search">Browse jobs</Link>
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
