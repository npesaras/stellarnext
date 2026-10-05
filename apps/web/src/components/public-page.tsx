import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { CurrentUser } from "@/lib/auth/auth.server";

export function PublicPage({
  children,
  user,
}: {
  children: ReactNode;
  user: CurrentUser | null;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader user={user} />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
