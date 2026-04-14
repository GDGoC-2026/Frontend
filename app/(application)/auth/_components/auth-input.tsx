"use client";

import { getAuthPalette } from "@/app/(application)/auth/_components/auth-theme";
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
  const palette = getAuthPalette(isDarkTheme ? "dark" : "light");

  return (
    <div className="w-full space-y-2">
      <label
        className="text-xs font-bold uppercase tracking-wide block"
        style={{
          color: palette.primary,
        }}
      >
        {label}
        {helper && (
          <span
            className="float-right text-xs font-normal"
            style={{
              color: palette.muted,
            }}
          >
            {helper}
          </span>
        )}
      </label>
      <input
        className={`
          w-full px-4 py-3 rounded-none text-sm font-sans
          border border-transparent transition-colors duration-200
          ${isDarkTheme ? "text-[#f8fafc] placeholder:text-[#7c8b99]" : "text-[#0f172a] placeholder:text-[#64748b]"}
          focus:outline-none focus:ring-2
          ${isDarkTheme ? "focus:ring-[#9cff93]" : "focus:ring-[#006e17]"}
          ${className || ""}
        `}
        style={{
          backgroundColor: palette.input,
        }}
        {...props}
        onFocus={(event) => {
          event.currentTarget.style.backgroundColor = palette.inputFocus;
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          event.currentTarget.style.backgroundColor = palette.input;
          props.onBlur?.(event);
        }}
      />
    </div>
  );
}
