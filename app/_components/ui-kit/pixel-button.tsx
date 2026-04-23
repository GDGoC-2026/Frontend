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
          : "border-2 border-[#9a7ab6] bg-transparent text-[#9a7ab6]"
        : theme === "dark"
          ? "bg-[#d575ff] text-[#390050] shadow-[4px_4px_0px_0px_black]"
          : "bg-[#9a7ab6] text-white shadow-[4px_4px_0px_0px_#7d678f]"
      : tone === "cyan"
        ? theme === "dark"
          ? "bg-[#69daff] text-[#002935]"
          : "bg-[#6f95a5] text-white shadow-[4px_4px_0px_0px_#5d7d88]"
        : hollow
          ? theme === "dark"
            ? "border-2 border-[#9cff93] bg-transparent text-[#9cff93]"
            : "border-2 border-[#5f8166] bg-transparent text-[#5f8166]"
          : theme === "dark"
            ? "bg-[#9cff93] text-[#006413] shadow-[4px_4px_0px_0px_#00440a]"
            : "bg-[#769a7a] text-white shadow-[4px_4px_0px_0px_#58745e]";

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
