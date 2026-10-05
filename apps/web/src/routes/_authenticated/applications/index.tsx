import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { BriefcaseBusiness, CalendarClock, Download } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listApplicationsFn } from "@/lib/jobs/job.functions";
import {
  formatSalary,
  formatWorkModel,
  jobLocationLabel,
} from "@/components/jobs/job-format";

export const Route = createFileRoute("/_authenticated/applications/")({
  beforeLoad: ({ context }) => {
    if (context.user.accountType !== "applicant")
      throw redirect({ to: "/dashboard" });
  },
  loader: () => listApplicationsFn(),
  component: ApplicationsPage,
  head: () => ({ meta: [{ title: "Applications — StellarJob" }] }),
});

type Application = Awaited<ReturnType<typeof listApplicationsFn>>[number];
type Sort = "newest" | "oldest" | "status";
const closedStatuses = new Set(["not_selected", "closed"]);
const statusOrder = [
  "offer",
  "interview",
  "reviewing",
  "applied",
  "not_selected",
  "closed",
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Manila",
  });
}

function csvCell(value: string) {
  const protectedValue = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${protectedValue.replaceAll('"', '""')}"`;
}

function exportApplications(applications: Application[]) {
  const headers = [
    "Role",
    "Company",
    "Status",
    "Applied",
    "Salary",
    "Next step",
    "Next step date",
  ];
  const rows = applications.map((item) => [
    item.job.title,
    item.job.companyName,
    item.status.replaceAll("_", " "),
    item.submitted_at,
    formatSalary(item.job.salaryMin, item.job.salaryMax),
    item.next_action_label ?? "",
    item.next_action_at ?? "",
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "stellarjob-applications.csv";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function ApplicationList({
  applications,
  emptyMessage,
}: {
  applications: Application[];
  emptyMessage: string;
}) {
  if (!applications.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BriefcaseBusiness aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>No applications here</EmptyTitle>
          <EmptyDescription>{emptyMessage}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to="/search">Browse jobs</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {applications.map((application) => (
        <Card key={application.id}>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-11 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {application.job.companyName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="truncate text-base">
                  {application.job.title}
                </CardTitle>
                <CardDescription className="truncate">
                  {application.job.companyName}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={
                closedStatuses.has(application.status) ? "outline" : "secondary"
              }
            >
              {application.status.replaceAll("_", " ")}
            </Badge>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Applied</dt>
                <dd className="mt-1 font-medium">
                  {formatDate(application.submitted_at)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Salary</dt>
                <dd className="mt-1 font-medium">
                  {formatSalary(
                    application.job.salaryMin,
                    application.job.salaryMax,
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Location</dt>
                <dd className="mt-1 font-medium">
                  {jobLocationLabel(application.job.city)} ·{" "}
                  {formatWorkModel(application.job.workModel)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Next step</dt>
                <dd className="mt-1 font-medium">
                  {application.next_action_label ?? "No action scheduled"}
                  {application.next_action_at
                    ? ` · ${formatDate(application.next_action_at)}`
                    : ""}
                </dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter>
            <Button variant="link" className="ml-auto" asChild>
              <Link to="/jobs/$jobId" params={{ jobId: application.job_id }}>
                View role
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function ApplicationsPage() {
  const applications = Route.useLoaderData();
  const [sort, setSort] = useState<Sort>("newest");
  const ordered = [...applications].sort((a, b) => {
    if (sort === "status") {
      return (
        statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status) ||
        b.submitted_at.localeCompare(a.submitted_at)
      );
    }
    return sort === "oldest"
      ? a.submitted_at.localeCompare(b.submitted_at)
      : b.submitted_at.localeCompare(a.submitted_at);
  });
  const active = ordered.filter((item) => !closedStatuses.has(item.status));
  const closed = ordered.filter((item) => closedStatuses.has(item.status));
  const nextAction = applications
    .filter(
      (item) =>
        item.next_action_at &&
        item.next_action_label &&
        new Date(item.next_action_at).getTime() >= Date.now(),
    )
    .sort((a, b) =>
      (a.next_action_at ?? "").localeCompare(b.next_action_at ?? ""),
    )[0];

  return (
    <div className="flex flex-col gap-7 pb-24 lg:pb-0">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {applications.length} applications · {active.length} active
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            My applications
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track roles you applied for from this StellarJob account.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={!applications.length}
            onClick={() => exportApplications(applications)}
          >
            <Download data-icon="inline-start" aria-hidden="true" />
            Export CSV
          </Button>
          <Button variant="outline" asChild>
            <Link to="/profile">Update profile</Link>
          </Button>
        </div>
      </header>

      {nextAction ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarClock
                aria-hidden="true"
                className="size-4 text-primary"
              />
              <CardTitle>Upcoming next step</CardTitle>
            </div>
            <CardDescription>
              {nextAction.next_action_label} · {nextAction.job.title} at{" "}
              {nextAction.job.companyName}
              {" · "}
              {formatDate(nextAction.next_action_at!)}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link to="/jobs/$jobId" params={{ jobId: nextAction.job_id }}>
                View role
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      <Tabs defaultValue="all" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({closed.length})</TabsTrigger>
          </TabsList>
          <Field className="w-full sm:w-52">
            <FieldLabel htmlFor="application-sort">Sort by</FieldLabel>
            <Select
              value={sort}
              onValueChange={(value) =>
                setSort(
                  value === "oldest"
                    ? "oldest"
                    : value === "status"
                      ? "status"
                      : "newest",
                )
              }
            >
              <SelectTrigger id="application-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="newest">Date applied: newest</SelectItem>
                  <SelectItem value="oldest">Date applied: oldest</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <TabsContent value="all">
          <ApplicationList
            applications={ordered}
            emptyMessage="When you apply for a live role, it will appear here."
          />
        </TabsContent>
        <TabsContent value="active">
          <ApplicationList
            applications={active}
            emptyMessage="You have no active applications right now."
          />
        </TabsContent>
        <TabsContent value="closed">
          <ApplicationList
            applications={closed}
            emptyMessage="You have no closed applications."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
