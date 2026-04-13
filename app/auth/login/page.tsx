"use client";

import { useState } from "react";
import { useTheme } from "@/app/_components/theme-provider";
import {
  AuthLayout,
  AuthLeftSection,
  AuthInput,
  AuthButton,
} from "../_components";

const PIXEL_MASCOT_DARK =
  "https://www.figma.com/api/mcp/asset/792deffd-33cc-44ca-936c-e937c0334c38";
const PIXEL_MASCOT_LIGHT =
  "https://www.figma.com/api/mcp/asset/f2f74f69-0eb2-4aec-a414-c1962f37273e";

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const isDarkTheme = theme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement login logic
      console.log("Login attempt:", { email, password });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      leftSection={
        <AuthLeftSection
          title="ACCESSING THE"
          subtitle="VOID"
          mascotUrl={isDarkTheme ? PIXEL_MASCOT_DARK : PIXEL_MASCOT_LIGHT}
          isDarkTheme={isDarkTheme}
        />
      }
      isDarkTheme={isDarkTheme}
    >
      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-8 relative"
      >
        {/* Theme Toggle Button */}
        <button
          suppressHydrationWarning
          type="button"
          onClick={toggleTheme}
          className="absolute -top-12 right-0 p-2 rounded-lg transition-colors"
          style={{
            backgroundColor: isDarkTheme
              ? "rgba(160, 255, 195, 0.1)"
              : "rgba(0, 109, 64, 0.1)",
            border: `2px solid ${isDarkTheme ? "#a0ffc3" : "#006d40"}`,
            color: isDarkTheme ? "#a0ffc3" : "#006d40",
          }}
          title="Toggle theme"
        >
          {isDarkTheme ? "☀️" : "🌙"}
        </button>

        {/* Header */}
        <div className="space-y-2">
          <h2
            className="text-2xl font-bold font-display"
            style={{
              color: isDarkTheme ? "#e1e0fb" : "#2d2d3d",
            }}
          >
            {`> USER_LOGIN`}
          </h2>
          <p
            className="text-sm"
            style={{
              color: isDarkTheme ? "#aba9ba" : "#595a70",
            }}
          >
            Enter your credentials to initialize the session.
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <AuthInput
            label="Email Identifier"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@void.collective"
            required
            isDarkTheme={isDarkTheme}
          />

          <AuthInput
            label="Access Key"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            helper="FORGOT?"
            required
            isDarkTheme={isDarkTheme}
          />
        </div>

        {/* Submit Button */}
        <AuthButton
          type="submit"
          disabled={isLoading}
          isDarkTheme={isDarkTheme}
          className="w-full"
        >
          {isLoading ? "INITIALIZING..." : "INITIALIZE SESSION"}
        </AuthButton>

        {/* Footer Links */}
        <div className="space-y-3 text-center">
          <p
            className="text-xs space-x-2"
            style={{
              color: isDarkTheme ? "#aba9ba" : "#595a70",
            }}
          >
            <span>[ GITHUB ]</span>
            <span>[ DISCORD ]</span>
          </p>
          <p className="text-xs">
            New entity?{" "}
            <a
              href="/auth/register"
              className="hover:underline"
              style={{
                color: isDarkTheme ? "#ff51fa" : "#c100ba",
              }}
            >
              [ CREATE_ACCOUNT ]
            </a>
          </p>
        </div>

        {/* Footer */}
        <div
          className="text-center text-xs space-y-1"
          style={{
            color: isDarkTheme ? "#aba9ba" : "#595a70",
          }}
        >
          <p className="space-x-2">
            <a href="#" className="hover:opacity-70">
              TERMS
            </a>
            <a href="#" className="hover:opacity-70">
              PRIVACY
            </a>
            <a href="#" className="hover:opacity-70">
              SUPPORT
            </a>
          </p>
          <p>© 2024 DIGITAL ARTISAN COLLECTIVE</p>
        </div>
      </form>
    </AuthLayout>
  );
}
