import { Link, createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { JobList } from "@/components/jobs/job-list";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { searchJobsFn } from "@/lib/jobs/job.functions";
import { jobSearchSchema, type JobSearch } from "@/lib/jobs/job-search-schema";

const workModels = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
] as const;
const employmentTypes = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
] as const;

export const Route = createFileRoute("/_authenticated/search/")({
  validateSearch: jobSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => searchJobsFn({ data: deps }),
  component: SearchPage,
  pendingComponent: SearchPending,
  head: () => ({ meta: [{ title: "Search jobs — StellarNext" }] }),
});

function SearchFilters({ initial }: { initial: JobSearch }) {
  const navigate = Route.useNavigate();
  const [draft, setDraft] = useState<JobSearch>(initial);
  const appliedFilters =
    initial.workModels.length +
    initial.employmentTypes.length +
    Number(initial.minSalary > 0) +
    Number(initial.postedWithinDays !== null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void navigate({ search: { ...draft, page: 1 } });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          <CardTitle>Search and refine</CardTitle>
          {appliedFilters > 0 ? (
            <Badge variant="secondary">{appliedFilters} applied</Badge>
          ) : null}
        </div>
        <CardDescription>
          Search titles, categories, or descriptions, then narrow the live
          results.
        </CardDescription>
      </CardHeader>
      <form onSubmit={submit}>
        <CardContent className="flex flex-col gap-6">
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="job-query">Keywords</FieldLabel>
              <Input
                id="job-query"
                value={draft.q}
                maxLength={100}
                placeholder="Job title or category"
                onChange={(event) =>
                  setDraft((current) => ({ ...current, q: event.target.value }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="job-location">City</FieldLabel>
              <Input
                id="job-location"
                value={draft.location}
                maxLength={100}
                placeholder="Any city"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
              />
            </Field>
          </FieldGroup>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <FieldSet>
              <FieldLegend variant="label">Work model</FieldLegend>
              <FieldGroup className="gap-3">
                {workModels.map((option) => (
                  <Field key={option.value} orientation="horizontal">
                    <Checkbox
                      id={`work-${option.value}`}
                      checked={draft.workModels.includes(option.value)}
                      onCheckedChange={(checked) =>
                        setDraft((current) => ({
                          ...current,
                          workModels: checked
                            ? [...current.workModels, option.value]
                            : current.workModels.filter(
                                (item) => item !== option.value,
                              ),
                        }))
                      }
                    />
                    <FieldLabel htmlFor={`work-${option.value}`}>
                      {option.label}
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
            </FieldSet>
            <FieldSet>
              <FieldLegend variant="label">Employment</FieldLegend>
              <FieldGroup className="gap-3">
                {employmentTypes.map((option) => (
                  <Field key={option.value} orientation="horizontal">
                    <Checkbox
                      id={`employment-${option.value}`}
                      checked={draft.employmentTypes.includes(option.value)}
                      onCheckedChange={(checked) =>
                        setDraft((current) => ({
                          ...current,
                          employmentTypes: checked
                            ? [...current.employmentTypes, option.value]
                            : current.employmentTypes.filter(
                                (item) => item !== option.value,
                              ),
                        }))
                      }
                    />
                    <FieldLabel htmlFor={`employment-${option.value}`}>
                      {option.label}
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
            </FieldSet>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="minimum-salary">
                  Minimum monthly salary (₱)
                </FieldLabel>
                <Input
                  id="minimum-salary"
                  type="number"
                  min={0}
                  max={10_000_000}
                  step={1000}
                  value={draft.minSalary || ""}
                  placeholder="Any salary"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      minSalary: Number(event.target.value) || 0,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="posted-within">Posted</FieldLabel>
                <Select
                  value={String(draft.postedWithinDays ?? "any")}
                  onValueChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      postedWithinDays:
                        value === "1"
                          ? 1
                          : value === "7"
                            ? 7
                            : value === "30"
                              ? 30
                              : null,
                    }))
                  }
                >
                  <SelectTrigger id="posted-within">
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="any">Any time</SelectItem>
                      <SelectItem value="1">Past 24 hours</SelectItem>
                      <SelectItem value="7">Past 7 days</SelectItem>
                      <SelectItem value="30">Past 30 days</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <Field>
              <FieldLabel htmlFor="search-sort">Sort results</FieldLabel>
              <Select
                value={draft.sort}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    sort:
                      value === "oldest"
                        ? "oldest"
                        : value === "salary_high"
                          ? "salary_high"
                          : value === "salary_low"
                            ? "salary_low"
                            : "newest",
                  }))
                }
              >
                <SelectTrigger id="search-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="salary_high">
                      Minimum salary: high to low
                    </SelectItem>
                    <SelectItem value="salary_low">
                      Minimum salary: low to high
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void navigate({ search: jobSearchSchema.parse({}) })}
          >
            Clear filters
          </Button>
          <Button type="submit">
            <Search data-icon="inline-start" aria-hidden="true" />
            Search jobs
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function SearchPage() {
  const filters = Route.useSearch();
  const { jobs, count, pageSize } = Route.useLoaderData();
  const totalPages = Math.ceil(count / pageSize);
  const firstResult = count ? (filters.page - 1) * pageSize + 1 : 0;
  const lastResult = Math.min(filters.page * pageSize, count);

  return (
    <div className="flex flex-col gap-7 pb-24 lg:pb-0">
      <header>
        <p className="text-sm font-medium text-primary">Opportunity search</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Find a role that fits
        </h1>
      </header>
      <SearchFilters key={JSON.stringify(filters)} initial={filters} />
      <section className="flex flex-col gap-4" aria-label="Job search results">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Open roles</h2>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {count} {count === 1 ? "role" : "roles"} match your search
              {count ? ` · showing ${firstResult}–${lastResult}` : ""}
            </p>
          </div>
          {filters.q || filters.location ? (
            <Badge variant="outline" className="max-w-full truncate">
              {[filters.q, filters.location].filter(Boolean).join(" · ")}
            </Badge>
          ) : null}
        </div>
        {jobs.length ? (
          <JobList jobs={jobs} />
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>
                {count > 0 ? "No roles on this page" : "No matching jobs"}
              </EmptyTitle>
              <EmptyDescription>
                {count > 0
                  ? "Go back to an earlier results page."
                  : "Try broader keywords or clear your filters."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" asChild>
                <Link
                  to="/search"
                  search={
                    count > 0
                      ? { ...filters, page: Math.max(1, filters.page - 1) }
                      : jobSearchSchema.parse({})
                  }
                >
                  {count > 0 ? "Previous page" : "Clear filters"}
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}
        {totalPages > 1 ? (
          <nav
            aria-label="Job results pages"
            className="flex items-center justify-center gap-3"
          >
            {filters.page > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  to="/search"
                  search={(previous) => ({
                    ...previous,
                    page: filters.page - 1,
                  })}
                >
                  <ChevronLeft data-icon="inline-start" aria-hidden="true" />
                  Previous
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              Page {filters.page} of {totalPages}
            </span>
            {filters.page < totalPages ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  to="/search"
                  search={(previous) => ({
                    ...previous,
                    page: filters.page + 1,
                  })}
                >
                  Next
                  <ChevronRight data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            )}
          </nav>
        ) : null}
      </section>
    </div>
  );
}

function SearchPending() {
  return (
    <div className="flex flex-col gap-6" aria-label="Loading jobs">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-64 w-full" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-52 w-full" />
      </div>
    </div>
  );
}
