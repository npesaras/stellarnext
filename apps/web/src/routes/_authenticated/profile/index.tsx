import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  Award,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Sparkles,
} from "lucide-react";

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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getProfileFn } from "@/lib/profile/profile.functions";

export const Route = createFileRoute("/_authenticated/profile/")({
  beforeLoad: ({ context }) => {
    if (context.user.accountType !== "applicant")
      throw redirect({ to: "/dashboard" });
  },
  loader: () => getProfileFn(),
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile — StellarNext" }] }),
});

const monthYearFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatProfileDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 7)}-01T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : monthYearFormatter.format(date);
}

function formatPeriod(
  startDate: string | null,
  endDate: string | null,
  isCurrent: boolean,
) {
  const start = formatProfileDate(startDate);
  const end = isCurrent ? "Present" : formatProfileDate(endDate);
  return [start, end].filter(Boolean).join(" – ");
}

function formatLocation(city: string | null, country: string | null) {
  return [city, country].filter(Boolean).join(", ");
}

function ProfilePage() {
  const data = Route.useLoaderData();
  const { user } = Route.useRouteContext();
  const profile = data.profile;
  const displayName =
    profile?.display_name ?? user.displayName ?? "Stellar member";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="flex flex-col gap-6 pb-24 lg:pb-0">
      <Card>
        <CardContent className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-start">
          <Avatar className="size-20">
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-semibold tracking-tight">
              {displayName}
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">
              {profile?.headline ?? "Add a professional headline"}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Mail className="size-4" aria-hidden="true" />
                {user.email}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="size-4" aria-hidden="true" />
                {[profile?.city, profile?.country].filter(Boolean).join(", ") ||
                  "Location not added"}
              </span>
              {profile?.phone ? (
                <span className="flex items-center gap-2">
                  <Phone className="size-4" aria-hidden="true" />
                  {profile.phone}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/search">See jobs</Link>
            </Button>
            <Button asChild>
              <Link to="/profile/onboarding">
                <Pencil data-icon="inline-start" aria-hidden="true" />
                {user.onboardingComplete ? "Edit profile" : "Continue profile"}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-6">
          {profile?.min_salary != null ||
          profile?.work_model_prefs?.length ||
          profile?.locations?.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Work preferences</CardTitle>
                <CardDescription>
                  Preferences saved on your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                {profile.min_salary != null ? (
                  <p>
                    <span className="font-medium">Minimum salary target:</span>{" "}
                    {new Intl.NumberFormat().format(profile.min_salary)}
                  </p>
                ) : null}
                {profile.work_model_prefs?.length ? (
                  <p>
                    <span className="font-medium">Work model:</span>{" "}
                    {profile.work_model_prefs.join(", ")}
                  </p>
                ) : null}
                {profile.locations?.length ? (
                  <p>
                    <span className="font-medium">Preferred locations:</span>{" "}
                    {profile.locations.join(", ")}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="leading-7 text-muted-foreground">
              {profile?.summary ||
                "Tell employers about the outcomes you create and the work you want to do next."}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BriefcaseBusiness className="size-5" aria-hidden="true" />
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {data.experience.length ? (
                data.experience.map((item) => {
                  const period = formatPeriod(
                    item.start_date,
                    item.end_date,
                    item.is_current,
                  );
                  const location = formatLocation(item.city, item.country);
                  return (
                    <div
                      key={item.id}
                      className="border-l-2 border-primary/25 pl-4"
                    >
                      <p className="font-medium">
                        {item.title || "Role not specified"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.company || "Company not specified"}
                      </p>
                      {period || location ? (
                        <p className="text-sm text-muted-foreground">
                          {[period, location].filter(Boolean).join(" · ")}
                        </p>
                      ) : null}
                      {item.description ? (
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <BriefcaseBusiness aria-hidden="true" />
                    </EmptyMedia>
                    <EmptyTitle>No experience yet</EmptyTitle>
                    <EmptyDescription>
                      Add relevant roles and projects to strengthen your
                      profile.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="size-5" aria-hidden="true" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {data.education.length ? (
                data.education.map((item) => {
                  const period = formatPeriod(
                    item.start_date,
                    item.end_date,
                    item.is_current,
                  );
                  const location = formatLocation(item.city, item.country);
                  return (
                    <div key={item.id}>
                      <p className="font-medium">
                        {item.degree || "Degree not specified"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.school || "School not specified"}
                        {item.field_of_study ? ` · ${item.field_of_study}` : ""}
                      </p>
                      {period || location ? (
                        <p className="text-sm text-muted-foreground">
                          {[period, location].filter(Boolean).join(" · ")}
                        </p>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  No education added yet.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="size-5" aria-hidden="true" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {data.certifications.length ? (
                data.certifications.map((item) => (
                  <div key={item.id}>
                    <p className="font-medium">{item.name}</p>
                    {item.issuer || item.issued_year ? (
                      <p className="text-sm text-muted-foreground">
                        {[item.issuer, item.issued_year]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No certifications added yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5" aria-hidden="true" />
                Skills
              </CardTitle>
              <CardDescription>
                Skills included with your applications.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {data.skills.length ? (
                data.skills.map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.label}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Add your strongest skills.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Profile status</CardTitle>
              <CardDescription>
                {user.onboardingComplete
                  ? "Your profile is ready to use when applying for jobs."
                  : "Complete your profile before applying."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge
                variant={user.onboardingComplete ? "secondary" : "outline"}
              >
                {user.onboardingComplete ? "Ready" : "Needs attention"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
