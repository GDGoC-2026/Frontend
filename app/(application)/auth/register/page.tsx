"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/app/_components/theme-provider";
import { getAuthPalette } from "@/app/(application)/auth/_components/auth-theme";
import { useRegisterMutation } from "@/hooks/use-auth";
import {
  AuthLayout,
  AuthLeftSection,
  AuthInput,
  AuthButton,
} from "@/app/(application)/auth/_components";

const PIXEL_SPRITE_DARK =
  "https://www.figma.com/api/mcp/asset/775daeb5-b11f-4cea-a70b-6bbe487517dd";
const PIXEL_SPRITE_LIGHT =
  "https://www.figma.com/api/mcp/asset/8bd21c9c-d02d-41d7-bd85-c1e3f0f0eede";

export default function RegisterPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDarkTheme = theme === "dark";
  const palette = getAuthPalette(theme);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const registerMutation = useRegisterMutation({
    onSuccess: () => {
      router.replace("/dashboard");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      alert("Please agree to the terms of service");
      return;
    }

    try {
      await registerMutation.mutateAsync({
        email,
        full_name: fullName || null,
        password,
      });
    } catch {}
  };

  return (
    <AuthLayout
      leftSection={
        <AuthLeftSection
          title="CREATE"
          subtitle="IDENTITY."
          description="Join the artisan collective. Secure your digital assets within our high-fidelity infrastructure."
          mascotUrl={isDarkTheme ? PIXEL_SPRITE_DARK : PIXEL_SPRITE_LIGHT}
          isDarkTheme={isDarkTheme}
        />
      }
      isDarkTheme={isDarkTheme}
    >
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md space-y-6"
      >
        <button
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

        <div className="mb-8 space-y-3">
          <h2
            className="text-xl font-bold font-display uppercase"
            style={{
              color: palette.title,
            }}
          >
            {`> REGISTER ACCOUNT`}
          </h2>
          <div
            className="h-0.5 w-12"
            style={{
              backgroundColor: palette.primary,
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <AuthInput
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Void Runner"
            isDarkTheme={isDarkTheme}
          />

          <AuthInput
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="artisan@pixel.io"
            required
            isDarkTheme={isDarkTheme}
          />
        </div>

        <div>
          <AuthInput
            label="Access Key (Password)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            isDarkTheme={isDarkTheme}
          />
        </div>

        <label className="flex cursor-pointer items-center space-x-3">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="h-4 w-4 rounded"
            style={{
              accentColor: palette.primary,
            }}
          />
          <span
            className="text-xs"
            style={{
              color: palette.muted,
            }}
          >
            I acknowledge the{" "}
            <a
              href="#"
              className="hover:underline"
              style={{
                color: palette.primary,
              }}
            >
              TERMS OF SERVICE
            </a>{" "}
            and consent to the digital processing of my artisan identity
          </span>
        </label>

        <div className="flex gap-4 pt-4">
          <AuthButton
            type="submit"
            disabled={registerMutation.isPending || !agreeTerms}
            isDarkTheme={isDarkTheme}
            className="flex-1"
          >
            {registerMutation.isPending ? "INITIALIZING..." : "INITIALIZE ACCOUNT"}
          </AuthButton>

          <AuthButton
            type="button"
            variant="secondary"
            isDarkTheme={isDarkTheme}
            onClick={() => (window.location.href = "/auth/login")}
          >
            ALREADY REGISTERED?
          </AuthButton>
        </div>

        {registerMutation.error ? (
          <p
            className="text-sm"
            style={{
              color: "#f87171",
            }}
          >
            {registerMutation.error.message}
          </p>
        ) : null}

        <div className="space-y-4 pt-4">
          <p
            className="text-center text-xs uppercase"
            style={{
              color: palette.muted,
            }}
          >
            EXTERNAL AUTH
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 rounded py-2 text-xs font-bold transition-colors"
              style={{
                border: `1px solid ${palette.muted}`,
                color: palette.muted,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = palette.input;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              WEB3
            </button>
            <button
              type="button"
              className="flex-1 rounded py-2 text-xs font-bold transition-colors"
              style={{
                border: `1px solid ${palette.muted}`,
                color: palette.muted,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = palette.input;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              NOSTR
            </button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
