"use client";

import Image from "next/image";

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
  return (
    <div className="flex flex-col justify-between h-full">
      {/* Top Section - Title and Description */}
      <div className="space-y-4">
        <div
          className="text-xs font-bold uppercase tracking-widest"
          style={{
            color: isDarkTheme ? "#a0ffc3" : "#006d40",
          }}
        >
          SECURITY PROTOCOL
        </div>
        <div className="space-y-1">
          <div
            className="text-3xl font-bold font-display"
            style={{
              color: isDarkTheme ? "#e6e3f5" : "#1d1d2b",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              className="text-3xl font-bold font-display"
              style={{
                color: isDarkTheme ? "#ff51fa" : "#c100ba",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Middle Section - Mascot */}
      {mascotUrl && (
        <div className="flex justify-center py-8">
          <div className="relative w-32 h-32">
            <img
              src={mascotUrl}
              alt="Pixel Mascot"
              className="w-full h-full object-contain"
            />
            {/* Corner borders */}
            <div
              className="absolute -top-4 -left-4 w-12 h-12 border-l-2 border-t-2"
              style={{
                borderColor: isDarkTheme ? "#a0ffc3" : "#006d40",
              }}
            />
            <div
              className="absolute -bottom-4 -right-4 w-12 h-12 border-r-2 border-b-2"
              style={{
                borderColor: isDarkTheme ? "#ff51fa" : "#c100ba",
              }}
            />
          </div>
        </div>
      )}

      {/* Bottom Section - System Info */}
      <div
        className="text-xs uppercase tracking-wide"
        style={{
          color: isDarkTheme ? "#aba9ba" : "#595a70",
        }}
      >
        <div>SYSTEM VERSION: {systemInfo.version}</div>
        <div>ENCRYPTION: {systemInfo.encryption}</div>
      </div>
    </div>
  );
}
