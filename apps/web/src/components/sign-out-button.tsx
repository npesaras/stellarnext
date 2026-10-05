import { useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { LogOut } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { signOutFn } from "@/lib/auth/auth.functions";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  const signOut = useServerFn(signOutFn);
  const router = useRouter();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="ghost"
      className={cn("w-full justify-start", className)}
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await signOut();
          await router.invalidate({ sync: true });
          await navigate({ to: "/" });
        } finally {
          setPending(false);
        }
      }}
    >
      <LogOut data-icon="inline-start" aria-hidden="true" />
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
