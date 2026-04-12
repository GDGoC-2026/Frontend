"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CyberTheme } from "@/app/_components/ui-kit/shared";

type ThemeContextValue = {
  theme: CyberTheme;
  setTheme: (theme: CyberTheme) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "neural-link-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: {
  children: ReactNode;
  defaultTheme?: CyberTheme;
}) {
  const [theme, setTheme] = useState<CyberTheme>(() => {
    if (typeof window === "undefined") {
      return defaultTheme;
    }

    const savedTheme = window.localStorage.getItem(STORAGE_KEY);

    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }

    return defaultTheme;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => {
        setTheme((currentTheme) =>
          currentTheme === "dark" ? "light" : "dark",
        );
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
