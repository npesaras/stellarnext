import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { CurrentUser } from "@/lib/auth/auth.server";

const navigation = [
  { label: "Find jobs", to: "/find-jobs" as const },
  { label: "For employers", to: "/employers" as const },
  { label: "About", to: "/about" as const },
];

export function SiteHeader({ user }: { user: CurrentUser | null }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandMark />

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {navigation.map((item) => (
            <Button key={item.to} variant="ghost" asChild>
              <Link to={item.to}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button asChild>
              <Link to="/dashboard">Open workspace</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/sign-in" search={{ mode: "signin" }}>
                  Sign in
                </Link>
              </Button>
              <Button asChild>
                <Link to="/sign-in" search={{ mode: "signup" }}>
                  Create account
                </Link>
              </Button>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Navigate StellarNext</SheetTitle>
              <SheetDescription>
                Explore jobs, employers, and your workspace.
              </SheetDescription>
            </SheetHeader>
            <nav
              className="mt-6 flex flex-col gap-2"
              aria-label="Mobile navigation"
            >
              {navigation.map((item) => (
                <SheetClose key={item.to} asChild>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to={item.to}>{item.label}</Link>
                  </Button>
                </SheetClose>
              ))}
              <div className="my-2 border-t" />
              <SheetClose asChild>
                <Button asChild>
                  <Link
                    to={user ? "/dashboard" : "/sign-in"}
                    search={user ? undefined : { mode: "signin" }}
                  >
                    {user ? "Open workspace" : "Sign in"}
                  </Link>
                </Button>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
