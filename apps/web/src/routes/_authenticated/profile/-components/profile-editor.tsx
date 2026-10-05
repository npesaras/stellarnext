import { useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CircleAlert, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { saveProfileFn } from "@/lib/profile/profile.functions";
import type { OnboardingStepKey } from "@/types/onboarding";

type ProfileData = {
  profile: {
    first_name: string | null;
    last_name: string | null;
    headline: string | null;
    city: string | null;
    country: string | null;
    street_address: string | null;
    postal_code: string | null;
    phone: string | null;
    summary: string | null;
  } | null;
  skills: Array<{ label: string }>;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    city: string | null;
    country: string | null;
    is_current: boolean;
    start_date: string | null;
    end_date: string | null;
    description: string | null;
  }>;
  education: Array<{
    id: string;
    degree: string;
    school: string;
    field_of_study: string | null;
    city: string | null;
    country: string | null;
    is_current: boolean;
    start_date: string | null;
    end_date: string | null;
  }>;
  certifications: Array<{ id: string; name: string; issuer: string | null }>;
};

type ExperienceDraft = {
  id?: string;
  title: string;
  company: string;
  city: string;
  country: string;
  isCurrent: boolean;
  startDate: string;
  endDate: string;
  description: string;
};

type EducationDraft = {
  id?: string;
  degree: string;
  school: string;
  fieldOfStudy: string;
  city: string;
  country: string;
  isCurrent: boolean;
  startDate: string;
  endDate: string;
};
type CertificationDraft = { id?: string; name: string; issuer: string };

const emptyExperience: ExperienceDraft = {
  title: "",
  company: "",
  city: "",
  country: "",
  isCurrent: false,
  startDate: "",
  endDate: "",
  description: "",
};
const emptyEducation: EducationDraft = {
  degree: "",
  school: "",
  fieldOfStudy: "",
  city: "",
  country: "",
  isCurrent: false,
  startDate: "",
  endDate: "",
};
const emptyCertification: CertificationDraft = { name: "", issuer: "" };

function toDatabaseDate(value: string) {
  return value ? `${value}-01` : null;
}

