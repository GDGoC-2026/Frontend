import type { ReactNode } from "react";
import type { CyberTheme } from "@/app/_components/ui-kit/shared";
import { cn } from "@/app/_components/ui-kit/shared";

export function FloatingRailShell({
  theme,
  children,
  className,
  widthClassName = "w-80",
}: {
  theme: CyberTheme;
  children: ReactNode;
  className?: string;
  widthClassName?: string;
}) {
  return (
    <>
      <div aria-hidden className={cn(widthClassName, "shrink-0")} />
      <aside
        className={cn(
          theme === "dark"
            ? "border-l-4 border-[#262626] bg-[#131313]"
            : "border-l-4 border-[#b5c0ca] bg-[#d9e0e6]",
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
