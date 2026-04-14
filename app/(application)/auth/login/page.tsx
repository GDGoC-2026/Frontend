"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/app/_components/theme-provider";
import { getAuthPalette } from "@/app/(application)/auth/_components/auth-theme";
import { useLoginMutation } from "@/hooks/use-auth";
import {
  AuthLayout,
  AuthLeftSection,
  AuthInput,
  AuthButton,
} from "@/app/(application)/auth/_components";

const PIXEL_MASCOT_DARK =
  "https://www.figma.com/api/mcp/asset/792deffd-33cc-44ca-936c-e937c0334c38";
const PIXEL_MASCOT_LIGHT =
  "https://www.figma.com/api/mcp/asset/f2f74f69-0eb2-4aec-a414-c1962f37273e";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const isDarkTheme = theme === "dark";
  const palette = getAuthPalette(theme);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLoginMutation({
    onSuccess: () => {
      router.replace(searchParams.get("next") || "/dashboard");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch {}
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
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md space-y-8"
      >
        <button
          suppressHydrationWarning
          type="button"
          onClick={toggleTheme}
          className="absolute -top-12 right-0 rounded-lg p-2 transition-colors"
          style={{
            backgroundColor: `${palette.primary}1a`,
            border: `2px solid ${palette.primary}`,
            color: palette.primary,
          }}
          title="Toggle theme"
        >
          {isDarkTheme ? "☀️" : "🌙"}
        </button>

        <div className="space-y-2">
          <h2
            className="text-2xl font-bold font-display"
            style={{
              color: palette.title,
            }}
          >
            {`> USER_LOGIN`}
          </h2>
          <p
            className="text-sm"
            style={{
              color: palette.body,
            }}
          >
            Enter your credentials to initialize the session.
          </p>
        </div>

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

        <AuthButton
          type="submit"
          disabled={loginMutation.isPending}
          isDarkTheme={isDarkTheme}
          className="w-full"
        >
          {loginMutation.isPending ? "INITIALIZING..." : "INITIALIZE SESSION"}
        </AuthButton>

        {loginMutation.error ? (
          <p
            className="text-sm"
            style={{
              color: "#f87171",
            }}
          >
            {loginMutation.error.message}
          </p>
        ) : null}

        <div className="space-y-3 text-center">
          <p
            className="space-x-2 text-xs"
            style={{
              color: palette.muted,
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
                color: palette.secondary,
              }}
            >
              [ CREATE_ACCOUNT ]
            </a>
          </p>
        </div>

        <div
          className="space-y-1 text-center text-xs"
          style={{
            color: palette.muted,
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
