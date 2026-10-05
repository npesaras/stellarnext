import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { WorkspaceShell } from "@/components/workspace-shell";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: "/sign-in",
        search: { mode: "signin", redirect: location.href },
      });
    }

    if (
      context.user.accountType === "applicant" &&
      !context.user.profileBasicsComplete
    ) {
      throw redirect({ to: "/onboarding/profile" });
    }
    return { user: context.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();
  return (
    <WorkspaceShell user={user}>
      <Outlet />
    </WorkspaceShell>
  );
}
