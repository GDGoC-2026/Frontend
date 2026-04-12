export type CyberTheme = "dark" | "light";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const interactiveMotionClass =
  "transition-all duration-150 ease-out hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0.5 active:brightness-95";
