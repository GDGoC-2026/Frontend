import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cloneElement, isValidElement, useState, type ReactNode } from "react";
import { figmaAssets } from "@/app/_data/cyber-assets";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { FloatingRailShell } from "@/app/_components/ui-kit/floating-rail-shell";
import { MessageCard } from "@/app/_components/ui-kit/message-card";
import { PixelButton } from "@/app/_components/ui-kit/pixel-button";
import {
  useLogoutMutation,
  useSessionQuery,
  useUpdateSubscriptionMutation,
} from "@/hooks/use-auth";
import type { UserProfile } from "@/lib/api/auth";
import {
  cn,
  interactiveMotionClass,
  type CyberTheme,
} from "@/app/_components/ui-kit/shared";

export type { CyberTheme } from "@/app/_components/ui-kit/shared";

type NavKey = "home" | "learn" | "practice" | "review" | "profile" | "settings";

type SafeImageProps = {
  src?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

type SidebarProps = {
  theme: CyberTheme;
  active: NavKey;
  subtitle: string;
  subtitleClassName?: string;
  subtitleFont?: "body" | "pixel";
  footer?: ReactNode;
  navSize?: "sm" | "md";
};

const DASHBOARD_ROUTE = "/dashboard";
const REVIEW_ROUTE = "/dashboard/review/quiz";

const navItems: Array<{
  key: NavKey;
  label: string;
  icon: ReactNode;
}> = [
  { key: "home", label: "HOME", icon: <HomeIcon /> },
  { key: "learn", label: "LEARN", icon: <LearnIcon /> },
  { key: "practice", label: "PRACTICE", icon: <PracticeIcon /> },
  { key: "review", label: "REVIEW", icon: <ReviewIcon /> },
  { key: "profile", label: "PROFILE", icon: <ProfileIcon /> },
  { key: "settings", label: "SETTINGS", icon: <SettingsIcon /> },
];

function navHref(theme: CyberTheme, key: NavKey) {
  switch (key) {
    case "home":
      return DASHBOARD_ROUTE;
    case "learn":
      return "/dashboard/learn/path";
    case "practice":
      return "/dashboard/practice/challenge";
    case "review":
      return REVIEW_ROUTE;
    case "profile":
      return "/dashboard/profile";
    case "settings":
      return null;
  }
}

function SafeImage({
  src,
  alt,
  width,
  height,
  className,
  priority,
}: SafeImageProps) {
  if (!src) {
    return (
      <div
        aria-label={`${alt} placeholder`}
        className={cn(
          "relative overflow-hidden bg-black/10",
          "before:absolute before:inset-0 before:bg-[linear-gradient(135deg,transparent_0%,transparent_48%,rgba(148,163,184,0.28)_50%,transparent_52%,transparent_100%)]",
          className,
        )}
        style={{ width, height }}
      />
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      height={height}
      priority={priority}
      src={src}
      unoptimized
      width={width}
    />
  );
}

function Frame({
  theme,
  sidebar,
  header,
  main,
  rightRail,
}: {
  theme: CyberTheme;
  sidebar: ReactNode;
  header: ReactNode;
  main: ReactNode;
  rightRail?: ReactNode;
}) {
  return (
    <div
      className={cn(
        theme === "dark" ? "bg-[#0e0e0e]" : "bg-[#e7edf1]",
        "h-screen overflow-x-auto overflow-y-hidden cyber-scrollbar",
      )}
    >
      <div className="flex h-screen min-w-7xl items-stretch">
        {sidebar}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {header}
          {main}
        </div>
        {rightRail}
      </div>
    </div>
  );
}

function Sidebar({
  theme,
  active,
  subtitle,
  subtitleClassName,
  subtitleFont = "body",
  footer,
  navSize = "sm",
}: SidebarProps) {
  const dark = theme === "dark";
  const [collapsed, setCollapsed] = useState(false);
  const sidebarFooter =
    footer && isValidElement(footer)
      ? cloneElement(footer, {
          collapsed,
        } as { collapsed: boolean })
      : footer;

  return (
    <>
      <div aria-hidden className={cn("shrink-0", collapsed ? "w-20" : "w-64")} />
      <aside
        className={cn(
          dark
            ? "bg-[#131313] shadow-[4px_0px_0px_0px_black]"
            : "bg-[#d9e0e6] shadow-[4px_0px_0px_0px_#b5c0ca]",
          "cyber-scrollbar fixed left-0 top-0 z-40 flex h-screen max-h-screen overflow-y-auto overscroll-contain flex-col transition-[width] duration-200",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <div className={cn("flex flex-col gap-2", collapsed ? "p-3" : "p-8")}>
          <button
            className={cn(
              dark
                ? "border border-[#262626] bg-[#0e0e0e] text-[#9cff93] hover:bg-[#1a1a1a]"
                : "border border-[#b5c0ca] bg-[#e7edf1] text-[#006e17] hover:bg-[#cfd7de]",
              "w-fit px-2 py-1 font-pixel text-[10px] uppercase transition-colors",
            )}
            aria-label={collapsed ? "Mo rong sidebar" : "Thu gon sidebar"}
            onClick={() => setCollapsed((value) => !value)}
            type="button"
          >
            {collapsed ? "MO RONG" : "THU GON"}
          </button>
          {!collapsed ? (
            <>
              <div
                className={cn(
                  "font-display text-2xl font-bold uppercase tracking-[-0.8px]",
                  dark ? "text-[#9cff93]" : "text-[#006e17]",
                )}
              >
                LEARNBRO
              </div>
              <div
                className={cn(
                  subtitleFont === "pixel"
                    ? "font-pixel text-[10px] leading-[15px]"
                    : "font-sans text-[12px] leading-4",
                  subtitleClassName ?? (dark ? "text-[#6b7280]" : "text-[#6c7988]"),
                )}
              >
                {subtitle}
              </div>
            </>
          ) : null}
        </div>
        <nav className={cn("flex flex-1 flex-col gap-2 pb-6", collapsed ? "px-2" : "px-4")}>
          {navItems.map((item) => {
            const current = item.key === active;
            const href = navHref(theme, item.key);
            const baseClassName = cn(
              "flex items-center uppercase transition-colors",
              collapsed ? "justify-center px-0 py-3" : "gap-4 px-4 py-4",
              !collapsed &&
                (navSize === "md"
                  ? "font-display text-base tracking-[-0.8px]"
                  : "font-display text-[14px] tracking-[-0.8px]"),
              current &&
                (collapsed
                  ? dark
                    ? "bg-[#262626] text-[#9cff93]"
                    : "bg-[#cfd7de] text-[#006e17]"
                  : dark
                    ? "border-l-4 border-[#9cff93] bg-[#262626] pl-3 text-[#9cff93]"
                    : "border-l-4 border-[#006e17] bg-[#cfd7de] pl-3 text-[#006e17]"),
              !current && (dark ? "text-[#6b7280]" : "text-[#52606f]"),
            );
            const content = (
              <>
                <span className="size-5 shrink-0">{item.icon}</span>
                {!collapsed ? <span>{item.label}</span> : null}
              </>
            );

            if (!href) {
              return (
                <div className={baseClassName} key={item.key}>
                  {content}
                </div>
              );
            }

            return (
              <Link
                className={cn(baseClassName, interactiveMotionClass)}
                href={href}
                key={item.key}
              >
                {content}
              </Link>
            );
          })}
        </nav>
        {sidebarFooter ? <div className="mt-auto">{sidebarFooter}</div> : null}
      </aside>
    </>
  );
}

function SidebarFooterUser({
  theme,
  src,
  title,
  subtitle,
  subtitleTone = "green",
  compact = false,
  collapsed = false,
}: {
  theme: CyberTheme;
  src?: string;
  title: string;
  subtitle: string;
  subtitleTone?: "green" | "cyan" | "muted";
  compact?: boolean;
  collapsed?: boolean;
}) {
  const dark = theme === "dark";
  const session = useSessionQuery();
  const sessionUser = session.data;
  const resolvedTitle = sessionUser ? formatProfileAlias(sessionUser) : title;
  const resolvedSubtitle = sessionUser?.email ?? subtitle;
  const subtitleColor =
    subtitleTone === "green"
      ? dark
        ? "text-[#9cff93]"
        : "text-[#16a34a]"
      : subtitleTone === "cyan"
        ? dark
          ? "text-[#69daff]"
          : "text-[#00677d]"
        : dark
          ? "text-[#adaaaa]"
          : "text-[#64748b]";

  return (
    <div
      className={cn(
        dark
          ? "border-t-4 border-[#262626] bg-[#0e0e0e]"
          : "border-t-4 border-[#b5c0ca] bg-[#e7edf1]",
        "p-6",
      )}
    >
      <div
        className={cn(
          dark ? "bg-[#262626]" : "bg-[#cfd7de]",
          compact ? "p-3" : "p-4",
          collapsed ? "flex justify-center" : "flex items-center gap-3",
        )}
      >
        <SafeImage
          alt={title}
          className={cn(
            "object-cover saturate-0",
            collapsed ? "h-10 w-10 rounded-full" : "h-10 w-10",
          )}
          height={40}
          src={src}
          width={40}
        />
        {!collapsed ? (
          <div className="min-w-0">
            <div
              className={cn(
                "truncate font-pixel text-[10px] uppercase leading-4",
                dark ? "text-white" : "text-[#0f172a]",
              )}
            >
              {resolvedTitle}
            </div>
            <div
              className={cn(
                "truncate font-display text-[10px] uppercase leading-[15px]",
                subtitleColor,
              )}
            >
              {resolvedSubtitle}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function HeaderBar({
  theme,
  children,
}: {
  theme: CyberTheme;
  children: ReactNode;
}) {
  return (
    <header
      className={cn(
        theme === "dark"
          ? "border-b-4 border-[#131313] bg-[#0e0e0e]"
          : "border-b-4 border-[#b5c0ca] bg-[#e7edf1]",
        "sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between px-6 pb-1",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center justify-between gap-6">
        {children}
      </div>
      <div className="ml-6 shrink-0">
        <ThemeToggle  />
      </div>
    </header>
  );
}

function HeaderTitle({
  theme,
  title,
  trail,
}: {
  theme: CyberTheme;
  title: string;
  trail?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "font-display text-xl font-bold tracking-[2px]",
          theme === "dark" ? "text-[#9cff93]" : "text-[#006e17]",
        )}
      >
        {title}
      </div>
      {trail ? (
        <div
          className={cn(
            "font-display text-sm uppercase",
            theme === "dark" ? "text-[#adaaaa]" : "text-[#475569]",
          )}
        >
          {trail}
        </div>
      ) : null}
    </div>
  );
}

function MetricBadge({
  theme,
  icon,
  children,
}: {
  theme: CyberTheme;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon ? (
        <span
          className={cn(
            "size-4",
            theme === "dark" ? "text-[#9cff93]" : "text-[#16a34a]",
          )}
        >
          {icon}
        </span>
      ) : null}
      <span
        className={cn(
          "font-display text-sm font-bold",
          theme === "dark" ? "text-white" : "text-[#0f172a]",
        )}
      >
        {children}
      </span>
    </div>
  );
}

function ProgressSegments({
  theme,
  total,
  value,
  activeTone = "brand",
  size = "md",
}: {
  theme: CyberTheme;
  total: number;
  value: number;
  activeTone?: "brand" | "cyan" | "purple" | "orange" | "red";
  size?: "sm" | "md" | "lg";
}) {
  const activeColor =
    activeTone === "cyan"
      ? theme === "dark"
        ? "bg-[#69daff]"
        : "bg-[#0891b2]"
      : activeTone === "purple"
        ? theme === "dark"
          ? "bg-[#d575ff]"
          : "bg-[#9800d0]"
        : activeTone === "orange"
          ? "bg-[#ff7351]"
          : activeTone === "red"
            ? "bg-[#dc2626]"
            : theme === "dark"
              ? "bg-[#9cff93]"
              : "bg-[#16a34a]";
  const inactiveColor = theme === "dark" ? "bg-[#262626]" : "bg-[#e2e8f0]";
  const height = size === "lg" ? "h-6" : size === "sm" ? "h-2" : "h-3";

  return (
    <div className="flex w-full gap-1">
      {Array.from({ length: total }).map((_, index) => (
        <div
          className={cn(
            "flex-1",
            height,
            index < value ? activeColor : inactiveColor,
          )}
          key={`${activeTone}-${index}`}
        />
      ))}
    </div>
  );
}

function SectionTitle({
  theme,
  title,
  linkLabel,
}: {
  theme: CyberTheme;
  title: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-6 w-2",
            theme === "dark" ? "bg-[#9cff93]" : "bg-[#16a34a]",
          )}
        />
        <h2
          className={cn(
            "font-display text-xl font-bold tracking-[-1px]",
            theme === "dark" ? "text-white" : "text-[#0f172a]",
          )}
        >
          {title}
        </h2>
      </div>
      {linkLabel ? (
        <div
          className={cn(
            "font-sans text-[10px] font-semibold uppercase",
            theme === "dark" ? "text-[#69daff]" : "text-[#0891b2]",
          )}
        >
          {linkLabel}
        </div>
      ) : null}
    </div>
  );
}

function LessonCard({
  theme,
  imageSrc,
  tag,
  tagTone,
  title,
  duration,
  xp,
}: {
  theme: CyberTheme;
  imageSrc?: string;
  tag: string;
  tagTone: "brand" | "cyan" | "purple";
  title: string;
  duration: string;
  xp: string;
}) {
  const dark = theme === "dark";
  const tagClass =
    tagTone === "purple"
      ? dark
        ? "text-[#d575ff]"
        : "text-[#9800d0]"
      : tagTone === "cyan"
        ? dark
          ? "text-[#69daff]"
          : "text-[#0891b2]"
        : dark
          ? "text-[#69daff]"
          : "text-[#0891b2]";
  const xpClass =
    tagTone === "purple"
      ? dark
        ? "text-[#d575ff]"
        : "text-[#9800d0]"
      : theme === "dark"
        ? "text-[#9cff93]"
        : "text-[#16a34a]";

  return (
    <article className={cn(dark ? "bg-[#1a1a1a]" : "bg-[#d9e0e6]", "p-5")}>
      <div
        className={cn(
          dark ? "bg-[#131313]" : "bg-[#cfd7de]",
          "relative mb-4 aspect-video overflow-hidden",
        )}
      >
        <SafeImage
          alt={title}
          className="h-full w-full object-cover opacity-80"
          height={128}
          src={imageSrc}
          width={177}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn("size-7", dark ? "text-[#9cff93]" : "text-[#16a34a]")}
          >
            <TerminalIcon />
          </span>
        </div>
      </div>
      <div
        className={cn(
          "mb-1 font-sans text-[9px] font-semibold uppercase",
          tagClass,
        )}
      >
        {tag}
      </div>
      <div
        className={cn(
          "mb-3 font-display text-sm font-bold uppercase",
          dark ? "text-white" : "text-[#0f172a]",
        )}
      >
        {title}
      </div>
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "font-sans text-[10px] italic",
            dark ? "text-[#adaaaa]" : "text-[#475569]",
          )}
        >
          {duration}
        </div>
        <div className={cn("font-sans text-[10px] font-semibold", xpClass)}>
          {xp}
        </div>
      </div>
    </article>
  );
}

function AssistantRail({
  theme,
  title,
  subtitle,
  topCard,
  middleCards,
  footer,
  accent = "purple",
}: {
  theme: CyberTheme;
  title: string;
  subtitle: string;
  topCard?: ReactNode;
  middleCards?: ReactNode;
  footer?: ReactNode;
  accent?: "purple" | "green";
}) {
  const dark = theme === "dark";
  const accentColor =
    accent === "green"
      ? dark
        ? "text-[#9cff93]"
        : "text-[#16a34a]"
      : dark
        ? "text-[#d575ff]"
        : "text-[#9800d0]";
  return (
    <FloatingRailShell>
      <div
        className={cn(
          dark ? "border-b-4 border-[#262626]" : "border-b-4 border-[#b5c0ca]",
          "p-6",
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                dark ? "bg-[#262626]" : "bg-[#cfd7de]",
                "flex size-12 items-center justify-center",
              )}
            >
              <span className={accentColor}>
                <BotIcon />
              </span>
            </div>
            <div>
              <div
                className={cn(
                  "font-display text-sm font-bold uppercase",
                  accentColor,
                )}
              >
                {title}
              </div>
              <div
                className={cn(
                  "font-sans text-[10px]",
                  dark ? "text-[#9cff93]" : "text-[#16a34a]",
                )}
              >
                {subtitle}
              </div>
            </div>
          </div>
          <button
            className={cn(
              "mt-1 inline-flex size-6 items-center justify-center",
              interactiveMotionClass,
              dark ? "text-white" : "text-[#0f172a]",
            )}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
        {topCard ? <div className="mt-6">{topCard}</div> : null}
      </div>
      <div className="flex flex-1 flex-col gap-6 p-6">{middleCards}</div>
      {footer ? (
        <div
          className={cn(
            dark
              ? "border-t-4 border-[#262626] bg-[#0e0e0e]"
              : "border-t-4 border-[#b5c0ca] bg-[#e7edf1]",
            "p-6",
          )}
        >
          {footer}
        </div>
      ) : null}
    </FloatingRailShell>
  );
}

function ProfileLogRail({ theme }: { theme: CyberTheme }) {
  const dark = theme === "dark";

  return (
    <FloatingRailShell>
      <div
        className={cn(
          dark ? "border-b-2 border-[#262626]" : "border-b-2 border-[#b5c0ca]",
          "p-8",
        )}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              dark ? "bg-[#d575ff]" : "bg-[#9800d0]",
              "flex size-12 items-center justify-center",
            )}
          >
            <BotIcon className={dark ? "text-black" : "text-white"} />
          </div>
          <div>
            <div
              className={cn(
                "font-display text-sm font-bold uppercase",
                dark ? "text-[#d575ff]" : "text-[#9800d0]",
              )}
            >
              AI_ASSISTANT
            </div>
            <div
              className={cn(
                "font-pixel text-[10px] leading-5",
                dark ? "text-[#9cff93]" : "text-[#006e17]",
              )}
            >
              ONLINE /
              <br />
              PROCESSING
            </div>
          </div>
        </div>
        <div className="mt-6">
          <PixelButton className="w-full" hollow theme={theme} tone="purple">
            NEW_QUERY
          </PixelButton>
        </div>
      </div>
      <div className="flex-1 space-y-6 p-6">
        <MessageCard
          body={
            <>
              Neural pattern detected. User showing
              <br />
              15% increase in logic speed.
              <br />
              Recommendation: Level Up challenge
              <br />
              &quot;ALGO_DASH&quot; is now available.
            </>
          }
          label="SYST_LOG // 14:22"
          theme={theme}
          tone={dark ? "success" : "brand"}
        />
        <MessageCard
          body={
            <>
              Streak validated. 12 days continuous
              <br />
              data stream. Bonus multiplier +1.2x
              <br />
              applied.
            </>
          }
          label="SYST_LOG // 12:05"
          theme={theme}
        />
        <MessageCard
          body={
            <>
              Module &quot;RECURSION_01&quot; completed
              <br />
              with 98% accuracy. Achievement
              <br />
              UNLOCKED: &quot;LOOP_MASTER&quot;.
            </>
          }
          label="SYST_LOG // 09:12"
          theme={theme}
        />
      </div>
      <div
        className={cn(
          dark ? "bg-black" : "border-t-2 border-[#b5c0ca] bg-[#cfd7de]",
          "p-6",
        )}
      >
        <div className="flex justify-between">
          <div className="font-pixel text-[10px] leading-5 text-[#767575]">
            UPTIME:
            <br />
            99.9%
          </div>
          <div className="font-pixel text-[10px] leading-5 text-[#767575]">
            VER: 4.2.0-
            <br />
            STABLE
          </div>
        </div>
      </div>
    </FloatingRailShell>
  );
}

