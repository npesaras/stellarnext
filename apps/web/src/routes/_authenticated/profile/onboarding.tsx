import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { STEPS } from "@/data/onboarding";
import { getProfileFn } from "@/lib/profile/profile.functions";
import { ProfileEditor } from "./-components/profile-editor";

const editableSteps = STEPS.filter((step) => step.key !== "done");

export const Route = createFileRoute("/_authenticated/profile/onboarding")({
  beforeLoad: ({ context }) => {
    if (context.user.accountType !== "applicant")
      throw redirect({ to: "/employer/onboarding" });
    if (!context.user.profileBasicsComplete)
      throw redirect({ to: "/onboarding/profile" });
  },
  loader: () => getProfileFn(),
  component: ProfileOnboardingPage,
  head: () => ({ meta: [{ title: "Build your profile — StellarNext" }] }),
});

function ProfileOnboardingPage() {
  const data = Route.useLoaderData();
  const editorData = {
    ...data,
    experience: data.experience.map((item) => ({
      ...item,
      title: item.title ?? "",
      company: item.company ?? "",
    })),
    education: data.education.map((item) => ({
      ...item,
      degree: item.degree ?? "",
      school: item.school ?? "",
    })),
  };
  const { user } = Route.useRouteContext();
  const [stepIndex, setStepIndex] = useState(0);
  const [stageLoaded, setStageLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [finished, setFinished] = useState(false);
  const storageKey = `stellarjob-profile-step:${user.id}`;

  useEffect(() => {
    if (user.onboardingComplete) {
      setStageLoaded(true);
      return;
    }
    try {
      const saved = Number(window.localStorage.getItem(storageKey));
      if (
        Number.isInteger(saved) &&
        saved >= 0 &&
        saved < editableSteps.length
      ) {
        setStepIndex(saved);
      }
    } catch {
      // Browser storage is optional; profile fields still reload from Supabase.
    }
    setStageLoaded(true);
  }, [storageKey, user.onboardingComplete]);

  function goToStep(index: number) {
    setStepIndex(index);
    try {
      window.localStorage.setItem(storageKey, String(index));
    } catch {
      // Progress remains available in this tab.
    }
  }

  function nextStep() {
    if (stepIndex === editableSteps.length - 1) {
      setFinished(true);
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // Completion itself is recorded in Supabase.
      }
      return;
    }
    goToStep(stepIndex + 1);
  }

  if (finished) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="items-center text-center">
          <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
          <CardTitle className="text-2xl">Your profile is ready</CardTitle>
          <CardDescription>
            Your details were saved. You can update them whenever your
            experience changes.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/profile">View profile</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/search">Find jobs</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (user.onboardingComplete) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-7 pb-24 lg:pb-0">
        <header>
          <Badge variant="secondary">Profile settings</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Keep your profile current
          </h1>
          <p className="mt-2 text-muted-foreground">
            Update the details employers see with your applications.
          </p>
        </header>
        <ProfileEditor data={editorData} />
      </div>
    );
  }

  if (!stageLoaded) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  const step = editableSteps[stepIndex];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-24 lg:pb-0">
      <header className="flex flex-col gap-3">
        <Badge variant="secondary" className="self-start">
          Profile builder · Step {stepIndex + 1} of {editableSteps.length}
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">{step.label}</h1>
        <p className="max-w-2xl text-muted-foreground">
          Build one reusable profile for every StellarNext application. Each step
          is saved before you continue.
        </p>
        <Progress
          value={Math.round(((stepIndex + 1) / editableSteps.length) * 100)}
          aria-label={`Profile builder progress: step ${stepIndex + 1} of ${editableSteps.length}`}
        />
      </header>

      <nav aria-label="Profile setup steps" className="flex flex-wrap gap-2">
        {editableSteps.map((item, index) => (
          <Button
            key={item.key}
            type="button"
            size="sm"
            variant={index === stepIndex ? "secondary" : "ghost"}
            aria-current={index === stepIndex ? "step" : undefined}
            disabled={saving || index > stepIndex}
            onClick={() => goToStep(index)}
          >
            {index + 1}. {item.label}
          </Button>
        ))}
      </nav>

      {stepIndex > 0 ? (
        <Button
          type="button"
          variant="outline"
          className="self-start"
          disabled={saving}
          onClick={() => goToStep(stepIndex - 1)}
        >
          Back
        </Button>
      ) : null}

      <ProfileEditor
        data={editorData}
        onboarding
        wizardStep={step.key}
        onSaved={nextStep}
        onSavingChange={setSaving}
      />
    </div>
  );
}
