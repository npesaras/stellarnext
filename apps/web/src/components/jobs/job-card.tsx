import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Building2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatEmploymentType,
  formatSalary,
  formatWorkModel,
  jobLocationLabel,
} from "@/components/jobs/job-format";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { JobDetail } from "@/lib/jobs/job-model";

export function JobCard({ job }: { job: JobDetail }) {
  const pills = [
    jobLocationLabel(job.city),
    formatWorkModel(job.workModel),
    formatEmploymentType(job.employmentType),
  ];

  return (
    <Card className="group h-full transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-11 rounded-lg">
            <AvatarFallback className="rounded-lg bg-secondary text-secondary-foreground">
              {job.companyName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{job.title}</h3>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Building2 aria-hidden="true" className="size-3.5" />
              <span className="truncate">{job.companyName}</span>
            </p>
          </div>
        </div>
        {job.promoted ? <Badge variant="outline">Promoted</Badge> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="font-medium text-primary">
          {formatSalary(job.salaryMin, job.salaryMax)}
        </p>
        <div className="flex flex-wrap gap-2">
          {pills.map((pill) => (
            <Badge key={pill} variant="secondary" className="font-normal">
              {pill}
            </Badge>
          ))}
          {job.category ? (
            <Badge variant="outline" className="font-normal">
              {job.category}
            </Badge>
          ) : null}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="ml-auto" asChild>
          <Link to="/jobs/$jobId" params={{ jobId: job.id }}>
            View role
            <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