export function ProfileEditor({
  data,
  onboarding = false,
  wizardStep,
  onSaved,
  onSavingChange,
}: {
  data: ProfileData;
  onboarding?: boolean;
  wizardStep?: Exclude<OnboardingStepKey, "done">;
  onSaved?: () => void;
  onSavingChange?: (saving: boolean) => void;
}) {
  const saveProfile = useServerFn(saveProfileFn);
  const router = useRouter();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [details, setDetails] = useState({
    firstName: data.profile?.first_name ?? "",
    lastName: data.profile?.last_name ?? "",
    headline: data.profile?.headline ?? "",
    city: data.profile?.city ?? "",
    country: data.profile?.country ?? "",
    streetAddress: data.profile?.street_address ?? "",
    postalCode: data.profile?.postal_code ?? "",
    phone: data.profile?.phone ?? "",
    summary: data.profile?.summary ?? "",
    skills: data.skills.map((skill) => skill.label).join(", "),
  });
  const [experiences, setExperiences] = useState<ExperienceDraft[]>(
    data.experience.map((item) => ({
      id: item.id,
      title: item.title,
      company: item.company,
      city: item.city ?? "",
      country: item.country ?? "",
      isCurrent: item.is_current,
      startDate: item.start_date?.slice(0, 7) ?? "",
      endDate: item.end_date?.slice(0, 7) ?? "",
      description: item.description ?? "",
    })),
  );
  const [education, setEducation] = useState<EducationDraft[]>(
    data.education.map((item) => ({
      id: item.id,
      degree: item.degree,
      school: item.school,
      fieldOfStudy: item.field_of_study ?? "",
      city: item.city ?? "",
      country: item.country ?? "",
      isCurrent: item.is_current,
      startDate: item.start_date?.slice(0, 7) ?? "",
      endDate: item.end_date?.slice(0, 7) ?? "",
    })),
  );
  const [certifications, setCertifications] = useState<CertificationDraft[]>(
    data.certifications.map((item) => ({
      id: item.id,
      name: item.name,
      issuer: item.issuer ?? "",
    })),
  );
  const [savedExperiences, setSavedExperiences] = useState(experiences);
  const [savedEducation, setSavedEducation] = useState(education);
  const [savedCertifications, setSavedCertifications] =
    useState(certifications);
  const [savedSkills, setSavedSkills] = useState(details.skills);

  useEffect(() => setSaveError(""), [wizardStep]);

  function updateDetails(key: keyof typeof details, value: string) {
    setDetails((current) => ({ ...current, [key]: value }));
  }

  async function persist(intent: "next" | "exit") {
    setPending(true);
    setSaveError("");
    onSavingChange?.(true);
    try {
      const experiencesToSave =
        wizardStep && wizardStep !== "experience"
          ? savedExperiences
          : experiences;
      const educationToSave =
        wizardStep && wizardStep !== "education" ? savedEducation : education;
      const certificationsToSave =
        wizardStep && wizardStep !== "certifications"
          ? savedCertifications
          : certifications;
      const result = await saveProfile({
        data: {
          firstName: details.firstName,
          lastName: details.lastName,
          headline: details.headline,
          city: details.city,
          country: details.country,
          streetAddress: details.streetAddress,
          postalCode: details.postalCode,
          phone: details.phone,
          summary: details.summary,
          skills: (wizardStep && wizardStep !== "skills"
            ? savedSkills
            : details.skills
          )
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
          experiences: experiencesToSave
            .filter(
              (item) => item.id || item.title.trim() || item.company.trim(),
            )
            .map((item) => ({
              ...item,
              startDate: toDatabaseDate(item.startDate),
              endDate: toDatabaseDate(item.endDate),
            })),
          education: educationToSave
            .filter(
              (item) => item.id || item.degree.trim() || item.school.trim(),
            )
            .map((item) => ({
              ...item,
              startDate: toDatabaseDate(item.startDate),
              endDate: toDatabaseDate(item.endDate),
            })),
          certifications: certificationsToSave.filter(
            (item) => item.id || item.name.trim(),
          ),
          completeOnboarding:
            onboarding && wizardStep === "review" && intent === "next",
          wizardStep,
        },
      });
      if (wizardStep === "experience") {
        const next = experiencesToSave
          .filter((item) => item.id || item.title.trim() || item.company.trim())
          .map((item, index) => ({ ...item, id: result.experienceIds[index] }));
        setExperiences(next);
        setSavedExperiences(next);
      } else if (wizardStep === "education") {
        const next = educationToSave
          .filter((item) => item.id || item.degree.trim() || item.school.trim())
          .map((item, index) => ({ ...item, id: result.educationIds[index] }));
        setEducation(next);
        setSavedEducation(next);
      } else if (wizardStep === "certifications") {
        const next = certificationsToSave
          .filter((item) => item.id || item.name.trim())
          .map((item, index) => ({
            ...item,
            id: result.certificationIds[index],
          }));
        setCertifications(next);
        setSavedCertifications(next);
      } else if (wizardStep === "skills") {
        const normalized = [
          ...new Set(
            details.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
          ),
        ].join(", ");
        setSavedSkills(normalized);
        updateDetails("skills", normalized);
      }
      if (wizardStep === "review" && intent === "next") {
        onSaved?.();
      }
      if (!wizardStep || intent === "exit" || wizardStep === "review") {
        await router.invalidate({ sync: true });
      }
      if (intent === "exit") {
        toast.success("Profile draft saved");
        await navigate({ to: "/profile" });
      } else if (wizardStep) {
        if (wizardStep === "review") toast.success("Your profile is ready");
        else toast.success("Progress saved");
        if (wizardStep !== "review") onSaved?.();
      } else {
        toast.success("Profile updated");
        await navigate({ to: "/profile" });
      }
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Please try again.";
      setSaveError(message);
      toast.error("Could not save your profile", {
        description: message,
      });
    } finally {
      setPending(false);
      onSavingChange?.(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await persist("next");
  }

  function skipStep() {
    if (!wizardStep) return;
    if (wizardStep === "experience") {
      setExperiences(savedExperiences);
    } else if (wizardStep === "education") {
      setEducation(savedEducation);
    } else if (wizardStep === "certifications") {
      setCertifications(savedCertifications);
    } else if (wizardStep === "skills") {
      updateDetails("skills", savedSkills);
    }
    onSaved?.();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      {saveError ? (
        <Alert variant="destructive" role="alert">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Could not save this step</AlertTitle>
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      ) : null}
      {(!wizardStep || ["name", "location", "skills"].includes(wizardStep)) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {wizardStep === "location"
                ? "Your location and contact"
                : wizardStep === "skills"
                  ? "Your skills"
                  : "Personal details"}
            </CardTitle>
            <CardDescription>
              {wizardStep === "location"
                ? "Help employers understand where you work from."
                : wizardStep === "skills"
                  ? "Add the capabilities employers can search for."
                  : "Help hiring teams understand who you are and what you do best."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {(!wizardStep || wizardStep === "name") && (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="firstName">First name</FieldLabel>
                      <Input
                        id="firstName"
                        value={details.firstName}
                        onChange={(event) =>
                          updateDetails("firstName", event.target.value)
                        }
                        required
                        maxLength={80}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                      <Input
                        id="lastName"
                        value={details.lastName}
                        onChange={(event) =>
                          updateDetails("lastName", event.target.value)
                        }
                        required
                        maxLength={80}
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="headline">
                      Professional headline
                    </FieldLabel>
                    <Input
                      id="headline"
                      value={details.headline}
                      onChange={(event) =>
                        updateDetails("headline", event.target.value)
                      }
                      placeholder="Product designer focused on accessible fintech"
                      maxLength={140}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="summary">About you</FieldLabel>
                    <Textarea
                      id="summary"
                      rows={5}
                      value={details.summary}
                      onChange={(event) =>
                        updateDetails("summary", event.target.value)
                      }
                      maxLength={1200}
                    />
                    <FieldDescription>
                      Focus on outcomes, strengths, and the work you want to do
                      next.
                    </FieldDescription>
                  </Field>
                </>
              )}
              {(!wizardStep || wizardStep === "location") && (
                <>
                  <div className="grid gap-5 sm:grid-cols-3">
                    <Field>
                      <FieldLabel htmlFor="city">City</FieldLabel>
                      <Input
                        id="city"
                        value={details.city}
                        onChange={(event) =>
                          updateDetails("city", event.target.value)
                        }
                        required={wizardStep === "location"}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="country">Country</FieldLabel>
                      <Input
                        id="country"
                        value={details.country}
                        onChange={(event) =>
                          updateDetails("country", event.target.value)
                        }
                        required={wizardStep === "location"}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="phone">Phone</FieldLabel>
                      <Input
                        id="phone"
                        type="tel"
                        value={details.phone}
                        onChange={(event) =>
                          updateDetails("phone", event.target.value)
                        }
                      />
                    </Field>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
                    <Field>
                      <FieldLabel htmlFor="streetAddress">
                        Street address
                      </FieldLabel>
                      <Input
                        id="streetAddress"
                        value={details.streetAddress}
                        onChange={(event) =>
                          updateDetails("streetAddress", event.target.value)
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="postalCode">Postal code</FieldLabel>
                      <Input
                        id="postalCode"
                        value={details.postalCode}
                        onChange={(event) =>
                          updateDetails("postalCode", event.target.value)
                        }
                      />
                    </Field>
                  </div>
                </>
              )}
              {(!wizardStep || wizardStep === "skills") && (
                <Field>
                  <FieldLabel htmlFor="skills">Skills</FieldLabel>
                  <Input
                    id="skills"
                    value={details.skills}
                    onChange={(event) =>
                      updateDetails("skills", event.target.value)
                    }
                    placeholder="TypeScript, Customer support, Data analysis"
                  />
                  <FieldDescription>
                    Separate skills with commas.
                  </FieldDescription>
                </Field>
              )}
            </FieldGroup>
          </CardContent>
        </Card>
      )}

      {(!wizardStep || wizardStep === "experience") && (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Work experience</CardTitle>
              <CardDescription>
                Add roles that show relevant responsibility and outcomes.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setExperiences((items) => [...items, emptyExperience])
              }
            >
              <Plus data-icon="inline-start" aria-hidden="true" />
              Add role
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {experiences.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No experience added yet.
              </p>
            ) : null}
            {experiences.map((experience, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 rounded-lg border p-4"
              >
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove experience"
                    onClick={() =>
                      setExperiences((items) =>
                        items.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor={`experience-title-${index}`}>
                      Role title
                    </FieldLabel>
                    <Input
                      id={`experience-title-${index}`}
                      value={experience.title}
                      onChange={(event) =>
                        setExperiences((items) =>
                          items.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, title: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`experience-company-${index}`}>
                      Company
                    </FieldLabel>
                    <Input
                      id={`experience-company-${index}`}
                      value={experience.company}
                      onChange={(event) =>
                        setExperiences((items) =>
                          items.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, company: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`experience-start-${index}`}>
                      Start month
                    </FieldLabel>
                    <Input
                      id={`experience-start-${index}`}
                      type="month"
                      value={experience.startDate}
                      onChange={(event) =>
                        setExperiences((items) =>
                          items.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, startDate: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`experience-end-${index}`}>
                      End month
                    </FieldLabel>
                    <Input
                      id={`experience-end-${index}`}
                      type="month"
                      disabled={experience.isCurrent}
                      value={experience.endDate}
                      onChange={(event) =>
                        setExperiences((items) =>
                          items.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, endDate: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`experience-city-${index}`}>
                      City
                    </FieldLabel>
                    <Input
                      id={`experience-city-${index}`}
                      value={experience.city}
                      onChange={(event) =>
                        setExperiences((items) =>
                          items.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, city: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`experience-country-${index}`}>
                      Country
                    </FieldLabel>
                    <Input
                      id={`experience-country-${index}`}
                      value={experience.country}
                      onChange={(event) =>
                        setExperiences((items) =>
                          items.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, country: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </Field>
                </div>
                <Field orientation="horizontal">
                  <Checkbox
                    id={`experience-current-${index}`}
                    checked={experience.isCurrent}
                    onCheckedChange={(checked) =>
                      setExperiences((items) =>
                        items.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, isCurrent: checked === true }
                            : item,
                        ),
                      )
                    }
                  />
                  <FieldLabel htmlFor={`experience-current-${index}`}>
                    I currently work here
                  </FieldLabel>
                </Field>
                <Field>
                  <FieldLabel htmlFor={`experience-description-${index}`}>
                    What you accomplished
                  </FieldLabel>
                  <Textarea
                    id={`experience-description-${index}`}
                    value={experience.description}
                    onChange={(event) =>
                      setExperiences((items) =>
                        items.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, description: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </Field>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {(!wizardStep || wizardStep === "education") && (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Education</CardTitle>
              <CardDescription>
                Add degrees, diplomas, or programs relevant to your path.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setEducation((items) => [...items, emptyEducation])
              }
            >
              <Plus data-icon="inline-start" aria-hidden="true" />
              Add education
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {education.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No education added yet.
              </p>
            ) : null}
            {education.map((item, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
              >
                <Field>
                  <FieldLabel htmlFor={`education-degree-${index}`}>
                    Degree or program
                  </FieldLabel>
                  <Input
                    id={`education-degree-${index}`}
                    value={item.degree}
                    onChange={(event) =>
                      setEducation((items) =>
                        items.map((entry, itemIndex) =>
                          itemIndex === index
                            ? { ...entry, degree: event.target.value }
                            : entry,
                        ),
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`education-school-${index}`}>
                    School
                  </FieldLabel>
                  <Input
                    id={`education-school-${index}`}
                    value={item.school}
                    onChange={(event) =>
                      setEducation((items) =>
                        items.map((entry, itemIndex) =>
                          itemIndex === index
                            ? { ...entry, school: event.target.value }
                            : entry,
                        ),
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`education-field-${index}`}>
                    Field of study
                  </FieldLabel>
                  <Input
                    id={`education-field-${index}`}
                    value={item.fieldOfStudy}
                    onChange={(event) =>
                      setEducation((items) =>
                        items.map((entry, itemIndex) =>
                          itemIndex === index
                            ? { ...entry, fieldOfStudy: event.target.value }
                            : entry,
                        ),
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`education-city-${index}`}>
                    City
                  </FieldLabel>
                  <Input
                    id={`education-city-${index}`}
                    value={item.city}
                    onChange={(event) =>
                      setEducation((items) =>
                        items.map((entry, itemIndex) =>
                          itemIndex === index
                            ? { ...entry, city: event.target.value }
                            : entry,
                        ),
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`education-country-${index}`}>
                    Country
                  </FieldLabel>
                  <Input
                    id={`education-country-${index}`}
                    value={item.country}
                    onChange={(event) =>
                      setEducation((items) =>
                        items.map((entry, itemIndex) =>
                          itemIndex === index
                            ? { ...entry, country: event.target.value }
                            : entry,
                        ),
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`education-start-${index}`}>
                    Start month
                  </FieldLabel>
                  <Input
                    id={`education-start-${index}`}
                    type="month"
                    value={item.startDate}
                    onChange={(event) =>
                      setEducation((items) =>
                        items.map((entry, itemIndex) =>
                          itemIndex === index
                            ? { ...entry, startDate: event.target.value }
                            : entry,
                        ),
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`education-end-${index}`}>
                    End month
                  </FieldLabel>
                  <Input
                    id={`education-end-${index}`}
                    type="month"
                    disabled={item.isCurrent}
                    value={item.endDate}
                    onChange={(event) =>
                      setEducation((items) =>
                        items.map((entry, itemIndex) =>
                          itemIndex === index
                            ? { ...entry, endDate: event.target.value }
                            : entry,
                        ),
                      )
                    }
                  />
                </Field>
                <Field orientation="horizontal">
                  <Checkbox
                    id={`education-current-${index}`}
                    checked={item.isCurrent}
                    onCheckedChange={(checked) =>
                      setEducation((items) =>
                        items.map((entry, itemIndex) =>
                          itemIndex === index
                            ? { ...entry, isCurrent: checked === true }
                            : entry,
                        ),
                      )
                    }
                  />
                  <FieldLabel htmlFor={`education-current-${index}`}>
                    Currently enrolled
                  </FieldLabel>
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove education"
                  onClick={() =>
                    setEducation((items) =>
                      items.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {(!wizardStep || wizardStep === "certifications") && (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Certifications</CardTitle>
              <CardDescription>
                Add licenses and certificates relevant to your work.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setCertifications((items) => [...items, emptyCertification])
              }
            >
              <Plus data-icon="inline-start" aria-hidden="true" /> Add
              certification
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {certifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No certifications added yet.
              </p>
            ) : null}
            {certifications.map((item, index) => (
              <div
                key={item.id ?? index}
                className="grid gap-4 rounded-lg border p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
              >
                <Field>
                  <FieldLabel htmlFor={`certification-name-${index}`}>
                    Certification name
                  </FieldLabel>
                  <Input
                    id={`certification-name-${index}`}
                    value={item.name}
                    onChange={(event) =>
                      setCertifications((items) =>
                        items.map((entry, itemIndex) =>
                          itemIndex === index
                            ? { ...entry, name: event.target.value }
                            : entry,
                        ),
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`certification-issuer-${index}`}>
                    Issuer
                  </FieldLabel>
                  <Input
                    id={`certification-issuer-${index}`}
                    value={item.issuer}
                    onChange={(event) =>
                      setCertifications((items) =>
                        items.map((entry, itemIndex) =>
                          itemIndex === index
                            ? { ...entry, issuer: event.target.value }
                            : entry,
                        ),
                      )
                    }
                  />
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove certification"
                  onClick={() =>
                    setCertifications((items) =>
                      items.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {wizardStep === "review" && (
        <Card>
          <CardHeader>
            <CardTitle>Review your profile</CardTitle>
            <CardDescription>
              Check these details before making your profile ready for
              applications.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 text-sm sm:grid-cols-2">
            <div>
              <p className="font-medium">Identity</p>
              <p className="text-muted-foreground">
                {details.firstName} {details.lastName}
              </p>
              <p className="text-muted-foreground">
                {details.headline || "No headline added"}
              </p>
            </div>
            <div>
              <p className="font-medium">Location</p>
              <p className="text-muted-foreground">
                {[details.city, details.country].filter(Boolean).join(", ") ||
                  "No location added"}
              </p>
            </div>
            <div>
              <p className="font-medium">Experience</p>
              <p className="text-muted-foreground">
                {experiences.length}{" "}
                {experiences.length === 1 ? "role" : "roles"}
              </p>
            </div>
            <div>
              <p className="font-medium">Education</p>
              <p className="text-muted-foreground">
                {education.length}{" "}
                {education.length === 1 ? "entry" : "entries"}
              </p>
            </div>
            <div>
              <p className="font-medium">Certifications</p>
              <p className="text-muted-foreground">
                {certifications.length}{" "}
                {certifications.length === 1 ? "certificate" : "certificates"}
              </p>
            </div>
            <div>
              <p className="font-medium">Skills</p>
              <p className="text-muted-foreground">
                {details.skills || "No skills added"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        {wizardStep &&
        wizardStep !== "review" &&
        wizardStep !== "name" &&
        wizardStep !== "location" ? (
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={skipStep}
          >
            Skip for now
          </Button>
        ) : null}
        {wizardStep ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => void persist("exit")}
          >
            Save and exit
          </Button>
        ) : null}
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Spinner data-icon="inline-start" /> : null}
          {pending
            ? "Saving…"
            : wizardStep === "review"
              ? "Finish profile"
              : wizardStep
                ? "Save and continue"
                : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
