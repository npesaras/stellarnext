import { Link } from "@tanstack/react-router";

import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div className="flex flex-col gap-3">
          <BrandMark />
          <p className="max-w-md text-sm text-muted-foreground">
            Clearer pathways from education to meaningful work for Filipino
            talent and the teams hiring them.
          </p>
        </div>
        <nav
          className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm"
          aria-label="Footer"
        >
          <Link
            to="/find-jobs"
            className="text-muted-foreground hover:text-foreground"
          >
            Find jobs
          </Link>
          <Link
            to="/employers"
            className="text-muted-foreground hover:text-foreground"
          >
            Employers
          </Link>
          <Link
            to="/about"
            className="text-muted-foreground hover:text-foreground"
          >
            About
          </Link>
          <Link
            to="/sign-in"
            search={{ mode: "signin" }}
            className="text-muted-foreground hover:text-foreground"
          >
            Sign in
          </Link>
        </nav>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} StellarNext. Built for better career starts.
      </div>
    </footer>
  );
}
