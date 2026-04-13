"use client";

import { InputHTMLAttributes } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  isDarkTheme?: boolean;
  helper?: string;
}

export function AuthInput({
  label,
  isDarkTheme = true,
  helper,
  className,
  ...props
}: AuthInputProps) {
  return (
    <div className="w-full space-y-2">
      <label
        className="text-xs font-bold uppercase tracking-wide block"
        style={{
          color: isDarkTheme ? "#a0ffc3" : "#006d40",
        }}
      >
        {label}
        {helper && (
          <span
            className="float-right text-xs font-normal"
            style={{
              color: isDarkTheme ? "#aba9ba" : "#595a70",
            }}
          >
            {helper}
          </span>
        )}
      </label>
      <input
        {...props}
        className={`
          w-full px-4 py-3 rounded-none text-sm font-sans
          transition-colors duration-200
          ${
            isDarkTheme
              ? "bg-[#242436] text-[rgba(71,71,85,0.5)] placeholder-[rgba(71,71,85,0.5)]"
              : "bg-[#e6e4e9] text-[rgba(89,90,112,0.5)] placeholder-[rgba(89,90,112,0.5)]"
          }
          focus:outline-none focus:ring-2
          ${
            isDarkTheme
              ? "focus:ring-[#a0ffc3] focus:bg-[#2d2d3f]"
              : "focus:ring-[#006d40] focus:bg-[#f0f0f5]"
          }
          ${className || ""}
        `}
      />
    </div>
  );
}
