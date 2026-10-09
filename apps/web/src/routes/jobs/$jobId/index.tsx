import {
  Link,
  createFileRoute,
  notFound,
  useRouter,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bookmark, Building2, CheckCircle2, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PublicPage } from "@/components/public-page";
import {
  formatEmploymentType,
  formatSalary,
  formatWorkModel,
  jobLocationLabel,
} from "@/components/jobs/job-format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  getJobFn,
  isJobSavedFn,
  listJobsFn,
  toggleSavedJobFn,
} from "@/lib/jobs/job.functions";

export const Route = createFileRoute("/jobs/$jobId/")({
  loader: async ({ params, context }) => {
    const job = await getJobFn({ data: { jobId: params.jobId } });
    if (!job) throw notFound();
    const [saved, similar] = await Promise.all([
      context.user && context.user.accountType === "applicant"
        ? isJobSavedFn({ data: { jobId: job.id } })
        : Promise.resolve(false),
      listJobsFn({ data: { q: "", location: "" } }),
    ]);
    return {
      job,
      saved,
      similar: similar.jobs
        .filter((item) => item.id !== job.id && item.category === job.category)
        .slice(0, 3),
    };
  },
  component: JobDetailPage,
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.job.title ?? "Job"} — StellarNext` }],
  }),
});

function DetailList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <ul className="flex flex-col gap-3 text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function JobDetailPage() {
  const { user } = Route.useRouteContext();
  const { job, saved, similar } = Route.useLoaderData();
  const router = useRouter();
  const toggleSaved = useServerFn(toggleSavedJobFn);
  const [pending, setPending] = useState(false);
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  async function save() {
    setPending(true);
    try {
      const result = await toggleSaved({ data: { jobId: job.id } });
      await router.invalidate({ sync: true });
      toast.success(result.saved ? "Job saved" : "Job removed from saved jobs");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update saved jobs.",
      );
    } finally {
      setPending(false);
    }
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Job link copied");
    } catch {
      toast.error("Could not copy the job link.");
    }
  }

  return (
    <PublicPage user={user}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/find-jobs">← All jobs</Link>
        </Button>
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <article className="flex flex-col gap-8">
            <header className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <Avatar className="size-14 rounded-xl">
                  <AvatarFallback className="rounded-xl bg-secondary text-xl text-primary">
                    {job.companyName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    {job.title}
                  </h1>
                  <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                    <Building2 className="size-4" aria-hidden="true" />
                    {job.companyName} · {jobLocationLabel(job.city)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.promoted ? <Badge>Promoted</Badge> : null}
                {job.verified ? (
                  <Badge variant="secondary">
                    <CheckCircle2 data-icon="inline-start" aria-hidden="true" />{" "}
                    Verified employer
                  </Badge>
                ) : null}
                {job.category ? (
                  <Badge variant="outline">{job.category}</Badge>
                ) : null}
                <Badge variant="outline">
                  {formatWorkModel(job.workModel)}
                </Badge>
              </div>
              <p className="text-2xl font-semibold text-primary">
                {salary}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  monthly
                </span>
              </p>
            </header>
            <Separator />
            {job.about ? (
              <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold">About the role</h2>
                <p className="leading-8 text-muted-foreground">{job.about}</p>
              </section>
            ) : null}
            <DetailList title="What you will do" items={job.responsibilities} />
            <DetailList title="What you bring" items={job.requirements} />
            <DetailList title="Nice to have" items={job.niceToHave} />
            {job.companyAbout ? (
              <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold">
                  About {job.companyName}
                </h2>
                <p className="leading-8 text-muted-foreground">
                  {job.companyAbout}
                </p>
              </section>
            ) : null}
          </article>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardHeader>
                <CardDescription>Compensation</CardDescription>
                <CardTitle>{salary}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {user?.accountType === "employer" ? (
                  <p className="text-sm text-muted-foreground">
                    Sign in as an applicant to apply or save this role.
                  </p>
                ) : user && !user.onboardingComplete ? (
                  <Button size="lg" asChild>
                    <Link to="/profile/onboarding">
                      Complete profile to apply
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" asChild>
                    <Link to="/jobs/$jobId/apply" params={{ jobId: job.id }}>
                      Apply now
                    </Link>
                  </Button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {user && user.accountType === "applicant" ? (
                    <Button variant="outline" disabled={pending} onClick={save}>
                      {pending ? (
                        <Spinner data-icon="inline-start" />
                      ) : (
                        <Bookmark data-icon="inline-start" aria-hidden="true" />
                      )}
                      {saved ? "Saved" : "Save"}
                    </Button>
                  ) : !user ? (
                    <Button variant="outline" asChild>
                      <Link
                        to="/sign-in"
                        search={{ mode: "signin", redirect: `/jobs/${job.id}` }}
                      >
                        Sign in to save
                      </Link>
                    </Button>
                  ) : null}
                  <Button variant="outline" onClick={share}>
                    <Share2 data-icon="inline-start" aria-hidden="true" /> Share
                  </Button>
                </div>
                <Separator />
                <dl className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Location</dt>
                    <dd className="font-medium">
                      {jobLocationLabel(job.city)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Work model</dt>
                    <dd className="font-medium">
                      {formatWorkModel(job.workModel)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium">
                      {formatEmploymentType(job.employmentType)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            {similar.length ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Similar roles</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {similar.map((role) => (
                    <Link
                      key={role.id}
                      to="/jobs/$jobId"
                      params={{ jobId: role.id }}
                      className="block rounded-md p-2 hover:bg-muted"
                    >
                      <p className="font-medium">{role.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {role.companyName}
                      </p>
                      <p className="mt-1 text-sm text-primary">
                        {formatSalary(role.salaryMin, role.salaryMax)}
                      </p>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </aside>
        </div>
      </div>
    </PublicPage>
  );
}
