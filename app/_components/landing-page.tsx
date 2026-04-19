"use client";

import Link from "next/link";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useSessionQuery } from "@/hooks/use-auth";

gsap.registerPlugin(ScrollTrigger);

const problemCards = [
  {
    index: "01",
    title: "Passive Learning",
    description: "Watching videos without real practice leads to low retention.",
  },
  {
    index: "02",
    title: "Fragmented Tools",
    description: "Notes, coding, and AI tools are separated across tabs.",
  },
  {
    index: "03",
    title: "AI Overdependence",
    description: "AI gives full answers instantly, preventing deep understanding.",
  },
  {
    index: "04",
    title: "Practice Friction",
    description: "Difficult setup for local coding environments kills momentum.",
  },
  {
    index: "05",
    title: "Gamification Illusion",
    description: "Platforms focus on streaks instead of actual skill mastery.",
  },
];

const solutionPoints = [
  "AI companion with reduced answers",
  "Integrated coding playground",
  "Knowledge graph insights",
  "Dynamic path lessons",
  "Spaced repetition built into the flow",
];

const featureCards = [
  {
    title: "AI Companion",
    description:
      "Guides thinking with hints, Socratic prompts, and challenge scaffolds instead of instant solutions.",
    wide: true,
  },
  {
    title: "Smart Flashcards",
    description: "Spaced repetition stays tied to the exact concepts you practice.",
  },
  {
    title: "Gamified Learning",
    description: "Earn XP, maintain streaks, and climb leagues through technical mastery.",
  },
  {
    title: "Dynamic Lessons",
    description: "AI generates custom exercises in real-time based on your specific weaknesses.",
  },
  {
    title: "Knowledge Graph",
    description:
      "Explore a visual map of concepts to see how your learning connects together.",
  },
];

const techColumns = [
  {
    label: "Frontend",
    items: ["Next.js", "Tailwind CSS", "Monaco Editor"],
  },
  {
    label: "Backend",
    items: ["FastAPI", "LangChain", "Celery"],
  },
  {
    label: "AI & Logic",
    items: ["Gemini", "Graph RAG", "LangGraph"],
  },
  {
    label: "Database",
    items: ["PostgreSQL / Neo4j", "Milvus / Redis"],
  },
  {
    label: "Execution",
    items: ["Judge0", "Docker Sandbox"],
  },
];

const audiences = [
  {
    title: "Students",
    description: "Build deeper intuition without bouncing between tools or tabs.",
  },
  {
    title: "Developers",
    description: "Practice fast, map weak spots, and close gaps with adaptive guidance.",
  },
  {
    title: "AI Learners",
    description: "Use AI as a mentor that sharpens thinking instead of replacing it.",
  },
];

const gains = [
  {
    title: "Deep Understanding",
    description: "Not just memorization, but true conceptual mastery.",
  },
  {
    title: "Faster Practice",
    description: "Get straight to the work without environment setup pain.",
  },
  {
    title: "Better Retention",
    description: "Built-in spaced repetition keeps concepts fresh.",
  },
  {
    title: "Personalized Path",
    description: "Every lesson adapts to your current skill level.",
  },
];

const pricingPlans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    subtitle: "For curious learners getting started.",
    features: ["Starter lessons", "Basic flashcards"],
    cta: "Start Free",
    featured: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9.99",
    subtitle: "per month",
    features: ["Unlimited AI guidance", "Dynamic exercises", "Knowledge graph access"],
    cta: "Go Pro",
    featured: true,
    badge: "Most Popular",
  },
  {
    id: "developer",
    name: "Developer",
    price: "$29.99",
    subtitle: "per month",
    features: ["Sandboxed code execution", "Advanced projects", "Priority support"],
    cta: "Join Developer",
    featured: false,
  },
];

const heroMarks = [
  {
    className: "left-[-6%] top-[16%] rotate-[-9deg]",
    label: "~ / a1",
  },
  {
    className: "right-[-4%] top-[12%] rotate-[11deg]",
    label: "xi //",
  },
  {
    className: "left-[8%] bottom-[18%] rotate-[7deg]",
    label: "r_02",
  },
  {
    className: "right-[10%] bottom-[14%] rotate-[-12deg]",
    label: "// flux",
  },
];

