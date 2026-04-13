"use client";

import { useTheme } from "@/app/_components/theme-provider";
import { cn, interactiveMotionClass } from "@/app/_components/ui-kit/shared";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      suppressHydrationWarning
      className={cn(
        "group inline-flex items-center gap-3 border-2 px-3 py-2",
        interactiveMotionClass,
        isDark
          ? "border-[#262626] bg-[#131313] text-[#9cff93]"
          : "border-[#b5c0ca] bg-[#d9e0e6] text-[#006e17]",
      )}
      onClick={toggleTheme}
      type="button"
    >
      <span
        suppressHydrationWarning
        className={cn(
          "font-display text-[10px] font-bold uppercase tracking-[1.8px]",
          isDark ? "text-[#69daff]" : "text-[#0891b2]",
        )}
      >
        {isDark ? "Light Mode" : "Dark Mode"}
      </span>

      <span
        className={cn(
          "font-pixel text-[10px] leading-none",
          isDark ? "text-[#9cff93]" : "text-[#006e17]",
        )}
      >
        THEME
      </span>
    </button>
  );
}
