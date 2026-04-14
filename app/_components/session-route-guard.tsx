"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logout, useSessionQuery } from "@/hooks/use-auth";

export function SessionRouteGuard({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: "auth" | "dashboard";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSessionQuery();
  const hasVerifiedSessionOnThisMount = session.isFetchedAfterMount;

  useEffect(() => {
    if (
      mode === "auth" &&
      hasVerifiedSessionOnThisMount &&
      session.data &&
      !session.isPending &&
      !session.isFetching
    ) {
      router.replace("/dashboard");
      return;
    }

    if (
      mode === "dashboard" &&
      hasVerifiedSessionOnThisMount &&
      session.data === null &&
      !session.isPending &&
      !session.isFetching
    ) {
      void logout().finally(() => {
        const next = pathname && pathname !== "/dashboard" ? `?next=${encodeURIComponent(pathname)}` : "";
        router.replace(`/auth/login${next}`);
      });
    }
  }, [
    hasVerifiedSessionOnThisMount,
    mode,
    pathname,
    router,
    session.data,
    session.isFetching,
    session.isPending,
  ]);

  if (mode === "dashboard" && (session.isPending || !hasVerifiedSessionOnThisMount)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm uppercase tracking-[0.24em] text-[#9cff93]">
        Verifying session...
      </div>
    );
  }

  return <>{children}</>;
}
