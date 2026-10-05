import { JobCard } from "@/components/jobs/job-card";
import type { JobDetail } from "@/lib/jobs/job-model";

export function JobList({
  jobs,
  emptyMessage = "No open jobs have been posted yet.",
}: {
  jobs: JobDetail[];
  emptyMessage?: string;
}) {
  if (jobs.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
