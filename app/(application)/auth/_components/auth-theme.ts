import type { CyberTheme } from "@/app/_components/ui-kit/shared";

type AuthPalette = {
  page: string;
  shell: string;
  shellBorder: string;
  leftPanel: string;
  rightPanel: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  title: string;
  body: string;
  muted: string;
  input: string;
  inputFocus: string;
};

const authPalette: Record<CyberTheme, AuthPalette> = {
  dark: {
    page: "bg-[radial-gradient(circle_at_top,rgba(105,218,255,0.08),transparent_28%),linear-gradient(180deg,#05070a_0%,#020407_100%)]",
    shell: "bg-[#0e1318]",
    shellBorder: "border-[#1f2f39]",
    leftPanel: "bg-[#11181f]",
    rightPanel: "bg-[#0b1015]",
    primary: "#9cff93",
    primaryHover: "#b8ffb1",
    secondary: "#69daff",
    title: "#f8fafc",
    body: "#cbd5e1",
    muted: "#7c8b99",
    input: "#162029",
    inputFocus: "#1d2a35",
  },
  light: {
    page: "bg-[#e7edf1]",
    shell: "bg-[#f4f8fb]",
    shellBorder: "border-[#b5c0ca]",
    leftPanel: "bg-[#d9e0e6]",
    rightPanel: "bg-[#edf3f7]",
    primary: "#006e17",
    primaryHover: "#00861c",
    secondary: "#00677d",
    title: "#0f172a",
    body: "#334155",
    muted: "#64748b",
    input: "#dce5eb",
    inputFocus: "#eef5f8",
  },
};

export function getAuthPalette(theme: CyberTheme) {
  return authPalette[theme];
}
