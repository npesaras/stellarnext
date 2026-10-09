import {
  Link,
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { getJobFn, submitApplicationFn } from "@/lib/jobs/job.functions";
import { getApplicationProfilePreviewFn } from "@/lib/profile/application-preview.functions";

export const Route = createFileRoute("/_authenticated/jobs/$jobId/apply/")({
  beforeLoad: ({ context }) => {
    if (context.user.accountType !== "applicant")
      throw redirect({ to: "/dashboard" });
  },
  loader: async ({ params }) => {
    const [job, profile] = await Promise.all([
      getJobFn({ data: { jobId: params.jobId } }),
      getApplicationProfilePreviewFn(),
    ]);
    if (!job) throw notFound();
    return { job, profile };
  },
  component: ApplyPage,
  head: () => ({ meta: [{ title: "Apply — StellarNext" }] }),
});

function ApplyPage() {
  const { jobId } = Route.useParams();
  const { job, profile } = Route.useLoaderData();
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const router = useRouter();
  const submitApplication = useServerFn(submitApplicationFn);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try {
      const values = new FormData(event.currentTarget);
      await submitApplication({
        data: { jobId, note: String(values.get("note") ?? "") },
      });
      await router.invalidate({ sync: true });
      toast.success("Application submitted");
      await navigate({ to: "/applications" });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not submit your application.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-24 lg:pb-0">
      <Button variant="ghost" asChild>
        <Link to="/jobs/$jobId" params={{ jobId }}>
          ← Back to job
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Your saved profile</CardTitle>
          <CardDescription>
            Review the information currently saved to your StellarNext account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div>
            <p className="font-medium">
              {[profile.first_name, profile.last_name]
                .filter(Boolean)
                .join(" ") ||
                user.displayName ||
                "Name not added"}
            </p>
            <p className="text-muted-foreground">
              {profile.headline || "Professional headline not added"}
            </p>
            <p className="text-muted-foreground">
              {[profile.city, profile.country].filter(Boolean).join(", ") ||
                "Location not added"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {profile.cv_url ? "Résumé saved to profile" : "No résumé saved"}
            </Badge>
            <span className="text-muted-foreground">
              Résumé attachments are not submitted in this flow yet.
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild>
            <Link to="/profile/onboarding">Edit profile</Link>
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Apply for {job.title}</CardTitle>
          <CardDescription>
            Your application to {job.companyName} will be recorded with your
            optional note. Profile details above are for your review.
          </CardDescription>
        </CardHeader>
        <form onSubmit={submit}>
          <CardContent>
            <FieldGroup>
              <Alert>
                <Send aria-hidden="true" />
                <AlertTitle>Review your profile first</AlertTitle>
                <AlertDescription>
                  Your StellarNext profile should be current before you apply.
                </AlertDescription>
              </Alert>
              {!user.onboardingComplete ? (
                <Alert>
                  <AlertTitle>Profile setup required</AlertTitle>
                  <AlertDescription>
                    <Link
                      to="/profile/onboarding"
                      className="underline underline-offset-4"
                    >
                      Complete your profile
                    </Link>{" "}
                    before submitting an application.
                  </AlertDescription>
                </Alert>
              ) : null}
              <Field>
                <FieldLabel htmlFor="note">
                  Message to the hiring team
                </FieldLabel>
                <Textarea
                  id="note"
                  name="note"
                  rows={7}
                  placeholder="Share why this role is a strong fit…"
                />
                <FieldDescription>
                  Optional. Keep it specific and mention one relevant outcome or
                  project.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="mt-6 flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link to="/jobs/$jobId" params={{ jobId }}>
                Cancel
              </Link>
            </Button>
            <Button
              type="submit"
              disabled={
                pending ||
                user.accountType !== "applicant" ||
                !user.onboardingComplete
              }
            >
              {pending ? <Spinner data-icon="inline-start" /> : null}
              {pending ? "Submitting…" : "Submit application"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
