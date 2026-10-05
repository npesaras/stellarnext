import { Link } from "@tanstack/react-router";
import { Orbit } from "lucide-react";

import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight",
        className,
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Orbit aria-hidden="true" />
      </span>
      <span className="text-lg">StellarJob</span>
    </Link>
  );
}
