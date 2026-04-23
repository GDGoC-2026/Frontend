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
        : "bg-[#eaf3ea] text-[#5f8166]"
      : tone === "purple"
        ? dark
          ? "border-l-4 border-[#d575ff] bg-[#262626]"
          : "border-l-4 border-[#9a7ab6] bg-[#d8e2d8]"
        : tone === "brand"
          ? dark
            ? "border-l-2 border-[#9cff93] bg-[#1a1a1a]"
            : "border-l-2 border-[#769a7a] bg-[#d8e2d8]"
          : dark
            ? "bg-[#262626]"
            : "bg-[#d8e2d8]";
  const labelClass =
    tone === "purple"
      ? dark
        ? "text-[#d575ff]"
        : "text-[#9a7ab6]"
      : tone === "success"
        ? dark
          ? "text-[#9cff93]"
          : "text-[#5f8166]"
        : theme === "dark"
          ? "text-[#adaaaa]"
          : "text-[#607068]";

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
          dark ? "text-white" : tone === "success" ? "text-[#5f8166]" : "text-[#243127]",
        )}
      >
        {body}
      </div>
    </div>
  );
}