function MetricTile({
  theme,
  label,
  value,
  tone = "brand",
  icon,
}: {
  theme: CyberTheme;
  label: string;
  value: string;
  tone?: "brand" | "purple" | "cyan";
  icon?: ReactNode;
}) {
  const dark = theme === "dark";
  const borderColor =
    tone === "purple"
      ? dark
        ? "border-[#d575ff]"
        : "border-[#9800d0]"
      : tone === "cyan"
        ? dark
          ? "border-[#69daff]"
          : "border-[#00677d]"
        : dark
          ? "border-[#9cff93]"
          : "border-[#006e17]";
  const labelColor =
    tone === "purple"
      ? dark
        ? "text-[#d575ff]"
        : "text-[#9800d0]"
      : tone === "cyan"
        ? dark
          ? "text-[#69daff]"
          : "text-[#00677d]"
        : dark
          ? "text-[#9cff93]"
          : "text-[#006e17]";

  return (
    <div
      className={cn(
        dark ? "bg-[#1a1a1a]" : "bg-[#e2e8f0]",
        "border-l-4 p-4",
        borderColor,
      )}
    >
      <div
        className={cn(
          "mb-1 font-pixel text-[10px] uppercase leading-[15px]",
          labelColor,
        )}
      >
        {label}
      </div>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "font-display text-4xl font-bold tracking-[2.4px]",
            dark ? "text-white" : "text-[#0f172a]",
          )}
        >
          {value}
        </div>
        {icon ? <span className={labelColor}>{icon}</span> : null}
      </div>
    </div>
  );
}

function AchievementCard({
  theme,
  title,
  subtitle,
  tone,
  locked = false,
  icon,
}: {
  theme: CyberTheme;
  title: string;
  subtitle: string;
  tone: "brand" | "purple" | "cyan";
  locked?: boolean;
  icon: ReactNode;
}) {
  const dark = theme === "dark";
  const accent =
    tone === "purple"
      ? dark
        ? "bg-[#d575ff]"
        : "bg-[#9800d0]"
      : tone === "cyan"
        ? dark
          ? "bg-[#69daff]"
          : "bg-[#00677d]"
        : dark
          ? "bg-[#9cff93]"
          : "bg-[#006e17]";

  return (
    <div className={cn(dark ? "bg-[#1a1a1a]" : "bg-[#e2e8f0]", "relative p-5")}>
      <div
        className={cn(
          "mb-6 flex size-16 items-center justify-center",
          dark ? "bg-[#262626]" : "bg-[#cfd7de]",
          locked ? "opacity-35" : "",
        )}
      >
        <span
          className={
            locked
              ? dark
                ? "text-[#6b7280]"
                : "text-[#6c7988]"
              : tone === "purple"
                ? dark
                  ? "text-[#d575ff]"
                  : "text-[#9800d0]"
                : tone === "cyan"
                  ? dark
                    ? "text-[#69daff]"
                    : "text-[#00677d]"
                  : dark
                    ? "text-[#9cff93]"
                    : "text-[#006e17]"
          }
        >
          {icon}
        </span>
      </div>
      <div
        className={cn(
          "font-pixel text-[10px] uppercase leading-[15px]",
          dark ? "text-white" : "text-[#0f172a]",
        )}
      >
        {title}
      </div>
      <div
        className={cn(
          "mt-1 font-sans text-[10px] uppercase",
          dark ? "text-[#adaaaa]" : "text-[#6c7988]",
        )}
      >
        {subtitle}
      </div>
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-1",
          locked ? (dark ? "bg-[#262626]" : "bg-[#cbd5e1]") : accent,
        )}
      />
    </div>
  );
}

