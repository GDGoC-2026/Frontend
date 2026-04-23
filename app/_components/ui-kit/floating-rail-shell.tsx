"use client";

import type { ReactNode } from "react";
import { useTheme } from "@/app/_components/theme-provider";
import { cn } from "@/app/_components/ui-kit/shared";

export function FloatingRailShell({
  children,
  className,
  widthClassName = "w-80",
}: {
  children: ReactNode;
  className?: string;
  widthClassName?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <div aria-hidden className={cn(widthClassName, "shrink-0")} />

      <aside
        suppressHydrationWarning
        className={cn(
          isDark
            ? "border-l-4 border-[#262626] bg-[#131313]"
            : "border-l-4 border-[#a3b1a4] bg-[#d8e2d8]",
          "cyber-scrollbar fixed right-0 top-0 z-40 flex h-screen max-h-screen overflow-y-auto overscroll-contain flex-col",
          widthClassName,
          className,
        )}
      >
        {children}
      </aside>
    </>
  );
}
