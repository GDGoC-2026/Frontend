"use client";

import Image from "next/image";
import { getAuthPalette } from "@/app/(application)/auth/_components/auth-theme";

interface AuthLeftSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  isDarkTheme?: boolean;
  mascotUrl?: string;
  systemInfo?: {
    version: string;
    encryption: string;
  };
}

export function AuthLeftSection({
  title,
  subtitle,
  description,
  isDarkTheme = true,
  mascotUrl,
  systemInfo = {
    version: "0.9.4-ALPHA",
    encryption: "PIXEL-GRID-88",
  },
}: AuthLeftSectionProps) {
  const palette = getAuthPalette(isDarkTheme ? "dark" : "light");

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Top Section - Title and Description */}
      <div className="space-y-4">
        <div
          className="text-xs font-bold uppercase tracking-widest"
          style={{
            color: palette.primary,
          }}
        >
          SECURITY PROTOCOL
        </div>
        <div className="space-y-1">
          <div
            className="text-3xl font-bold font-display"
            style={{
              color: palette.title,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              className="text-3xl font-bold font-display"
              style={{
                color: palette.secondary,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        {description ? (
          <p
            className="max-w-xs text-sm leading-6"
            style={{
              color: palette.body,
            }}
          >
            {description}
          </p>
        ) : null}
      </div>

      {/* Middle Section - Mascot */}
      {mascotUrl && (
        <div className="flex justify-center py-8">
          <div className="relative w-32 h-32">
            <Image
              src={mascotUrl}
              alt="Pixel Mascot"
              className="w-full h-full object-contain"
              width={128}
              height={128}
              unoptimized
            />
            {/* Corner borders */}
            <div
              className="absolute -top-4 -left-4 w-12 h-12 border-l-2 border-t-2"
              style={{
                borderColor: palette.primary,
              }}
            />
            <div
              className="absolute -bottom-4 -right-4 w-12 h-12 border-r-2 border-b-2"
              style={{
                borderColor: palette.secondary,
              }}
            />
          </div>
        </div>
      )}

      {/* Bottom Section - System Info */}
      <div
        className="text-xs uppercase tracking-wide"
        style={{
          color: palette.muted,
        }}
      >
        <div>SYSTEM VERSION: {systemInfo.version}</div>
        <div>ENCRYPTION: {systemInfo.encryption}</div>
      </div>
    </div>
  );
}
