"use client";

import { useState } from "react";
import { useTheme } from "@/app/_components/theme-provider";
import {
  AuthLayout,
  AuthLeftSection,
  AuthInput,
  AuthButton,
} from "../_components";

const PIXEL_SPRITE_DARK =
  "https://www.figma.com/api/mcp/asset/775daeb5-b11f-4cea-a70b-6bbe487517dd";
const PIXEL_SPRITE_LIGHT =
  "https://www.figma.com/api/mcp/asset/8bd21c9c-d02d-41d7-bd85-c1e3f0f0eede";

export default function RegisterPage() {
  const { theme, toggleTheme } = useTheme();
  const isDarkTheme = theme === "dark";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      alert("Please agree to the terms of service");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement registration logic
      console.log("Registration attempt:", { username, email, password });
    } finally {
      setIsLoading(false);
    }
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
      {/* Register Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 relative"
      >
        {/* Theme Toggle Button */}
        <button
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
        <div className="space-y-3 mb-8">
          <h2
            className="text-xl font-bold font-display uppercase"
            style={{
              color: isDarkTheme ? "#e6e3f5" : "#181827",
            }}
          >
            {`> REGISTER ACCOUNT`}
          </h2>
          <div
            className="w-12 h-0.5"
            style={{
              backgroundColor: isDarkTheme ? "#a0ffc3" : "#006d40",
            }}
          />
        </div>

        {/* Form Fields - Two Column Grid */}
        <div className="grid grid-cols-2 gap-6">
          <AuthInput
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="USER_01"
            required
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

        {/* Password Field - Full Width */}
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

        {/* Terms Checkbox */}
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 rounded"
            style={{
              accentColor: isDarkTheme ? "#a0ffc3" : "#006d40",
            }}
          />
          <span
            className="text-xs"
            style={{
              color: isDarkTheme ? "#aba9ba" : "#595a70",
            }}
          >
            I acknowledge the{" "}
            <a
              href="#"
              className="hover:underline"
              style={{
                color: isDarkTheme ? "#a0ffc3" : "#006d40",
              }}
            >
              TERMS OF SERVICE
            </a>{" "}
            and consent to the digital processing of my artisan identity
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <AuthButton
            type="submit"
            disabled={isLoading || !agreeTerms}
            isDarkTheme={isDarkTheme}
            className="flex-1"
          >
            {isLoading ? "INITIALIZING..." : "INITIALIZE ACCOUNT"}
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

        {/* External Auth */}
        <div className="space-y-4 pt-4">
          <p
            className="text-xs text-center uppercase"
            style={{
              color: isDarkTheme ? "#aba9ba" : "#595a70",
            }}
          >
            EXTERNAL AUTH
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 py-2 rounded text-xs font-bold transition-colors"
              style={{
                border: `1px solid ${isDarkTheme ? "#aba9ba" : "#595a70"}`,
                color: isDarkTheme ? "#aba9ba" : "#595a70",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkTheme
                  ? "#242436"
                  : "#ebebf5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              WEB3
            </button>
            <button
              type="button"
              className="flex-1 py-2 rounded text-xs font-bold transition-colors"
              style={{
                border: `1px solid ${isDarkTheme ? "#aba9ba" : "#595a70"}`,
                color: isDarkTheme ? "#aba9ba" : "#595a70",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkTheme
                  ? "#242436"
                  : "#ebebf5";
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