function SubjectCard({
  theme,
  code,
  icon,
  title,
  description,
  progress,
  tone = "brand",
}: {
  theme: CyberTheme;
  code: string;
  icon: ReactNode;
  title: string;
  description: string[];
  progress: number;
  tone?: "brand" | "purple" | "cyan";
}) {
  const dark = theme === "dark";
  const tagColor =
    tone === "purple"
      ? dark
        ? "text-[#d575ff]"
        : "text-[#9800d0]"
      : tone === "cyan"
        ? dark
          ? "text-[#69daff]"
          : "text-[#0891b2]"
        : dark
          ? "text-[#9cff93]"
          : "text-[#16a34a]";

  return (
    <article
      className={cn(
        dark
          ? "bg-[#131313] shadow-[0px_-4px_0px_0px_#262626,0px_4px_0px_0px_#262626,-4px_0px_0px_0px_#262626,4px_0px_0px_0px_#262626]"
          : "bg-[#d9e0e6] shadow-[0px_-4px_0px_0px_#b5c0ca,0px_4px_0px_0px_#b5c0ca,-4px_0px_0px_0px_#b5c0ca,4px_0px_0px_0px_#b5c0ca]",
        "relative flex min-h-[335px] flex-col justify-between p-8",
      )}
    >
      <div className="absolute right-0 top-0 bg-black/10 px-2 py-2 font-display text-[10px] uppercase text-current opacity-50">
        {code}
      </div>
      <div
        className={cn(
          dark ? "bg-[#262626]" : "bg-[#cfd7de]",
          "mb-6 flex size-16 items-center justify-center",
        )}
      >
        <span className={tagColor}>{icon}</span>
      </div>
      <div>
        <h3
          className={cn(
            "mb-3 font-display text-[24px] font-bold uppercase leading-8 tracking-[-0.6px]",
            dark ? "text-white" : "text-[#0f172a]",
          )}
        >
          {title}
        </h3>
        <div
          className={cn(
            "space-y-0.5 font-sans text-sm leading-5",
            dark ? "text-[#adaaaa]" : "text-[#475569]",
          )}
        >
          {description.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="w-20">
          <div
            className={cn(
              "mb-2 font-display text-[10px] uppercase",
              dark ? "text-[#adaaaa]" : "text-[#64748b]",
            )}
          >
            PROGRESS
          </div>
          <ProgressSegments
            activeTone={tone}
            size="sm"
            theme={theme}
            total={4}
            value={progress}
          />
        </div>
        <span className={tagColor}>
          <ArrowRightIcon />
        </span>
      </div>
    </article>
  );
}

function PromoCard({
  theme,
  title,
  description,
  tone,
  imageSrc,
}: {
  theme: CyberTheme;
  title: string;
  description: string[];
  tone: "purple" | "cyan";
  imageSrc?: string;
}) {
  const dark = theme === "dark";
  const titleColor =
    tone === "purple"
      ? dark
        ? "text-[#d575ff]"
        : "text-[#9800d0]"
      : dark
        ? "text-[#69daff]"
        : "text-[#0891b2]";

  return (
    <article
      className={cn(
        dark
          ? "bg-[#1a1a1a] shadow-[0px_-4px_0px_0px_#262626,0px_4px_0px_0px_#262626,-4px_0px_0px_0px_#262626,4px_0px_0px_0px_#262626]"
          : "bg-[#d9e0e6] shadow-[0px_-4px_0px_0px_#b5c0ca,0px_4px_0px_0px_#b5c0ca,-4px_0px_0px_0px_#b5c0ca,4px_0px_0px_0px_#b5c0ca]",
        "flex items-center gap-6 p-8",
      )}
    >
      <div
        className={cn(
          dark ? "bg-black" : "bg-[#cfd7de]",
          "shrink-0 overflow-hidden shadow-[0px_0px_0px_4px_#b5c0ca]",
        )}
      >
        <SafeImage
          alt={title}
          className="h-20 w-20 object-cover"
          height={80}
          src={imageSrc}
          width={80}
        />
      </div>
      <div>
        <div
          className={cn(
            "font-display text-base font-bold uppercase",
            titleColor,
          )}
        >
          {title}
        </div>
        <div
          className={cn(
            "mt-1 space-y-0.5 font-sans text-sm leading-5",
            dark ? "text-[#adaaaa]" : "text-[#475569]",
          )}
        >
          {description.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </article>
  );
}

function EditorTabs({ theme }: { theme: CyberTheme }) {
  const dark = theme === "dark";

  return (
    <div
      className={cn(
        dark
          ? "border-b-4 border-[#131313] bg-[#0e0e0e]"
          : "border-b-4 border-[#b5c0ca] bg-[#e7edf1]",
        "flex items-center gap-6 px-4 py-3",
      )}
    >
      <div
        className={cn(
          "font-display text-sm font-bold tracking-[1.4px]",
          dark ? "text-white" : "text-[#0f172a]",
        )}
      >
        Binary_Search_Logic.md
      </div>
      <div
        className={cn(
          "font-display text-xs font-bold uppercase",
          dark ? "text-[#69daff]" : "text-[#0891b2]",
        )}
      >
        SAVED
      </div>
      <div className="ml-auto flex items-center gap-6">
        {["GRAPH", "PREVIEW", "AI_AS..."].map((tab, index) => (
          <div
            className={cn(
              "font-display text-sm uppercase",
              index === 0
                ? dark
                  ? "border-b-2 border-[#9cff93] pb-2 text-[#9cff93]"
                  : "border-b-2 border-[#16a34a] pb-2 text-[#16a34a]"
                : dark
                  ? "text-[#6b7280]"
                  : "text-[#6c7988]",
            )}
            key={tab}
          >
            {tab}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardScreen({ theme }: { theme: CyberTheme }) {
  const dark = theme === "dark";
  const assets = dark ? figmaAssets.darkHome : figmaAssets.lightHome;

  return (
    <Frame
      header={
        <HeaderBar theme={theme}>
          <HeaderTitle theme={theme} title="LEARNING_TERMINAL" />
          <div className="flex items-center gap-6">
            <MetricBadge icon={<FireIcon />} theme={theme}>
              7 DAY_STREAK
            </MetricBadge>
            <MetricBadge icon={<TrophyIcon />} theme={theme}>
              XP: 2450
            </MetricBadge>
            <PixelButton theme={theme}>REWARDS</PixelButton>
          </div>
        </HeaderBar>
      }
      main={
        <main
          className={cn(
            dark ? "bg-[#0e0e0e]" : "bg-[#e7edf1]",
            "cyber-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain",
          )}
        >
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-12 p-8">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_320px]">
              <section
                className={cn(
                  dark
                    ? "bg-[#131313] border-l-4 border-[#9cff93]"
                    : "bg-[#d9e0e6] border-l-4 border-[#16a34a]",
                  "overflow-hidden p-8",
                )}
              >
                <div className="flex justify-between gap-6">
                  <div className="max-w-[560px]">
                    <div
                      className={cn(
                        dark
                          ? "bg-[#00fc40] text-[#005a10]"
                          : "bg-[#dcfce7] text-[#166534]",
                        "mb-4 inline-flex px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[1px]",
                      )}
                    >
                      ONGOING MODULE
                    </div>
                    <h1
                      className={cn(
                        "font-display text-5xl font-bold uppercase leading-[1] tracking-[-1.8px]",
                        dark ? "text-white" : "text-[#0f172a]",
                      )}
                    >
                      INTRODUCTION TO ALGORITHMS
                    </h1>
                    <p
                      className={cn(
                        "mt-5 max-w-[28rem] font-sans text-sm leading-[22px]",
                        dark ? "text-[#adaaaa]" : "text-[#475569]",
                      )}
                    >
                      Master the foundational logic of computational complexity
                      and data structures in a high-fidelity terminal
                      environment.
                    </p>
                  </div>
                  <div
                    className={cn(
                      dark ? "bg-[#1a1a1a]" : "bg-[#cfd7de]",
                      "hidden h-28 w-32 items-center justify-center xl:flex",
                    )}
                  >
                    <span
                      className={cn(
                        "size-12",
                        dark ? "text-[#6b7280]" : "text-[#9aa8b6]",
                      )}
                    >
                      <TerminalFrameIcon />
                    </span>
                  </div>
                </div>
                <div className="mt-10">
                  <div className="mb-3 flex items-end justify-between">
                    <div
                      className={cn(
                        "font-display text-xs font-bold uppercase",
                        dark ? "text-[#9cff93]" : "text-[#16a34a]",
                      )}
                    >
                      PROGRESS_LOAD: 64%
                    </div>
                    <div
                      className={cn(
                        "font-display text-xs uppercase",
                        dark ? "text-[#6b7280]" : "text-[#6c7988]",
                      )}
                    >
                      SEGMENT_04/07
                    </div>
                  </div>
                  <ProgressSegments
                    activeTone="cyan"
                    size="lg"
                    theme={theme}
                    total={7}
                    value={4}
                  />
                </div>
                <div className="mt-8">
                  <PixelButton className="min-w-[280px]" theme={theme}>
                    CONTINUE_SYSTEM_BOOT <ArrowRightIcon />
                  </PixelButton>
                </div>
              </section>
              <div className="flex flex-col gap-8">
                <div
                  className={cn(
                    dark
                      ? "bg-[#262626] border-b-4 border-[#ff7351]"
                      : "bg-[#d9e0e6] border-b-4 border-[#dc2626]",
                    "p-6",
                  )}
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div
                      className={cn(
                        dark ? "bg-[#b92902]" : "bg-[#fee2e2]",
                        "flex size-12 items-center justify-center",
                      )}
                    >
                      <span
                        className={dark ? "text-[#ff7351]" : "text-[#dc2626]"}
                      >
                        <FireIcon />
                      </span>
                    </div>
                    <div>
                      <div
                        className={cn(
                          "font-display text-[10px] font-bold uppercase",
                          dark ? "text-[#ff7351]" : "text-[#dc2626]",
                        )}
                      >
                        ACTIVE STREAK
                      </div>
                      <div
                        className={cn(
                          "font-display text-4xl font-bold",
                          dark ? "text-white" : "text-[#0f172a]",
                        )}
                      >
                        07 DAYS
                      </div>
                    </div>
                  </div>
                  <ProgressSegments
                    activeTone={dark ? "orange" : "red"}
                    size="sm"
                    theme={theme}
                    total={7}
                    value={7}
                  />
                </div>
                <MessageCard
                  body={
                    <>
                      &quot;Operator, your performance in &apos;O-Notation&apos;
                      is optimal.
                      <br />
                      Suggesting &apos;Advanced Sorting&apos; for next
                      cycle.&quot;
                    </>
                  }
                  label="AI_ADVISORY"
                  theme={theme}
                  tone="purple"
                />
              </div>
            </div>
            <section className="space-y-8">
              <SectionTitle
                linkLabel="VIEW_ALL_NODES"
                theme={theme}
                title="RECOMMENDED PATHWAYS"
              />
              <div className="grid gap-6 xl:grid-cols-4">
                <LessonCard
                  duration="24m duration"
                  imageSrc={assets.lessonDataStructures}
                  tag="LOGIC_TIER_1"
                  tagTone="brand"
                  theme={theme}
                  title="DYNAMIC PROGRAMMING"
                  xp="+150 XP"
                />
                <LessonCard
                  duration="45m duration"
                  imageSrc={assets.lessonNeuralNetworks}
                  tag="CREATIVE_TIER_2"
                  tagTone="purple"
                  theme={theme}
                  title="NEURAL ARCHITECTURE"
                  xp="+300 XP"
                />
                <LessonCard
                  duration="18m duration"
                  imageSrc={assets.lessonCyberSecurity}
                  tag="SYSTEM_TIER_3"
                  tagTone="cyan"
                  theme={theme}
                  title="ENCRYPTION PROTOCOLS"
                  xp="+120 XP"
                />
                <LessonCard
                  duration="32m duration"
                  imageSrc={assets.lessonMachineLearning}
                  tag="LOGIC_TIER_1"
                  tagTone="brand"
                  theme={theme}
                  title="GRADIENT DESCENT"
                  xp="+200 XP"
                />
              </div>
            </section>
          </div>
        </main>
      }
      rightRail={
        dark ? null : (
          <AssistantRail
            accent="green"
            footer={
              <div className="space-y-4">
                <PixelButton
                  className="w-full"
                  hollow
                  theme={theme}
                  tone="purple"
                >
                  CHAT
                </PixelButton>
                <PixelButton className="w-full" theme={theme} tone="purple">
                  NEW_QUERY
                </PixelButton>
              </div>
            }
            middleCards={
              <>
                <MessageCard
                  body={
                    <>
                      Your last solution for &quot;Binary Search&quot;
                      <br />
                      was highly efficient. 98th percentile
                      <br />
                      reached.
                    </>
                  }
                  label="SYSTEM_ALERT"
                  theme={theme}
                  tone="success"
                />
                <MessageCard
                  body={
                    <>
                      Explain the difference between Dijkstra
                      <br />
                      and A* search.
                    </>
                  }
                  label="USER_QUERY"
                  theme={theme}
                />
                <MessageCard
                  body={
                    <>
                      A* is essentially Dijkstra&apos;s algorithm
                      <br />
                      with a heuristic function to guide the
                      <br />
                      search...
                    </>
                  }
                  label="AI_RESPONSE"
                  theme={theme}
                  tone="purple"
                />
              </>
            }
            subtitle="Online / Processing"
            theme={theme}
            title="AI_ASSISTANT"
          />
        )
      }
      sidebar={
        <Sidebar
          active="home"
          footer={
            <SidebarFooterUser
              src={assets.userAvatar}
              subtitle="ONLINE"
              theme={theme}
              title="OPERATOR_01"
            />
          }
          subtitle="RANK: NOVICE"
          theme={theme}
        />
      }
      theme={theme}
    />
  );
}

export function SubjectSelectScreen({ theme }: { theme: CyberTheme }) {
  const dark = theme === "dark";

  return (
    <Frame
      header={
        <HeaderBar theme={theme}>
          <HeaderTitle theme={theme} title="LEARNING_TERMINAL" />
          <div className="flex items-center gap-4">
            {dark ? (
              <div className="flex items-center gap-5">
                <span className="text-[#9cff93]">
                  <SparkIcon />
                </span>
                <div className="border-l-2 border-[#9cff93] bg-[#262626] px-3 py-1 font-display text-sm text-[#9cff93]">
                  XP: 2450
                </div>
              </div>
            ) : null}
          </div>
        </HeaderBar>
      }
      main={
        <main
          className={cn(
            dark ? "bg-[#0e0e0e]" : "bg-[#e7edf1]",
            "cyber-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain",
          )}
        >
          <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-12 p-12">
            <div className="max-w-[720px]">
              <h1
                className={cn(
                  "font-display text-[60px] font-bold uppercase leading-[1] tracking-[-3px]",
                  dark ? "text-white" : "text-[#0f172a]",
                )}
              >
                SELECT{" "}
                <span className={dark ? "text-[#9cff93]" : "text-[#16a34a]"}>
                  SUBJECT
                </span>
                _
              </h1>
              <p
                className={cn(
                  "mt-4 text-base leading-[26px]",
                  dark ? "text-[#adaaaa]" : "text-[#475569]",
                )}
              >
                Initialize your cognitive uplink. Choose a primary knowledge
                domain to begin processing new data packets. All progression is
                permanent within the neural ledger.
              </p>
            </div>
            <div className="grid gap-10 xl:grid-cols-2">
              <SubjectCard
                code="0X_CS_01"
                description={[
                  "Master the syntax of reality.",
                  "Algorithms, data structures, and",
                  "the architecture of the digital",
                  "void.",
                ]}
                icon={<TerminalIcon />}
                progress={2}
                theme={theme}
                title="COMPUTER SCIENCE"
              />
              <SubjectCard
                code="0X_EN_02"
                description={[
                  "Decode the narrative protocols.",
                  "Analysis of linguistic frameworks",
                  "and the evolution of human data",
                  "exchange.",
                ]}
                icon={<BookIcon />}
                progress={3}
                theme={theme}
                title="ENGLISH"
                tone="purple"
              />
            </div>
            <div className="grid gap-8 xl:grid-cols-2">
              <PromoCard
                description={[
                  "New modules added to the Computer",
                  "Science database. Quantum Logic",
                  "protocols now available for high-level",
                  "users.",
                ]}
                imageSrc={figmaAssets.subjectSelect.systemStatus}
                theme={theme}
                title="SYSTEM_UPDATE"
                tone="purple"
              />
              <PromoCard
                description={[
                  "Secure uplink maintained. Your progress",
                  "is being synchronized across the global",
                  "learning grid. No packet loss detected.",
                ]}
                imageSrc={figmaAssets.subjectSelect.securityProtocol}
                theme={theme}
                title="DATA_INTEGRITY"
                tone="cyan"
              />
            </div>
          </div>
        </main>
      }
      rightRail={
        <AssistantRail
          footer={
            <PixelButton className="w-full" theme={theme} tone="purple">
              + NEW_QUERY
            </PixelButton>
          }
          middleCards={
            <>
              <MessageCard
                body={
                  <>
                    &quot;Greetings, User. Based on your
                    <br />
                    previous session, I suggest continuing
                    <br />
                    with Computer Science to complete the
                    <br />
                    &apos;Array Mastery&apos; challenge.&quot;
                  </>
                }
                theme={theme}
                tone="purple"
              />
              <MessageCard
                body="Show me my latest score in History."
                theme={theme}
              />
              <MessageCard
                body={
                  <>
                    Accessing neural archives... Your
                    <br />
                    last History session resulted in 850
                    <br />
                    XP. You are 150 XP away from
                    <br />
                    &apos;Chronicler&apos; rank.
                  </>
                }
                theme={theme}
                tone="purple"
              />
            </>
          }
          subtitle="STATUS: ANALYZING"
          theme={theme}
          title="AI_ASSISTANT"
        />
      }
      sidebar={
        <Sidebar
          active="home"
          footer={
            dark ? (
              <div className="border-t-4 border-[#262626] bg-[#0e0e0e] p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center bg-[#262626] text-[#d575ff]">
                    <BotIcon />
                  </div>
                  <div>
                    <div className="font-display text-xs font-bold uppercase text-[#d575ff]">
                      AI_ASSISTANT
                    </div>
                    <div className="font-sans text-[10px] text-[#adaaaa]">
                      Online / Processing
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-t-4 border-[#b5c0ca] bg-[#e7edf1] p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center bg-[#cfd7de] text-[#9800d0]">
                    <BotIcon />
                  </div>
                  <div>
                    <div className="font-display text-xs font-bold uppercase text-[#9800d0]">
                      AI_ASSISTANT
                    </div>
                    <div className="font-sans text-[10px] text-[#52606f]">
                      Online / Processing
                    </div>
                  </div>
                </div>
              </div>
            )
          }
          navSize="md"
          subtitle="Rank: Novice"
          subtitleClassName={
            dark
              ? "font-sans text-xs leading-4 text-[#adaaaa] tracking-[1.2px]"
              : "font-sans text-xs leading-4 text-[#6c7988]"
          }
          theme={theme}
        />
      }
      theme={theme}
    />
  );
}

export function PathScreen({ theme }: { theme: CyberTheme }) {
  const dark = theme === "dark";

  return (
    <Frame
      header={
        <HeaderBar theme={theme}>
          <HeaderTitle
            theme={theme}
            title="LEARNING_TERMINAL"
            trail="COMPUTER SCIENCE / MODULE 01"
          />
          {dark ? (
            <div className="flex items-center gap-4">
              <div className="text-[#9cff93]">
                <BotStatusIcon />
              </div>
              <div className="font-display text-sm font-bold text-[#9cff93]">
                ONLINE
              </div>
            </div>
          ) : (
            <MetricBadge icon={<SparkIcon />} theme={theme}>
              XP: 2450
            </MetricBadge>
          )}
        </HeaderBar>
      }
      main={
        <main
          className={cn(
            dark ? "bg-[#0e0e0e]" : "bg-[#e7edf1]",
            "cyber-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain",
          )}
        >
          <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-10 p-12">
            <div>
              <h1
                className={cn(
                  "font-display text-5xl font-bold uppercase",
                  dark ? "text-white" : "text-[#0f172a]",
                )}
              >
                COMPUTER SCIENCE PATH
              </h1>
              <div className="mt-4 max-w-[560px]">
                <ProgressSegments
                  activeTone="cyan"
                  size="md"
                  theme={theme}
                  total={8}
                  value={3}
                />
              </div>
            </div>
            <div className="relative grid gap-10">
              <div
                className={cn(
                  "absolute bottom-0 left-8 top-0 w-px",
                  dark ? "bg-[#262626]" : "bg-[#cbd5e1]",
                )}
              />
              {[
                {
                  title: "BINARY & LOGIC GATES",
                  description:
                    "Master the foundational units of digital computation and boolean algebra.",
                  time: "45 MIN",
                  xp: "150 XP",
                  active: false,
                  locked: false,
                  done: true,
                },
                {
                  title: "MEMORY MANAGEMENT",
                  description:
                    "Understanding pointers, stack vs heap, and manual allocation logic.",
                  time: "60 MIN",
                  xp: "250 XP",
                  active: true,
                  locked: false,
                  done: false,
                },
                {
                  title: "DATA STRUCTURES I",
                  description:
                    "Implementation of Linked Lists, Queues, and Stacks from scratch.",
                  time: "90 MIN",
                  xp: "400 XP",
                  active: false,
                  locked: true,
                  done: false,
                },
                {
                  title: "ALGORITHMIC COMPLEXITY",
                  description:
                    "Big O Notation, space-time trade-offs, and optimization strategies.",
                  time: "120 MIN",
                  xp: "500 XP",
                  active: false,
                  locked: true,
                  done: false,
                },
              ].map((item, index) => (
                <div
                  className="grid grid-cols-[64px_minmax(0,1fr)] gap-10"
                  key={item.title}
                >
                  <div className="relative flex justify-center">
                    <div
                      className={cn(
                        "mt-2 flex size-16 items-center justify-center border-4",
                        item.active
                          ? dark
                            ? "border-[#9cff93] bg-[#9cff93] text-[#0e0e0e] shadow-[0px_0px_18px_rgba(156,255,147,0.55)]"
                            : "border-[#16a34a] bg-[#00b61f] text-white shadow-[0px_0px_18px_rgba(22,163,74,0.25)]"
                          : item.done
                            ? dark
                              ? "border-[#262626] bg-[#131313] text-[#9cff93]"
                              : "border-[#b5c0ca] bg-[#d9e0e6] text-[#16a34a]"
                            : dark
                              ? "border-[#262626] bg-[#0e0e0e] text-[#6b7280]"
                              : "border-[#b5c0ca] bg-[#e7edf1] text-[#6c7988]",
                      )}
                    >
                      {item.locked ? (
                        <LockIcon />
                      ) : item.done ? (
                        <CheckIcon />
                      ) : (
                        <CodeIcon />
                      )}
                    </div>
                  </div>
                  <article
                    className={cn(
                      item.locked
                        ? dark
                          ? "bg-[#0e0e0e] opacity-60"
                          : "bg-[#e7edf1] opacity-70"
                        : dark
                          ? "bg-[#131313]"
                          : "bg-[#d9e0e6]",
                      item.active &&
                        (dark
                          ? "border border-[#36553a] shadow-[inset_0_0_0_1px_rgba(156,255,147,0.18)]"
                          : "border-2 border-[#00b61f]"),
                      !item.active &&
                        !item.locked &&
                        !item.done &&
                        (dark ? "bg-[#131313]" : "bg-[#d9e0e6]"),
                      !dark && "shadow-[0px_0px_0px_2px_#b5c0ca]",
                      "p-6",
                    )}
                  >
                    <div
                      className={cn(
                        "mb-2 font-display text-sm font-bold uppercase",
                        item.active
                          ? dark
                            ? "text-[#9cff93]"
                            : "text-[#16a34a]"
                          : dark
                            ? "text-[#6b7280]"
                            : "text-[#6c7988]",
                      )}
                    >
                      UNIT 0{index + 1}
                      {item.active ? "  READY TO PROCESS" : ""}
                    </div>
                    <h2
                      className={cn(
                        "font-display text-4xl font-bold uppercase",
                        item.locked
                          ? dark
                            ? "text-[#575757]"
                            : "text-[#6c7988]"
                          : dark
                            ? "text-white"
                            : "text-[#0f172a]",
                      )}
                    >
                      {item.title}
                    </h2>
                    <p
                      className={cn(
                        "mt-3 text-base",
                        item.locked
                          ? dark
                            ? "text-[#575757]"
                            : "text-[#6c7988]"
                          : dark
                            ? "text-[#adaaaa]"
                            : "text-[#475569]",
                      )}
                    >
                      {item.description}
                    </p>
                    <div
                      className={cn(
                        "mt-4 flex gap-6 font-display text-sm",
                        item.locked
                          ? dark
                            ? "text-[#575757]"
                            : "text-[#6c7988]"
                          : dark
                            ? "text-[#69daff]"
                            : "text-[#0891b2]",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <ClockIcon />
                        {item.time}
                      </span>
                      <span
                        className={
                          item.locked
                            ? ""
                            : dark
                              ? "text-[#9cff93]"
                              : "text-[#16a34a]"
                        }
                      >
                        <span className="inline-flex items-center gap-2">
                          <BoltIcon />
                          {item.xp}
                        </span>
                      </span>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </main>
      }
      rightRail={
        <AssistantRail
          footer={
            <div
              className={cn(
                dark ? "bg-[#1a1a1a]" : "bg-[#d9e0e6] border border-[#b5c0ca]",
                "p-4",
              )}
            >
              <div
                className={cn(
                  "font-sans text-xs",
                  dark ? "text-[#6b7280]" : "text-[#6c7988]",
                )}
              >
                TYPE_MESSAGE...
              </div>
            </div>
          }
          middleCards={
            <>
              <MessageCard
                body={
                  <>
                    Memory management is critical for low-level system
                    performance.
                    <br />
                    Would you like a breakdown of Stack vs Heap?
                  </>
                }
                label="ASSISTANT:"
                theme={theme}
                tone="purple"
              />
              <MessageCard
                body='"Yes, explain the Stack first."'
                label="USER:"
                theme={theme}
              />
              <MessageCard
                body={
                  <>
                    The stack is a LIFO (Last-In First-Out) structure.
                    <br />
                    It&apos;s fast and automatically managed by the CPU...
                  </>
                }
                label="ASSISTANT:"
                theme={theme}
                tone="purple"
              />
            </>
          }
          subtitle="Processing Module 02..."
          theme={theme}
          title="NEURO_VOICE_4.0"
        />
      }
      sidebar={
        <Sidebar
          active="learn"
          footer={
            <SidebarFooterUser
              compact
              src={
                dark
                  ? figmaAssets.darkHome.userAvatar
                  : figmaAssets.lightHome.userAvatar
              }
              subtitle="STREAK: 12 DAYS"
              subtitleTone="cyan"
              theme={theme}
              title="USER_01"
            />
          }
          subtitle="RANK: NOVICE"
          subtitleClassName={
            dark
              ? "font-pixel text-[10px] leading-[15px] text-[#9cff93]"
              : "font-pixel text-[10px] leading-[15px] text-[#9800d0]"
          }
          subtitleFont="pixel"
          theme={theme}
        />
      }
      theme={theme}
    />
  );
}

export function DocsExplorerScreen({ theme }: { theme: CyberTheme }) {
  const dark = theme === "dark";

  return (
    <Frame
      header={
        <HeaderBar theme={theme}>
          <HeaderTitle theme={theme} title="LEARNING_TERMINAL" />
          {dark ? (
            <div className="flex items-center gap-4">
              <span className="text-[#9cff93]">
                <SparkIcon />
              </span>
              <div className="font-display text-sm font-bold text-[#9cff93]">
                XP: 2450
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-5 text-[#6c7988]">
              <FolderIcon />
              <ShareIcon />
              <EyeIcon />
            </div>
          )}
        </HeaderBar>
      }
      main={
        <main
          className={cn(
            dark ? "bg-[#0e0e0e]" : "bg-[#e7edf1]",
            "cyber-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain",
          )}
        >
          <EditorTabs theme={theme} />
          <div className="grid h-[calc(100vh-64px-52px)] grid-cols-[220px_minmax(0,1fr)_280px]">
            <aside
              className={cn(
                dark
                  ? "border-r border-[#262626] bg-[#131313]"
                  : "border-r border-[#b5c0ca] bg-[#d9e0e6]",
                "p-4",
              )}
            >
              <div
                className={cn(
                  dark
                    ? "bg-[#262626] text-[#6b7280]"
                    : "bg-[#e7edf1] text-[#6c7988]",
                  "mb-4 flex items-center justify-between px-4 py-3 text-xs",
                )}
              >
                <span>SEARCH_FILES...</span>
                <SearchIcon />
              </div>
              <div
                className={cn(
                  "space-y-3 font-display text-sm",
                  dark ? "text-[#adaaaa]" : "text-[#475569]",
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FolderIcon />
                    <span>CS_FUNDAMENTALS</span>
                  </div>
                  <div className="ml-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <FolderIcon />
                      <span>RECURSION_NOTES</span>
                    </div>
                    <div
                      className={cn(
                        dark
                          ? "bg-[#262626] text-[#9cff93]"
                          : "bg-[#e7edf1] text-[#16a34a]",
                        "flex items-center gap-2 px-3 py-2",
                      )}
                    >
                      <FileIcon />
                      <span>Binary_Search_Logic.md</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileIcon />
                      <span>Sorting_Algos.md</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FolderIcon />
                  <span>DATA_STRUCTURES</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileIcon />
                  <span>Todo_List.md</span>
                </div>
              </div>
            </aside>
            <section
              className={cn(
                dark ? "bg-[#0e0e0e]" : "bg-[#e7edf1]",
                "overflow-auto p-4 cyber-scrollbar",
              )}
            >
              <div
                className={cn(
                  dark
                    ? "border border-[#262626] bg-[#131313]"
                    : "border border-[#b5c0ca] bg-[#d9e0e6]",
                  "mx-auto max-w-[520px] p-6",
                )}
              >
                <div
                  className={cn(
                    "mb-4 font-display text-sm uppercase",
                    dark ? "text-[#9cff93]" : "text-[#16a34a]",
                  )}
                >
                  # Binary Search Algorithm
                </div>
                <h1
                  className={cn(
                    "mb-6 font-display text-5xl font-bold leading-tight",
                    dark ? "text-white" : "text-[#0f172a]",
                  )}
                >
                  Binary Search
                  <br />
                  Implementation
                </h1>
                <div
                  className={cn(
                    "space-y-3 text-base leading-9",
                    dark ? "text-[#adaaaa]" : "text-[#475569]",
                  )}
                >
                  <p>
                    Binary search is a fast search algorithm with run-time
                    complexity of O(log n).
                  </p>
                  <p>
                    This search algorithm works on the principle of divide and
                    conquer.
                  </p>
                  <p>
                    For this algorithm to work properly, the data collection
                    should be in the sorted form.
                  </p>
                </div>
                <h2
                  className={cn(
                    "mt-8 font-display text-xl font-bold",
                    dark ? "text-[#9cff93]" : "text-[#16a34a]",
                  )}
                >
                  ## Logic Principles
                </h2>
                <ul
                  className={cn(
                    "mt-4 space-y-3 text-lg leading-9",
                    dark ? "text-[#adaaaa]" : "text-[#475569]",
                  )}
                >
                  <li>
                    Compare target value with the middle element of the array.
                  </li>
                  <li>If target equals middle, search is successful.</li>
                  <li>
                    If target is smaller, continue search in the lower half.
                  </li>
                  <li>
                    Leverage recursion carefully to keep implementations
                    cleaner.
                  </li>
                </ul>
                <div
                  className={cn(
                    dark ? "bg-[#262626]" : "bg-[#cfd7de]",
                    "mt-8 p-6",
                  )}
                >
                  <div
                    className={cn(
                      "mb-3 font-display text-base",
                      dark ? "text-[#d575ff]" : "text-[#9800d0]",
                    )}
                  >
                    {"// Code snippet logic"}
                  </div>
                  <pre
                    className={cn(
                      "overflow-auto font-mono text-sm leading-7",
                      dark ? "text-white" : "text-[#0f172a]",
                    )}
                  >
                    {`function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  ...
}`}
                  </pre>
                </div>
              </div>
            </section>
            <aside
              className={cn(
                dark
                  ? "border-l border-[#262626] bg-[#0e0e0e]"
                  : "border-l border-[#b5c0ca] bg-[#d9e0e6]",
                "flex flex-col",
              )}
            >
              <div
                className={cn("flex-1 p-4", dark ? "bg-black" : "bg-[#e7edf1]")}
              >
                <div className="relative h-full border">
                  <div
                    className={cn(
                      "absolute left-1/2 top-24 h-8 w-16 -translate-x-1/2 border text-center text-[8px]",
                      dark
                        ? "border-[#9cff93] text-[#9cff93]"
                        : "border-[#0f172a] text-[#0f172a]",
                    )}
                  >
                    SORTED
                  </div>
                  <div
                    className={cn(
                      "absolute right-6 top-24 h-8 w-16 border text-center text-[8px]",
                      dark
                        ? "border-[#9cff93] text-[#9cff93]"
                        : "border-[#0f172a] text-[#0f172a]",
                    )}
                  >
                    ARRAY
                  </div>
                  <div
                    className={cn(
                      "absolute left-10 top-24 h-8 w-16 border text-center text-[8px]",
                      dark
                        ? "border-[#9cff93] text-[#9cff93]"
                        : "border-[#0f172a] text-[#0f172a]",
                    )}
                  >
                    SEARCH
                  </div>
                  <div
                    className={cn(
                      "absolute left-1/2 top-44 h-8 w-24 -translate-x-1/2 border text-center text-[8px]",
                      dark
                        ? "border-[#9cff93] text-[#9cff93]"
                        : "border-[#0f172a] text-[#0f172a]",
                    )}
                  >
                    BINARY SEARCH
                  </div>
                  <div
                    className={cn(
                      "absolute left-1/2 top-64 h-8 w-20 -translate-x-1/2 border text-center text-[8px]",
                      dark
                        ? "border-[#d575ff] text-[#d575ff]"
                        : "border-[#9800d0] text-[#9800d0]",
                    )}
                  >
                    RECURSION
                  </div>
                  <div
                    className={cn(
                      "absolute left-1/2 top-32 h-16 w-px -translate-x-1/2",
                      dark ? "bg-[#9cff93]" : "bg-[#0f172a]",
                    )}
                  />
                  <div
                    className={cn(
                      "absolute left-24 top-32 h-20 w-px rotate-45 origin-top",
                      dark ? "bg-[#9cff93]" : "bg-[#0f172a]",
                    )}
                  />
                  <div
                    className={cn(
                      "absolute right-24 top-32 h-20 w-px -rotate-45 origin-top",
                      dark ? "bg-[#9cff93]" : "bg-[#0f172a]",
                    )}
                  />
                </div>
              </div>
              <div
                className={cn(
                  dark
                    ? "border-t border-[#262626] bg-[#131313]"
                    : "border-t-2 border-[#b5c0ca] bg-[#d9e0e6]",
                  "space-y-4 p-4",
                )}
              >
                <div
                  className={cn(
                    "font-display text-sm font-bold uppercase",
                    dark ? "text-[#d575ff]" : "text-[#9800d0]",
                  )}
                >
                  SUGGESTED_ACTIONS
                </div>
                {[
                  "GENERATE_FLASHCARDS",
                  "SUMMARIZE_LOGIC",
                  "LINK_TO_RECURSION",
                ].map((action, index) => (
                  <div
                    className={cn(
                      dark ? "bg-[#1a1a1a]" : "bg-[#e7edf1]",
                      index === 0
                        ? dark
                          ? "border-l-4 border-[#9cff93]"
                          : "border-l-4 border-[#16a34a]"
                        : index === 1
                          ? dark
                            ? "border-l-4 border-[#69daff]"
                            : "border-l-4 border-[#0891b2]"
                          : dark
                            ? "border-l-4 border-[#d575ff]"
                            : "border-l-4 border-[#9800d0]",
                      "px-4 py-3 font-display text-sm font-bold",
                    )}
                    key={action}
                  >
                    {action}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </main>
      }
      sidebar={
        <Sidebar
          active="learn"
          footer={
            <SidebarFooterUser
              compact
              src={
                dark
                  ? figmaAssets.darkHome.userAvatar
                  : figmaAssets.lightHome.userAvatar
              }
              subtitle="STREAK: 12 DAYS"
              subtitleTone="cyan"
              theme={theme}
              title="USER_01"
            />
          }
          subtitle="RANK: NOVICE"
          subtitleClassName={
            dark
              ? "font-sans text-xs leading-4 text-[#adaaaa] tracking-[1.2px]"
              : "font-pixel text-[10px] leading-[15px] text-[#16a34a]"
          }
          subtitleFont={dark ? "body" : "pixel"}
          theme={theme}
        />
      }
      theme={theme}
    />
  );
}

export function PracticeChallengeScreen({ theme }: { theme: CyberTheme }) {
  const dark = theme === "dark";

  return (
    <Frame
      header={
        <HeaderBar theme={theme}>
          <HeaderTitle
            theme={theme}
            title="LEARNING_TERMINAL"
            trail="PYTHON_MODULE_04: RECURSION"
          />
          <div className="flex items-center gap-8">
            {["LEARN", "PRACTICE", "CHALLENGE"].map((item, index) => (
              <div
                className={cn(
                  "font-display text-sm font-bold uppercase",
                  index === 1
                    ? dark
                      ? "text-[#69daff]"
                      : "text-[#0f172a]"
                    : dark
                      ? "text-[#9cff93]"
                      : "text-[#16a34a]",
                )}
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </HeaderBar>
      }
      main={
        <main
          className={cn(
            dark ? "bg-[#0e0e0e]" : "bg-[#e7edf1]",
            "flex-1 overflow-hidden",
          )}
        >
          <div className="grid h-[calc(100vh-64px)] grid-cols-[420px_minmax(0,1fr)] overflow-hidden">
            <section
              className={cn(
                dark ? "bg-[#131313]" : "bg-[#d9e0e6]",
                dark ? "border-[#262626]" : "border-[#b5c0ca]",
                "cyber-scrollbar overflow-y-auto border-r p-8",
              )}
            >
              <div
                className={cn(
                  dark ? "bg-[#262626]" : "bg-[#cfd7de]",
                  "mb-6 flex items-start justify-between p-4",
                )}
              >
                <div>
                  <div
                    className={cn(
                      "font-display text-xl font-bold uppercase",
                      dark ? "text-[#9cff93]" : "text-[#16a34a]",
                    )}
                  >
                    PROBLEM_042:
                    <br />
                    BINARY_SEARCH
                  </div>
                </div>
                <div
                  className={cn(
                    dark
                      ? "bg-[#9cff93] text-[#0e0e0e]"
                      : "bg-[#16a34a] text-white",
                    "px-4 py-1 font-display text-sm font-bold uppercase",
                  )}
                >
                  HARD
                </div>
              </div>
              <div
                className={cn(
                  "space-y-6 text-2xl leading-[1.45]",
                  dark ? "text-white" : "text-[#0f172a]",
                )}
              >
                <p>
                  Implement a function
                  <span
                    className={cn(
                      "mx-2 px-2 py-1 text-xl",
                      dark
                        ? "bg-[#262626] text-[#d575ff]"
                        : "bg-[#cfd7de] text-[#9800d0]",
                    )}
                  >
                    binary_search(arr, target)
                  </span>
                  that returns the index of the target in a sorted list using
                  the
                  <span
                    className={cn(
                      "ml-2",
                      dark ? "text-[#69daff]" : "text-[#0891b2]",
                    )}
                  >
                    Divide and Conquer
                  </span>
                  strategy.
                </p>
              </div>
              <div className="mt-8">
                <div
                  className={cn(
                    "mb-4 font-display text-3xl font-bold uppercase",
                    dark ? "text-white" : "text-[#0f172a]",
                  )}
                >
                  LOGIC_REQUIREMENTS:
                </div>
                <div className="space-y-4">
                  {[
                    "Time Complexity: O(log n)",
                    "Space Complexity: O(1)",
                    "Handle empty arrays and missing targets.",
                  ].map((item) => (
                    <div className="flex items-start gap-3" key={item}>
                      <span
                        className={cn(
                          "mt-1 size-3 border",
                          dark ? "border-[#9cff93]" : "border-[#16a34a]",
                        )}
                      />
                      <span
                        className={cn(
                          "text-xl",
                          dark ? "text-white" : "text-[#0f172a]",
                        )}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className={cn(
                  dark ? "bg-[#262626]" : "bg-[#cfd7de]",
                  "mt-8 p-6",
                )}
              >
                <div
                  className={cn(
                    "mb-3 font-display text-2xl font-bold uppercase",
                    dark ? "text-[#69daff]" : "text-[#0891b2]",
                  )}
                >
                  EXAMPLE_INPUT:
                </div>
                <div
                  className={cn(
                    "font-mono text-sm leading-7",
                    dark ? "text-white" : "text-[#0f172a]",
                  )}
                >
                  arr = [1, 3, 5, 7, 9, 11]
                  <br />
                  target = 7
                  <br />
                  OUTPUT: 3
                </div>
              </div>
              <div
                className={cn(
                  dark ? "bg-[#262626]" : "bg-[#cfd7de]",
                  "mt-4 p-6",
                )}
              >
                <div
                  className={cn(
                    "mb-3 font-display text-2xl font-bold uppercase",
                    dark ? "text-[#767575]" : "text-[#64748b]",
                  )}
                >
                  SYSTEM_HINT:
                </div>
                <p
                  className={cn(
                    "text-lg italic leading-8",
                    dark ? "text-[#adaaaa]" : "text-[#475569]",
                  )}
                >
                  Remember to update the &apos;low&apos; and &apos;high&apos;
                  pointers correctly to avoid infinite loops in the terminal
                  memory space.
                </p>
              </div>
            </section>
            <section className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_220px] overflow-hidden">
              <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-h-0 p-6">
                  <div
                    className={cn(
                      dark
                        ? "border border-[#262626] bg-[#0e0e0e]"
                        : "border border-[#b5c0ca] bg-[#e7edf1]",
                      "flex h-full min-h-0 flex-col p-6",
                    )}
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <span className="size-3 rounded-full bg-[#ef4444]" />
                      <span className="size-3 rounded-full bg-[#f59e0b]" />
                      <span className="size-3 rounded-full bg-[#d575ff]" />
                      <div
                        className={cn(
                          "ml-4 font-display text-base font-bold",
                          dark ? "text-[#adaaaa]" : "text-[#475569]",
                        )}
                      >
                        solution.py
                      </div>
                    </div>
                    <pre
                      className={cn(
                        "cyber-scrollbar min-h-0 flex-1 overflow-auto font-mono text-2xl leading-[2.1]",
                        dark ? "text-[#d575ff]" : "text-[#9800d0]",
                      )}
                    >
                      {`def binary_search(arr, target):
    # Initialize pointers
    low = 0
    high = len(arr) - 1

    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1

    return -1`}
                    </pre>
                    <div className="mt-6 flex justify-end">
                      <PixelButton className="px-10" theme={theme}>
                        RUN
                      </PixelButton>
                    </div>
                  </div>
                </div>
                <aside
                  className={cn(
                    dark ? "bg-[#131313]" : "bg-[#d9e0e6]",
                    dark ? "border-[#262626]" : "border-[#b5c0ca]",
                    "cyber-scrollbar overflow-y-auto border-l p-6",
                  )}
                >
                  <div className="mb-8 flex items-center gap-4">
                    <div
                      className={cn(
                        dark
                          ? "border-4 border-[#d575ff]"
                          : "border-4 border-[#9800d0]",
                        "flex size-12 items-center justify-center",
                      )}
                    >
                      <BotIcon
                        className={dark ? "text-white" : "text-[#0f172a]"}
                      />
                    </div>
                    <div>
                      <div
                        className={cn(
                          "font-display text-sm font-bold uppercase",
                          dark ? "text-white" : "text-[#0f172a]",
                        )}
                      >
                        ONLINE / PROCESSING
                      </div>
                    </div>
                  </div>
                  <MessageCard
                    body={
                      <>
                        &quot;Analyzing your code structure...
                        <br />
                        Optimization detected. You are
                        <br />
                        correctly using integer division for the
                        <br />
                        midpoint.&quot;
                      </>
                    }
                    theme={theme}
                    tone="purple"
                  />
                  <div
                    className={cn(
                      "mt-5 font-display text-lg font-bold uppercase",
                      dark ? "text-[#d575ff]" : "text-[#9800d0]",
                    )}
                  >
                    SUGGESTED_QUERY:
                  </div>
                  <div
                    className={cn(
                      "mt-2 text-base italic leading-7",
                      dark ? "text-[#adaaaa]" : "text-[#475569]",
                    )}
                  >
                    &quot;Explain space complexity in recursive
                    implementations?&quot;
                  </div>
                  <div
                    className={cn(
                      "mt-10 flex items-center justify-between font-display text-xl font-bold uppercase",
                      dark ? "text-white" : "text-[#475569]",
                    )}
                  >
                    <span>SYSTEM_LOAD</span>
                    <span>42%</span>
                  </div>
                  <div className="mt-3">
                    <ProgressSegments
                      activeTone="purple"
                      size="sm"
                      theme={theme}
                      total={4}
                      value={2}
                    />
                  </div>
                </aside>
              </div>
              <div
                className={cn(
                  dark
                    ? "border-t border-[#262626]"
                    : "border-t-2 border-[#b5c0ca]",
                  "grid grid-cols-[minmax(0,1fr)_320px]",
                )}
              >
                <div className="min-h-0 p-6">
                  <div
                    className={cn(
                      dark ? "bg-[#131313]" : "bg-[#111827]",
                      "flex h-full min-h-0 flex-col p-4",
                    )}
                  >
                    <div
                      className={cn(
                        "mb-3 font-display text-xl font-bold uppercase",
                        dark ? "text-[#9cff93]" : "text-[#9cff93]",
                      )}
                    >
                      CONSOLE_OUTPUT
                    </div>
                    <pre className="cyber-scrollbar min-h-0 flex-1 overflow-auto font-mono text-sm leading-7 text-[#00fc40]">
                      {`> Executing test cases...
> Test 1: [1, 2, 3], target 2 ... PASSED
> Test 2: [10, 20, 30, 40], target 40 ... PASSED
> Test 3: [], target 5 ... PASSED
> ALL_SYSTEMS_GO: 100% Logic Validity.`}
                    </pre>
                  </div>
                </div>
                <div className="p-6">
                  <div
                    className={cn(
                      dark
                        ? "bg-[#1a1a1a]"
                        : "bg-[#cfd7de] border border-[#b5c0ca]",
                      "p-4",
                    )}
                  >
                    <div
                      className={cn(
                        "font-sans text-sm",
                        dark ? "text-[#575757]" : "text-[#6c7988]",
                      )}
                    >
                      TYPE_QUERY_HERE...
                    </div>
                  </div>
                  <div className="mt-4">
                    <PixelButton className="w-full" theme={theme} tone="purple">
                      NEW_QUERY
                    </PixelButton>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      }
      sidebar={
        <Sidebar
          active="practice"
          footer={
            <SidebarFooterUser
              compact
              src={
                dark
                  ? figmaAssets.darkHome.userAvatar
                  : figmaAssets.lightHome.userAvatar
              }
              subtitle="ONLINE"
              theme={theme}
              title="SYS_USR_882"
            />
          }
          subtitle="RANK: NOVICE"
          subtitleClassName={
            dark
              ? "font-display text-[12px] tracking-[1.2px] text-[#6b7280]"
              : "font-display text-[12px] tracking-[1.2px] text-[#6c7988]"
          }
          theme={theme}
        />
      }
      theme={theme}
    />
  );
}

export function FlashcardScreen() {
  const theme: CyberTheme = "dark";

  const flashcards = [
    {
      id: 1,
      question: "What is the base case in a recursive function?",
      answer:
        "The base case is the condition that stops the recursion. Without it, the function would call itself infinitely, causing a stack overflow error.",
    },
    {
      id: 2,
      question: "What does Big O notation O(n log n) represent?",
      answer:
        "O(n log n) represents algorithms that divide the problem (log n) and process each element (n), like Merge Sort and Quick Sort on average.",
    },
    {
      id: 3,
      question: "What is a closure in JavaScript?",
      answer:
        "A closure is a function that retains access to its outer scope's variables even after the outer function has finished executing.",
    },
    {
      id: 4,
      question: "Difference between stack and queue data structures?",
      answer:
        "Stack follows LIFO (Last In, First Out) — like a stack of plates. Queue follows FIFO (First In, First Out) — like a line of people.",
    },
    {
      id: 5,
      question: "What is memoization and when should you use it?",
      answer:
        "Memoization caches the results of expensive function calls. Use it when a function is called repeatedly with the same inputs to avoid redundant computation.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const currentCard = flashcards[currentIndex];
  const total = flashcards.length;

  function goPrev() {
    setFlipped(false);
    setTimeout(() => setCurrentIndex((i) => (i - 1 + total) % total), 150);
  }

  function goNext() {
    setFlipped(false);
    setTimeout(() => setCurrentIndex((i) => (i + 1) % total), 150);
  }

  return (
    <Frame
      header={
        <HeaderBar theme={theme}>
          <HeaderTitle theme={theme} title="LEARNING_TERMINAL" />
          <div className="font-pixel text-[10px] uppercase text-[#6b7280]">
            CARD {currentIndex + 1} / {total}
          </div>
        </HeaderBar>
      }
      main={
        <main className="cyber-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#0e0e0e]">
          <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-12 p-12">
            {/* Title */}
            <div className="ml-28 max-w-[520px]">
              <div className="font-display text-5xl font-bold uppercase text-[#9cff93]">
                FLASHCARD_DECK
              </div>
              <div className="mt-1 font-display text-lg uppercase text-[#767575]">
                MODULE_04: RECURSIVE_LOGIC
              </div>
            </div>

            {/* Flashcard with flip */}
            <div className="mx-auto w-full max-w-[820px]">
              <div
                className="relative cursor-pointer"
                style={{ perspective: "1200px" }}
                onClick={() => setFlipped((f) => !f)}
              >
                <div
                  style={{
                    transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
                    transformStyle: "preserve-3d",
                    transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    position: "relative",
                    minHeight: "280px",
                  }}
                >
                  {/* Front — Question */}
                  <div
                    className="bg-[#262626] p-12 shadow-[12px_8px_0px_0px_black] absolute inset-0"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="mb-8 flex justify-center text-[#9cff93]">
                      <TerminalIcon />
                    </div>
                    <h1 className="text-center font-display text-4xl font-bold leading-tight text-white">
                      {currentCard.question}
                    </h1>
                    <div className="mt-8 flex justify-center">
                      <div className="border border-[#3a3a3a] bg-[#0e0e0e] px-6 py-2 font-pixel text-[10px] uppercase text-[#6b7280]">
                        ▶ CLICK TO REVEAL ANSWER
                      </div>
                    </div>
                  </div>

                  {/* Back — Answer */}
                  <div
                    className="bg-[#1a2e1a] border-2 border-[#9cff93] p-12 shadow-[12px_8px_0px_0px_black] absolute inset-0 flex flex-col items-center justify-center"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="mb-6 font-pixel text-[10px] uppercase text-[#9cff93]">
                      ✓ ANSWER_REVEAL
                    </div>
                    <p className="text-center font-sans text-lg leading-relaxed text-white">
                      {currentCard.answer}
                    </p>
                    <div className="mt-8 flex justify-center">
                      <div className="border border-[#9cff93]/30 bg-[#0e0e0e] px-6 py-2 font-pixel text-[10px] uppercase text-[#9cff93]/60">
                        ▶ CLICK TO FLIP BACK
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mx-auto flex w-full max-w-[480px] items-center justify-between">
              {/* PREV */}
              <button
                id="flashcard-prev-btn"
                type="button"
                onClick={goPrev}
                className="group flex items-center gap-4 transition-opacity hover:opacity-80"
              >
                <div className="border-2 border-[#9cff93] p-4 text-[#9cff93] transition-colors group-hover:bg-[#9cff93] group-hover:text-[#0e0e0e]">
                  <ArrowLeftIcon />
                </div>
                <span className="font-display text-xl uppercase text-[#6b7280] group-hover:text-white transition-colors">
                  PREV
                </span>
              </button>

              {/* Progress dots */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1.5">
                  {flashcards.map((_, idx) => (
                    <button
                      key={idx}
                      id={`flashcard-dot-${idx}`}
                      type="button"
                      onClick={() => { setFlipped(false); setTimeout(() => setCurrentIndex(idx), 150); }}
                      className={cn(
                        "h-2 w-2 transition-all",
                        idx === currentIndex
                          ? "bg-[#9cff93] w-4"
                          : "bg-[#262626] hover:bg-[#4a4a4a]",
                      )}
                    />
                  ))}
                </div>
                <span className="font-pixel text-[9px] uppercase text-[#6b7280]">
                  {currentIndex + 1} / {total}
                </span>
              </div>

              {/* NEXT */}
              <button
                id="flashcard-next-btn"
                type="button"
                onClick={goNext}
                className="group flex items-center gap-4 transition-opacity hover:opacity-80"
              >
                <span className="font-display text-xl uppercase text-white group-hover:text-[#9cff93] transition-colors">
                  NEXT
                </span>
                <div className="bg-[#9cff93] p-4 text-[#0e0e0e] transition-colors group-hover:bg-[#7de874]">
                  <ArrowRightIcon />
                </div>
              </button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 xl:grid-cols-3">
              {[
                {
                  label: "FOCUS_TIME",
                  value: "24:12",
                  tone: "purple" as const,
                  icon: <ClockIcon />,
                },
                {
                  label: "ACCURACY",
                  value: "92.4%",
                  tone: "brand" as const,
                  icon: <BoltIcon />,
                },
                {
                  label: "SESSION",
                  value: `0${currentIndex + 1}/${String(total).padStart(2, "0")}`,
                  tone: "cyan" as const,
                  icon: <LayersIcon />,
                },
              ].map((card) => (
                <div className="bg-[#262626] p-6" key={card.label}>
                  <div
                    className={cn(
                      "mb-3 flex items-center gap-3 font-display text-xs uppercase",
                      card.tone === "purple"
                        ? "text-[#d575ff]"
                        : card.tone === "cyan"
                          ? "text-[#69daff]"
                          : "text-[#9cff93]",
                    )}
                  >
                    {card.icon}
                    {card.label}
                  </div>
                  <div className="font-display text-4xl font-bold text-white">
                    {card.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      }
      rightRail={
        <AssistantRail
          footer={
            <PixelButton className="w-full" theme={theme} tone="purple">
              NEW_QUERY
            </PixelButton>
          }
          middleCards={
            <>
              <MessageCard
                body={
                  <>
                    Recursion can be tricky. Remember that the
                    <span className="text-[#9cff93]"> base case </span>
                    is what prevents the infinite loop. Need an example?
                  </>
                }
                label="RESPONSE:"
                theme={theme}
                tone="purple"
              />
              <div className="space-y-5 text-[#adaaaa]">
                {[
                  "Show code snippet",
                  "Explain like I'm five",
                  "Why is this important?",
                ].map((item) => (
                  <div className="font-sans text-sm" key={item}>
                    -- {item}
                  </div>
                ))}
              </div>
            </>
          }
          subtitle="Online / Processing"
          theme={theme}
          title="CORE_LOGIC_BOT"
        />
      }
      sidebar={
        <Sidebar
          active="practice"
          footer={
            <div className="border-t-4 border-[#262626] bg-[#0e0e0e] p-6">
              <div className="bg-[#262626] p-4">
                <div className="mb-2 font-display text-xs uppercase text-[#69daff]">
                  NEURAL SYNC STATUS
                </div>
                <ProgressSegments
                  activeTone="brand"
                  size="sm"
                  theme="dark"
                  total={total}
                  value={currentIndex + 1}
                />
                <div className="mt-2 text-right font-display text-[10px] uppercase text-[#6b7280]">
                  {Math.round(((currentIndex + 1) / total) * 100)}% SYNCHED
                </div>
              </div>
            </div>
          }
          subtitle="RANK: NOVICE"
          subtitleClassName="font-pixel text-[10px] leading-[15px] text-[#9cff93]"
          subtitleFont="pixel"
          theme="dark"
        />
      }
      theme="dark"
    />
  );
}

function formatProfileName(user?: UserProfile | null) {
  const fullName = user?.full_name?.trim();

  if (fullName) {
    return fullName;
  }

  const emailHandle = user?.email.split("@")[0]?.replace(/[._-]+/g, " ").trim();

  return emailHandle ? emailHandle : "Operator Neo";
}

function formatProfileAlias(user?: UserProfile | null) {
  return formatProfileName(user)
    .replace(/\s+/g, "_")
    .slice(0, 18)
    .toUpperCase();
}

function formatSubscriptionTier(user?: UserProfile | null) {
  return (user?.subscription_tier || "Free").replace(/[_-]+/g, " ").toUpperCase();
}

function getProfileSyncValue(user?: UserProfile | null) {
  const tier = user?.subscription_tier?.toLowerCase();

  if (tier?.includes("enterprise")) {
    return 10;
  }

  if (tier?.includes("pro") || tier?.includes("premium")) {
    return 8;
  }

  if (tier?.includes("basic")) {
    return 5;
  }

  return user?.is_active ? 4 : 2;
}

export function ProfileScreen({
  theme,
  user,
  isLoading = false,
  errorMessage = null,
}: {
  theme: CyberTheme;
  user?: UserProfile | null;
  isLoading?: boolean;
  errorMessage?: string | null;
}) {
  const router = useRouter();
  const dark = theme === "dark";
  const assets = dark ? figmaAssets.darkProfile : figmaAssets.lightProfile;
  const profileName = formatProfileName(user);
  const profileAlias = formatProfileAlias(user);
  const subscriptionTier = formatSubscriptionTier(user);
  const statusLabel = user?.is_active ? "ACTIVE" : "INACTIVE";
  const shortUserId = user?.id.slice(0, 8).toUpperCase() ?? "UNKNOWN";
  const syncValue = getProfileSyncValue(user);
  const emailAddress = user?.email ?? "No authenticated session email";
  const updateSubscriptionMutation = useUpdateSubscriptionMutation();
  const logoutMutation = useLogoutMutation({
    onSuccess: () => {
      router.replace("/auth/login");
    },
  });
  const subscriptionOptions = [
    { label: "FREE", value: "free" },
    { label: "PRO", value: "pro" },
    { label: "ENTERPRISE", value: "enterprise" },
  ] as const;

  return (
    <Frame
      header={
        <HeaderBar theme={theme}>
          <HeaderTitle theme={theme} title="LEARNING_TERMINAL" />
          <div className="flex items-center gap-4">
            <span className={dark ? "text-[#9cff93]" : "text-[#16a34a]"}>
              <SparkIcon />
            </span>
            <span className={dark ? "text-[#69daff]" : "text-[#0891b2]"}>
              <TrophyIcon />
            </span>
            <div
              className={cn(
                dark
                  ? "bg-[#00fc40] text-[#005a10]"
                  : "bg-[#006e17] text-white",
                "px-3 py-1 font-pixel text-[10px]",
              )}
            >
              TIER: {subscriptionTier}
            </div>
          </div>
        </HeaderBar>
      }
      main={
        <main
          className={cn(
            dark ? "bg-[#0e0e0e]" : "bg-[#e7edf1]",
            "cyber-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain",
          )}
        >
          <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-12 p-12">
            <section className="flex items-end gap-8">
              <div className="relative">
                <div
                  className={cn(
                    dark ? "bg-[#9cff93]/20" : "bg-[#006e17]/10",
                    "absolute inset-0 blur-xl",
                  )}
                />
                <SafeImage
                  alt={profileName}
                  className={cn(
                    dark
                      ? "border-4 border-[#262626] saturate-0"
                      : "border-4 border-[#b5c0ca] saturate-0",
                    "relative h-48 w-48 object-cover",
                  )}
                  height={192}
                  priority
                  src={assets.heroAvatar}
                  width={192}
                />
                <div
                  className={cn(
                    dark
                      ? "bg-[#9cff93] text-[#006413]"
                      : "bg-[#006e17] text-white",
                    "absolute bottom-0 right-0 px-2 py-1 font-pixel text-[10px]",
                  )}
                >
                  {statusLabel}
                </div>
              </div>
              <div className="flex-1">
                <h1
                  className={cn(
                    "font-display text-[48px] font-bold uppercase tracking-[-2.4px]",
                    dark ? "text-white" : "text-[#0f172a]",
                  )}
                >
                  {profileName}
                </h1>
                <div
                  className={cn(
                    "mt-4 max-w-[32rem] space-y-0.5 text-base leading-6",
                    dark ? "text-[#adaaaa]" : "text-[#484847]",
                  )}
                >
                  <p>AUTHENTICATED_EMAIL: {emailAddress}</p>
                  <p>
                    ACCOUNT_STATUS: {statusLabel} {"//"} SUBSCRIPTION_TIER:{" "}
                    {subscriptionTier}
                  </p>
                  <p>
                    {isLoading
                      ? "Synchronizing profile payload from backend..."
                      : errorMessage
                        ? `PROFILE_SYNC_WARNING: ${errorMessage}`
                        : `PROFILE_ID: ${shortUserId} // SESSION_LINK_STABLE.`}
                  </p>
                </div>
                <div className="mt-4 grid max-w-[520px] gap-4 md:grid-cols-2">
                  <MetricTile
                    label="USER ID"
                    theme={theme}
                    value={shortUserId}
                  />
                  <MetricTile
                    icon={<FireIcon />}
                    label="STATUS"
                    theme={theme}
                    tone="purple"
                    value={statusLabel}
                  />
                  <MetricTile
                    label="PLAN"
                    theme={theme}
                    tone="cyan"
                    value={subscriptionTier}
                  />
                </div>
              </div>
            </section>
            <section className="space-y-6">
              <div
                className={cn(
                  dark
                    ? "border-b-2 border-[#262626]"
                    : "border-b-2 border-[#b5c0ca]",
                  "flex items-end justify-between pb-5",
                )}
              >
                <h2
                  className={cn(
                    "font-display text-[24px] font-bold uppercase",
                    dark ? "text-white" : "text-[#0f172a]",
                  )}
                >
                  EARNED_ACHIEVEMENTS
                </h2>
                <div
                  className={cn(
                    "font-display text-sm uppercase",
                    dark ? "text-[#767575]" : "text-[#64748b]",
                  )}
                >
                  14 / 48 UNLOCKED
                </div>
              </div>
              <div className="grid gap-4 xl:grid-cols-6">
                <AchievementCard
                  icon={<TerminalIcon />}
                  subtitle="FIRST BOOTUP"
                  theme={theme}
                  title="HELLO_WORLD"
                  tone="brand"
                />
                <AchievementCard
                  icon={<BoltIcon />}
                  subtitle="3HR SESSION"
                  theme={theme}
                  title="OVERCLOCK"
                  tone="purple"
                />
                <AchievementCard
                  icon={<DatabaseIcon />}
                  subtitle="COLLECTED 100 FILES"
                  theme={theme}
                  title="ARCHIVIST"
                  tone="cyan"
                />
                <AchievementCard
                  icon={<ShieldIcon />}
                  subtitle="SECURE AUTH"
                  theme={theme}
                  title="ENCRYPTED"
                  tone="brand"
                />
                <AchievementCard
                  icon={<LockIcon />}
                  locked
                  subtitle="???"
                  theme={theme}
                  title="LOCKED_ID"
                  tone="brand"
                />
                <AchievementCard
                  icon={<LockIcon />}
                  locked
                  subtitle="???"
                  theme={theme}
                  title="LOCKED_ID"
                  tone="brand"
                />
              </div>
            </section>
            <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr_1fr]">
              <div
                className={cn(
                  dark
                    ? "bg-[#1a1a1a] border-l-4 border-[#9cff93]"
                    : "bg-[#e2e8f0] border-l-4 border-[#006e17]",
                  "min-w-0 p-6",
                )}
              >
                <div className="flex justify-between">
                  <div>
                    <div
                      className={cn(
                        "font-display text-4xl font-bold uppercase",
                        dark ? "text-white" : "text-[#0f172a]",
                      )}
                    >
                      PROFILE
                    </div>
                    <div
                      className={cn(
                        "font-display text-4xl font-bold uppercase",
                        dark ? "text-white" : "text-[#0f172a]",
                      )}
                    >
                      OVERVIEW
                    </div>
                  </div>
                  <div
                    className={cn(
                      "min-w-0 break-words text-right font-display text-[18px] font-bold uppercase",
                      dark ? "text-[#9cff93]" : "text-[#16a34a]",
                    )}
                  >
                    TIER:
                    <br />
                    {subscriptionTier}
                  </div>
                </div>
                <div
                  className={cn(
                    "mt-4 text-sm",
                    dark ? "text-[#adaaaa]" : "text-[#475569]",
                  )}
                >
                  {isLoading
                    ? "Waiting for authenticated profile sync..."
                    : `Session synchronized for ${profileAlias}.`}
                </div>
                <div className="mt-5">
                  <ProgressSegments
                    size="lg"
                    theme={theme}
                    total={10}
                    value={syncValue}
                  />
                </div>
              </div>
              <div className="grid min-w-0 gap-6">
                <div
                  className={cn(
                    dark ? "bg-[#1a1a1a]" : "bg-[#e2e8f0]",
                    "min-w-0 p-6",
                  )}
                >
                  <div
                    className={cn(
                      "mb-4 flex items-center gap-2 font-pixel text-[10px] uppercase",
                      dark ? "text-[#d575ff]" : "text-[#9800d0]",
                    )}
                  >
                    ACCOUNT_MATRIX <EyeIcon />
                  </div>
                  <div className="space-y-2">
                    {[
                      [
                        "EMAIL",
                        emailAddress,
                        dark ? "text-[#9cff93]" : "text-[#006e17]",
                      ],
                      [
                        "STATUS",
                        statusLabel,
                        dark ? "text-[#9cff93]" : "text-[#006e17]",
                      ],
                      [
                        "PLAN",
                        subscriptionTier,
                        dark ? "text-[#d575ff]" : "text-[#9800d0]",
                      ],
                    ].map(([label, value, color]) => (
                      <div className="flex justify-between text-sm" key={label}>
                        <span
                          className={dark ? "text-white" : "text-[#0f172a]"}
                        >
                          {label}
                        </span>
                        <span className={cn("max-w-[12rem] text-right break-all", color)}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className={cn(
                    dark ? "bg-[#1a1a1a]" : "bg-[#e2e8f0]",
                    "min-w-0 p-6",
                  )}
                >
                  <div
                    className={cn(
                      "mb-4 flex items-center gap-2 font-pixel text-[10px] uppercase",
                      dark ? "text-[#69daff]" : "text-[#00677d]",
                    )}
                  >
                    SOCIAL_MATRIX <ShareIcon />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <SafeImage
                        alt="SYS_ADMIN"
                        className="h-8 w-8 rounded-full object-cover saturate-0"
                        height={32}
                        src={assets.friendAdmin}
                        width={32}
                      />
                      <span
                        className={cn(
                          "font-pixel text-[10px]",
                          dark ? "text-white" : "text-[#0f172a]",
                        )}
                      >
                        SYS_ADMIN
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <SafeImage
                        alt="NULL_POINTER"
                        className="h-8 w-[14px] rounded-full object-cover saturate-0"
                        height={32}
                        src={assets.friendPointer}
                        width={14}
                      />
                      <span
                        className={cn(
                          "font-pixel text-[10px]",
                          dark ? "text-white" : "text-[#0f172a]",
                        )}
                      >
                        NULL_POINTER
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  dark
                    ? "bg-[#1a1a1a] border-b-8 border-[#d575ff]"
                    : "bg-[#e2e8f0] border-b-8 border-[#9800d0]",
                  "min-w-0 p-6",
                )}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div
                    className={cn(
                      dark ? "bg-[#d575ff]" : "bg-[#9800d0]",
                      "flex h-4 w-[10px] items-center justify-center",
                    )}
                  >
                    <span
                      className={cn(
                        "size-2",
                        dark ? "bg-black" : "bg-[#e7edf1]",
                      )}
                    />
                  </div>
                  <div
                    className={cn(
                      "font-pixel text-xs uppercase leading-4",
                      dark ? "text-[#d575ff]" : "text-[#9800d0]",
                    )}
                  >
                    AI_PULSE:
                    <br />
                    ACTIVE
                  </div>
                </div>
                <div
                  className={cn(
                    "min-w-0 break-all font-pixel text-[10px] uppercase leading-5",
                    dark ? "text-[#767575]" : "text-[#484847]",
                  )}
                  >
                    CURRENT_STATUS:
                    <br />
                  {statusLabel}_SESSION_VERIFIED
                  <br />
                  AUTH_EMAIL:
                  <br />
                  {emailAddress}
                  <br />
                  PROFILE_ID:
                  <br />
                  {shortUserId}
                  <br />
                  TIER:
                  <br />
                  {subscriptionTier}
                </div>
                <div
                  className={cn(
                    dark
                      ? "border-2 border-[#262626]"
                      : "border-2 border-[#f1f5f9]",
                    "mt-6",
                  )}
                >
                  <SafeImage
                    alt="Processing Visualization"
                    className="h-32 w-full object-cover saturate-0"
                    height={128}
                    src={assets.processingVisualization}
                    width={176}
                  />
                </div>
                <div className="mt-6">
                  <PixelButton className="w-full" theme={theme} tone="purple">
                    RUN_DIAGNOSTICS
                  </PixelButton>
                </div>
                <div className="mt-3">
                  <PixelButton
                    className="w-full"
                    disabled={logoutMutation.isPending}
                    hollow
                    onClick={() => logoutMutation.mutate()}
                    theme={theme}
                    tone="cyan"
                  >
                    {logoutMutation.isPending ? "LOGGING_OUT..." : "LOG_OUT"}
                  </PixelButton>
                </div>
                <div className="mt-6 space-y-3">
                  <div
                    className={cn(
                      "font-pixel text-[10px] uppercase tracking-[1.2px]",
                      dark ? "text-[#69daff]" : "text-[#00677d]",
                    )}
                  >
                    UPDATE_SUBSCRIPTION
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {subscriptionOptions.map((option) => {
                      const isCurrent =
                        user?.subscription_tier?.toLowerCase() === option.value;

                      return (
                        <PixelButton
                          className="w-full"
                          disabled={updateSubscriptionMutation.isPending || isCurrent}
                          hollow={!isCurrent}
                          key={option.value}
                          onClick={() =>
                            updateSubscriptionMutation.mutate({
                              new_tier: option.value,
                            })
                          }
                          theme={theme}
                          tone={isCurrent ? "brand" : "cyan"}
                        >
                          {updateSubscriptionMutation.isPending && isCurrent
                            ? "UPDATING..."
                            : option.label}
                        </PixelButton>
                      );
                    })}
                  </div>
                  <div
                    className={cn(
                      "min-h-5 text-xs",
                      updateSubscriptionMutation.isError
                        ? dark
                          ? "text-[#d575ff]"
                          : "text-[#9800d0]"
                        : dark
                          ? "text-[#767575]"
                          : "text-[#475569]",
                    )}
                  >
                    {updateSubscriptionMutation.isError
                      ? updateSubscriptionMutation.error.message
                      : "Click a tier button to call /api/v1/users/subscription and sync the profile UI."}
                  </div>
                  {logoutMutation.isError ? (
                    <div
                      className={cn(
                        "text-xs",
                        dark ? "text-[#d575ff]" : "text-[#9800d0]",
                      )}
                    >
                      {logoutMutation.error.message}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        </main>
      }
      rightRail={<ProfileLogRail theme={theme} />}
      sidebar={
        <Sidebar
          active="profile"
          footer={
            <SidebarFooterUser
              compact
              src={assets.sidebarAvatar}
              subtitle={emailAddress}
              subtitleTone="cyan"
              theme={theme}
              title={profileAlias}
            />
          }
          subtitle={`TIER: ${subscriptionTier}`}
          subtitleClassName={
            dark
              ? "font-pixel text-[10px] leading-[15px] text-[#d575ff]"
              : "font-pixel text-[10px] leading-[15px] text-[#9800d0]"
          }
          subtitleFont="pixel"
          theme={theme}
        />
      }
      theme={theme}
    />
  );
}

export function QuizScreen() {
  const theme: CyberTheme = "dark";

  return (
    <Frame
      header={
        <HeaderBar theme={theme}>
          <HeaderTitle theme={theme} title="LEARNING_TERMINAL" />
          <div />
        </HeaderBar>
      }
      main={
        <main className="cyber-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#0e0e0e]">
          <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-10 p-12">
            <div>
              <div className="font-display text-xs font-bold uppercase tracking-[2px] text-[#69daff]">
                SESSION_PROGRESS: UNIT_04 // QUANTUM_MECHANICS
              </div>
              <div className="mt-3 max-w-[640px]">
                <ProgressSegments
                  activeTone="cyan"
                  size="md"
                  theme={theme}
                  total={9}
                  value={7}
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="border border-[#262626] bg-[#131313] p-8">
                <div className="mb-4 font-display text-base font-bold uppercase text-[#9cff93]">
                  QUESTION_MODULE_04_A
                </div>
                <h1 className="max-w-[820px] font-display text-5xl font-bold leading-tight text-white">
                  Which principle states that it is impossible to know both the
                  position and momentum of a particle with absolute precision?
                </h1>
              </div>
              <div className="grid gap-5 xl:grid-cols-2">
                {[
                  "The Pauli Exclusion Principle",
                  "Heisenberg Uncertainty Principle",
                  "Schrodinger Wave Equation",
                  "Quantum Entanglement",
                ].map((choice, index) => (
                  <div
                    className="bg-[#262626] px-5 py-6 text-2xl text-white"
                    key={choice}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <span>{choice}</span>
                      <span className="font-display text-[10px] uppercase text-[#575757]">
                        OPTION_0{index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border border-[#262626] bg-[#131313] p-8">
                <div className="mb-4 font-display text-base font-bold uppercase text-[#d575ff]">
                  FILL_BLANK_MODULE_04_B
                </div>
                <h2 className="max-w-[820px] font-display text-5xl font-bold leading-tight text-white">
                  The wave-particle duality suggests that light can exhibit
                  properties of both waves and _____.
                </h2>
                <div className="mt-8 h-1 w-40 bg-[#d575ff]" />
              </div>
              <div className="space-y-5">
                <div className="bg-[#262626] p-5">
                  <div className="font-display text-xs uppercase text-[#575757]">
                    INPUT_TERMINAL
                  </div>
                  <textarea
                    className="mt-4 min-h-[72px] w-full resize-none bg-transparent font-display text-[28px] leading-tight text-white placeholder:text-[#575757] focus:outline-none"
                    placeholder="TYPE YOUR ANSWER HERE..."
                    rows={2}
                  />
                  <div className="mt-6 h-2 bg-[#9cff93] shadow-[0px_0px_12px_0px_rgba(156,255,147,0.55)]" />
                </div>
                <div className="flex gap-4">
                  <PixelButton className="w-full" theme={theme}>
                    SUBMIT_RESPONSE
                  </PixelButton>
                  <div className="bg-[#262626] px-8 py-4 font-display text-sm font-bold uppercase text-white">
                    SKIP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      }
      rightRail={
        <AssistantRail
          footer={
            <div className="space-y-4">
              <div className="bg-[#262626] px-5 py-4 font-display text-sm uppercase text-[#9cff93]">
                CHAT
              </div>
              <PixelButton className="w-full" theme={theme} tone="purple">
                NEW_QUERY
              </PixelButton>
            </div>
          }
          middleCards={
            <>
              <MessageCard
                body={
                  <>
                    Need a logic boost? This principle was formulated in 1927
                    and is central to quantum mechanics. It relates to the
                    fundamental limit of precision.
                  </>
                }
                label="HINT AVAILABLE"
                theme={theme}
                tone="purple"
              />
              <MessageCard
                body={
                  <>
                    Analyze the question context:
                    <br />
                    position and momentum constraints.
                  </>
                }
                theme={theme}
              />
              <PixelButton className="w-full" theme={theme} tone="purple">
                Tell me more about the Heisenberg Principle.
              </PixelButton>
            </>
          }
          subtitle="ONLINE / PROCESSING"
          theme={theme}
          title="AI_ASSISTANT"
        />
      }
      sidebar={
        <Sidebar
          active="learn"
          footer={
            <SidebarFooterUser
              compact
              src={figmaAssets.darkHome.userAvatar}
              subtitle="LEVEL 12 / ARCHITECT"
              subtitleTone="muted"
              theme="dark"
              title="SYSTEM_USR"
            />
          }
          subtitle="RANK: NOVICE"
          subtitleClassName="font-display text-[12px] tracking-[1.2px] text-[#6b7280]"
          theme="dark"
        />
      }
      theme="dark"
    />
  );
}

function HomeIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <path
        d="M3 9.5L10 4l7 5.5V17h-4.5v-4H7.5v4H3V9.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function LearnIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 20">
      <path
        d="M2 7l10-5 10 5-10 5L2 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M6 10.5v4.2c0 .8 2.7 2.3 6 2.3s6-1.5 6-2.3v-4.2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function PracticeIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <path
        d="M5 5l10 10M11.5 3.5l5 5-3 3-5-5 3-3ZM3.5 11.5l5 5-3 3-5-5 3-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <path d="M4 4h12v12H4z" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M6.5 7.5h7M6.5 10h7M6.5 12.5h4.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <circle cx="10" cy="7" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4 17c0-3.2 2.8-5.5 6-5.5s6 2.3 6 5.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <path
        d="M10 3.5l1.4 1.8 2.2-.1.5 2.1 1.9 1.1-1 2 1 2-1.9 1.1-.5 2.1-2.2-.1L10 16.5l-1.4-1.8-2.2.1-.5-2.1-1.9-1.1 1-2-1-2 1.9-1.1.5-2.1 2.2.1L10 3.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <path
        d="M11.5 2.5c.4 2-1.5 2.9-1.5 4.7 0 .8.4 1.6 1.2 2.2.4-.5.8-1.2.8-1.9 1.6 1.1 3 2.8 3 5.1A5 5 0 0 1 5 12c0-2.2 1.3-4 3-5.2 0 1 .4 1.7.8 2.1.8-.5 1.2-1.3 1.2-2.2 0-1.2-.9-2-1.4-2.7.9-.4 2.2-.7 2.9-1.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <path
        d="M6 3h8v2.5c0 2.2-1.8 4-4 4s-4-1.8-4-4V3Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M7 15h6M8 12.5h4M5 4H3v1.5A2.5 2.5 0 0 0 5.5 8M15 4h2v1.5A2.5 2.5 0 0 1 14.5 8"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg fill="none" viewBox="0 0 28 24">
      <path
        d="M4 5l4 4-4 4M11 17h9"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="2.5"
      />
      <rect
        height="20"
        rx="1"
        stroke="currentColor"
        strokeWidth="2"
        width="24"
        x="2"
        y="2"
      />
    </svg>
  );
}

function TerminalFrameIcon() {
  return (
    <svg fill="none" viewBox="0 0 100 80">
      <rect
        height="72"
        rx="2"
        stroke="currentColor"
        strokeWidth="6"
        width="88"
        x="6"
        y="4"
      />
      <path
        d="M28 28l12 12-12 12M50 52h18"
        stroke="currentColor"
        strokeWidth="6"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <path d="M4 10h11M10 4l6 6-6 6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <path
        d="M16 10H5M10 4l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function BotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 28 28">
      <rect
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        width="18"
        x="5"
        y="8"
      />
      <path
        d="M14 4v4M9 13h2M17 13h2M8 22v3M20 22v3M3 14h2M23 14h2"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <circle
        cx="8.5"
        cy="8.5"
        r="4.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M12 12l4.5 4.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 18">
      <path
        d="M2 4h6l2 2h8v8.5A1.5 1.5 0 0 1 16.5 16h-13A1.5 1.5 0 0 1 2 14.5V4Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg fill="none" viewBox="0 0 18 20">
      <path d="M4 2h6l4 4v12H4z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2v4h4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <circle cx="5" cy="10" r="2" fill="currentColor" />
      <circle cx="15" cy="5" r="2" fill="currentColor" />
      <circle cx="15" cy="15" r="2" fill="currentColor" />
      <path
        d="M6.7 9.1 13 6M6.7 10.9 13 14"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 16">
      <path
        d="M1 8s4-6 11-6 11 6 11 6-4 6-11 6S1 8 1 8Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <path d="m4 10 4 4 8-9" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <path
        d="M7 6 3 10l4 4M13 6l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg fill="none" viewBox="0 0 18 20">
      <path d="M10 1 4 11h4l-1 8 7-11h-4l.5-7Z" fill="currentColor" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <path
        d="m10 3 7 4-7 4-7-4 7-4ZM3 11l7 4 7-4M3 7l7 4 7-4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg fill="none" viewBox="0 0 18 20">
      <rect
        height="9"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.6"
        width="12"
        x="3"
        y="9"
      />
      <path
        d="M6 9V6a3 3 0 1 1 6 0v3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg fill="none" viewBox="0 0 22 18">
      <ellipse
        cx="11"
        cy="4"
        rx="8"
        ry="3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3 4v10c0 1.7 3.6 3 8 3s8-1.3 8-3V4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3 9c0 1.7 3.6 3 8 3s8-1.3 8-3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg fill="none" viewBox="0 0 18 20">
      <path
        d="M9 2 3 4.5v5c0 4.1 2.6 6.9 6 8.5 3.4-1.6 6-4.4 6-8.5v-5L9 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg fill="none" viewBox="0 0 22 18">
      <path
        d="M3 3.5h7a3 3 0 0 1 3 3V15H6a3 3 0 0 0-3 3V3.5ZM19 3.5h-7a3 3 0 0 0-3 3V15h7a3 3 0 0 1 3 3V3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg fill="none" viewBox="0 0 14 14">
      <path d="M2 2l10 10M12 2 2 12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <path
        d="M10 2 7.5 7.5 2 10l5.5 2.5L10 18l2.5-5.5L18 10l-5.5-2.5L10 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function BotStatusIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <path d="M4 6h12v8H4z" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10 2v4M7 10h2M11 10h2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}
