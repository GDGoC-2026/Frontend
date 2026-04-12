import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { CyberTheme } from "@/app/_components/ui-kit/shared";
import {
  cn,
  interactiveMotionClass,
} from "@/app/_components/ui-kit/shared";

type PixelButtonProps = {
  theme: CyberTheme;
  tone?: "brand" | "purple" | "cyan";
  children: ReactNode;
  className?: string;
  hollow?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function PixelButton({
  theme,
  tone = "brand",
  children,
  className,
  hollow = false,
  type = "button",
  ...props
}: PixelButtonProps) {
  const styles =
    tone === "purple"
      ? hollow
        ? theme === "dark"
          ? "border-2 border-[#d575ff] bg-transparent text-[#d575ff]"
          : "border-2 border-[#9800d0] bg-transparent text-[#9800d0]"
        : theme === "dark"
          ? "bg-[#d575ff] text-[#390050] shadow-[4px_4px_0px_0px_black]"
          : "bg-[#9800d0] text-white shadow-[4px_4px_0px_0px_#0f172a]"
      : tone === "cyan"
        ? theme === "dark"
          ? "bg-[#69daff] text-[#002935]"
          : "bg-[#0891b2] text-white"
        : hollow
          ? theme === "dark"
            ? "border-2 border-[#9cff93] bg-transparent text-[#9cff93]"
            : "border-2 border-[#16a34a] bg-transparent text-[#16a34a]"
          : theme === "dark"
            ? "bg-[#9cff93] text-[#006413] shadow-[4px_4px_0px_0px_#00440a]"
            : "bg-[#16a34a] text-white shadow-[4px_4px_0px_0px_#00440a]";

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-3 px-8 py-3",
        interactiveMotionClass,
        styles,
        className,
      )}
      type={type}
      {...props}
    >
      <span className="font-display text-sm font-bold uppercase tracking-[1.4px]">
        {children}
      </span>
    </button>
  );
}