function SectionHeading({
  align = "left",
  eyebrow,
  title,
}: {
  align?: "left" | "center";
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className={align === "center" ? "text-center" : ""} data-reveal="heading">
      {eyebrow ? (
        <div className="mb-4 font-display text-xs font-semibold uppercase tracking-[0.35em] text-[#7c8b99]">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="font-display text-[clamp(2rem,4vw,2.5rem)] font-bold uppercase tracking-[-0.05em] text-white">
        {title}
      </h2>
      <div
        className={`mt-4 h-1 w-24 bg-[#9cff93] ${align === "center" ? "mx-auto" : ""}`}
      />
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7c8b99] transition-colors hover:text-[#9cff93]"
    >
      {children}
    </a>
  );
}

function SignalButton({
  href,
  children,
  hollow = false,
  size = "hero",
  fullWidth = false,
}: {
  href: string;
  children: ReactNode;
  hollow?: boolean;
  size?: "nav" | "hero" | "pricing";
  fullWidth?: boolean;
}) {
  const sizeClassName =
    size === "nav"
      ? "h-8 px-6 text-[10px] tracking-[0.24em]"
      : size === "pricing"
        ? "h-10 w-full px-6 text-[10px] tracking-[0.24em]"
        : "h-[68px] px-10 text-sm tracking-[0.28em]";

  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center justify-center font-display font-bold uppercase transition-transform duration-200 hover:-translate-y-0.5 ${
        fullWidth ? "w-full" : size === "hero" ? "min-w-[169px]" : ""
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 translate-x-0 translate-y-0 border transition-transform duration-200 group-hover:translate-x-[6px] group-hover:translate-y-[6px] ${
          hollow
            ? "border-[#f4f6f1] bg-[#f4f6f1]"
            : "border-[#1b5b10] bg-[#1b5b10]"
        }`}
      />
      <span
        className={`relative z-[1] inline-flex items-center justify-center border font-display font-bold uppercase transition-colors duration-200 ${
          hollow
            ? "border-[#f4f6f1] bg-[#05070a] text-[#f4f6f1] group-hover:bg-[#0b0d10] group-hover:text-white"
            : "border-[#9df879] bg-[#9df879] text-[#1f6412] group-hover:bg-[#adff8d]"
        } ${sizeClassName} ${fullWidth ? "w-full" : ""}`}
      >
        {children}
      </span>
    </Link>
  );
}

function MicroIcon() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#29422b] bg-[#101812] text-[10px] text-[#9cff93]">
      +
    </span>
  );
}

export function LandingPage() {
  const session = useSessionQuery();
  const isAuthenticated = Boolean(session.data);
  const navAuthHref = isAuthenticated ? "/dashboard" : "/auth/login";
  const navAuthLabel = isAuthenticated ? "Dashboard" : "Sign In";
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const heroLensRef = useRef<HTMLDivElement>(null);
  const heroPointerFrameRef = useRef<number | null>(null);
  const heroLensCurrentRef = useRef({ x: 50, y: 50, opacity: 1 });
  const heroLensTargetRef = useRef({ x: 50, y: 50, opacity: 1 });

  const syncHeroInteractiveEffects = useCallback(function syncHeroInteractiveEffects() {
    const lens = heroLensRef.current;

    if (!lens) {
      heroPointerFrameRef.current = null;
      return;
    }

    const lensCurrent = heroLensCurrentRef.current;
    const lensTarget = heroLensTargetRef.current;

    lensCurrent.x += (lensTarget.x - lensCurrent.x) * 0.18;
    lensCurrent.y += (lensTarget.y - lensCurrent.y) * 0.18;
    lensCurrent.opacity += (lensTarget.opacity - lensCurrent.opacity) * 0.18;

    lens.style.setProperty("--lens-x", `${lensCurrent.x}%`);
    lens.style.setProperty("--lens-y", `${lensCurrent.y}%`);
    lens.style.setProperty("--lens-opacity", `${lensCurrent.opacity}`);

    const lensDelta =
      Math.abs(lensTarget.x - lensCurrent.x) +
      Math.abs(lensTarget.y - lensCurrent.y) +
      Math.abs(lensTarget.opacity - lensCurrent.opacity);

    if (lensDelta < 0.08) {
      heroPointerFrameRef.current = null;
      return;
    }

    heroPointerFrameRef.current = window.requestAnimationFrame(syncHeroInteractiveEffects);
  }, []);

  const ensureHeroInteractiveLoop = useCallback(() => {
    if (heroPointerFrameRef.current !== null) {
      return;
    }

    heroPointerFrameRef.current = window.requestAnimationFrame(syncHeroInteractiveEffects);
  }, [syncHeroInteractiveEffects]);

  const resetHeroLens = useCallback(() => {
    heroLensTargetRef.current = { x: 50, y: 50, opacity: 1 };
    ensureHeroInteractiveLoop();
  }, [ensureHeroInteractiveLoop]);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      resetHeroLens();
      ensureHeroInteractiveLoop();

      if (progressRef.current) {
        gsap.set(progressRef.current, {
          scaleX: 0,
          transformOrigin: "left center",
        });

        ScrollTrigger.create({
          end: "bottom bottom",
          onUpdate: (self) => {
            gsap.to(progressRef.current, {
              duration: 0.18,
              overwrite: true,
              scaleX: self.progress,
            });
          },
          start: "top top",
          trigger: document.documentElement,
        });
      }

      if (prefersReducedMotion) {
        return;
      }

      gsap.from("[data-hero-badge]", {
        delay: 0.15,
        duration: 0.8,
        opacity: 0,
        y: 28,
      });

      gsap.from("[data-hero-line]", {
        duration: 1.1,
        ease: "power3.out",
        opacity: 0,
        stagger: 0.12,
        yPercent: 120,
      });

      gsap.from("[data-hero-copy]", {
        delay: 0.35,
        duration: 0.9,
        opacity: 0,
        y: 32,
      });

      gsap.from("[data-hero-actions]", {
        delay: 0.55,
        duration: 0.8,
        opacity: 0,
        y: 30,
      });

      gsap.to("[data-float-shape]", {
        duration: 5.5,
        ease: "sine.inOut",
        repeat: -1,
        stagger: 0.35,
        y: (_, target) =>
          target instanceof HTMLElement && target.dataset.float === "large"
            ? -18
            : -10,
        yoyo: true,
      });

      gsap.to("[data-hero-glow]", {
        duration: 7,
        ease: "sine.inOut",
        opacity: 0.85,
        repeat: -1,
        scale: 1.08,
        yoyo: true,
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          duration: 0.62,
          ease: "power2.out",
          opacity: 0,
          scrollTrigger: {
            once: true,
            start: "top 90%",
            trigger: element,
          },
          y: 24,
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-card]").forEach((element, index) => {
        gsap.from(element, {
          delay: Math.min(index * 0.03, 0.18),
          duration: 0.64,
          ease: "power2.out",
          opacity: 0,
          scrollTrigger: {
            once: true,
            start: "top 91%",
            trigger: element,
          },
          y: 28,
        });
      });

      gsap.to("[data-cube]", {
        duration: 6.8,
        ease: "sine.inOut",
        repeat: -1,
        rotate: 6,
        y: -8,
        yoyo: true,
      });

      gsap.to("[data-hero-shell]", {
        ease: "none",
        opacity: 0.72,
        scale: 0.97,
        scrollTrigger: {
          end: "bottom top",
          scrub: 0.35,
          start: "top top",
          trigger: "[data-hero-shell]",
        },
        yPercent: 5,
      });

      gsap.utils.toArray<HTMLElement>("[data-feature-card]").forEach((element, index) => {
        gsap.fromTo(
          element,
          {
            opacity: 0,
            y: 22 + index * 4,
          },
          {
            duration: 0.66,
            ease: "power2.out",
            opacity: 1,
            scrollTrigger: {
              once: true,
              start: "top 92%",
              trigger: element,
            },
            y: 0,
          },
        );
      });
    }, root);

    ScrollTrigger.refresh();

    return () => {
      if (heroPointerFrameRef.current !== null) {
        window.cancelAnimationFrame(heroPointerFrameRef.current);
      }

      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [ensureHeroInteractiveLoop, resetHeroLens]);

  const updateHeroLens = useCallback((clientX: number, clientY: number) => {
    const element = heroLensRef.current;

    if (!element) {
      return;
    }

    const bounds = element.getBoundingClientRect();
    const x = ((clientX - bounds.left) / bounds.width) * 100;
    const y = ((clientY - bounds.top) / bounds.height) * 100;
    heroLensTargetRef.current = {
      opacity: 1,
      x: Math.min(Math.max(x, 8), 92),
      y: Math.min(Math.max(y, 4), 96),
    };
    ensureHeroInteractiveLoop();
  }, [ensureHeroInteractiveLoop]);

  return (
    <div ref={rootRef} className="bg-[#05070a] text-white">
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-[60] h-[2px] bg-white/5">
        <div ref={progressRef} className="h-full bg-[#9cff93]" />
      </div>
      <main className="min-h-screen bg-[#05070a] pt-[65px] text-white">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#05070a]/72 backdrop-blur-xl">
        <div className="mx-auto flex h-[65px] w-full max-w-[1280px] items-center justify-between px-6">
          <Link
            href="/"
            className="font-display text-lg font-bold uppercase tracking-[-0.06em] text-[#9cff93]"
          >
            Learnbro
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <NavLink href="#features">Core Features</NavLink>
            <NavLink href="#solution">Knowledge Graph</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </nav>
            <SignalButton href={navAuthHref} size="nav">
              {navAuthLabel}
            </SignalButton>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#080b0d_0%,#05070a_100%)]" />
        <div
          className="absolute inset-0 opacity-80"
          data-hero-glow
          style={{
            background:
              "radial-gradient(circle at 50% 35%, rgba(156,255,147,0.18), transparent 22%), radial-gradient(circle at 18% 20%, rgba(105,218,255,0.14), transparent 16%), radial-gradient(circle at 78% 18%, rgba(255,255,255,0.06), transparent 14%)",
          }}
        />
        <div
          className="pointer-events-none absolute left-10 top-48 h-24 w-24 border border-[#213026]"
          data-float="small"
          data-float-shape
        />
        <div
          className="pointer-events-none absolute right-12 top-[38rem] h-36 w-36 rotate-45 border border-[#243728]"
          data-float="large"
          data-float-shape
        >
          <div className="absolute inset-10 border border-[#9cff93]/40" />
        </div>
        <div
          className="pointer-events-none absolute left-[12%] top-[18%] h-56 w-56 rounded-full bg-[#9cff93]/[0.05] blur-3xl"
          data-distance="140"
          data-parallax
        />
        <div
          className="pointer-events-none absolute right-[6%] top-[52%] h-64 w-64 rounded-full bg-[#69daff]/[0.07] blur-3xl"
          data-distance="170"
          data-parallax
        />
        <div
          className="relative mx-auto flex min-h-[calc(100svh-65px)] max-w-[1280px] flex-col px-6 pt-24"
          data-hero-shell
        >
          <div className="mx-auto flex max-w-[1080px] flex-1 flex-col items-center justify-center text-center">
            <div
              className="mb-10 border border-[#293829] bg-[#0f1712]/80 px-4 py-2 font-display text-[11px] uppercase tracking-[0.28em] text-[#a7b7ab]"
              data-hero-badge
            >
              AI-guided technical mastery for serious learners
            </div>
            <div className="relative">
              {heroMarks.map((mark) => (
                <span
                  aria-hidden="true"
                  className={`landing-signature-mark pointer-events-none absolute hidden lg:block ${mark.className}`}
                  key={mark.label}
                >
                  {mark.label}
                </span>
              ))}
              <div
                ref={heroLensRef}
                className="landing-title-lens relative mx-auto w-fit"
                onPointerEnter={(event) =>
                  updateHeroLens(event.clientX, event.clientY)
                }
                onPointerLeave={resetHeroLens}
                onPointerMove={(event) =>
                  updateHeroLens(event.clientX, event.clientY)
                }
              >
                <h1 className="flex flex-col items-center gap-[0.04em] font-display text-[clamp(5.15rem,13vw,10.75rem)] font-bold uppercase leading-[0.94] tracking-[-0.08em]">
                  <span className="landing-title-row">
                    <span
                      className="landing-title-base whitespace-nowrap text-white"
                      data-hero-line
                    >
                      Learn Smarter
                    </span>
                  </span>
                  <span className="landing-title-row">
                    <span
                      className="landing-title-base whitespace-nowrap text-[#9cff93]"
                      data-hero-line
                    >
                      Not Harder
                    </span>
                  </span>
                </h1>
                <div aria-hidden="true" className="landing-title-focus absolute inset-0">
                  <div className="landing-title-soft-inner font-display text-[clamp(5.15rem,13vw,10.75rem)] font-bold uppercase leading-[0.94] tracking-[-0.08em]">
                    <span className="landing-title-row">
                      <span className="whitespace-nowrap text-white">Learn Smarter</span>
                    </span>
                    <span className="landing-title-row">
                      <span className="whitespace-nowrap text-[#9cff93]">Not Harder</span>
                    </span>
                  </div>
                  <div className="landing-title-focus-inner font-display text-[clamp(5.15rem,13vw,10.75rem)] font-bold uppercase leading-[0.94] tracking-[-0.08em]">
                    <span className="landing-title-row">
                      <span className="whitespace-nowrap text-white">Learn Smarter</span>
                    </span>
                    <span className="landing-title-row">
                      <span className="whitespace-nowrap text-[#9cff93]">Not Harder</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p
              className="mt-8 max-w-[616px] text-base leading-7 text-[#8b98a5]"
              data-hero-copy
            >
              A cyber learning platform that merges guided AI, integrated coding,
              knowledge mapping, and retention loops into one continuous flow.
            </p>
            <div
              className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
              data-hero-actions
            >
              <SignalButton href="/auth/register" size="hero">
                Get Started
              </SignalButton>
              <SignalButton href="/dashboard" hollow size="hero">
                Try Demo
              </SignalButton>
            </div>
          </div>
          <div className="relative mt-auto h-[42px] overflow-hidden border-t border-[#1a231c] bg-[#070a08]">
            <div className="landing-ticker flex min-w-max items-center gap-12 whitespace-nowrap py-3 font-display text-[11px] uppercase tracking-[0.3em] text-[#627169]">
              <span>AI guidance that sharpens understanding</span>
              <span>Integrated coding practice without setup friction</span>
              <span>Knowledge graph visibility across every lesson</span>
              <span>AI guidance that sharpens understanding</span>
              <span>Integrated coding practice without setup friction</span>
              <span>Knowledge graph visibility across every lesson</span>
            </div>
          </div>
        </div>
      </section>

      <section className="scroll-mt-28 border-b border-white/5 py-32">
        <div className="mx-auto max-w-[1280px] px-6">
          <SectionHeading title="Why Current Learning Platforms Fail" />
          <div className="mt-20 grid gap-4 lg:grid-cols-5">
            {problemCards.map((card) => (
              <article
                className="border border-[#1f2a21] bg-[#0c1110] p-7 transition-all duration-300 hover:border-[#325235] hover:bg-[#101513]"
                data-card
                key={card.index}
              >
                <div className="font-display text-sm font-bold uppercase tracking-[0.25em] text-[#9cff93]">
                  {card.index}
                </div>
                <h3 className="mt-6 font-display text-[1.75rem] font-bold leading-none tracking-[-0.06em] text-white">
                  {card.title}
                </h3>
                <p className="mt-5 text-sm leading-6 text-[#85929f]">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="scroll-mt-28 border-b border-white/5 py-32" id="solution">
        <div className="mx-auto grid max-w-[1280px] gap-16 px-6 lg:grid-cols-[1fr_589px] lg:items-center">
          <div>
            <SectionHeading title="Our Solution" />
            <p className="mt-8 max-w-[580px] text-lg leading-8 text-[#8b98a5]" data-reveal>
              We combine gamification with real technical depth to create an
              interactive and personalized learning journey.
            </p>
            <ul className="mt-10 space-y-4">
              {solutionPoints.map((point) => (
                <li
                  className="flex items-center gap-4 text-sm text-[#d3dae0]"
                  data-reveal
                  key={point}
                >
                  <MicroIcon />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="relative border border-[#2a3628] bg-[#0f1512] p-5"
            data-card
            data-cube-wrap
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(156,255,147,0.14),transparent_60%)]" />
            <div className="relative mx-auto aspect-[579/321] w-full overflow-hidden border border-[#243726] bg-[linear-gradient(180deg,#151c18_0%,#0a0f0d_100%)]">
              <div
                className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rotate-[18deg] border border-[#3a5139] bg-[linear-gradient(145deg,rgba(156,255,147,0.16),rgba(156,255,147,0.03))] shadow-[0_0_50px_rgba(156,255,147,0.16)]"
                data-cube
              />
              <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-[54%] -translate-y-[54%] rotate-[18deg] border border-[#577055] bg-transparent" />
              <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-[46%] -translate-y-[62%] rotate-[18deg] border border-[#4b6349] bg-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-28 border-b border-white/5 py-32"
        data-feature-stage
        id="features"
      >
        <div className="mx-auto max-w-[1280px] px-6">
          <SectionHeading align="center" title="Core Features" />
          <div className="mt-20 grid gap-4 lg:grid-cols-3" data-feature-grid>
            {featureCards.map((card) => (
              <article
                className={`border border-[#202a21] bg-[#0c1010] p-8 transition-all duration-300 hover:border-[#355537] hover:bg-[#101513] ${
                  card.wide ? "lg:col-span-2 lg:min-h-[296px]" : "lg:min-h-[296px]"
                }`}
                data-card
                data-feature-card
                key={card.title}
              >
                <div className="h-10 w-10 border border-[#2a442d] bg-[#101712]" />
                <h3
                  className={`mt-8 font-display font-bold uppercase tracking-[-0.05em] text-white ${
                    card.wide ? "text-[2rem]" : "text-[1.6rem]"
                  }`}
                >
                  {card.title}
                </h3>
                <p
                  className={`mt-5 max-w-[460px] text-sm leading-7 text-[#8b98a5] ${
                    card.wide ? "lg:text-base" : ""
                  }`}
                >
                  {card.description}
                </p>
                {card.wide ? (
                  <div className="mt-12 grid grid-cols-3 gap-4">
                    {["Adaptive hints", "Reduced answers", "Concept reinforcement"].map(
                      (label) => (
                        <div
                          className="h-1 bg-[#9cff93]"
                          key={label}
                          title={label}
                        />
                      ),
                    )}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 py-28">
        <div className="mx-auto max-w-[1280px] px-6">
          <SectionHeading align="center" title="Technology Stack" />
          <div className="mt-14 grid gap-10 md:grid-cols-3 xl:grid-cols-5">
            {techColumns.map((column) => (
              <div data-card key={column.label}>
                <div className="font-display text-[11px] font-semibold uppercase tracking-[0.32em] text-[#7c8b99]">
                  {column.label}
                </div>
                <ul className="mt-6 space-y-3 text-base text-[#d5dbe0]">
                  {column.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 py-32">
        <div className="mx-auto grid max-w-[1280px] gap-16 px-6 lg:grid-cols-2">
          <div>
            <SectionHeading title="Who Is This For?" />
            <div className="mt-12 space-y-6">
              {audiences.map((item) => (
                <article
                  className="border border-[#202a21] bg-[#0b0f10] px-6 py-7 transition-all duration-300 hover:border-[#355537] hover:bg-[#101513]"
                  data-card
                  key={item.title}
                >
                  <h3 className="font-display text-lg font-bold uppercase tracking-[-0.04em] text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#8b98a5]">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
          <div
            className="border border-[#355537] bg-[#0f1612] p-10 shadow-[0_0_0_1px_rgba(156,255,147,0.08)]"
            data-card
          >
            <SectionHeading title="What You Gain" />
            <div className="mt-12 grid gap-10 sm:grid-cols-2">
              {gains.map((gain) => (
                <div data-reveal key={gain.title}>
                  <h3 className="font-display text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9cff93]">
                    {gain.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-[#a7b7ab]">
                    {gain.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="scroll-mt-28 border-b border-white/5 py-32" id="pricing">
        <div className="mx-auto max-w-[1280px] px-6">
          <SectionHeading align="center" title="Pricing Plans" />
          <div className="mt-16 grid gap-8 xl:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article
                className={`border px-8 py-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.featured
                    ? "border-[#9cff93] bg-[#101612] shadow-[0_0_0_1px_rgba(156,255,147,0.18)]"
                    : "border-[#202a21] bg-[#0b0f10] hover:border-[#355537]"
                }`}
                data-card
                key={plan.name}
              >
                {plan.badge ? (
                  <div className="inline-flex border border-[#9cff93] px-3 py-1 font-display text-[10px] uppercase tracking-[0.25em] text-[#9cff93]">
                    {plan.badge}
                  </div>
                ) : null}
                <h3 className="mt-6 font-display text-[2rem] font-bold tracking-[-0.06em] text-white">
                  {plan.name}
                </h3>
                <div className="mt-8">
                  <div className="font-display text-[2.5rem] font-bold tracking-[-0.06em] text-[#9cff93]">
                    {plan.price}
                  </div>
                  <div className="mt-2 text-sm uppercase tracking-[0.2em] text-[#6c7b77]">
                    {plan.subtitle}
                  </div>
                </div>
                <ul className="mt-10 space-y-4 text-sm text-[#d3dae0]">
                  {plan.features.map((feature) => (
                    <li className="flex items-center gap-3" key={feature}>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#9cff93]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-12">
                        <SignalButton
                          href={`/checkout?plan=${plan.id}`}
                          hollow={!plan.featured}
                          size="pricing"
                          fullWidth
                        >
                          {plan.cta}
                        </SignalButton>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32">
        <div className="mx-auto max-w-[1280px] px-6">
          <div
            className="relative mx-auto max-w-[896px] border border-[#2f472f] bg-[#0d1210] px-10 py-20 text-center"
            data-card
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(156,255,147,0.14),transparent_55%)]" />
            <div className="absolute left-0 top-0 h-8 w-8 border-l border-t border-[#9cff93]" />
            <div className="absolute right-0 top-0 h-8 w-8 border-r border-t border-[#9cff93]" />
            <div className="absolute bottom-0 left-0 h-8 w-8 border-b border-l border-[#9cff93]" />
            <div className="absolute bottom-0 right-0 h-8 w-8 border-b border-r border-[#9cff93]" />
            <div className="relative">
              <h2
                className="font-display text-[clamp(2.5rem,5vw,4rem)] font-bold uppercase leading-[0.92] tracking-[-0.07em] text-white"
                data-reveal
              >
                Start Your <span className="text-[#9cff93]">Learning</span>
                <br />
                Journey Today
              </h2>
              <p
                className="mx-auto mt-8 max-w-[620px] text-base leading-7 text-[#8b98a5]"
                data-reveal
              >
                Join learners who want one environment for guided thinking,
                hands-on coding, and durable technical mastery.
              </p>
              <div
                className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
                data-reveal
              >
                <SignalButton href="/auth/register" size="hero">
                  Get Started
                </SignalButton>
                <SignalButton href="/dashboard" hollow size="hero">
                  Explore Dashboard
                </SignalButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 text-[11px] uppercase tracking-[0.24em] text-[#61706a] md:flex-row md:items-end md:justify-between">
          <div data-reveal>
            <div className="font-display text-base font-bold tracking-[-0.05em] text-[#9cff93]">
              AI Learn Nexus
            </div>
            <div className="mt-4">© 2024 AI Learn Nexus // Terminal_v1.0</div>
          </div>
          <div className="flex flex-wrap gap-6" data-reveal>
            <a href="#features" className="transition-colors hover:text-[#9cff93]">
              Features
            </a>
            <a href="#solution" className="transition-colors hover:text-[#9cff93]">
              Solution
            </a>
            <a href="#pricing" className="transition-colors hover:text-[#9cff93]">
              Pricing
            </a>
            <Link href={navAuthHref} className="transition-colors hover:text-[#9cff93]">
              {navAuthLabel}
            </Link>
          </div>
        </div>
      </footer>
      </main>
    </div>
  );
}
