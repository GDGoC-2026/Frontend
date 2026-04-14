"use client";

import { useTheme } from "@/app/_components/theme-provider";
import { ReactNode } from "react";
import { getAuthPalette } from "@/app/(application)/auth/_components/auth-theme";

interface AuthLayoutProps {
  children: ReactNode;
  leftSection: ReactNode;
  isDarkTheme?: boolean;
}

export function AuthLayout({ children, leftSection }: AuthLayoutProps) {
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";
  const palette = getAuthPalette(theme);
  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 ${palette.page}`}
      data-theme={isDarkTheme ? "dark" : "light"}
    >
      <div
        className={`w-full max-w-4xl rounded-lg overflow-hidden border shadow-2xl ${palette.shell} ${palette.shellBorder}`}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "710px",
        }}
      >
        {/* Left Section */}
        <div
          className={`flex flex-col justify-between rounded-l-lg p-8 sm:p-12 ${palette.leftPanel}`}
        >
          {leftSection}
        </div>

        {/* Right Section - Form */}
        <div
          className={`flex flex-col justify-center p-8 sm:p-16 ${palette.rightPanel}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
