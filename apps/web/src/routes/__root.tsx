import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
  useRouter,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUserFn } from "@/lib/auth/auth.functions";
import appCss from "@/styles/app.css?url";

export const Route = createRootRoute({
  headers: () => ({ "Cache-Control": "private, no-store" }),
  beforeLoad: async () => ({ user: await getCurrentUserFn() }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "StellarJob — Better starts for meaningful careers" },
      {
        name: "description",
        content:
          "Explore live opportunities and track your path from application to meaningful work.",
      },
      { property: "og:title", content: "StellarJob" },
      {
        property: "og:description",
        content: "Better starts for meaningful careers.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster position="top-center" richColors />
    </>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <p className="font-mono text-sm text-primary">404</p>
          <CardTitle>That page is out of orbit</CardTitle>
          <CardDescription>
            The page may have moved or the address may be incorrect.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/">Return home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

function ErrorPage({ error, reset }: { error: unknown; reset: () => void }) {
  const router = useRouter();

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>This page did not load</CardTitle>
          <CardDescription>
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-2">
          <Button
            onClick={async () => {
              await router.invalidate({ sync: true });
              reset();
            }}
          >
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Go home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
