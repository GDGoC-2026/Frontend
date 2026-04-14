"use client";

import { getAuthPalette } from "@/app/(application)/auth/_components/auth-theme";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isDarkTheme?: boolean;
  variant?: "primary" | "secondary" | "tertiary";
}

export function AuthButton({
  children,
  isDarkTheme = true,
  variant = "primary",
  className,
  ...props
}: AuthButtonProps) {
  const palette = getAuthPalette(isDarkTheme ? "dark" : "light");
  const baseStyles =
    "px-6 py-3 font-bold uppercase tracking-wide text-sm rounded-none transition-all duration-200";

  const variantStyles = {
    primary: isDarkTheme
      ? "text-[#08110b] active:scale-95"
      : "text-white active:scale-95",
    secondary: "border-2 bg-transparent",
    tertiary: "border-b-2 bg-transparent hover:opacity-100",
  };

  return (
    <button
      {...props}
      className={`${baseStyles} ${variantStyles[variant]} ${className || ""}`}
      style={
        variant === "primary"
          ? {
              backgroundColor: palette.primary,
            }
          : variant === "secondary"
            ? {
                borderColor: palette.secondary,
                color: palette.secondary,
              }
            : {
                borderColor: palette.muted,
                color: palette.muted,
              }
      }
      onMouseEnter={(event) => {
        if (variant === "primary") {
          event.currentTarget.style.backgroundColor = palette.primaryHover;
        }
        if (variant === "secondary") {
          event.currentTarget.style.backgroundColor = palette.secondary;
          event.currentTarget.style.color = "#08110b";
        }
        props.onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        if (variant === "primary") {
          event.currentTarget.style.backgroundColor = palette.primary;
        }
        if (variant === "secondary") {
          event.currentTarget.style.backgroundColor = "transparent";
          event.currentTarget.style.color = palette.secondary;
        }
        props.onMouseLeave?.(event);
      }}
    >
      {children}
    </button>
  );
}
