"use client";

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
  const baseStyles =
    "px-6 py-3 font-bold uppercase tracking-wide text-sm rounded-none transition-all duration-200";

  const variantStyles = {
    primary: isDarkTheme
      ? "bg-[#a0ffc3] text-[#0d0d19] hover:bg-[#7fffa8] active:scale-95"
      : "bg-[#006d40] text-white hover:bg-[#005733] active:scale-95",
    secondary: isDarkTheme
      ? "border-2 border-[#ff51fa] text-[#ff51fa] hover:bg-[#ff51fa] hover:text-[#0d0d19]"
      : "border-2 border-[#c100ba] text-[#c100ba] hover:bg-[#c100ba] hover:text-white",
    tertiary: isDarkTheme
      ? "text-[#aba9ba] border-b-2 border-[#aba9ba] hover:text-[#e6e3f5]"
      : "text-[#595a70] border-b-2 border-[#595a70] hover:text-[#2d2d3d]",
  };

  return (
    <button
      {...props}
      className={`${baseStyles} ${variantStyles[variant]} ${className || ""}`}
    >
      {children}
    </button>
  );
}
