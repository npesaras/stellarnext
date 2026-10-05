import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bookmark,
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  Search,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand-mark";
import { SignOutButton } from "@/components/sign-out-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { CurrentUser } from "@/lib/auth/auth.server";
import { cn } from "@/lib/utils";

const applicantItems = [
  { label: "Overview", to: "/dashboard" as const, icon: LayoutDashboard },
  { label: "Search jobs", to: "/search" as const, icon: Search },
  {
    label: "Applications",
    to: "/applications" as const,
    icon: BriefcaseBusiness,
  },
  { label: "Saved jobs", to: "/saved" as const, icon: Bookmark },
  { label: "Profile", to: "/profile" as const, icon: UserRound },
];

const employerItems = [
  { label: "Overview", to: "/dashboard" as const, icon: LayoutDashboard },
  {
    label: "Company profile",
    to: "/employer/onboarding" as const,
    icon: Building2,
  },
];

export function WorkspaceShell({
  children,
  user,
}: {
  children: ReactNode;
  user: CurrentUser;
}) {
  const navigating = useRouterState({ select: (state) => state.isLoading });
  const items =
    user.accountType === "employer" ? employerItems : applicantItems;
  const initials = (user.displayName ?? user.email)
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-muted/35 lg:grid lg:grid-cols-[17rem_1fr]">
      {navigating ? (
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 bg-primary/20"
          role="status"
        >
          <div className="h-full w-1/3 animate-pulse bg-primary" />
          <span className="sr-only">Loading page…</span>
        </div>
      ) : null}
      <aside className="hidden border-r bg-card lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="flex h-16 items-center px-5">
          <BrandMark />
        </div>
        <Separator />
        <nav
          className="flex flex-1 flex-col gap-1 p-3"
          aria-label={
            user.accountType === "employer"
              ? "Employer workspace"
              : "Applicant workspace"
          }
        >
          {items.map((item) => (
            <Button
              key={item.to}
              variant="ghost"
              className="justify-start"
              asChild
            >
              <Link
                to={item.to}
                activeProps={{ className: "bg-accent text-accent-foreground" }}
              >
                <item.icon data-icon="inline-start" aria-hidden="true" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="border-t p-3">
          <div className="mb-2 flex items-center gap-3 px-2 py-2">
            <Avatar>
              <AvatarFallback>{initials || "SJ"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {user.displayName ?? "Stellar member"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:hidden">
          <BrandMark />
          <SignOutButton className="w-auto" />
        </header>
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <nav
          className={cn(
            "fixed inset-x-0 bottom-0 z-40 grid border-t bg-background p-1 lg:hidden",
            user.accountType === "employer" ? "grid-cols-2" : "grid-cols-5",
          )}
          aria-label={
            user.accountType === "employer"
              ? "Employer workspace"
              : "Applicant workspace"
          }
        >
          {items.map((item) => (
            <Button
              key={item.to}
              variant="ghost"
              size="sm"
              className="h-auto flex-col gap-1 py-2"
              asChild
            >
              <Link to={item.to} activeProps={{ className: "text-primary" }}>
                <item.icon aria-hidden="true" />
                <span className="text-[0.65rem]">
                  {item.label.split(" ")[0]}
                </span>
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
}
