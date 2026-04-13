"use client";

import { useTheme } from "@/app/_components/theme-provider";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  leftSection: ReactNode;
  isDarkTheme?: boolean;
}

export function AuthLayout({ children, leftSection }: AuthLayoutProps) {
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";
  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 ${isDarkTheme ? "bg-[#0f0f1a]" : "bg-[#fafafa]"}`}
      data-theme={isDarkTheme ? "dark" : "light"}
    >
      <div
        className={`w-full max-w-4xl rounded-lg overflow-hidden shadow-2xl border
          ${
            isDarkTheme
              ? "bg-[#12121f] border-[rgba(71,71,85,0.15)]"
              : "bg-[#f5f3f7] border-[#d3d2ec]"
          }
        `}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "710px",
        }}
      >
        {/* Left Section */}
        <div
          className={`flex flex-col justify-between p-8 sm:p-12 rounded-l-lg
            ${isDarkTheme ? "bg-[#1e1e2e]" : "bg-[#efedf2]"}
          `}
        >
          {leftSection}
        </div>

        {/* Right Section - Form */}
        <div
          className={`flex flex-col justify-center p-8 sm:p-16
            ${isDarkTheme ? "bg-[#181827]" : "bg-white"}
          `}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
