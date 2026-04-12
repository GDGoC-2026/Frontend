import type { ReactNode } from "react";
import type { CyberTheme } from "@/app/_components/ui-kit/shared";
import { cn } from "@/app/_components/ui-kit/shared";

export function MessageCard({
  theme,
  label,
  body,
  tone = "muted",
  className,
}: {
  theme: CyberTheme;
  label?: string;
  body: ReactNode;
  tone?: "muted" | "brand" | "purple" | "success";
  className?: string;
}) {
  const dark = theme === "dark";
  const wrapper =
    tone === "success"
      ? dark
        ? "bg-[#262626] text-[#9cff93]"
        : "bg-[#cfd7de] text-[#006e17]"
      : tone === "purple"
        ? dark
          ? "border-l-4 border-[#d575ff] bg-[#262626]"
          : "border-l-4 border-[#9800d0] bg-[#d9e0e6]"
        : tone === "brand"
          ? dark
            ? "border-l-2 border-[#9cff93] bg-[#1a1a1a]"
            : "border-l-2 border-[#16a34a] bg-[#d9e0e6]"
          : dark
            ? "bg-[#262626]"
            : "bg-[#d9e0e6]";
  const labelClass =
    tone === "purple"
      ? dark
        ? "text-[#d575ff]"
        : "text-[#9800d0]"
      : tone === "success"
        ? dark
          ? "text-[#9cff93]"
          : "text-[#006e17]"
        : theme === "dark"
          ? "text-[#adaaaa]"
          : "text-[#52606f]";

  return (
    <div className={cn(wrapper, "p-4", className)}>
      {label ? (
        <div className={cn("mb-2 font-sans text-[10px] font-bold uppercase", labelClass)}>
          {label}
        </div>
      ) : null}
      <div
        className={cn(
          "font-sans text-xs leading-4",
          dark ? "text-white" : tone === "success" ? "text-[#006e17]" : "text-[#0f172a]",
        )}
      >
        {body}
      </div>
    </div>
  );
}
