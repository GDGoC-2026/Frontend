"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  startTransition,
  useEffect,
  useDeferredValue,
  useRef,
  useState,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditorNamespace } from "monaco-editor";
import { PixelButton } from "@/app/_components/ui-kit/pixel-button";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { cn, type CyberTheme } from "@/app/_components/ui-kit/shared";
import {
  useBackendCodeRecommendationMutation,
  useBackendCodingAttemptsQuery,
  useBackendCodingProblemQuery,
  useBackendCodingProblemSessionQuery,
  useBackendCreateFlashcardMutation,
  useBackendDueFlashcardsQuery,
  useBackendEvaluateQuizMutation,
  useBackendGenerateLessonCodingProblemsMutation,
  useBackendGenerateLessonMutation,
  useBackendGenerateQuizMutation,
  useBackendLessonCodingProblemsQuery,
  useBackendMyStatsQuery,
  useBackendProfileQuery,
  useBackendQuizAttemptsQuery,
  useBackendRunCodingProblemMutation,
  useBackendSavedLessonQuery,
  useBackendSavedLessonsQuery,
  useBackendSaveLessonMutation,
  useBackendStreamSubmitCodingProblemMutation,
  useBackendSubmitCodingProblemMutation,
  useBackendSubmitReviewMutation,
  useBackendUpdateSubscriptionMutation,
  useBackendUpdateLessonProgressMutation,
  useBackendUploadedDocumentsQuery,
  useBackendUpsertCodingProblemSessionMutation,
} from "@/hooks/use-backend-api";
import { useLogoutMutation, useSessionQuery } from "@/hooks/use-auth";
import type {
  FlashcardResponse,
  LessonGenerationResponse,
  LessonGeneratePayload,
  LessonPage,
  QuizEvaluationResponse,
  QuizQuestion,
  SubmitStreamCompletedEvent,
  SubmitStreamCaseEvent,
  SavedLessonDetail,
  SavedLessonSummary,
  UploadedDocumentItem,
} from "@/lib/api/frontend";

const REVIEW_SESSION_STORAGE_KEY = "versera.review-session";
const SELECTED_LESSON_STORAGE_KEY = "versera.selected-lesson-id";
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

type NavKey = "home" | "practice" | "interview" | "notes" | "profile";

type ActiveLesson = LessonGenerationResponse | SavedLessonDetail;

type ReviewSession = {
  completedPageIds?: string[];
  lessonTitle?: string | null;
  passingScore: number;
  quizId: string;
  questions: QuizQuestion[];
  sourceLessonId?: string | null;
  sourcePageId?: string | null;
  title: string;
  topic: string;
};

type LessonModule = {
  lessons: SavedLessonSummary[];
  progressPercent: number;
  topic: string;
  totalPages: number;
};

type PendingDraftAction = (
  savedLesson: SavedLessonDetail | null,
) => void | Promise<void>;

type BuilderState = {
  current_level: LessonGeneratePayload["current_level"];
  daily_study_time_minutes: number;
  include_answer_key: boolean;
  include_coding_exercises: boolean;
  include_mindmap: boolean;
  include_external_sources: boolean;
  external_search_query: string;
  max_external_sources: number;
  learningObjectives: string;
  learning_pace: LessonGeneratePayload["learning_pace"];
  learning_style: LessonGeneratePayload["learning_style"];
  max_quiz_questions: number;
  prompt: string;
  questionTypes: Array<"multiple_choice" | "fill_blank" | "true_false">;
  subject: string;
  subtopics: string;
  topic: string;
};

type PracticeQuizFormState = {
  current_level: "beginner" | "intermediate" | "advanced";
  daily_study_time_minutes: number;
  learning_pace: "slow" | "normal" | "fast";
  learning_style: "visual" | "auditory" | "kinesthetic" | "reading/writing";
  max_questions: number;
  preferred_question_types: Array<
    "multiple_choice" | "fill_blank" | "true_false"
  >;
};

const defaultBuilderState: BuilderState = {
  current_level: "intermediate",
  daily_study_time_minutes: 30,
  include_answer_key: false,
  include_coding_exercises: true,
  include_mindmap: true,
  include_external_sources: false,
  external_search_query: "",
  max_external_sources: 6,
  learningObjectives: "",
  learning_pace: "normal",
  learning_style: "reading/writing",
  max_quiz_questions: 8,
  prompt: "",
  questionTypes: ["multiple_choice", "fill_blank"],
  subject: "",
  subtopics: "",
  topic: "",
};

const defaultPracticeQuizFormState: PracticeQuizFormState = {
  current_level: "intermediate",
  daily_study_time_minutes: 30,
  learning_pace: "normal",
  learning_style: "visual",
  max_questions: 8,
  preferred_question_types: ["multiple_choice", "fill_blank"],
};

const MIN_LESSON_PROMPT_LENGTH = 10;
const MIN_DAILY_STUDY_MINUTES = 5;
const MAX_DAILY_STUDY_MINUTES = 300;
const MIN_LESSON_QUIZ_QUESTIONS = 1;
const MAX_LESSON_QUIZ_QUESTIONS = 50;
const MIN_PRACTICE_QUESTIONS = 3;

const navigationItems: Array<{
  href: string;
  key: NavKey;
  label: string;
}> = [
  {
    href: "/dashboard",
    key: "home",
    label: "Home",
  },
  {
    href: "/dashboard/practice/challenge",
    key: "practice",
    label: "Practice",
  },
  {
    href: "/dashboard/review/quiz",
    key: "interview",
    label: "Interview",
  },
  {
    href: "/dashboard/profile",
    key: "profile",
    label: "Profile",
  },
  {
    href: "/dashboard/notes",
    key: "notes",
    label: "Notes",
  },
];

const navigationHints: Record<NavKey, string> = {
  home: "Lesson Forge",
  interview: "Review Mission",
  notes: "Markdown Vault",
  profile: "User Hub",
  practice: "Challenge Arena",
};

type CodingLanguageOption = {
  judge0Id: number;
  label: string;
  monacoLanguage: string;
  value: string;
};

const CODING_LANGUAGE_OPTIONS: CodingLanguageOption[] = [
  {
    judge0Id: 71,
    label: "Python",
    monacoLanguage: "python",
    value: "python",
  },
  {
    judge0Id: 63,
    label: "JavaScript",
    monacoLanguage: "javascript",
    value: "javascript",
  },
  {
    judge0Id: 62,
    label: "Java",
    monacoLanguage: "java",
    value: "java",
  },
  {
    judge0Id: 54,
    label: "C++",
    monacoLanguage: "cpp",
    value: "cpp",
  },
];

function resolveLanguageOptionByJudgeId(judge0Id: number | null | undefined) {
  if (!judge0Id) {
    return null;
  }

  return (
    CODING_LANGUAGE_OPTIONS.find((option) => option.judge0Id === judge0Id) ??
    null
  );
}

function resolveLanguageOptionByName(language: string | null | undefined) {
  if (!language) {
    return null;
  }

  const normalized = language.trim().toLowerCase();

  return (
    CODING_LANGUAGE_OPTIONS.find(
      (option) =>
        option.value === normalized ||
        option.label.toLowerCase() === normalized ||
        (normalized === "typescript" && option.value === "javascript"),
    ) ?? null
  );
}

function getDefaultCodingStarterTemplate(languageValue: string) {
  if (languageValue === "javascript") {
    return (
      'const fs = require("fs");\n\n' +
      "function solve(rawInput) {\n" +
      "  // TODO: write your logic here\n" +
      "  const normalized = rawInput.trim();\n" +
      "  return normalized.toUpperCase();\n" +
      "}\n\n" +
      'const input = fs.readFileSync(0, "utf8");\n' +
      "const output = solve(input);\n" +
      "process.stdout.write(String(output));\n"
    );
  }

  if (languageValue === "java") {
    return (
      "import java.io.BufferedReader;\n" +
      "import java.io.InputStreamReader;\n" +
      "import java.util.stream.Collectors;\n\n" +
      "public class Main {\n" +
      "    static String solve(String rawInput) {\n" +
      "        // TODO: write your logic here\n" +
      "        String normalized = rawInput.trim();\n" +
      "        return normalized.toUpperCase();\n" +
      "    }\n\n" +
      "    public static void main(String[] args) throws Exception {\n" +
      "        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));\n" +
      '        String input = reader.lines().collect(Collectors.joining("\\\\n"));\n' +
      "        System.out.print(solve(input));\n" +
      "    }\n" +
      "}\n"
    );
  }

  if (languageValue === "cpp") {
    return (
      "#include <bits/stdc++.h>\n" +
      "using namespace std;\n\n" +
      "string solve(const string& rawInput) {\n" +
      "    // TODO: write your logic here\n" +
      "    string normalized = rawInput;\n" +
      "    auto is_space = [](unsigned char ch) { return std::isspace(ch) != 0; };\n" +
      "    while (!normalized.empty() && is_space((unsigned char)normalized.back())) normalized.pop_back();\n" +
      "    size_t left = 0;\n" +
      "    while (left < normalized.size() && is_space((unsigned char)normalized[left])) left++;\n" +
      "    normalized = normalized.substr(left);\n" +
      "    for (char& ch : normalized) ch = (char)toupper((unsigned char)ch);\n" +
      "    return normalized;\n" +
      "}\n\n" +
      "int main() {\n" +
      "    ios::sync_with_stdio(false);\n" +
      "    cin.tie(nullptr);\n\n" +
      "    string input((istreambuf_iterator<char>(cin)), istreambuf_iterator<char>());\n" +
      "    cout << solve(input);\n" +
      "    return 0;\n" +
      "}\n"
    );
  }

  return (
    "import sys\n\n" +
    "def solve(raw_input: str) -> str:\n" +
    "    # TODO: write your logic here\n" +
    "    normalized = raw_input.strip()\n" +
    "    return normalized.upper()\n\n" +
    'if __name__ == "__main__":\n' +
    "    data = sys.stdin.read()\n" +
    "    sys.stdout.write(solve(data))\n"
  );
}

function resolveStarterCodeForLanguage(
  languageValue: string,
  problem?: {
    language?: string | null;
    language_id?: number | null;
    starter_code?: string | null;
  } | null,
) {
  const problemLanguage =
    resolveLanguageOptionByJudgeId(problem?.language_id) ??
    resolveLanguageOptionByName(problem?.language);

  if (problem?.starter_code && problemLanguage?.value === languageValue) {
    return problem.starter_code;
  }

  return getDefaultCodingStarterTemplate(languageValue);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRecord(value: unknown) {
  return isRecord(value) ? value : null;
}

function getString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function getStringArray(value: unknown) {
  return getArray(value)
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function clampNumber(
  value: number,
  min: number,
  max: number,
  fallback: number,
) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

function validateLessonBuilderState(builder: BuilderState) {
  if (builder.prompt.trim().length < MIN_LESSON_PROMPT_LENGTH) {
    return `Prompt must be at least ${MIN_LESSON_PROMPT_LENGTH} characters.`;
  }

  if (!builder.questionTypes.length) {
    return "Select at least one question type.";
  }

  if (
    builder.daily_study_time_minutes < MIN_DAILY_STUDY_MINUTES ||
    builder.daily_study_time_minutes > MAX_DAILY_STUDY_MINUTES
  ) {
    return `Daily minutes must stay between ${MIN_DAILY_STUDY_MINUTES} and ${MAX_DAILY_STUDY_MINUTES}.`;
  }

  if (
    builder.max_quiz_questions < MIN_LESSON_QUIZ_QUESTIONS ||
    builder.max_quiz_questions > MAX_LESSON_QUIZ_QUESTIONS
  ) {
    return `Quiz question count must stay between ${MIN_LESSON_QUIZ_QUESTIONS} and ${MAX_LESSON_QUIZ_QUESTIONS}.`;
  }

  return null;
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

type SubscriptionPlan = {
  cta: string;
  description: string;
  features: string[];
  name: string;
  price: string;
  tier: "freemium" | "pro" | "developer" | "enterprise";
};

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    cta: "Keep Free",
    description: "Core lesson generation and learning workspace.",
    features: ["Lesson generation", "Flashcards & quiz", "Basic usage"],
    name: "Freemium",
    price: "$0",
    tier: "freemium",
  },
  {
    cta: "Upgrade to Pro",
    description: "More power for consistent daily learning.",
    features: [
      "Higher limits",
      "Priority requests",
      "Advanced recommendations",
    ],
    name: "Pro",
    price: "$9/mo",
    tier: "pro",
  },
  {
    cta: "Upgrade to Developer",
    description: "Full coding workspace workflow and sandbox focus.",
    features: [
      "Developer sandbox",
      "Richer coding workflows",
      "Faster support lane",
    ],
    name: "Developer",
    price: "$19/mo",
    tier: "developer",
  },
  {
    cta: "Upgrade to Enterprise",
    description: "Team-scale collaboration and premium controls.",
    features: [
      "Enterprise limits",
      "Priority SLA",
      "Organization-level access",
    ],
    name: "Enterprise",
    price: "$49/mo",
    tier: "enterprise",
  },
];

const SUBSCRIPTION_ORDER: Record<SubscriptionPlan["tier"], number> = {
  developer: 2,
  enterprise: 3,
  freemium: 0,
  pro: 1,
};

function normalizeSubscriptionTier(
  value: string | null | undefined,
): SubscriptionPlan["tier"] {
  const normalized = (value ?? "").trim().toLowerCase();
  if (
    normalized === "pro" ||
    normalized === "developer" ||
    normalized === "enterprise"
  ) {
    return normalized;
  }
  return "freemium";
}

function getDocumentPreview(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "No preview available.";
  }
  if (normalized.length <= 160) {
    return normalized;
  }
  return `${normalized.slice(0, 160)}...`;
}

function getThemeSurface(theme: CyberTheme = "dark") {
  if (theme === "light") {
    return {
      accent: "text-[#5f8166]",
      accentBg: "bg-[#5f8166]",
      bg: "bg-[#e7eee5]",
      border: "border-[#a5b2a3]",
      card: "bg-[#f6faf3]",
      cardSoft: "bg-[#edf4ec]",
      muted: "text-[#6e7c73]",
      secondary: "text-[#6f95a5]",
      text: "text-[#243127]",
    };
  }
  // dark theme (default)
  return {
    accent: "text-[#9cff93]",
    accentBg: "bg-[#9cff93]",
    bg: "bg-[#05070a]",
    border: "border-[#1a1a1a]",
    card: "bg-[#111315]",
    cardSoft: "bg-[#0b0d0f]",
    muted: "text-[#6b7280]",
    secondary: "text-[#69daff]",
    text: "text-[#f8fafc]",
  };
}

function formatProfileName(
  user?: {
    email?: string | null;
    full_name?: string | null;
  } | null,
) {
  const fullName = user?.full_name?.trim();
  if (fullName) {
    return fullName;
  }

  const emailHandle = user?.email?.split("@")[0]?.trim();
  return emailHandle ? emailHandle : "Operator Neo";
}

function formatProfileAlias(
  user?: {
    email?: string | null;
    full_name?: string | null;
  } | null,
) {
  return formatProfileName(user)
    .replace(/\s+/g, "_")
    .slice(0, 18)
    .toUpperCase();
}

function formatSubscriptionTier(
  user?: {
    subscription_tier?: string | null;
  } | null,
) {
  return (user?.subscription_tier || "Free")
    .replace(/[_-]+/g, " ")
    .toUpperCase();
}

function isSavedLesson(lesson: ActiveLesson): lesson is SavedLessonDetail {
  return "id" in lesson;
}

function getLessonCompletedPageIds(
  lesson: ActiveLesson | null,
  draftCompletedPageIds: string[],
) {
  if (!lesson) {
    return [];
  }

  if (isSavedLesson(lesson)) {
    return lesson.progress.completed_page_ids ?? [];
  }

  return draftCompletedPageIds;
}

function getLessonCurrentPageId(
  lesson: ActiveLesson | null,
  activePageId: string,
) {
  if (!lesson) {
    return null;
  }

  if (activePageId) {
    return activePageId;
  }

  if (isSavedLesson(lesson)) {
    return lesson.progress.current_page_id ?? lesson.navigation.default_page_id;
  }

  return lesson.navigation.default_page_id;
}

function computeDraftProgressPercent(
  lesson: LessonGenerationResponse | null,
  completedPageIds: string[],
) {
  if (!lesson || lesson.navigation.total_pages <= 0) {
    return 0;
  }

  return Math.round(
    (uniqueStrings(completedPageIds).length / lesson.navigation.total_pages) *
      100,
  );
}

function groupLessonsByTopic(lessons: SavedLessonSummary[] | undefined) {
  const map = new Map<string, LessonModule>();

  for (const lesson of lessons ?? []) {
    const key = lesson.topic || "Untitled topic";
    const current = map.get(key);
    const totalPages = current
      ? current.totalPages + lesson.progress.total_pages
      : lesson.progress.total_pages;
    const progressPercent = current
      ? current.progressPercent + lesson.progress.progress_percent
      : lesson.progress.progress_percent;

    map.set(key, {
      lessons: [...(current?.lessons ?? []), lesson],
      progressPercent,
      topic: key,
      totalPages,
    });
  }

  return Array.from(map.values())
    .map((module) => ({
      ...module,
      progressPercent: module.lessons.length
        ? Math.round(module.progressPercent / module.lessons.length)
        : 0,
    }))
    .sort(
      (a, b) =>
        b.lessons.length - a.lessons.length || a.topic.localeCompare(b.topic),
    );
}

function buildReviewSessionFromLesson(
  lesson: ActiveLesson,
  page: LessonPage,
  completedPageIds: string[],
) {
  const pageData = getRecord(page.data) ?? {};
  const quizConfig = getRecord(pageData.quiz) ?? {};
  const questions = getArray(pageData.questions).filter(
    isRecord,
  ) as QuizQuestion[];

  if (!questions.length) {
    return null;
  }

  return {
    completedPageIds,
    lessonTitle: lesson.title,
    passingScore: getNumber(quizConfig.passing_score) ?? 70,
    quizId: isSavedLesson(lesson)
      ? `${lesson.id}:${page.page_id}`
      : `${lesson.lesson_id}:${page.page_id}`,
    questions,
    sourceLessonId: isSavedLesson(lesson) ? lesson.id : null,
    sourcePageId: page.page_id,
    title: getString(quizConfig.title, page.title),
    topic: lesson.topic,
  } satisfies ReviewSession;
}

function persistSelectedLessonId(lessonId: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!lessonId) {
    window.localStorage.removeItem(SELECTED_LESSON_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SELECTED_LESSON_STORAGE_KEY, lessonId);
}

function persistReviewSession(session: ReviewSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    REVIEW_SESSION_STORAGE_KEY,
    JSON.stringify(session),
  );
}

function readSelectedLessonId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(SELECTED_LESSON_STORAGE_KEY);
}

function readReviewSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(REVIEW_SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ReviewSession;
  } catch {
    return null;
  }
}

function StatBadge({
  label,
  tone = "default",
  value,
  theme = "dark",
}: {
  label: string;
  tone?: "default" | "cyan" | "purple" | "amber";
  value: string;
  theme?: CyberTheme;
}) {
  const toneStyles = {
    dark: {
      default: "border-[#1f2937] bg-[#0b0d0f] text-white/80",
      cyan: "border-[#1b3942] bg-[#09151a] text-cyan-200",
      purple: "border-[#33203d] bg-[#140a18] text-fuchsia-200",
      amber: "border-[#4b320c] bg-[#1b1305] text-amber-200",
    },
    light: {
      default: "border-[#d1d5db] bg-white text-[#243127]",
      cyan: "border-[#b6e0ea] bg-[#edfafd] text-cyan-700",
      purple: "border-[#e4ccff] bg-[#faf5ff] text-fuchsia-700",
      amber: "border-[#f3d19c] bg-[#fff7e6] text-amber-700",
    },
  };

  return (
    <div
      className={cn(
        "border px-3 py-2 text-sm",
        toneStyles[theme][tone]
      )}
    >
      <div
        className={cn(
          "font-pixel text-[9px] uppercase tracking-[0.2em]",
          theme === "dark" ? "text-white/45" : "text-[#6f7c74]"
        )}
      >
        {label}
      </div>

      <div className="mt-1 font-display text-base font-semibold uppercase tracking-[0.05em]">
        {value}
      </div>
    </div>
  );
}

function WorkspaceField({
  children,
  label,
  theme = "dark",
}: {
  children: ReactNode;
  label: string;
  theme?: CyberTheme;
}) {
  return (
    <label className="block space-y-2">
      <div
        className={cn(
          "font-pixel text-[9px] uppercase tracking-[0.2em]",
          theme === "dark" ? "text-white/55" : "text-[#6f7c74]",
        )}
      >
        {label}
      </div>
      {children}
    </label>
  );
}

function WorkspaceInput({
  className,
  theme = "dark",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { theme?: CyberTheme }) {
  return (
    <input
      {...props}
      className={cn(
        "w-full border px-4 py-3 text-sm outline-none transition",
        theme === "dark"
          ? "border-[#262626] bg-[#05070a] text-white focus:border-[#9cff93] focus:bg-black"
          : "border-[#c6d2c4] bg-[#fbfdf8] text-[#243127] focus:border-[#8cab90] focus:bg-white",
        className,
      )}
    />
  );
}

function WorkspaceSelect({
  className,
  theme = "dark",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { theme?: CyberTheme }) {
  return (
    <select
      {...props}
      className={cn(
        "w-full border px-4 py-3 text-sm outline-none transition",
        theme === "dark"
          ? "border-[#262626] bg-[#05070a] text-white focus:border-[#9cff93] focus:bg-black"
          : "border-[#c6d2c4] bg-[#fbfdf8] text-[#243127] focus:border-[#8cab90] focus:bg-white",
        className,
      )}
    />
  );
}

function WorkspaceTextarea(
  {
    className,
    theme = "dark",
    ...props
  }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    theme?: CyberTheme;
  },
) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full border px-4 py-4 text-sm outline-none transition",
        theme === "dark"
          ? "border-[#262626] bg-[#05070a] text-white focus:border-[#9cff93] focus:bg-black"
          : "border-[#c6d2c4] bg-[#fbfdf8] text-[#243127] focus:border-[#8cab90] focus:bg-white",
        className,
      )}
    />
  );
}

function WorkspaceCheckbox({
  checked,
  label,
  onChange,
  theme = "dark",
}: {
  checked: boolean;
  label: string;
  onChange: (next: boolean) => void;
  theme?: CyberTheme;
}) {
  return (
    <button
      className={cn(
        "border px-3 py-2 font-pixel text-[9px] uppercase tracking-[0.12em] transition",
        checked
          ? theme === "dark"
            ? "border-[#9cff93] bg-[#0a1208] text-[#d9ffd6]"
            : "border-[#8cab90] bg-[#edf5eb] text-[#2b4730]"
          : theme === "dark"
            ? "border-[#262626] bg-[#05070a] text-white/65 hover:border-[#4b5563] hover:bg-[#111315]"
            : "border-[#c6d2c4] bg-[#f8fbf5] text-[#5f7066] hover:border-[#9db09f] hover:bg-[#edf3ea]",
      )}
      onClick={() => onChange(!checked)}
      type="button"
    >
      {label}
    </button>
  );
}

export function WorkspaceShell({
  active,
  children,
  headerActions,
  onNavigate,
  subtitle,
  theme,
  title,
}: {
  active: NavKey;
  children: ReactNode;
  headerActions?: ReactNode;
  onNavigate?: (href: string) => void;
  subtitle: string;
  theme: CyberTheme;
  title: string;
}) {
  const palette = getThemeSurface(theme);
  const router = useRouter();
  const session = useSessionQuery();
  const logoutMutation = useLogoutMutation({
    onSuccess: () => {
      router.replace("/auth/login");
    },
  });
  const profileAlias = formatProfileAlias(session.data);
  const subscriptionTier = formatSubscriptionTier(session.data);

  return (
    <div
      className={cn("pixel-workspace light-dashboard-canvas min-h-screen", palette.bg, palette.text)}
      data-theme={theme}
    >
      <div className="grid min-h-screen lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside
          className={cn(
            "flex flex-col border-b px-5 py-5 lg:sticky lg:top-0 lg:h-[100dvh] lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-6 lg:py-6",
            palette.border,
            theme === "dark" ? "bg-[#0b0d0f]" : "bg-[#eef6f0]",
          )}
        >
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="Learnbro" className="h-10 w-10" />
            <div
              className={cn(
                "font-display text-2xl font-bold uppercase tracking-[0.08em]",
                palette.accent,
              )}
            >
              Learnbro
            </div>
          </div>
          <nav
            className={cn(
              "mt-6 border p-3",
              theme === "dark"
                ? "border-[#1f2937] bg-[#05070a]"
                : "border-[#9eb2aa] bg-[#fbfffc]",
            )}
          >
            <div
              className={cn(
                "px-1 font-pixel text-[9px] uppercase tracking-[0.2em]",
                theme === "dark" ? "text-white/45" : "text-[#5f7280]",
              )}
            >
              Quick Routes
            </div>
            <div className="mt-3 space-y-2">
              {navigationItems.map((item, index) => {
                const current = item.key === active;

                return (
                  <Link
                    className={cn(
                      "group relative block overflow-hidden border px-4 py-3 transition",
                      current
                        ? theme === "dark"
                          ? "border-[#9cff93] bg-[#111315] text-[#9cff93]"
                          : "border-[#0f9f62] bg-[#e4f8eb] text-[#0f7a4c]"
                        : theme === "dark"
                          ? "border-[#262626] bg-[#05070a] text-white/75 hover:border-[#4b5563] hover:bg-[#111315]"
                          : "border-[#aab8b0] bg-[#fbfffc] text-[#334155] hover:border-[#7bb093] hover:bg-[#edf6f1]",
                    )}
                    href={item.href}
                    key={item.key}
                    onClick={(event) => {
                      if (current) {
                        event.preventDefault();
                        return;
                      }

                      if (onNavigate) {
                        event.preventDefault();
                        onNavigate(item.href);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div
                          className={cn(
                            "font-pixel text-[9px] uppercase tracking-[0.2em]",
                            theme === "dark" ? "text-white/40" : "text-[#6b7280]",
                          )}
                        >
                          {(index + 1).toString().padStart(2, "0")}
                        </div>
                        <div className="mt-1 font-display text-base font-semibold uppercase tracking-[0.08em]">
                          {item.label}
                        </div>
                        <div
                          className={cn(
                            "mt-1 text-[10px] uppercase tracking-[0.18em]",
                            theme === "dark" ? "text-white/45" : "text-[#6b7280]",
                          )}
                        >
                          {navigationHints[item.key]}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "mt-1 h-2.5 w-2.5 shrink-0 border",
                          current
                            ? theme === "dark"
                              ? "border-[#9cff93] bg-[#9cff93]"
                              : "border-[#0f9f62] bg-[#0f9f62]"
                            : theme === "dark"
                              ? "border-white/30 bg-transparent group-hover:border-[#69daff]"
                              : "border-[#9eb2aa] bg-transparent group-hover:border-[#0b7285]",
                        )}
                      />
                    </div>
                    <div className={cn("mt-3 h-[2px]", theme === "dark" ? "bg-black/40" : "bg-[#dce8e1]")}>
                      <div
                        className={cn(
                          "h-full transition-all duration-300",
                          current
                            ? theme === "dark"
                              ? "w-full bg-[#9cff93]"
                              : "w-full bg-[#0f9f62]"
                            : theme === "dark"
                              ? "w-1/3 bg-white/20 group-hover:w-2/3 group-hover:bg-[#69daff]/70"
                              : "w-1/3 bg-[#aab8b0] group-hover:w-2/3 group-hover:bg-[#0b7285]/70",
                        )}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>
          <div className={cn("mt-6 border-t pt-6", theme === "dark" ? "border-[#262626]" : "border-[#b8c8bf]")}>
            <div
              className={cn(
                "border p-4",
                theme === "dark"
                  ? "border-[#1f2937] bg-[#05070a]"
                  : "border-[#9eb2aa] bg-[#fbfffc]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  className={cn(
                    "font-pixel text-[9px] uppercase tracking-[0.2em]",
                    theme === "dark" ? "text-[#6b7280]" : "text-[#64748b]",
                  )}
                >
                  Profile
                </div>
                <div
                  className={cn(
                    "h-2 w-8 border",
                    theme === "dark"
                      ? "border-[#9cff93]/50 bg-[#9cff93]/20"
                      : "border-[#0f9f62]/40 bg-[#0f9f62]/20",
                  )}
                />
              </div>
              <div
                className={cn(
                  "mt-3 font-display text-base font-semibold uppercase",
                  theme === "dark" ? "text-white" : "text-[#14211a]",
                )}
              >
                {profileAlias}
              </div>
              <div
                className={cn(
                  "mt-1 text-xs uppercase tracking-[0.16em]",
                  theme === "dark" ? "text-[#69daff]" : "text-[#0b7285]",
                )}
              >
                {subscriptionTier}
              </div>
              <div className={cn("mt-4 h-[2px]", theme === "dark" ? "bg-black/50" : "bg-[#dce8e1]")}>
                <div
                  className={cn(
                    "h-full w-2/3",
                    theme === "dark"
                      ? "bg-gradient-to-r from-[#9cff93] to-[#69daff]"
                      : "bg-gradient-to-r from-[#0f9f62] to-[#0b7285]",
                  )}
                />
              </div>
              <div
                className={cn(
                  "mt-3 truncate text-xs",
                  theme === "dark" ? "text-[#6b7280]" : "text-[#64748b]",
                )}
              >
                {session.data?.email ?? "session not loaded"}
              </div>
              <button
                className={cn(
                  "mt-4 w-full border px-3 py-2 font-pixel text-[10px] uppercase tracking-[0.14em] transition",
                  logoutMutation.isPending
                    ? theme === "dark"
                      ? "border-[#334155] bg-[#111827] text-white/55"
                      : "border-[#cbd5e1] bg-[#e2e8f0] text-[#64748b]"
                    : theme === "dark"
                      ? "border-[#7f1d1d] bg-[#180808] text-[#fca5a5] hover:border-[#ef4444] hover:text-[#fecaca]"
                      : "border-[#d9a3a3] bg-[#fff3f3] text-[#b42318] hover:border-[#ef4444] hover:text-[#991b1b]",
                )}
                disabled={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
                type="button"
              >
                {logoutMutation.isPending ? "LOGGING OUT..." : "LOG OUT"}
              </button>
              {logoutMutation.isError ? (
                <div className={cn("mt-2 text-xs", theme === "dark" ? "text-[#fca5a5]" : "text-[#b42318]")}>
                  {logoutMutation.error.message}
                </div>
              ) : null}
            </div>
          </div>
        </aside>
        <main className="min-w-0">
          <div
            className={cn(
              "border-b px-6 py-5 lg:px-8",
              palette.border,
              theme === "dark" ? "bg-[#05070a]" : "bg-[rgba(252,255,253,0.86)]",
            )}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div
                  className={cn(
                    "text-[11px] uppercase tracking-[0.32em]",
                    theme === "dark" ? "text-white/45" : "text-[#64748b]",
                  )}
                >
                  {subtitle}
                </div>
                <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-[0.04em]">
                  {title}
                </h1>
              </div>
              {headerActions ? (
                <div className="shrink-0">{headerActions}</div>
              ) : null}
            </div>
          </div>
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function UnsavedDraftPrompt({
  destinationLabel,
  isOpen,
  isSaving,
  onDiscard,
  onSave,
  onStay,
}: {
  destinationLabel: string;
  isOpen: boolean;
  isSaving: boolean;
  onDiscard: () => void;
  onSave: () => void;
  onStay: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6">
      <div className="w-full max-w-xl border border-[#262626] bg-[#05070a] p-6">
        <div className="font-pixel text-[9px] uppercase tracking-[0.24em] text-[#9cff93]">
          UNSAVED_LESSON_DRAFT
        </div>
        <div className="mt-4 font-display text-3xl font-semibold uppercase text-white">
          Save before leaving?
        </div>
        <div className="mt-4 text-sm leading-7 text-white/65">
          You have a generated lesson that is not saved yet. Save it before you{" "}
          {destinationLabel} so the draft is not lost.
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <PixelButton
            disabled={isSaving}
            onClick={onSave}
            theme="dark"
            tone="cyan"
          >
            {isSaving ? "Saving..." : "Save and continue"}
          </PixelButton>
          <PixelButton
            disabled={isSaving}
            hollow
            onClick={onDiscard}
            theme="dark"
            tone="purple"
          >
            Leave without saving
          </PixelButton>
          <PixelButton disabled={isSaving} hollow onClick={onStay} theme="dark">
            Stay here
          </PixelButton>
        </div>
      </div>
    </div>
  );
}

function ModuleStrip({
  activeTopic,
  modules,
  onSelect,
  theme,
}: {
  activeTopic: string | null;
  modules: LessonModule[];
  onSelect: (topic: string) => void;
  theme: CyberTheme;
}) {
  if (!modules.length) {
    return null;
  }

  const dark = theme === "dark";

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {modules.map((module) => {
        const isActive = module.topic === activeTopic;

        return (
          <button
            className={cn(
              "rounded-[28px] border p-5 text-left transition",
              isActive
                ? dark
                  ? "border-[#9cff93]/45 bg-[#9cff93]/10"
                  : "border-[#8cab90] bg-[#edf5eb]"
                : dark
                  ? "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
                  : "border-[#c6d2c4] bg-[#f4f8f1] hover:border-[#9db09f] hover:bg-[#edf3ea]",
            )}
            key={module.topic}
            onClick={() => onSelect(module.topic)}
            type="button"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div
                  className={cn(
                    "text-[11px] uppercase tracking-[0.28em]",
                    dark ? "text-white/45" : "text-[#6f7c74]",
                  )}
                >
                  Subject module
                </div>
                <div className="mt-2 font-display text-xl font-semibold uppercase">
                  {module.topic}
                </div>
              </div>
              <div
                className={cn(
                  "rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em]",
                  dark
                    ? "border-white/10 text-white/60"
                    : "border-[#cad6c8] bg-[#eef4ec] text-[#5e6f65]",
                )}
              >
                {module.lessons.length} lessons
              </div>
            </div>
            <div
              className={cn(
                "mt-5 h-2 rounded-full",
                dark ? "bg-white/8" : "bg-[#d7e3d7]",
              )}
            >
              <div
                className={cn(
                  "h-full rounded-full",
                  dark
                    ? "bg-gradient-to-r from-[#9cff93] to-[#69daff]"
                    : "bg-gradient-to-r from-[#8fb791] to-[#8cb6c6]",
                )}
                style={{ width: `${Math.max(module.progressPercent, 8)}%` }}
              />
            </div>
            <div
              className={cn(
                "mt-3 flex items-center justify-between text-xs uppercase tracking-[0.18em]",
                dark ? "text-white/55" : "text-[#66766d]",
              )}
            >
              <span>Avg progress {module.progressPercent}%</span>
              <span>{module.totalPages} pages</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function LessonList({
  activeLessonId,
  lessons,
  onSelect,
  theme,
}: {
  activeLessonId: string | null;
  lessons: SavedLessonSummary[];
  onSelect: (lessonId: string) => void;
  theme: CyberTheme;
}) {
  const dark = theme === "dark";

  if (!lessons.length) {
    return (
      <div
        className={cn(
          "rounded-[28px] border border-dashed p-6 text-sm",
          dark
            ? "border-white/10 bg-white/[0.03] text-white/55"
            : "border-[#c6d2c4] bg-[#f3f7f1] text-[#6b7b72]",
        )}
      >
        No saved lessons yet. Generate one from the Home builder to seed this
        module.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {lessons.map((lesson) => {
        const current = lesson.id === activeLessonId;

        return (
          <button
            className={cn(
              "flex w-full items-center justify-between rounded-[24px] border px-5 py-4 text-left transition",
              current
                ? dark
                  ? "border-[#69daff]/45 bg-[#69daff]/10"
                  : "border-[#8cb6c6] bg-[#edf5f7]"
                : dark
                  ? "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                  : "border-[#c6d2c4] bg-[#f4f8f1] hover:border-[#9db09f] hover:bg-[#edf3ea]",
            )}
            key={lesson.id}
            onClick={() => onSelect(lesson.id)}
            type="button"
          >
            <div>
              <div className="font-display text-lg font-semibold uppercase">
                {lesson.title}
              </div>
              <div
                className={cn(
                  "mt-1 text-xs uppercase tracking-[0.18em]",
                  dark ? "text-white/45" : "text-[#6f7c74]",
                )}
              >
                Updated {formatDate(lesson.updated_at)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-base font-semibold uppercase">
                {Math.round(lesson.progress.progress_percent)}%
              </div>
              <div
                className={cn(
                  "text-xs uppercase tracking-[0.18em]",
                  dark ? "text-white/45" : "text-[#6f7c74]",
                )}
              >
                {lesson.progress.completed_page_ids?.length ?? 0}/
                {lesson.progress.total_pages} complete
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MarkdownPanel({
  content,
  theme,
}: {
  content: string;
  theme: CyberTheme;
}) {
  const dark = theme === "dark";

  return (
    <div
      className={cn(
        "max-w-none prose prose-headings:font-display prose-headings:uppercase",
        dark
          ? "prose-invert prose-strong:text-white prose-p:text-white/85 prose-li:text-white/75"
          : "prose-headings:text-[#243127] prose-p:text-[#3f4d44] prose-li:text-[#49584f] prose-strong:text-[#243127]",
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

function LessonPageTabs({
  activePageId,
  completedPageIds,
  onSelect,
  pages,
  theme,
}: {
  activePageId: string;
  completedPageIds: string[];
  onSelect: (pageId: string) => void;
  pages: LessonPage[];
  theme: CyberTheme;
}) {
  const dark = theme === "dark";

  return (
    <div className="flex flex-wrap gap-3">
      {pages.map((page, index) => {
        const completed = completedPageIds.includes(page.page_id);
        const active = page.page_id === activePageId;

        return (
          <button
            className={cn(
              "rounded-full border px-4 py-2 text-sm uppercase tracking-[0.16em] transition",
              active
                ? dark
                  ? "border-[#9cff93]/40 bg-[#9cff93]/12 text-white"
                  : "border-[#8cab90] bg-[#edf5eb] text-[#243127]"
                : dark
                  ? "border-white/10 bg-white/[0.03] text-white/65 hover:border-white/20 hover:bg-white/[0.08]"
                  : "border-[#c6d2c4] bg-[#f4f8f1] text-[#5f7066] hover:border-[#9db09f] hover:bg-[#edf3ea]",
            )}
            key={page.page_id}
            onClick={() => onSelect(page.page_id)}
            type="button"
          >
            {index + 1}. {page.page_type}
            {completed ? " · done" : ""}
          </button>
        );
      })}
    </div>
  );
}

function OverviewPage({
  page,
  theme,
}: {
  page: LessonPage;
  theme: CyberTheme;
}) {
  const dark = theme === "dark";
  const data = getRecord(page.data) ?? {};
  const sourceDocuments = getArray(data.source_documents).filter(isRecord);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
      <section
        className={cn(
          "rounded-[32px] border p-6",
          dark
            ? "border-white/10 bg-white/[0.04]"
            : "border-[#c6d2c4] bg-[#f4f8f1]",
        )}
      >
        <div className={cn("text-[11px] uppercase tracking-[0.3em]", dark ? "text-white/45" : "text-[#6f7c74]")}>
          Prompt
        </div>
        <div
          className={cn(
            "mt-4 whitespace-pre-wrap text-base leading-8",
            dark ? "text-white/85" : "text-[#3f4d44]",
          )}
        >
          {getString(data.prompt, "No prompt stored for this lesson.")}
        </div>
      </section>
      <section
        className={cn(
          "rounded-[32px] border p-6",
          dark
            ? "border-white/10 bg-white/[0.04]"
            : "border-[#c6d2c4] bg-[#f4f8f1]",
        )}
      >
        <div className={cn("text-[11px] uppercase tracking-[0.3em]", dark ? "text-white/45" : "text-[#6f7c74]")}>
          Uploaded documents
        </div>
        <div className="mt-4 space-y-3">
          {sourceDocuments.length ? (
            sourceDocuments.map((document) => (
              <div
                className={cn(
                  "rounded-3xl border p-4",
                  dark
                    ? "border-white/10 bg-black/20"
                    : "border-[#d1dbcf] bg-[#eef4ec]",
                )}
                key={getString(document.file_name)}
              >
                <div className="font-display text-base font-semibold uppercase">
                  {getString(document.file_name, "Document")}
                </div>
                <div className={cn("mt-2 text-xs uppercase tracking-[0.18em]", dark ? "text-white/45" : "text-[#6f7c74]")}>
                  {getString(document.file_type)} ·{" "}
                  {getString(document.extracted_characters)} chars
                </div>
                {getString(document.excerpt) ? (
                  <div className={cn("mt-3 text-sm leading-6", dark ? "text-white/65" : "text-[#55645a]")}>
                    {getString(document.excerpt)}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div
              className={cn(
                "rounded-3xl border border-dashed p-4 text-sm",
                dark
                  ? "border-white/10 text-white/55"
                  : "border-[#c6d2c4] text-[#6b7b72]",
              )}
            >
              This lesson was generated without source documents.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function TheoryPage({
  page,
  theme,
}: {
  page: LessonPage;
  theme: CyberTheme;
}) {
  const dark = theme === "dark";
  const data = getRecord(page.data) ?? {};
  const lesson = getRecord(data.lesson) ?? {};
  const sections = getArray(data.sections).filter(isRecord);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-3">
        <div className={cn("rounded-[28px] border p-5", dark ? "border-white/10 bg-white/[0.04]" : "border-[#c6d2c4] bg-[#f4f8f1]")}>
          <div className={cn("text-[11px] uppercase tracking-[0.26em]", dark ? "text-white/45" : "text-[#6f7c74]")}>
            Objectives
          </div>
          <div className={cn("mt-3 space-y-2 text-sm leading-6", dark ? "text-white/75" : "text-[#49584f]")}>
            {getStringArray(lesson.learning_objectives).map((item) => (
              <div key={item}>• {item}</div>
            ))}
          </div>
        </div>
        <div className={cn("rounded-[28px] border p-5", dark ? "border-white/10 bg-white/[0.04]" : "border-[#c6d2c4] bg-[#f4f8f1]")}>
          <div className={cn("text-[11px] uppercase tracking-[0.26em]", dark ? "text-white/45" : "text-[#6f7c74]")}>
            Prerequisites
          </div>
          <div className={cn("mt-3 space-y-2 text-sm leading-6", dark ? "text-white/75" : "text-[#49584f]")}>
            {getStringArray(lesson.prerequisites).map((item) => (
              <div key={item}>• {item}</div>
            ))}
          </div>
        </div>
        <div className={cn("rounded-[28px] border p-5", dark ? "border-white/10 bg-white/[0.04]" : "border-[#c6d2c4] bg-[#f4f8f1]")}>
          <div className={cn("text-[11px] uppercase tracking-[0.26em]", dark ? "text-white/45" : "text-[#6f7c74]")}>
            Required knowledge
          </div>
          <div className={cn("mt-3 text-sm leading-6", dark ? "text-white/75" : "text-[#49584f]")}>
            {getString(lesson.estimated_required_knowledge, "Not provided")}
          </div>
        </div>
      </section>
      <section className="space-y-4">
        {sections.map((section, index) => (
          <article
            className={cn(
              "rounded-[32px] border p-6",
              dark
                ? "border-white/10 bg-white/[0.04]"
                : "border-[#c6d2c4] bg-[#f4f8f1]",
            )}
            key={`${getString(section.title)}-${index}`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.24em]",
                  dark
                    ? "border-white/10 text-white/55"
                    : "border-[#cad6c8] bg-[#eef4ec] text-[#66766d]",
                )}
              >
                {getString(section.type, "section")}
              </div>
              <div className={cn("text-[11px] uppercase tracking-[0.24em]", dark ? "text-white/45" : "text-[#6f7c74]")}>
                section {index + 1}
              </div>
            </div>
            <h3 className="mt-4 font-display text-2xl font-semibold uppercase">
              {getString(section.title, `Section ${index + 1}`)}
            </h3>
            <div className="mt-4">
              <MarkdownPanel
                content={getString(
                  section.content,
                  "No content available for this section.",
                )}
                theme={theme}
              />
            </div>
            {getString(section.importance) ? (
              <div
                className={cn(
                  "mt-5 rounded-3xl border p-4 text-sm leading-6",
                  dark
                    ? "border-[#69daff]/20 bg-[#69daff]/8 text-[#d8f8ff]"
                    : "border-[#b8ced7] bg-[#edf5f7] text-[#46616d]",
                )}
              >
                {getString(section.importance)}
              </div>
            ) : null}
            {getStringArray(section.key_points).length ? (
              <div className="mt-5">
                <div className={cn("text-[11px] uppercase tracking-[0.26em]", dark ? "text-white/45" : "text-[#6f7c74]")}>
                  Key points
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {getStringArray(section.key_points).map((point) => (
                    <div
                      className={cn(
                        "rounded-3xl border p-4 text-sm",
                        dark
                          ? "border-white/10 bg-black/15 text-white/70"
                          : "border-[#d1dbcf] bg-[#eef4ec] text-[#4f5f56]",
                      )}
                      key={point}
                    >
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {getArray(section.examples).filter(isRecord).length ? (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {getArray(section.examples)
                  .filter(isRecord)
                  .map((example, exampleIndex) => (
                    <div
                      className={cn(
                        "rounded-3xl border p-4",
                        dark
                          ? "border-white/10 bg-black/20"
                          : "border-[#d1dbcf] bg-[#eef4ec]",
                      )}
                      key={`${getString(example.title)}-${exampleIndex}`}
                    >
                      <div className="font-display text-base font-semibold uppercase">
                        {getString(
                          example.title,
                          `Example ${exampleIndex + 1}`,
                        )}
                      </div>
                      <div className={cn("mt-2 text-sm leading-6", dark ? "text-white/70" : "text-[#4f5f56]")}>
                        {getString(example.description)}
                      </div>
                    </div>
                  ))}
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}

function FlashcardsPage({
  onCreateFlashcard,
  page,
  theme,
}: {
  onCreateFlashcard: (question: string, answer: string) => void;
  page: LessonPage;
  theme: CyberTheme;
}) {
  const data = getRecord(page.data) ?? {};
  const cards = getArray(data.cards).filter(isRecord);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const dark = theme === "dark";

  const total = cards.length;
  const currentCard = cards[currentIndex];

  function goPrev() {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((i) => (i - 1 + total) % total), 120);
  }

  function goNext() {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((i) => (i + 1) % total), 120);
  }

  if (!total) {
    return (
      <div
        className={cn(
          "rounded-[30px] border border-dashed p-6 text-sm",
          dark
            ? "border-white/10 bg-white/[0.03] text-white/55"
            : "border-[#c6d2c4] bg-[#f3f7f1] text-[#6b7b72]",
        )}
      >
        This lesson does not contain flashcards yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header: type/subtopic + Save to deck */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div
          className={cn(
            "font-pixel text-[9px] uppercase tracking-[0.2em]",
            dark ? "text-white/45" : "text-[#6f7c74]",
          )}
        >
          {getString(currentCard.type, "flashcard")} ·{" "}
          {getString(currentCard.subtopic, "general")}
        </div>
        <button
          className={cn(
            "font-pixel text-[9px] uppercase tracking-[0.2em] transition",
            dark
              ? "text-[#69daff] hover:text-[#9cff93]"
              : "text-[#4f8798] hover:text-[#5f8c61]",
          )}
          onClick={() =>
            onCreateFlashcard(
              getString(currentCard.question),
              getString(currentCard.answer),
            )
          }
          type="button"
        >
          ▸ Save to deck
        </button>
      </div>

      {/* Flashcard (flip on click) */}
      <button
        aria-label={isFlipped ? "Flip to question side" : "Flip to answer side"}
        className="block w-full text-left [perspective:1200px]"
        onClick={() => setIsFlipped((f) => !f)}
        type="button"
      >
        <div
          className={cn(
            "relative min-h-[320px] w-full [transform-style:preserve-3d] transition-transform duration-500",
            isFlipped ? "[transform:rotateY(180deg)]" : "",
          )}
        >
          {/* Front — Question */}
          <div
            className={cn(
              "absolute inset-0 border p-6 [backface-visibility:hidden]",
              dark
                ? "border-white/10 bg-black/20"
                : "border-[#c6d2c4] bg-[#f8fbf5]",
            )}
          >
            <div
              className={cn(
                "text-[11px] uppercase tracking-[0.24em]",
                dark ? "text-white/45" : "text-[#6f7c74]",
              )}
            >
              Question
            </div>
            <div className="mt-4 font-display text-2xl font-semibold uppercase">
              {getString(currentCard.question, `Flashcard ${currentIndex + 1}`)}
            </div>
            <div
              className={cn(
                "mt-6 text-[11px] uppercase tracking-[0.24em]",
                dark ? "text-[#69daff]" : "text-[#4f8798]",
              )}
            >
              ▸ Click to flip answer
            </div>
          </div>

          {/* Back — Answer */}
          <div
            className={cn(
              "absolute inset-0 border p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]",
              dark
                ? "border-[#9cff93]/20 bg-[#9cff93]/8"
                : "border-[#b6d0b9] bg-[#edf5eb]",
            )}
          >
            <div
              className={cn(
                "text-[11px] uppercase tracking-[0.24em]",
                dark ? "text-[#c5ffc0]" : "text-[#5f8c61]",
              )}
            >
              Answer key
            </div>
            <div
              className={cn(
                "mt-3 text-sm leading-7",
                dark ? "text-white/82" : "text-[#3f4d44]",
              )}
            >
              {getString(currentCard.answer, "No answer provided")}
            </div>
            {getStringArray(currentCard.hints).length ? (
              <div
                className={cn(
                  "mt-4 space-y-2 text-sm",
                  dark ? "text-white/70" : "text-[#55645a]",
                )}
              >
                {getStringArray(currentCard.hints).map((hint) => (
                  <div key={hint}>• {hint}</div>
                ))}
              </div>
            ) : null}
            <div
              className={cn(
                "mt-5 text-[11px] uppercase tracking-[0.24em]",
                dark ? "text-[#9cff93]" : "text-[#5f8c61]",
              )}
            >
              ▸ Click to flip back
            </div>
          </div>
        </div>
      </button>

      {/* Navigation: ← PREV · dots · NEXT → */}
      <div className="flex items-center justify-between gap-4 pt-2">
        {/* Prev arrow */}
        <button
          id="lesson-flashcard-prev"
          type="button"
          onClick={goPrev}
          disabled={total <= 1}
          className="group flex items-center gap-2 disabled:opacity-30"
          aria-label="Previous flashcard"
        >
          <span
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center border transition",
              dark
                ? "border-[#9cff93]/40 text-[#9cff93] group-hover:border-[#9cff93] group-hover:bg-[#9cff93]/10"
                : "border-[#a4c2a8] text-[#5f8c61] group-hover:border-[#8cab90] group-hover:bg-[#edf5eb]",
            )}
          >
            {/* Left arrow SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="square"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </span>
          <span
            className={cn(
              "font-pixel text-[9px] uppercase tracking-[0.14em] transition",
              dark
                ? "text-white/45 group-hover:text-white/80"
                : "text-[#6f7c74] group-hover:text-[#243127]",
            )}
          >
            Prev
          </span>
        </button>

        {/* Dot indicators */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex gap-1.5">
            {cards.map((_, idx) => (
              <button
                key={idx}
                id={`lesson-fc-dot-${idx}`}
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  setTimeout(() => setCurrentIndex(idx), 120);
                }}
                className={cn(
                  "h-1.5 transition-all",
                  idx === currentIndex
                    ? dark
                      ? "w-5 bg-[#9cff93]"
                      : "w-5 bg-[#7fae84]"
                    : dark
                      ? "w-1.5 bg-white/20 hover:bg-white/40"
                      : "w-1.5 bg-[#c9d5c7] hover:bg-[#9db09f]",
                )}
                aria-label={`Go to card ${idx + 1}`}
              />
            ))}
          </div>
          <span
            className={cn(
              "font-pixel text-[8px] uppercase tracking-[0.14em]",
              dark ? "text-white/35" : "text-[#7a887f]",
            )}
          >
            {currentIndex + 1} / {total}
          </span>
        </div>

        {/* Next arrow */}
        <button
          id="lesson-flashcard-next"
          type="button"
          onClick={goNext}
          disabled={total <= 1}
          className="group flex items-center gap-2 disabled:opacity-30"
          aria-label="Next flashcard"
        >
          <span
            className={cn(
              "font-pixel text-[9px] uppercase tracking-[0.14em] transition",
              dark
                ? "text-white/45 group-hover:text-white/80"
                : "text-[#6f7c74] group-hover:text-[#243127]",
            )}
          >
            Next
          </span>
          <span
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center border transition",
              dark
                ? "border-[#9cff93]/40 bg-[#9cff93]/10 text-[#9cff93] group-hover:border-[#9cff93] group-hover:bg-[#9cff93]/20"
                : "border-[#a4c2a8] bg-[#edf5eb] text-[#5f8c61] group-hover:border-[#8cab90] group-hover:bg-[#e4efe1]",
            )}
          >
            {/* Right arrow SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="square"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}

function QuizPage({
  lesson,
  onLaunchReview,
  page,
  theme,
}: {
  lesson: ActiveLesson;
  onLaunchReview: () => void;
  page: LessonPage;
  theme: CyberTheme;
}) {
  const data = getRecord(page.data) ?? {};
  const questions = getArray(data.questions).filter(isRecord);
  const [currentIndex, setCurrentIndex] = useState(0);
  const dark = theme === "dark";

  const total = questions.length;
  const currentQuestion = questions[currentIndex];

  function goPrev() {
    setCurrentIndex((i) => (i - 1 + total) % total);
  }

  function goNext() {
    setCurrentIndex((i) => (i + 1) % total);
  }

  return (
    <div className="space-y-6">
      {/* Header with title and Start Review button */}
      <div
        className={cn(
          "flex flex-col gap-4 border p-6 lg:flex-row lg:items-center lg:justify-between",
          dark
            ? "border-white/10 bg-white/[0.04]"
            : "border-[#c6d2c4] bg-[#f4f8f1]",
        )}
      >
        <div>
          <div
            className={cn(
              "font-pixel text-[9px] uppercase tracking-[0.28em]",
              dark ? "text-white/45" : "text-[#6f7c74]",
            )}
          >
            Quiz page
          </div>
          <h3 className="mt-2 font-display text-2xl font-semibold uppercase">
            {page.title}
          </h3>
          <div
            className={cn(
              "mt-2 text-sm leading-6",
              dark ? "text-white/65" : "text-[#55645a]",
            )}
          >
            Quiz attempts will be tracked under{" "}
            <span className={dark ? "text-white" : "text-[#243127]"}>
              {lesson.topic}
            </span>
            .
          </div>
        </div>
        <PixelButton onClick={onLaunchReview} theme={theme} tone="cyan">
          Start Review Mode
        </PixelButton>
      </div>

      {/* Single question card */}
      {total === 0 ? (
        <div
          className={cn(
            "border border-dashed p-6 text-sm",
            dark
              ? "border-white/10 bg-white/[0.03] text-white/55"
              : "border-[#c6d2c4] bg-[#f3f7f1] text-[#6b7b72]",
          )}
        >
          This quiz page does not contain questions yet.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Question counter label */}
          <div className="flex items-center justify-between px-1">
            <div
              className={cn(
                "font-pixel text-[9px] uppercase tracking-[0.2em]",
                dark ? "text-white/45" : "text-[#6f7c74]",
              )}
            >
              {getString(currentQuestion.type, "question").replaceAll("_", " ")}{" "}
              · {getString(currentQuestion.subtopic, lesson.topic)}
            </div>
            <div
              className={cn(
                "font-pixel text-[9px] uppercase tracking-[0.2em]",
                dark ? "text-white/35" : "text-[#7a887f]",
              )}
            >
              {currentIndex + 1} / {total}
            </div>
          </div>

          {/* Question card — fixed min-height prevents layout jump between short/long questions */}
          <article
            className={cn(
              "flex min-h-[340px] flex-col border p-6",
              dark
                ? "border-white/10 bg-white/[0.04]"
                : "border-[#c6d2c4] bg-[#f8fbf5]",
            )}
          >
            <div className="font-display text-xl font-semibold uppercase leading-tight">
              {getString(
                currentQuestion.question,
                `Question ${currentIndex + 1}`,
              )}
            </div>

            {getStringArray(currentQuestion.options).length ? (
              <div className="mt-5 grid gap-2">
                {getStringArray(currentQuestion.options).map(
                  (option, optIdx) => (
                    <div
                      className={cn(
                        "flex items-start gap-3 border px-4 py-3 text-sm",
                        dark
                          ? "border-white/10 bg-black/20 text-white/72"
                          : "border-[#d1dbcf] bg-[#eef4ec] text-[#49584f]",
                      )}
                      key={option}
                    >
                      <span
                        className={cn(
                          "mt-0.5 shrink-0 font-pixel text-[9px] uppercase",
                          dark ? "text-white/35" : "text-[#7a887f]",
                        )}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div
                className={cn(
                  "mt-4 border border-dashed px-4 py-3 font-pixel text-[9px] uppercase tracking-[0.14em]",
                  dark
                    ? "border-white/10 text-white/40"
                    : "border-[#cfd9cc] text-[#7a887f]",
                )}
              >
                Response type:{" "}
                {getString(currentQuestion.type).replaceAll("_", " ")}
              </div>
            )}
          </article>

          {/* Navigation: ← Prev · dots · Next → */}
          <div className="flex items-center justify-between gap-4 pt-1">
            {/* Prev */}
            <button
              id="lesson-quiz-prev"
              type="button"
              onClick={goPrev}
              disabled={total <= 1}
              className="group flex items-center gap-2 disabled:opacity-30"
              aria-label="Previous question"
            >
              <span
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center border transition",
                  dark
                    ? "border-[#69daff]/40 text-[#69daff] group-hover:border-[#69daff] group-hover:bg-[#69daff]/10"
                    : "border-[#b8ced7] text-[#4f8798] group-hover:border-[#8cb6c6] group-hover:bg-[#edf5f7]",
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="square"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </span>
              <span
                className={cn(
                  "font-pixel text-[9px] uppercase tracking-[0.14em] transition",
                  dark
                    ? "text-white/45 group-hover:text-white/80"
                    : "text-[#6f7c74] group-hover:text-[#243127]",
                )}
              >
                Prev
              </span>
            </button>

            {/* Dot indicators */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex gap-1.5">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    id={`lesson-quiz-dot-${idx}`}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "h-1.5 transition-all",
                      idx === currentIndex
                        ? dark
                          ? "w-5 bg-[#69daff]"
                          : "w-5 bg-[#8cb6c6]"
                        : dark
                          ? "w-1.5 bg-white/20 hover:bg-white/40"
                          : "w-1.5 bg-[#d0dbd8] hover:bg-[#9cb7c1]",
                    )}
                    aria-label={`Go to question ${idx + 1}`}
                  />
                ))}
              </div>
              <span
                className={cn(
                  "font-pixel text-[8px] uppercase tracking-[0.14em]",
                  dark ? "text-white/35" : "text-[#7a887f]",
                )}
              >
                {currentIndex + 1} / {total}
              </span>
            </div>

            {/* Next */}
            <button
              id="lesson-quiz-next"
              type="button"
              onClick={goNext}
              disabled={total <= 1}
              className="group flex items-center gap-2 disabled:opacity-30"
              aria-label="Next question"
            >
              <span
                className={cn(
                  "font-pixel text-[9px] uppercase tracking-[0.14em] transition",
                  dark
                    ? "text-white/45 group-hover:text-white/80"
                    : "text-[#6f7c74] group-hover:text-[#243127]",
                )}
              >
                Next
              </span>
              <span
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center border transition",
                  dark
                    ? "border-[#69daff]/40 bg-[#69daff]/10 text-[#69daff] group-hover:border-[#69daff] group-hover:bg-[#69daff]/20"
                    : "border-[#b8ced7] bg-[#edf5f7] text-[#4f8798] group-hover:border-[#8cb6c6] group-hover:bg-[#e4f0f3]",
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="square"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ResourcesPage({
  page,
  theme,
}: {
  page: LessonPage;
  theme: CyberTheme;
}) {
  const items = getStringArray((getRecord(page.data) ?? {}).items);
  const dark = theme === "dark";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.length ? (
        items.map((item) => (
          <div
            className={cn(
              "rounded-[28px] border p-5 text-sm leading-7",
              dark
                ? "border-white/10 bg-white/[0.04] text-white/75"
                : "border-[#d1dbcf] bg-[#eef4ec] text-[#49584f]",
            )}
            key={item}
          >
            {item}
          </div>
        ))
      ) : (
        <div
          className={cn(
            "rounded-[28px] border border-dashed p-6 text-sm",
            dark
              ? "border-white/10 bg-white/[0.03] text-white/55"
              : "border-[#c6d2c4] bg-[#f3f7f1] text-[#6b7b72]",
          )}
        >
          No supporting resources were included in this lesson.
        </div>
      )}
    </div>
  );
}

function CodingPage({
  lesson,
  page,
  theme,
}: {
  lesson: ActiveLesson;
  page: LessonPage;
  theme: CyberTheme;
}) {
  const dark = theme === "dark";
  const data = getRecord(page.data) ?? {};
  const tasks = getArray(data.tasks).filter(isRecord);
  const savedLessonId = isSavedLesson(lesson) ? lesson.id : null;
  const lessonLanguage = getString(data.language, "python");
  const lessonLanguageId = getNumber(data.language_id) ?? 71;

  const codingProblemsQuery = useBackendLessonCodingProblemsQuery(
    savedLessonId,
    {
      enabled: Boolean(savedLessonId),
    },
  );
  const generateCodingProblemsMutation =
    useBackendGenerateLessonCodingProblemsMutation();
  const runCodingProblemMutation = useBackendRunCodingProblemMutation();
  const submitCodingProblemMutation = useBackendSubmitCodingProblemMutation();
  const submitCodingProblemStreamMutation =
    useBackendStreamSubmitCodingProblemMutation();
  const upsertCodingSessionMutation =
    useBackendUpsertCodingProblemSessionMutation();
  const recommendationMutation = useBackendCodeRecommendationMutation();

  const codingProblems = codingProblemsQuery.data ?? [];
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(
    null,
  );
  const codingProblemQuery = useBackendCodingProblemQuery(selectedProblemId, {
    enabled: Boolean(selectedProblemId),
  });
  const sessionQuery = useBackendCodingProblemSessionQuery(selectedProblemId, {
    enabled: Boolean(selectedProblemId),
  });
  const attemptsQuery = useBackendCodingAttemptsQuery(
    selectedProblemId,
    { limit: 8, offset: 0 },
    { enabled: Boolean(selectedProblemId) },
  );

  const defaultLanguageOption =
    resolveLanguageOptionByName(lessonLanguage) ??
    resolveLanguageOptionByJudgeId(lessonLanguageId) ??
    CODING_LANGUAGE_OPTIONS[0];
  const [sourceCode, setSourceCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [recommendationText, setRecommendationText] = useState("");
  const [selectedLanguage, setSelectedLanguage] =
    useState<CodingLanguageOption>(defaultLanguageOption);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [submitStreamStatus, setSubmitStreamStatus] = useState<string | null>(
    null,
  );
  const [submitStreamPassedTests, setSubmitStreamPassedTests] = useState(0);
  const [submitStreamTotalTests, setSubmitStreamTotalTests] = useState(0);
  const [submitStreamCaseResults, setSubmitStreamCaseResults] = useState<
    SubmitStreamCaseEvent["case_result"][]
  >([]);
  const [submitStreamCompleted, setSubmitStreamCompleted] =
    useState<SubmitStreamCompletedEvent | null>(null);

  const autoGenerateTriggeredRef = useRef(false);
  const hydratedProblemIdRef = useRef<string | null>(null);
  const hydratedLanguageProblemIdRef = useRef<string | null>(null);
  const editorRef = useRef<MonacoEditorNamespace.IStandaloneCodeEditor | null>(
    null,
  );

  useEffect(() => {
    if (!codingProblems.length) {
      setSelectedProblemId(null);
      return;
    }

    if (
      selectedProblemId &&
      codingProblems.some((problem) => problem.id === selectedProblemId)
    ) {
      return;
    }

    setSelectedProblemId(codingProblems[0].id);
  }, [codingProblems, selectedProblemId]);

  useEffect(() => {
    if (!savedLessonId || autoGenerateTriggeredRef.current) {
      return;
    }

    if (codingProblemsQuery.isLoading || codingProblems.length > 0) {
      return;
    }

    autoGenerateTriggeredRef.current = true;
    generateCodingProblemsMutation.mutate({
      lessonId: savedLessonId,
      payload: {
        decision_mode: "force",
        max_problems: Math.max(1, Math.min(5, tasks.length || 2)),
      },
    });
  }, [
    codingProblems.length,
    codingProblemsQuery.isLoading,
    generateCodingProblemsMutation,
    savedLessonId,
    tasks.length,
  ]);

  useEffect(() => {
    hydratedProblemIdRef.current = null;
    hydratedLanguageProblemIdRef.current = null;
    setRecommendationText("");
    setLocalMessage(null);
    setSubmitStreamStatus(null);
    setSubmitStreamPassedTests(0);
    setSubmitStreamTotalTests(0);
    setSubmitStreamCaseResults([]);
    setSubmitStreamCompleted(null);
  }, [selectedProblemId]);

  useEffect(() => {
    if (
      !selectedProblemId ||
      hydratedProblemIdRef.current === selectedProblemId
    ) {
      return;
    }

    const sessionCode = sessionQuery.data?.current_code;
    const starterCode = resolveStarterCodeForLanguage(
      selectedLanguage.value,
      codingProblemQuery.data
        ? {
            language: codingProblemQuery.data.language,
            language_id: codingProblemQuery.data.language_id,
            starter_code: codingProblemQuery.data.starter_code,
          }
        : null,
    );
    const initialCode = sessionCode || starterCode;

    if (!initialCode) {
      return;
    }

    setSourceCode(initialCode);
    hydratedProblemIdRef.current = selectedProblemId;
  }, [
    codingProblemQuery.data?.language,
    codingProblemQuery.data?.language_id,
    codingProblemQuery.data?.starter_code,
    selectedProblemId,
    selectedLanguage.value,
    sessionQuery.data?.current_code,
  ]);

  useEffect(() => {
    if (
      !selectedProblemId ||
      hydratedLanguageProblemIdRef.current === selectedProblemId
    ) {
      return;
    }

    const resolvedLanguage =
      resolveLanguageOptionByJudgeId(sessionQuery.data?.language_id) ??
      resolveLanguageOptionByJudgeId(codingProblemQuery.data?.language_id) ??
      resolveLanguageOptionByName(codingProblemQuery.data?.language) ??
      resolveLanguageOptionByName(lessonLanguage) ??
      defaultLanguageOption;

    setSelectedLanguage(resolvedLanguage);
    hydratedLanguageProblemIdRef.current = selectedProblemId;
  }, [
    codingProblemQuery.data?.language,
    codingProblemQuery.data?.language_id,
    defaultLanguageOption,
    lessonLanguage,
    selectedProblemId,
    sessionQuery.data?.language_id,
  ]);

  const activeProblem = codingProblemQuery.data;
  const testCases = activeProblem?.test_cases ?? [];
  const attempts = attemptsQuery.data?.attempts ?? [];
  const activeLanguageId = selectedLanguage.judge0Id;
  const runResult = runCodingProblemMutation.data;
  const submitResult = submitCodingProblemMutation.data;
  const effectiveSubmitResult = submitStreamCompleted
    ? {
        passed: submitStreamCompleted.passed,
        passed_tests: submitStreamCompleted.passed_tests,
        results: submitStreamCompleted.results,
        status: submitStreamCompleted.result_status,
        total_tests: submitStreamCompleted.total_tests,
      }
    : submitResult;
  const isSubmittingCode =
    submitCodingProblemStreamMutation.isPending ||
    submitCodingProblemMutation.isPending;
  const submitResultByCaseIndex = new Map(
    submitStreamCaseResults.map((caseResult) => [caseResult.index, caseResult]),
  );

  const onEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const formatCode = async () => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const formatAction = editor.getAction("editor.action.formatDocument");
    if (!formatAction) {
      return;
    }

    await formatAction.run();
  };

  const runCode = async () => {
    if (!selectedProblemId || !sourceCode.trim()) {
      setLocalMessage("Write code before running.");
      return;
    }

    setLocalMessage(null);
    await runCodingProblemMutation.mutateAsync({
      problemId: selectedProblemId,
      payload: {
        language_id: activeLanguageId,
        source_code: sourceCode,
        stdin: stdin || undefined,
      },
    });
  };

  const submitCode = async () => {
    if (!selectedProblemId || !sourceCode.trim()) {
      setLocalMessage("Write code before submitting.");
      return;
    }

    setLocalMessage(null);
    setSubmitStreamStatus("started");
    setSubmitStreamPassedTests(0);
    setSubmitStreamCaseResults([]);
    setSubmitStreamCompleted(null);
    setSubmitStreamTotalTests(0);

    try {
      await submitCodingProblemStreamMutation.mutateAsync({
        onEvent: (event) => {
          if (event.status === "started") {
            setSubmitStreamStatus("started");
            setSubmitStreamTotalTests(event.total_tests);
            return;
          }

          if (event.status === "case") {
            setSubmitStreamStatus("running");
            setSubmitStreamPassedTests(event.passed_tests);
            setSubmitStreamTotalTests(event.total_tests);
            setSubmitStreamCaseResults((current) => {
              const withoutCurrent = current.filter(
                (item) => item.index !== event.case_result.index,
              );
              return [...withoutCurrent, event.case_result].sort(
                (a, b) => a.index - b.index,
              );
            });
            return;
          }

          if (event.status === "completed") {
            setSubmitStreamStatus("completed");
            setSubmitStreamPassedTests(event.passed_tests);
            setSubmitStreamTotalTests(event.total_tests);
            setSubmitStreamCompleted(event);
            return;
          }

          if (event.status === "error") {
            setSubmitStreamStatus("error");
            setLocalMessage(event.error);
          }
        },
        payload: {
          language_id: activeLanguageId,
          source_code: sourceCode,
        },
        problemId: selectedProblemId,
      });
    } catch {
      setSubmitStreamStatus("fallback");
      const fallback = await submitCodingProblemMutation.mutateAsync({
        problemId: selectedProblemId,
        payload: {
          language_id: activeLanguageId,
          source_code: sourceCode,
        },
      });
      setSubmitStreamCompleted({
        attempt_id: fallback.attempt_id,
        passed: fallback.passed,
        passed_tests: fallback.passed_tests,
        result_status: fallback.status ?? undefined,
        results: fallback.results ?? [],
        status: "completed",
        total_tests: fallback.total_tests,
      });
      setSubmitStreamPassedTests(fallback.passed_tests);
      setSubmitStreamTotalTests(fallback.total_tests);
    }
  };

  const saveSession = async () => {
    if (!selectedProblemId) {
      return;
    }

    await upsertCodingSessionMutation.mutateAsync({
      problemId: selectedProblemId,
      payload: {
        current_code: sourceCode,
        language_id: activeLanguageId,
      },
    });
    setLocalMessage("Code session saved.");
  };

  const getRecommendation = async () => {
    if (!sourceCode.trim()) {
      setLocalMessage("Write code before requesting recommendations.");
      return;
    }

    setLocalMessage(null);
    const recommendation = await recommendationMutation.mutateAsync({
      content: sourceCode,
      content_type: "code",
      trigger_lines: 1,
      user_context: `${lesson.topic} · ${activeProblem?.title ?? "coding practice"}`,
    });

    setRecommendationText(
      recommendation.text || "No recommendation returned yet.",
    );
  };

  return (
    <div className="space-y-5">
      <div
        className={cn(
          "rounded-[30px] border p-6",
          dark
            ? "border-white/10 bg-white/[0.04]"
            : "border-[#c6d2c4] bg-[#f4f8f1]",
        )}
      >
        <div
          className={cn(
            "flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.28em]",
            dark ? "text-white/45" : "text-[#6f7c74]",
          )}
        >
          <span>coding workspace</span>
          <span>{selectedLanguage.label}</span>
          {savedLessonId ? (
            <span>linked to saved lesson</span>
          ) : (
            <span>draft mode</span>
          )}
        </div>
        <div className="mt-3 font-display text-2xl font-semibold uppercase">
          Interactive coding
        </div>
        <div
          className={cn(
            "mt-3 text-sm leading-7",
            dark ? "text-white/70" : "text-[#55645a]",
          )}
        >
          Pick a coding problem in the left strip, edit starter code, run or
          submit against test cases, then ask AI for improvement suggestions.
        </div>
      </div>

      {!savedLessonId ? (
        <div className="space-y-4">
          <div
            className={cn(
              "rounded-[28px] border border-dashed p-6 text-sm",
              dark
                ? "border-white/10 bg-white/[0.03] text-white/55"
                : "border-[#c6d2c4] bg-[#f3f7f1] text-[#6b7b72]",
            )}
          >
            This lesson is still a draft. Save lesson first to activate
            run/submit APIs and persistent code sessions.
          </div>
          {tasks.length
            ? tasks.map((task, index) => (
                <article
                  className={cn(
                    "rounded-[30px] border p-6",
                    dark
                      ? "border-white/10 bg-white/[0.04]"
                      : "border-[#c6d2c4] bg-[#f4f8f1]",
                  )}
                  key={`${getString(task.title)}-${index}`}
                >
                  <div
                    className={cn(
                      "flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.26em]",
                      dark ? "text-white/45" : "text-[#6f7c74]",
                    )}
                  >
                    <span>coding exercise</span>
                    {getString(task.difficulty) ? (
                      <span>{getString(task.difficulty)}</span>
                    ) : null}
                  </div>
                  <div className="mt-3 font-display text-2xl font-semibold uppercase">
                    {getString(task.title, `Task ${index + 1}`)}
                  </div>
                  <div
                    className={cn(
                      "mt-4 text-sm leading-7",
                      dark ? "text-white/75" : "text-[#49584f]",
                    )}
                  >
                    {getString(
                      task.instructions,
                      getString(
                        task.description,
                        "No task description provided.",
                      ),
                    )}
                  </div>
                  {getString(task.starting_code) ? (
                    <pre
                      className={cn(
                        "mt-4 overflow-x-auto rounded-[22px] border p-4 text-xs leading-6",
                        dark
                          ? "border-white/10 bg-black/25 text-white/75"
                          : "border-[#d1dbcf] bg-[#eef4ec] text-[#49584f]",
                      )}
                    >
                      {getString(task.starting_code)}
                    </pre>
                  ) : null}
                </article>
              ))
            : null}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div
              className={cn(
                "rounded-[28px] border p-4",
                dark
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-[#c6d2c4] bg-[#f4f8f1]",
              )}
            >
              <div
                className={cn(
                  "font-pixel text-[9px] uppercase tracking-[0.2em]",
                  dark ? "text-white/45" : "text-[#6f7c74]",
                )}
              >
                Coding bar
              </div>
              <div className="mt-3 space-y-2">
                {codingProblems.length ? (
                  codingProblems.map((problem) => (
                    <button
                      className={cn(
                        "w-full border px-3 py-3 text-left transition",
                        selectedProblemId === problem.id
                          ? dark
                            ? "border-[#69daff] bg-[#09151a] text-[#b9f2ff]"
                            : "border-[#8cb6c6] bg-[#edf5f7] text-[#2f5966]"
                          : dark
                            ? "border-[#262626] bg-[#05070a] text-white/70 hover:border-[#4b5563] hover:bg-[#111315]"
                            : "border-[#c6d2c4] bg-[#f8fbf5] text-[#49584f] hover:border-[#9db09f] hover:bg-[#edf3ea]",
                      )}
                      key={problem.id}
                      onClick={() => setSelectedProblemId(problem.id)}
                      type="button"
                    >
                      <div className="font-display text-sm font-semibold uppercase leading-5">
                        {problem.title}
                      </div>
                      <div
                        className={cn(
                          "mt-1 text-[10px] uppercase tracking-[0.18em]",
                          dark ? "text-white/40" : "text-[#6f7c74]",
                        )}
                      >
                        {problem.language} ·{" "}
                        {problem.difficulty ?? "intermediate"}
                      </div>
                    </button>
                  ))
                ) : (
                  <div
                    className={cn(
                      "rounded-2xl border border-dashed p-3 text-xs",
                      dark
                        ? "border-white/10 text-white/55"
                        : "border-[#c6d2c4] text-[#6b7b72]",
                    )}
                  >
                    No coding problem has been linked yet.
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <PixelButton
                  disabled={generateCodingProblemsMutation.isPending}
                  onClick={() =>
                    generateCodingProblemsMutation.mutate({
                      lessonId: savedLessonId,
                      payload: {
                        decision_mode: "force",
                        max_problems: Math.max(
                          1,
                          Math.min(5, tasks.length || 2),
                        ),
                      },
                    })
                  }
                  theme={theme}
                  tone="cyan"
                >
                  {generateCodingProblemsMutation.isPending
                    ? "Generating..."
                    : "Refresh Coding Tasks"}
                </PixelButton>
              </div>
            </div>

            <div
              className={cn(
                "rounded-[28px] border p-4",
                dark
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-[#c6d2c4] bg-[#f4f8f1]",
              )}
            >
              <div
                className={cn(
                  "font-pixel text-[9px] uppercase tracking-[0.2em]",
                  dark ? "text-white/45" : "text-[#6f7c74]",
                )}
              >
                Attempts
              </div>
              <div className="mt-3 space-y-2">
                {attempts.length ? (
                  attempts.map((attempt) => (
                    <div
                      className={cn(
                        "rounded-2xl border p-3",
                        dark
                          ? "border-white/10 bg-black/25"
                          : "border-[#d1dbcf] bg-[#eef4ec]",
                      )}
                      key={attempt.id}
                    >
                      <div
                        className={cn(
                          "text-[10px] uppercase tracking-[0.2em]",
                          dark ? "text-white/45" : "text-[#6f7c74]",
                        )}
                      >
                        {attempt.mode} · {attempt.overall_status ?? "unknown"}
                      </div>
                      <div
                        className={cn(
                          "mt-1 text-sm",
                          dark ? "text-white/75" : "text-[#49584f]",
                        )}
                      >
                        {attempt.passed_tests}/{attempt.total_tests} tests
                        passed
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className={cn(
                      "rounded-2xl border border-dashed p-3 text-xs",
                      dark
                        ? "border-white/10 text-white/55"
                        : "border-[#c6d2c4] text-[#6b7b72]",
                    )}
                  >
                    No attempts yet for this problem.
                  </div>
                )}
              </div>
            </div>
          </aside>

          <section className="space-y-4">
            <div
              className={cn(
                "rounded-[30px] border p-5",
                dark
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-[#c6d2c4] bg-[#f4f8f1]",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div
                    className={cn(
                      "text-[11px] uppercase tracking-[0.24em]",
                      dark ? "text-white/45" : "text-[#6f7c74]",
                    )}
                  >
                    Code editor
                  </div>
                  <div className="mt-2 font-display text-xl font-semibold uppercase">
                    {activeProblem?.title ?? "Select a coding task"}
                  </div>
                </div>
                <div className="w-full max-w-[280px]">
                  <WorkspaceField label="Language / Highlight" theme={theme}>
                    <WorkspaceSelect
                      onChange={(event) => {
                        const previousLanguage = selectedLanguage;
                        const next = CODING_LANGUAGE_OPTIONS.find(
                          (option) => option.value === event.target.value,
                        );
                        if (!next) {
                          return;
                        }
                        const previousTemplate = resolveStarterCodeForLanguage(
                          previousLanguage.value,
                          activeProblem
                            ? {
                                language: activeProblem.language,
                                language_id: activeProblem.language_id,
                                starter_code: activeProblem.starter_code,
                              }
                            : null,
                        );
                        const nextTemplate = resolveStarterCodeForLanguage(
                          next.value,
                          activeProblem
                            ? {
                                language: activeProblem.language,
                                language_id: activeProblem.language_id,
                                starter_code: activeProblem.starter_code,
                              }
                            : null,
                        );
                        setSelectedLanguage(next);
                        setSourceCode((current) => {
                          if (!current.trim() || current === previousTemplate) {
                            return nextTemplate;
                          }
                          return current;
                        });
                      }}
                      theme={theme}
                      value={selectedLanguage.value}
                    >
                      {CODING_LANGUAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} · Judge0 #{option.judge0Id}
                        </option>
                      ))}
                    </WorkspaceSelect>
                  </WorkspaceField>
                </div>
              </div>
              {activeProblem?.instructions ? (
                <div
                  className={cn(
                    "mt-3 text-sm leading-7",
                    dark ? "text-white/75" : "text-[#49584f]",
                  )}
                >
                  {activeProblem.instructions}
                </div>
              ) : null}
              <div className="mt-4">
                <div
                  className={cn(
                    "overflow-hidden rounded-[20px] border",
                    dark
                      ? "border-[#2a2a2a] bg-[#05070a]"
                      : "border-[#c6d2c4] bg-[#fbfdf8]",
                  )}
                >
                  <MonacoEditor
                    height="440px"
                    language={selectedLanguage.monacoLanguage}
                    onChange={(value) => setSourceCode(value ?? "")}
                    onMount={onEditorMount}
                    options={{
                      automaticLayout: true,
                      cursorBlinking: "smooth",
                      fontFamily: "Consolas, 'Courier New', monospace",
                      fontLigatures: false,
                      fontSize: 14,
                      formatOnPaste: true,
                      formatOnType: true,
                      insertSpaces: true,
                      lineNumbers: "on",
                      minimap: { enabled: true },
                      padding: { top: 12 },
                      quickSuggestions: {
                        comments: true,
                        other: true,
                        strings: true,
                      },
                      renderLineHighlight: "all",
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                      tabCompletion: "on",
                      tabSize: 2,
                      wordWrap: "on",
                    }}
                    theme={dark ? "vs-dark" : "vs"}
                    value={sourceCode}
                  />
                </div>
                <div
                  className={cn(
                    "mt-2 text-[11px] uppercase tracking-[0.18em]",
                    dark ? "text-white/45" : "text-[#6f7c74]",
                  )}
                >
                  VSCode-style shortcuts: Tab/Shift+Tab indent, Ctrl+Space
                  suggest, Shift+Alt+F format.
                </div>
              </div>
              <div className="mt-4">
                <WorkspaceField label="Custom Input (stdin)" theme={theme}>
                  <WorkspaceTextarea
                    className="min-h-[96px] font-mono text-xs leading-6"
                    onChange={(event) => setStdin(event.target.value)}
                    placeholder="Optional stdin for Run action"
                    spellCheck={false}
                    theme={theme}
                    value={stdin}
                  />
                </WorkspaceField>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <PixelButton
                  disabled={
                    runCodingProblemMutation.isPending || !selectedProblemId
                  }
                  onClick={() => void runCode()}
                  theme={theme}
                  tone="cyan"
                >
                  {runCodingProblemMutation.isPending
                    ? "Running..."
                    : "Run Code"}
                </PixelButton>
                <PixelButton
                  disabled={!selectedProblemId}
                  hollow
                  onClick={() => void formatCode()}
                  theme={theme}
                  tone="cyan"
                >
                  Format Code
                </PixelButton>
                <PixelButton
                  disabled={isSubmittingCode || !selectedProblemId}
                  onClick={() => void submitCode()}
                  theme={theme}
                >
                  {isSubmittingCode ? "Submitting..." : "Submit Tests"}
                </PixelButton>
                <PixelButton
                  disabled={!selectedProblemId}
                  hollow
                  onClick={() =>
                    setSourceCode(
                      resolveStarterCodeForLanguage(
                        selectedLanguage.value,
                        activeProblem ?? null,
                      ),
                    )
                  }
                  theme={theme}
                  tone="cyan"
                >
                  Load Starter
                </PixelButton>
                <PixelButton
                  disabled={
                    upsertCodingSessionMutation.isPending || !selectedProblemId
                  }
                  hollow
                  onClick={() => void saveSession()}
                  theme={theme}
                  tone="purple"
                >
                  {upsertCodingSessionMutation.isPending
                    ? "Saving..."
                    : "Save Code"}
                </PixelButton>
                <PixelButton
                  disabled={
                    recommendationMutation.isPending || !sourceCode.trim()
                  }
                  hollow
                  onClick={() => void getRecommendation()}
                  theme={theme}
                  tone="cyan"
                >
                  {recommendationMutation.isPending
                    ? "Analyzing..."
                    : "AI Recommend"}
                </PixelButton>
              </div>
              {localMessage ? (
                <div
                  className={cn(
                    "mt-3 text-xs",
                    dark ? "text-[#9cff93]" : "text-[#5f8c61]",
                  )}
                >
                  {localMessage}
                </div>
              ) : null}
              {runCodingProblemMutation.isError ? (
                <div className="mt-3 text-sm text-rose-300">
                  {runCodingProblemMutation.error.message}
                </div>
              ) : null}
              {submitCodingProblemMutation.isError ? (
                <div className="mt-3 text-sm text-rose-300">
                  {submitCodingProblemMutation.error.message}
                </div>
              ) : null}
              {submitCodingProblemStreamMutation.isError ? (
                <div className="mt-3 text-sm text-rose-300">
                  {submitCodingProblemStreamMutation.error.message}
                </div>
              ) : null}
              {recommendationMutation.isError ? (
                <div className="mt-3 text-sm text-rose-300">
                  {recommendationMutation.error.message}
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div
                className={cn(
                  "rounded-[28px] border p-5",
                  dark
                    ? "border-white/10 bg-white/[0.04]"
                    : "border-[#c6d2c4] bg-[#f4f8f1]",
                )}
              >
                <div
                  className={cn(
                    "text-[11px] uppercase tracking-[0.24em]",
                    dark ? "text-white/45" : "text-[#6f7c74]",
                  )}
                >
                  Test cases
                </div>
                <div className="mt-3 space-y-3">
                  {testCases.length ? (
                    testCases.map((testCase, index) => {
                      const caseResult = submitResultByCaseIndex.get(index + 1);

                      return (
                        <div
                          className={cn(
                            "rounded-2xl border p-3 text-xs",
                            dark
                              ? "border-white/10 bg-black/25"
                              : "border-[#d1dbcf] bg-[#eef4ec]",
                          )}
                          key={`${testCase.expected_output}-${index}`}
                        >
                          <div
                            className={cn(
                              "uppercase tracking-[0.2em]",
                              dark ? "text-white/45" : "text-[#6f7c74]",
                            )}
                          >
                            Case {index + 1}
                          </div>
                          <div
                            className={cn(
                              "mt-2",
                              dark ? "text-white/80" : "text-[#49584f]",
                            )}
                          >
                            input:{" "}
                            {testCase.is_hidden
                              ? "<hidden>"
                              : testCase.input || "<empty>"}
                          </div>
                          <div
                            className={cn(
                              "mt-1",
                              dark ? "text-white/80" : "text-[#49584f]",
                            )}
                          >
                            expected:{" "}
                            {testCase.is_hidden
                              ? "<hidden>"
                              : testCase.expected_output}
                          </div>
                          {caseResult ? (
                            <div
                              className={cn(
                                "mt-1",
                                dark ? "text-white/80" : "text-[#49584f]",
                              )}
                            >
                              status: {caseResult.status ?? "running"} ·{" "}
                              {caseResult.passed ? "passed" : "failed"}
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  ) : (
                    <div
                      className={cn(
                        "rounded-2xl border border-dashed p-3 text-xs",
                        dark
                          ? "border-white/10 text-white/55"
                          : "border-[#c6d2c4] text-[#6b7b72]",
                      )}
                    >
                      Test cases are not available yet.
                    </div>
                  )}
                </div>
              </div>

              <div
                className={cn(
                  "rounded-[28px] border p-5",
                  dark
                    ? "border-white/10 bg-white/[0.04]"
                    : "border-[#c6d2c4] bg-[#f4f8f1]",
                )}
              >
                <div
                  className={cn(
                    "text-[11px] uppercase tracking-[0.24em]",
                    dark ? "text-white/45" : "text-[#6f7c74]",
                  )}
                >
                  Execution output
                </div>
                <div className="mt-3 space-y-3 text-xs">
                  <div
                    className={cn(
                      "rounded-2xl border p-3",
                      dark
                        ? "border-white/10 bg-black/25"
                        : "border-[#d1dbcf] bg-[#eef4ec]",
                    )}
                  >
                    <div
                      className={cn(
                        "uppercase tracking-[0.2em]",
                        dark ? "text-white/45" : "text-[#6f7c74]",
                      )}
                    >
                      Run result
                    </div>
                    <pre
                      className={cn(
                        "mt-2 whitespace-pre-wrap",
                        dark ? "text-white/80" : "text-[#49584f]",
                      )}
                    >
                      {runResult
                        ? `status: ${runResult.status ?? "unknown"}\nstdout: ${runResult.stdout ?? ""}\nstderr: ${runResult.stderr ?? ""}`
                        : "Run code to see output."}
                    </pre>
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl border p-3",
                      dark
                        ? "border-white/10 bg-black/25"
                        : "border-[#d1dbcf] bg-[#eef4ec]",
                    )}
                  >
                    <div
                      className={cn(
                        "uppercase tracking-[0.2em]",
                        dark ? "text-white/45" : "text-[#6f7c74]",
                      )}
                    >
                      Submit result
                    </div>
                    <pre
                      className={cn(
                        "mt-2 whitespace-pre-wrap",
                        dark ? "text-white/80" : "text-[#49584f]",
                      )}
                    >
                      {effectiveSubmitResult
                        ? `status: ${effectiveSubmitResult.status ?? "unknown"}\npassed: ${effectiveSubmitResult.passed_tests}/${effectiveSubmitResult.total_tests}`
                        : "Submit tests to see verdict."}
                    </pre>
                    <div
                      className={cn(
                        "mt-3 text-[11px] uppercase tracking-[0.18em]",
                        dark ? "text-white/45" : "text-[#6f7c74]",
                      )}
                    >
                      realtime: {submitStreamStatus ?? "idle"} ·{" "}
                      {submitStreamPassedTests}/{submitStreamTotalTests || 0}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl border p-3",
                      dark
                        ? "border-white/10 bg-black/25"
                        : "border-[#d1dbcf] bg-[#eef4ec]",
                    )}
                  >
                    <div
                      className={cn(
                        "uppercase tracking-[0.2em]",
                        dark ? "text-white/45" : "text-[#6f7c74]",
                      )}
                    >
                      AI recommendations
                    </div>
                    <div
                      className={cn(
                        "mt-2 whitespace-pre-wrap text-sm leading-6",
                        dark ? "text-white/75" : "text-[#49584f]",
                      )}
                    >
                      {recommendationText ||
                        "Use AI Recommend to get improvement suggestions while coding."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

type MindmapDisplayNode = {
  children: MindmapDisplayNode[];
  color?: string;
  id: string;
  name: string;
};

function parseMindmapDisplayNode(
  value: unknown,
  fallbackId: string,
): MindmapDisplayNode | null {
  const record = getRecord(value);
  if (!record) {
    return null;
  }

  const parsedChildren = getArray(record.children)
    .map((child, index) =>
      parseMindmapDisplayNode(child, `${fallbackId}_${index}`),
    )
    .filter((child): child is MindmapDisplayNode => Boolean(child));

  const name =
    getString(record.name).trim() ||
    getString(record.label).trim() ||
    getString(record.title).trim() ||
    "Untitled node";
  const id = getString(record.id, fallbackId) || fallbackId;
  const color = getString(record.color).trim() || undefined;

  return {
    children: parsedChildren,
    color,
    id,
    name,
  };
}

function normalizeMindmapRoot(value: unknown): MindmapDisplayNode | null {
  let source: unknown = value;

  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      return null;
    }
  }

  if (Array.isArray(source)) {
    const children = source
      .map((item, index) => parseMindmapDisplayNode(item, `root_${index}`))
      .filter((item): item is MindmapDisplayNode => Boolean(item));
    return {
      children,
      id: "root",
      name: "Mind Map",
    };
  }

  const sourceRecord = getRecord(source);
  if (!sourceRecord) {
    return null;
  }

  const nodes = getArray(sourceRecord.nodes)
    .map((item, index) => parseMindmapDisplayNode(item, `root_${index}`))
    .filter((item): item is MindmapDisplayNode => Boolean(item));
  if (nodes.length && !getString(sourceRecord.name).trim()) {
    return {
      children: nodes,
      id: "root",
      name: "Mind Map",
    };
  }

  return parseMindmapDisplayNode(sourceRecord, "root");
}

function buildMindmapColumns(root: MindmapDisplayNode) {
  const columns: MindmapDisplayNode[][] = [];
  let currentLevel: MindmapDisplayNode[] = [root];

  while (currentLevel.length) {
    columns.push(currentLevel);
    const nextLevel: MindmapDisplayNode[] = [];
    currentLevel.forEach((node) => {
      nextLevel.push(...node.children);
    });
    currentLevel = nextLevel;
  }

  return columns;
}

function MindmapTreeNode({
  depth = 0,
  node,
  theme,
}: {
  depth?: number;
  node: MindmapDisplayNode;
  theme: CyberTheme;
}) {
  const dark = theme === "dark";

  return (
    <div
      className={cn(
        "pl-4",
        depth > 0
          ? dark
            ? "ml-2 border-l border-white/10"
            : "ml-2 border-l border-[#d1dbcf]"
          : "",
      )}
    >
      <div
        className={cn(
          "rounded-[18px] border px-4 py-3",
          dark
            ? "bg-black/20"
            : "border-[#d1dbcf] bg-[#eef4ec] text-[#243127]",
        )}
        style={node.color ? { borderColor: node.color } : undefined}
      >
        <div className="font-display text-sm font-semibold uppercase">
          {node.name}
        </div>
        <div
          className={cn(
            "mt-1 text-[10px] uppercase tracking-[0.2em]",
            dark ? "text-white/40" : "text-[#6f7c74]",
          )}
        >
          {node.children.length} child{node.children.length === 1 ? "" : "ren"}
        </div>
      </div>
      {node.children.length ? (
        <div className="mt-3 space-y-3">
          {node.children.map((childNode) => (
            <MindmapTreeNode
              depth={depth + 1}
              key={childNode.id}
              node={childNode}
              theme={theme}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MindmapPage({
  page,
  theme,
}: {
  page: LessonPage;
  theme: CyberTheme;
}) {
  const data = getRecord(page.data) ?? {};
  const rawMindmap = data.visualization ?? data.mindmap ?? data;
  const root = normalizeMindmapRoot(rawMindmap);
  const dark = theme === "dark";

  if (!root) {
    return (
      <div
        className={cn(
          "rounded-[32px] border p-6",
          dark
            ? "border-white/10 bg-white/[0.04]"
            : "border-[#c6d2c4] bg-[#f4f8f1]",
        )}
      >
        <div
          className={cn(
            "text-[11px] uppercase tracking-[0.3em]",
            dark ? "text-white/45" : "text-[#6f7c74]",
          )}
        >
          Mind map
        </div>
        <div
          className={cn(
            "mt-4 rounded-[24px] border border-dashed p-5 text-sm",
            dark
              ? "border-white/10 bg-black/25 text-white/60"
              : "border-[#d1dbcf] bg-[#eef4ec] text-[#55645a]",
          )}
        >
          Mind map data format is invalid, showing raw payload:
        </div>
        <pre
          className={cn(
            "mt-4 overflow-x-auto rounded-[24px] p-5 text-xs leading-6",
            dark ? "bg-black/25 text-white/70" : "bg-[#eef4ec] text-[#49584f]",
          )}
        >
          {JSON.stringify(rawMindmap, null, 2)}
        </pre>
      </div>
    );
  }

  const columns = buildMindmapColumns(root);

  return (
    <div className="space-y-5">
      <div
        className={cn(
          "rounded-[30px] border p-5",
          dark
            ? "border-white/10 bg-white/[0.04]"
            : "border-[#c6d2c4] bg-[#f4f8f1]",
        )}
      >
        <div
          className={cn(
            "text-[11px] uppercase tracking-[0.3em]",
            dark ? "text-white/45" : "text-[#6f7c74]",
          )}
        >
          Mind map
        </div>
        <div className="mt-2 font-display text-2xl font-semibold uppercase">
          {root.name}
        </div>
        <div className={cn("mt-2 text-sm", dark ? "text-white/65" : "text-[#55645a]")}>
          Pixel view of lesson hierarchy, rendered from backend mindmap data.
        </div>
      </div>

      <div
        className={cn(
          "rounded-[30px] border p-5",
          dark
            ? "border-white/10 bg-white/[0.04]"
            : "border-[#c6d2c4] bg-[#f4f8f1]",
        )}
      >
        <div
          className={cn(
            "text-[11px] uppercase tracking-[0.24em]",
            dark ? "text-white/45" : "text-[#6f7c74]",
          )}
        >
          Level map
        </div>
        <div className="mt-4 overflow-x-auto">
          <div className="flex min-w-max gap-4 pb-1">
            {columns.map((column, columnIndex) => (
              <div
                className={cn(
                  "w-[260px] shrink-0 rounded-[22px] border p-4",
                  dark
                    ? "border-white/10 bg-black/20"
                    : "border-[#d1dbcf] bg-[#eef4ec]",
                )}
                key={`level_${columnIndex}`}
              >
                <div
                  className={cn(
                    "font-pixel text-[9px] uppercase tracking-[0.2em]",
                    dark ? "text-white/45" : "text-[#6f7c74]",
                  )}
                >
                  Level {columnIndex + 1}
                </div>
                <div className="mt-3 space-y-3">
                  {column.map((node) => (
                    <div
                      className={cn(
                        "rounded-[16px] border px-3 py-3",
                        dark
                          ? "bg-white/[0.03]"
                          : "border-[#d1dbcf] bg-[#f8fbf5] text-[#243127]",
                      )}
                      key={node.id}
                      style={
                        node.color ? { borderColor: node.color } : undefined
                      }
                    >
                      <div className="font-display text-sm font-semibold uppercase leading-5">
                        {node.name}
                      </div>
                      <div
                        className={cn(
                          "mt-1 text-[10px] uppercase tracking-[0.18em]",
                          dark ? "text-white/40" : "text-[#6f7c74]",
                        )}
                      >
                        {node.children.length} branch
                        {node.children.length === 1 ? "" : "es"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "rounded-[30px] border p-5",
          dark
            ? "border-white/10 bg-white/[0.04]"
            : "border-[#c6d2c4] bg-[#f4f8f1]",
        )}
      >
        <div
          className={cn(
            "text-[11px] uppercase tracking-[0.24em]",
            dark ? "text-white/45" : "text-[#6f7c74]",
          )}
        >
          Tree view
        </div>
        <div className="mt-4">
          <MindmapTreeNode node={root} theme={theme} />
        </div>
      </div>
    </div>
  );
}

function LessonViewer({
  activePageId,
  completedPageIds,
  createFlashcardMutationPending,
  isSavingProgress,
  lesson,
  onBackToModules,
  onCreateFlashcard,
  onLaunchReview,
  onMarkComplete,
  onSelectPage,
  theme,
}: {
  activePageId: string;
  completedPageIds: string[];
  createFlashcardMutationPending: boolean;
  isSavingProgress: boolean;
  lesson: ActiveLesson;
  onBackToModules?: () => void;
  onCreateFlashcard: (question: string, answer: string) => void;
  onLaunchReview: () => void;
  onMarkComplete: () => void;
  onSelectPage: (pageId: string) => void;
  theme: CyberTheme;
}) {
  const dark = theme === "dark";
  const activePage =
    lesson.pages.find((page) => page.page_id === activePageId) ??
    lesson.pages[0];
  const completedCount = uniqueStrings(completedPageIds).length;
  const progressPercent = isSavedLesson(lesson)
    ? Math.round(lesson.progress.progress_percent)
    : computeDraftProgressPercent(lesson, completedPageIds);

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "rounded-[36px] border p-6 lg:p-7",
          dark
            ? "border-white/10 bg-[linear-gradient(135deg,rgba(156,255,147,0.14),rgba(105,218,255,0.06)_42%,rgba(255,255,255,0.02))]"
            : "border-[#c6d2c4] bg-[linear-gradient(135deg,rgba(143,183,145,0.18),rgba(140,182,198,0.12)_42%,rgba(255,255,255,0.42))]",
        )}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className={cn("text-[11px] uppercase tracking-[0.3em]", dark ? "text-white/45" : "text-[#6f7c74]")}>
              {lesson.topic}
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase leading-tight">
              {lesson.title}
            </h2>
            <div className={cn("mt-3 max-w-3xl text-sm leading-7", dark ? "text-white/70" : "text-[#49584f]")}>
              {activePage.description ||
                "Navigate each page to move from theory into quiz and flashcard practice."}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatBadge
              label="Pages"
              value={`${completedCount}/${lesson.navigation.total_pages}`}
              theme={theme}
            />
            <StatBadge
              label="Progress"
              tone="cyan"
              value={`${progressPercent}%`}
              theme={theme}
            />
            <StatBadge
              label="Mode"
              tone="purple"
              value={isSavedLesson(lesson) ? "Saved lesson" : "Generated draft"}
              theme={theme}
            />
          </div>
        </div>
        {onBackToModules ? (
          <div className={cn("mt-6 flex justify-end border-t pt-4", dark ? "border-white/10" : "border-[#d3ddd1]")}>
            <button
              onClick={onBackToModules}
              className={cn(
                "group flex items-center gap-2 font-pixel text-[10px] uppercase tracking-[0.2em] transition-colors",
                dark
                  ? "text-white/50 hover:text-white/80"
                  : "text-[#6f7c74] hover:text-[#243127]",
              )}
            >
              <span className="transition-transform group-hover:-translate-x-1">
                ←
              </span>
              <span>Back to subjects</span>
            </button>
          </div>
        ) : null}
      </div>
      <LessonPageTabs
        activePageId={activePage.page_id}
        completedPageIds={completedPageIds}
        onSelect={onSelectPage}
        pages={lesson.pages}
        theme={theme}
      />
      <div
        className={cn(
          "rounded-[36px] border p-6 lg:p-7",
          dark
            ? "border-white/10 bg-white/[0.04]"
            : "border-[#c6d2c4] bg-[#f4f8f1]",
        )}
      >
        <div className={cn("mb-6 flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-center lg:justify-between", dark ? "border-white/10" : "border-[#d3ddd1]")}>
          <div>
            <div className={cn("text-[11px] uppercase tracking-[0.3em]", dark ? "text-white/45" : "text-[#6f7c74]")}>
              {activePage.page_type}
            </div>
            <div className="mt-2 font-display text-2xl font-semibold uppercase">
              {activePage.title}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <PixelButton
              disabled={
                completedPageIds.includes(activePage.page_id) ||
                isSavingProgress
              }
              onClick={onMarkComplete}
              theme={theme}
              tone="cyan"
            >
              {isSavingProgress ? "Saving..." : "Mark Complete"}
            </PixelButton>
          </div>
        </div>
        {activePage.page_type === "overview" ? (
          <OverviewPage page={activePage} theme={theme} />
        ) : null}
        {activePage.page_type === "theory" ? (
          <TheoryPage page={activePage} theme={theme} />
        ) : null}
        {activePage.page_type === "flashcards" ? (
          <FlashcardsPage
            onCreateFlashcard={onCreateFlashcard}
            page={activePage}
            theme={theme}
          />
        ) : null}
        {activePage.page_type === "quiz" ? (
          <QuizPage
            lesson={lesson}
            onLaunchReview={onLaunchReview}
            page={activePage}
            theme={theme}
          />
        ) : null}
        {activePage.page_type === "resources" ? (
          <ResourcesPage page={activePage} theme={theme} />
        ) : null}
        {activePage.page_type === "coding" ? (
          <CodingPage lesson={lesson} page={activePage} theme={theme} />
        ) : null}
        {activePage.page_type === "mindmap" ? (
          <MindmapPage page={activePage} theme={theme} />
        ) : null}
        {createFlashcardMutationPending ? (
          <div className={cn("mt-5 text-sm", dark ? "text-white/55" : "text-[#6b7b72]")}>
            Saving lesson flashcard into your personal deck...
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function HomeLearningWorkspace({ theme }: { theme: CyberTheme }) {
  const router = useRouter();
  const session = useSessionQuery();
  const statsQuery = useBackendMyStatsQuery();
  const savedLessonsQuery = useBackendSavedLessonsQuery({ limit: 24 });
  const generateLessonMutation = useBackendGenerateLessonMutation();
  const saveLessonMutation = useBackendSaveLessonMutation();
  const updateLessonProgressMutation = useBackendUpdateLessonProgressMutation();
  const createFlashcardMutation = useBackendCreateFlashcardMutation();
  const [builder, setBuilder] = useState(defaultBuilderState);
  const [builderError, setBuilderError] = useState<string | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [pendingDraftDestination, setPendingDraftDestination] = useState("");
  const [showUnsavedDraftPrompt, setShowUnsavedDraftPrompt] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const pendingDraftActionRef = useRef<PendingDraftAction | null>(null);
  const [draftLesson, setDraftLesson] =
    useState<LessonGenerationResponse | null>(null);
  const [selectedSavedLessonId, setSelectedSavedLessonId] = useState<
    string | null
  >(() => readSelectedLessonId());
  const [showModules, setShowModules] = useState(true);
  const resolvedSavedLessonId =
    !draftLesson && savedLessonsQuery.data?.length
      ? savedLessonsQuery.data.some(
          (lesson) => lesson.id === selectedSavedLessonId,
        )
        ? selectedSavedLessonId
        : savedLessonsQuery.data[0].id
      : selectedSavedLessonId;
  const savedLessonDetailQuery = useBackendSavedLessonQuery(
    resolvedSavedLessonId,
    {
      enabled: Boolean(resolvedSavedLessonId),
    },
  );
  const [activePageId, setActivePageId] = useState("");
  const [draftCompletedPageIds, setDraftCompletedPageIds] = useState<string[]>(
    [],
  );
  const modules = groupLessonsByTopic(savedLessonsQuery.data);
  const activeLesson = draftLesson
    ? draftLesson
    : resolvedSavedLessonId
      ? (savedLessonDetailQuery.data ?? null)
      : null;
  const stats = getRecord(statsQuery.data) ?? {};

  const completedPageIds = getLessonCompletedPageIds(
    activeLesson,
    draftCompletedPageIds,
  );
  const displayedPageId = activeLesson?.pages.some(
    (page) => page.page_id === activePageId,
  )
    ? activePageId
    : getLessonCurrentPageId(activeLesson, "");
  const activeTopic = resolvedSavedLessonId
    ? (savedLessonDetailQuery.data?.topic ??
      savedLessonsQuery.data?.find(
        (lesson) => lesson.id === resolvedSavedLessonId,
      )?.topic ??
      null)
    : (draftLesson?.topic ?? null);

  useEffect(() => {
    if (!draftLesson) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [draftLesson]);

  const clearPendingDraftAction = () => {
    pendingDraftActionRef.current = null;
    setPendingDraftDestination("");
    setShowUnsavedDraftPrompt(false);
  };

  const runPendingDraftAction = async (
    savedLesson: SavedLessonDetail | null,
  ) => {
    const action = pendingDraftActionRef.current;
    clearPendingDraftAction();

    if (action) {
      await action(savedLesson);
    }
  };

  const requestDraftAction = (
    destinationLabel: string,
    action: PendingDraftAction,
  ) => {
    if (!draftLesson) {
      void action(null);
      return;
    }

    pendingDraftActionRef.current = action;
    setPendingDraftDestination(destinationLabel);
    setShowUnsavedDraftPrompt(true);
  };

  const generateLesson = async () => {
    const validationMessage = validateLessonBuilderState(builder);

    if (validationMessage) {
      setBuilderError(validationMessage);
      return;
    }

    setBuilderError(null);

    const payload: LessonGeneratePayload = {
      current_level: builder.current_level,
      daily_study_time_minutes: builder.daily_study_time_minutes,
      files: selectedFiles.length ? selectedFiles : undefined,
      include_answer_key: builder.include_answer_key,
      include_coding_exercises: builder.include_coding_exercises,
      include_mindmap: builder.include_mindmap,
      include_external_sources: builder.include_external_sources,
      external_search_query: builder.include_external_sources
        ? builder.external_search_query.trim() || undefined
        : undefined,
      max_external_sources: builder.include_external_sources
        ? builder.max_external_sources
        : 0,
      learning_objectives: builder.learningObjectives.trim() || undefined,
      learning_pace: builder.learning_pace,
      learning_style: builder.learning_style,
      max_quiz_questions: builder.max_quiz_questions,
      prompt: builder.prompt.trim(),
      quiz_question_types: builder.questionTypes.join(","),
      subject: builder.subject.trim() || undefined,
      subtopics: builder.subtopics.trim() || undefined,
      topic: builder.topic.trim() || undefined,
    };

    const lesson = await generateLessonMutation.mutateAsync(payload);
    setDraftLesson(lesson);
    setSelectedSavedLessonId(null);
    setDraftCompletedPageIds([]);
    setActivePageId(lesson.navigation.default_page_id);
    persistSelectedLessonId(null);
    setShowModules(false);
  };

  const saveLesson = async () => {
    if (!draftLesson) {
      return null;
    }

    const savedLesson = await saveLessonMutation.mutateAsync({
      completed_page_ids: completedPageIds,
      current_page_id: activePageId,
      execution_summary: draftLesson.execution_summary,
      navigation: draftLesson.navigation,
      pages: draftLesson.pages,
      prompt: draftLesson.prompt,
      quality_metrics: draftLesson.quality_metrics,
      source_documents: draftLesson.source_documents ?? [],
      title: draftLesson.title,
      topic: draftLesson.topic,
      workflow_issues: draftLesson.workflow_issues ?? [],
    });

    setDraftLesson(null);
    setSelectedSavedLessonId(savedLesson.id);
    setActivePageId(
      savedLesson.progress.current_page_id ??
        savedLesson.navigation.default_page_id,
    );
    persistSelectedLessonId(savedLesson.id);
    return savedLesson;
  };

  const saveLessonAndContinue = async () => {
    const savedLesson = await saveLesson();

    if (!savedLesson) {
      return;
    }

    await runPendingDraftAction(savedLesson);
  };

  const discardDraftAndContinue = async () => {
    setDraftLesson(null);
    setDraftCompletedPageIds([]);
    setActivePageId("");
    await runPendingDraftAction(null);
  };

  const stayOnDraft = () => {
    clearPendingDraftAction();
  };

  const navigateWithDraftGuard = (href: string) => {
    const destinationLabel =
      navigationItems.find((item) => item.href === href)?.label.toLowerCase() ??
      "continue";

    requestDraftAction(`open ${destinationLabel}`, () => {
      router.push(href);
    });
  };

  const updateSavedProgress = async (
    nextCurrentPageId: string,
    nextCompletedPageIds: string[],
  ) => {
    if (!activeLesson || !isSavedLesson(activeLesson)) {
      return;
    }

    await updateLessonProgressMutation.mutateAsync({
      lessonId: activeLesson.id,
      payload: {
        completed_page_ids: uniqueStrings(nextCompletedPageIds),
        current_page_id: nextCurrentPageId,
      },
    });
  };

  const selectPage = (pageId: string) => {
    startTransition(() => setActivePageId(pageId));

    if (activeLesson && isSavedLesson(activeLesson)) {
      void updateSavedProgress(pageId, completedPageIds);
    }
  };

  const markCurrentPageComplete = () => {
    if (!activeLesson) {
      return;
    }

    const nextCompleted = uniqueStrings([...completedPageIds, activePageId]);

    if (isSavedLesson(activeLesson)) {
      void updateSavedProgress(activePageId, nextCompleted);
      return;
    }

    setDraftCompletedPageIds(nextCompleted);
  };

  const launchLessonQuiz = () => {
    if (!activeLesson) {
      return;
    }

    const currentPage =
      activeLesson.pages.find((page) => page.page_id === displayedPageId) ??
      activeLesson.pages[0];

    if (currentPage.page_type !== "quiz") {
      return;
    }

    const reviewSession = buildReviewSessionFromLesson(
      activeLesson,
      currentPage,
      completedPageIds,
    );
    if (!reviewSession) {
      return;
    }

    if (reviewSession.sourceLessonId) {
      persistSelectedLessonId(reviewSession.sourceLessonId);
    }

    requestDraftAction("open interview mode", (savedLesson) => {
      const nextReviewSession =
        savedLesson && !reviewSession.sourceLessonId
          ? { ...reviewSession, sourceLessonId: savedLesson.id }
          : reviewSession;

      if (nextReviewSession.sourceLessonId) {
        persistSelectedLessonId(nextReviewSession.sourceLessonId);
      }

      persistReviewSession(nextReviewSession);
      router.push("/dashboard/review/quiz");
    });
  };

  return (
    <WorkspaceShell
      active="home"
      headerActions={
        <div className="flex flex-wrap gap-3">
          <ThemeToggle />
          {draftLesson ? (
            <StatBadge label="Status" tone="amber" value="Unsaved draft" theme={theme} />
          ) : null}
          <PixelButton
            onClick={() => setBuilderOpen((current) => !current)}
            theme={theme}
          >
            {builderOpen ? "Hide Create Lesson" : "Create Lesson"}
          </PixelButton>
          {draftLesson ? (
            <PixelButton
              disabled={saveLessonMutation.isPending}
              onClick={() => void saveLesson()}
              theme={theme}
              tone="cyan"
            >
              {saveLessonMutation.isPending ? "Saving..." : "Save Lesson"}
            </PixelButton>
          ) : null}
          <StatBadge
            label="Learner"
            value={getString(
              session.data?.full_name,
              session.data?.email ?? "Guest",
            )}
            theme={theme}
          />
          <StatBadge
            label="XP"
            tone="cyan"
            value={String(getNumber(stats.total_xp) ?? 0)}
            theme={theme}
          />
          <StatBadge
            label="Streak"
            tone="purple"
            value={`${getNumber(stats.current_streak) ?? 0} days`}
            theme={theme}
          />
        </div>
      }
      onNavigate={navigateWithDraftGuard}
      subtitle="Home · pixel lesson builder"
      theme={theme}
      title="Lesson Home"
    >
      <div className="space-y-8">
        {builderOpen ? (
          <section className="border border-[#262626] bg-[#0b0d0f] p-5 lg:p-6">
            <div className="flex flex-col gap-4 border-b border-[#262626] pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="font-pixel text-[9px] uppercase tracking-[0.2em] text-[#6b7280]">
                  CREATE_LESSON
                </div>
                <div className="mt-2 text-sm text-white/65">
                  Prompt, optionally upload documents, then generate a
                  multi-page lesson.
                </div>
              </div>
              <PixelButton
                disabled={
                  generateLessonMutation.isPending ||
                  builder.prompt.trim().length < MIN_LESSON_PROMPT_LENGTH
                }
                onClick={() => void generateLesson()}
                theme={theme}
              >
                {generateLessonMutation.isPending
                  ? "Generating..."
                  : "Run Generator"}
              </PixelButton>
            </div>
            <div className="mt-5 grid gap-4 xl:grid-cols-[1.45fr_1fr]">
              <div className="space-y-4">
                <WorkspaceField label="Prompt">
                  <WorkspaceTextarea
                    onChange={(event) =>
                      setBuilder((current) => ({
                        ...current,
                        prompt: event.target.value,
                      }))
                    }
                    placeholder="Describe the lesson you want, what the learner should know, and what documents should influence the answer."
                    rows={8}
                    value={builder.prompt}
                  />
                </WorkspaceField>
                <div className="grid gap-4 md:grid-cols-2">
                  <WorkspaceField label="Topic">
                    <WorkspaceInput
                      onChange={(event) =>
                        setBuilder((current) => ({
                          ...current,
                          topic: event.target.value,
                        }))
                      }
                      placeholder="Optional topic override"
                      value={builder.topic}
                    />
                  </WorkspaceField>
                  <WorkspaceField label="Subject">
                    <WorkspaceInput
                      onChange={(event) =>
                        setBuilder((current) => ({
                          ...current,
                          subject: event.target.value,
                        }))
                      }
                      placeholder="Optional subject"
                      value={builder.subject}
                    />
                  </WorkspaceField>
                </div>
                <WorkspaceField label="Subtopics">
                  <WorkspaceTextarea
                    onChange={(event) =>
                      setBuilder((current) => ({
                        ...current,
                        subtopics: event.target.value,
                      }))
                    }
                    placeholder="Comma-separated or line-separated subtopics"
                    rows={3}
                    value={builder.subtopics}
                  />
                </WorkspaceField>
                <WorkspaceField label="Learning objectives">
                  <WorkspaceTextarea
                    onChange={(event) =>
                      setBuilder((current) => ({
                        ...current,
                        learningObjectives: event.target.value,
                      }))
                    }
                    placeholder="What should the student achieve after finishing the lesson?"
                    rows={3}
                    value={builder.learningObjectives}
                  />
                </WorkspaceField>
              </div>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <WorkspaceField label="Level">
                    <WorkspaceSelect
                      onChange={(event) =>
                        setBuilder((current) => ({
                          ...current,
                          current_level: event.target
                            .value as BuilderState["current_level"],
                        }))
                      }
                      value={builder.current_level}
                    >
                      <option value="beginner">beginner</option>
                      <option value="intermediate">intermediate</option>
                      <option value="advanced">advanced</option>
                    </WorkspaceSelect>
                  </WorkspaceField>
                  <WorkspaceField label="Style">
                    <WorkspaceSelect
                      onChange={(event) =>
                        setBuilder((current) => ({
                          ...current,
                          learning_style: event.target
                            .value as BuilderState["learning_style"],
                        }))
                      }
                      value={builder.learning_style}
                    >
                      <option value="reading/writing">reading/writing</option>
                      <option value="visual">visual</option>
                      <option value="auditory">auditory</option>
                      <option value="kinesthetic">kinesthetic</option>
                    </WorkspaceSelect>
                  </WorkspaceField>
                  <WorkspaceField label="Pace">
                    <WorkspaceSelect
                      onChange={(event) =>
                        setBuilder((current) => ({
                          ...current,
                          learning_pace: event.target
                            .value as BuilderState["learning_pace"],
                        }))
                      }
                      value={builder.learning_pace}
                    >
                      <option value="slow">slow</option>
                      <option value="normal">normal</option>
                      <option value="fast">fast</option>
                    </WorkspaceSelect>
                  </WorkspaceField>
                  <WorkspaceField label="Daily minutes">
                    <WorkspaceInput
                      max={MAX_DAILY_STUDY_MINUTES}
                      min={MIN_DAILY_STUDY_MINUTES}
                      onChange={(event) =>
                        setBuilder((current) => ({
                          ...current,
                          daily_study_time_minutes: clampNumber(
                            Number(event.target.value || 30),
                            MIN_DAILY_STUDY_MINUTES,
                            MAX_DAILY_STUDY_MINUTES,
                            30,
                          ),
                        }))
                      }
                      type="number"
                      value={builder.daily_study_time_minutes}
                    />
                  </WorkspaceField>
                </div>
                <WorkspaceField label="Question types">
                  <div className="flex flex-wrap gap-2">
                    {(
                      ["multiple_choice", "fill_blank", "true_false"] as const
                    ).map((type) => (
                      <WorkspaceCheckbox
                        checked={builder.questionTypes.includes(type)}
                        key={type}
                        label={type.replaceAll("_", " ")}
                        onChange={(checked) =>
                          setBuilder((current) => ({
                            ...current,
                            questionTypes: checked
                              ? (uniqueStrings([
                                  ...current.questionTypes,
                                  type,
                                ]) as BuilderState["questionTypes"])
                              : (current.questionTypes.filter(
                                  (item) => item !== type,
                                ) as BuilderState["questionTypes"]),
                          }))
                        }
                      />
                    ))}
                  </div>
                </WorkspaceField>
                <WorkspaceField label="Files">
                  <WorkspaceInput
                    multiple
                    onChange={(event) =>
                      setSelectedFiles(Array.from(event.target.files ?? []))
                    }
                    type="file"
                  />
                </WorkspaceField>
                <div className="flex flex-wrap gap-2">
                  <WorkspaceCheckbox
                    checked={builder.include_mindmap}
                    label="Mindmap"
                    onChange={(checked) =>
                      setBuilder((current) => ({
                        ...current,
                        include_mindmap: checked,
                      }))
                    }
                  />
                  <WorkspaceCheckbox
                    checked={builder.include_coding_exercises}
                    label="Coding"
                    onChange={(checked) =>
                      setBuilder((current) => ({
                        ...current,
                        include_coding_exercises: checked,
                      }))
                    }
                  />
                  <WorkspaceCheckbox
                    checked={builder.include_answer_key}
                    label="Answer key"
                    onChange={(checked) =>
                      setBuilder((current) => ({
                        ...current,
                        include_answer_key: checked,
                      }))
                    }
                  />
                  <WorkspaceCheckbox
                    checked={builder.include_external_sources}
                    label="External sources"
                    onChange={(checked) =>
                      setBuilder((current) => ({
                        ...current,
                        include_external_sources: checked,
                      }))
                    }
                  />
                </div>
                {builder.include_external_sources && (
                  <div className="mt-2 grid gap-4 md:grid-cols-2">
                    <WorkspaceField label="External search query">
                      <WorkspaceInput
                        onChange={(event) =>
                          setBuilder((current) => ({
                            ...current,
                            external_search_query: event.target.value,
                          }))
                        }
                        placeholder="e.g. AI in education, quantum computing..."
                        value={builder.external_search_query}
                      />
                    </WorkspaceField>
                    <WorkspaceField label="Max external sources">
                      <WorkspaceInput
                        type="number"
                        min={1}
                        max={20}
                        onChange={(event) =>
                          setBuilder((current) => ({
                            ...current,
                            max_external_sources: clampNumber(
                              Number(event.target.value || 6),
                              1,
                              20,
                              6,
                            ),
                          }))
                        }
                        value={builder.max_external_sources}
                      />
                    </WorkspaceField>
                  </div>
                )}
              </div>
            </div>
            {builderError ? (
              <div className="mt-4 border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
                {builderError}
              </div>
            ) : null}
            {generateLessonMutation.isError ? (
              <div className="mt-4 border border-rose-500/30 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
                {generateLessonMutation.error.message}
              </div>
            ) : null}
            {saveLessonMutation.isError ? (
              <div className="mt-4 border border-rose-500/30 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
                {saveLessonMutation.error.message}
              </div>
            ) : null}
          </section>
        ) : null}
        {showModules ? (
          <>
            <section>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <div
                    className={cn(
                      "font-pixel text-[9px] uppercase tracking-[0.2em]",
                      theme === "dark" ? "text-white/45" : "text-[#6f7c74]",
                    )}
                  >
                    Subject modules
                  </div>
                  <div
                    className={cn(
                      "mt-2 text-sm",
                      theme === "dark" ? "text-white/60" : "text-[#54635a]",
                    )}
                  >
                    Saved lessons are grouped into modules so practice and
                    review can reuse the same topic clusters.
                  </div>
                </div>
              </div>
              <ModuleStrip
                activeTopic={activeTopic}
                modules={modules}
                onSelect={(topic) => {
                  const lesson = modules.find(
                    (module) => module.topic === topic,
                  )?.lessons[0];
                  if (!lesson) {
                    return;
                  }

                  requestDraftAction(`open lesson ${lesson.title}`, () => {
                    setSelectedSavedLessonId(lesson.id);
                    setActivePageId("");
                    persistSelectedLessonId(lesson.id);
                    setShowModules(false);
                  });
                }}
                theme={theme}
              />
            </section>
          </>
        ) : (
          <>
            {resolvedSavedLessonId && savedLessonDetailQuery.isPending ? (
              <section className="flex h-screen items-center justify-center">
                <div className="space-y-4 text-center">
                  <div className="inline-block">
                    <div  className={cn(
                      "h-12 w-12 animate-spin rounded-full border-4",
                      theme === "dark"
                        ? "border-white/20 border-t-[#69daff]"
                        : "border-[#d1d5db] border-t-[#0ea5e9]"
                    )} />
                  </div>
                  <div
                    className={cn(
                      "font-pixel text-[11px] uppercase tracking-[0.2em]",
                      theme === "dark" ? "text-white/60" : "text-[#6b7b72]",
                    )}
                  >
                    Loading lesson...
                  </div>
                </div>
              </section>
            ) : activeLesson ? (
              <section>
                <LessonViewer
                  activePageId={displayedPageId ?? activePageId}
                  completedPageIds={completedPageIds}
                  createFlashcardMutationPending={
                    createFlashcardMutation.isPending
                  }
                  isSavingProgress={updateLessonProgressMutation.isPending}
                  lesson={activeLesson}
                  onBackToModules={() => setShowModules(true)}
                  onCreateFlashcard={(question, answer) =>
                    createFlashcardMutation.mutate({
                      back_content: answer,
                      front_content: question,
                    })
                  }
                  onLaunchReview={launchLessonQuiz}
                  onMarkComplete={markCurrentPageComplete}
                  onSelectPage={selectPage}
                  theme={theme}
                />
              </section>
            ) : null}
          </>
        )}
      </div>
      <UnsavedDraftPrompt
        destinationLabel={pendingDraftDestination}
        isOpen={showUnsavedDraftPrompt}
        isSaving={saveLessonMutation.isPending}
        onDiscard={() => void discardDraftAndContinue()}
        onSave={() => void saveLessonAndContinue()}
        onStay={stayOnDraft}
      />
    </WorkspaceShell>
  );
}

export function PracticeLearningWorkspace({ theme }: { theme: CyberTheme }) {
  const dark = theme === "dark";
  const router = useRouter();
  const session = useSessionQuery();
  const savedLessonsQuery = useBackendSavedLessonsQuery({ limit: 24 });
  const dueFlashcardsQuery = useBackendDueFlashcardsQuery({ limit: 12 });
  const quizAttemptsQuery = useBackendQuizAttemptsQuery({ limit: 10 });
  const generateQuizMutation = useBackendGenerateQuizMutation();
  const submitReviewMutation = useBackendSubmitReviewMutation();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [quizForm, setQuizForm] = useState(defaultPracticeQuizFormState);
  const modules = groupLessonsByTopic(savedLessonsQuery.data).filter((module) =>
    module.topic.toLowerCase().includes(deferredSearch.trim().toLowerCase()),
  );
  const activeModule =
    modules.find((module) => module.topic === selectedTopic) ??
    modules[0] ??
    null;

  const launchPracticeQuiz = async (topic: string) => {
    const quiz = await generateQuizMutation.mutateAsync({
      current_level: quizForm.current_level,
      daily_study_time_minutes: quizForm.daily_study_time_minutes,
      include_debug: false,
      knowledge_gaps: [],
      learning_objectives: [
        `Strengthen understanding of ${topic}`,
        `Practice mixed quiz formats for ${topic}`,
      ],
      learning_pace: quizForm.learning_pace,
      learning_style: quizForm.learning_style,
      max_questions: quizForm.max_questions,
      preferred_question_types: quizForm.preferred_question_types,
      strengths: [],
      student_name: session.data?.full_name ?? session.data?.email ?? undefined,
      subject: topic,
      subtopics: activeModule?.lessons
        .map((lesson) => lesson.title)
        .slice(0, 6) ?? [topic],
      topic,
    });

    persistReviewSession({
      passingScore: getNumber(getRecord(quiz.quiz)?.passing_score) ?? 70,
      quizId: quiz.quiz_id,
      questions: quiz.questions,
      title: getString(getRecord(quiz.quiz)?.title, `${topic} Practice Quiz`),
      topic: quiz.topic,
    });
    router.push("/dashboard/review/quiz");
  };

  return (
    <WorkspaceShell
      active="practice"
      headerActions={
        <div className="flex flex-wrap gap-3">
          <ThemeToggle />
          {activeModule ? (
            <PixelButton
              disabled={generateQuizMutation.isPending}
              onClick={() => void launchPracticeQuiz(activeModule.topic)}
              theme={theme}
            >
              {generateQuizMutation.isPending
                ? "Preparing..."
                : "Start Interview"}
            </PixelButton>
          ) : null}
          <StatBadge
            label="Due flashcards"
            tone="cyan"
            value={String(dueFlashcardsQuery.data?.length ?? 0)}
            theme={theme}
          />
          <StatBadge
            label="Recent attempts"
            tone="purple"
            value={String(quizAttemptsQuery.data?.length ?? 0)}
            theme={theme}
          />
        </div>
      }
      subtitle="Practice · subject modules and drills"
      theme={theme}
      title="Practice Modules"
    >
      <div className="space-y-8">
        <section
          className={cn(
            "border p-5 lg:p-6",
            dark
              ? "border-[#262626] bg-[#0b0d0f]"
              : "border-[#c6d2c4] bg-[#f4f8f1]",
          )}
        >
          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              <WorkspaceField label="Search module" theme={theme}>
                <WorkspaceInput
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by topic"
                  theme={theme}
                  value={search}
                />
              </WorkspaceField>
              <WorkspaceField label="Selected topic" theme={theme}>
                <WorkspaceInput
                  readOnly
                  theme={theme}
                  value={activeModule?.topic ?? ""}
                />
              </WorkspaceField>
              <div
                className={cn(
                  "text-sm leading-6",
                  dark ? "text-white/60" : "text-[#55645a]",
                )}
              >
                Practice uses the same modules created from your saved lessons.
                Start an interview set from the currently selected topic.
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <WorkspaceField label="Level" theme={theme}>
                  <WorkspaceSelect
                    onChange={(event) =>
                      setQuizForm((current) => ({
                        ...current,
                        current_level: event.target
                          .value as PracticeQuizFormState["current_level"],
                      }))
                    }
                    theme={theme}
                    value={quizForm.current_level}
                  >
                    <option value="beginner">beginner</option>
                    <option value="intermediate">intermediate</option>
                    <option value="advanced">advanced</option>
                  </WorkspaceSelect>
                </WorkspaceField>
                <WorkspaceField label="Style" theme={theme}>
                  <WorkspaceSelect
                    onChange={(event) =>
                      setQuizForm((current) => ({
                        ...current,
                        learning_style: event.target
                          .value as PracticeQuizFormState["learning_style"],
                      }))
                    }
                    theme={theme}
                    value={quizForm.learning_style}
                  >
                    <option value="visual">visual</option>
                    <option value="auditory">auditory</option>
                    <option value="kinesthetic">kinesthetic</option>
                    <option value="reading/writing">reading/writing</option>
                  </WorkspaceSelect>
                </WorkspaceField>
                <WorkspaceField label="Pace" theme={theme}>
                  <WorkspaceSelect
                    onChange={(event) =>
                      setQuizForm((current) => ({
                        ...current,
                        learning_pace: event.target
                          .value as PracticeQuizFormState["learning_pace"],
                      }))
                    }
                    theme={theme}
                    value={quizForm.learning_pace}
                  >
                    <option value="slow">slow</option>
                    <option value="normal">normal</option>
                    <option value="fast">fast</option>
                  </WorkspaceSelect>
                </WorkspaceField>
                <WorkspaceField label="Question count" theme={theme}>
                  <WorkspaceInput
                    max={MAX_LESSON_QUIZ_QUESTIONS}
                    min={MIN_PRACTICE_QUESTIONS}
                    onChange={(event) =>
                      setQuizForm((current) => ({
                        ...current,
                        max_questions: clampNumber(
                          Number(event.target.value || 8),
                          MIN_PRACTICE_QUESTIONS,
                          MAX_LESSON_QUIZ_QUESTIONS,
                          8,
                        ),
                      }))
                    }
                    type="number"
                    theme={theme}
                    value={quizForm.max_questions}
                  />
                </WorkspaceField>
              </div>
              <WorkspaceField label="Question types" theme={theme}>
                <div className="flex flex-wrap gap-2">
                  {(
                    ["multiple_choice", "fill_blank", "true_false"] as const
                  ).map((type) => (
                    <WorkspaceCheckbox
                      checked={quizForm.preferred_question_types.includes(type)}
                      key={type}
                      label={type.replaceAll("_", " ")}
                      onChange={(checked) =>
                        setQuizForm((current) => ({
                          ...current,
                          preferred_question_types: checked
                            ? (uniqueStrings([
                                ...current.preferred_question_types,
                                type,
                              ]) as PracticeQuizFormState["preferred_question_types"])
                            : (current.preferred_question_types.filter(
                                (item) => item !== type,
                              ) as PracticeQuizFormState["preferred_question_types"]),
                        }))
                      }
                      theme={theme}
                    />
                  ))}
                </div>
              </WorkspaceField>
            </div>
          </div>
          {generateQuizMutation.isError ? (
            <div className="mt-4 border border-rose-500/30 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
              {generateQuizMutation.error.message}
            </div>
          ) : null}
        </section>
        <section>
          <ModuleStrip
            activeTopic={activeModule?.topic ?? null}
            modules={modules}
            onSelect={(topic) => startTransition(() => setSelectedTopic(topic))}
            theme={theme}
          />
        </section>
        <section className="grid gap-8 xl:grid-cols-[1.25fr_0.9fr]">
          <div className="space-y-6">
            <div
              className={cn(
                "border p-6",
                dark
                  ? "border-[#262626] bg-[#0b0d0f]"
                  : "border-[#c6d2c4] bg-[#f4f8f1]",
              )}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div
                    className={cn(
                      "font-pixel text-[9px] uppercase tracking-[0.2em]",
                      dark ? "text-white/45" : "text-[#6f7c74]",
                    )}
                  >
                    Module lessons
                  </div>
                  <div className="mt-2 font-display text-3xl font-semibold uppercase">
                    {activeModule?.topic ?? "No module selected"}
                  </div>
                  <div
                    className={cn(
                      "mt-2 text-sm leading-6",
                      dark ? "text-white/60" : "text-[#55645a]",
                    )}
                  >
                    Open a saved lesson in Home or generate a fresh practice
                    quiz for this module.
                  </div>
                </div>
                {activeModule ? (
                  <PixelButton
                    onClick={() => void launchPracticeQuiz(activeModule.topic)}
                    theme={theme}
                    tone="cyan"
                  >
                    Interview This Module
                  </PixelButton>
                ) : null}
              </div>
              <div className="mt-5">
                <LessonList
                  activeLessonId={null}
                  lessons={activeModule?.lessons ?? []}
                  onSelect={(lessonId) => {
                    persistSelectedLessonId(lessonId);
                    router.push("/dashboard");
                  }}
                  theme={theme}
                />
              </div>
            </div>
            <div
              className={cn(
                "border p-6",
                dark
                  ? "border-[#262626] bg-[#0b0d0f]"
                  : "border-[#c6d2c4] bg-[#f4f8f1]",
              )}
            >
              <div
                className={cn(
                  "font-pixel text-[9px] uppercase tracking-[0.2em]",
                  dark ? "text-white/45" : "text-[#6f7c74]",
                )}
              >
                Recent quiz attempts
              </div>
              <div className="mt-5 space-y-3">
                {(quizAttemptsQuery.data ?? []).length ? (
                  quizAttemptsQuery.data?.map((attempt) => (
                    <div
                      className={cn(
                        "flex items-center justify-between rounded-[24px] border px-5 py-4",
                        dark
                          ? "border-white/10 bg-black/20"
                          : "border-[#d1dbcf] bg-[#eef4ec]",
                      )}
                      key={attempt.id}
                    >
                      <div>
                        <div className="font-display text-lg font-semibold uppercase">
                          {attempt.topic}
                        </div>
                        <div
                          className={cn(
                            "mt-1 text-xs uppercase tracking-[0.18em]",
                            dark ? "text-white/45" : "text-[#6f7c74]",
                          )}
                        >
                          attempt {attempt.attempt_number} ·{" "}
                          {formatDate(attempt.created_at)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-lg font-semibold uppercase">
                          {Math.round(attempt.score_percent)}%
                        </div>
                        <div
                          className={cn(
                            "text-xs uppercase tracking-[0.18em]",
                            dark ? "text-white/45" : "text-[#6f7c74]",
                          )}
                        >
                          {attempt.correct_answers}/{attempt.total_questions}{" "}
                          correct
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className={cn(
                      "rounded-[24px] border border-dashed p-5 text-sm",
                      dark
                        ? "border-white/10 text-white/55"
                        : "border-[#c6d2c4] text-[#6b7b72]",
                    )}
                  >
                    No quiz attempts yet. Generate one from this Practice
                    sidebar.
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div
              className={cn(
                "border p-6",
                dark
                  ? "border-[#262626] bg-[#0b0d0f]"
                  : "border-[#c6d2c4] bg-[#f4f8f1]",
              )}
            >
              <div
                className={cn(
                  "font-pixel text-[9px] uppercase tracking-[0.2em]",
                  dark ? "text-white/45" : "text-[#6f7c74]",
                )}
              >
                Due flashcards
              </div>
              <div className="mt-5 space-y-3">
                {(dueFlashcardsQuery.data ?? []).length ? (
                  dueFlashcardsQuery.data?.map((card) => (
                    <FlashcardReviewCard
                      card={card}
                      isSubmitting={submitReviewMutation.isPending}
                      key={card.id}
                      onReview={(grade) =>
                        submitReviewMutation.mutate({
                          cardId: card.id,
                          payload: { grade },
                        })
                      }
                      theme={theme}
                    />
                  ))
                ) : (
                  <div
                    className={cn(
                      "rounded-[24px] border border-dashed p-5 text-sm",
                      dark
                        ? "border-white/10 text-white/55"
                        : "border-[#c6d2c4] text-[#6b7b72]",
                    )}
                  >
                    No cards are due right now. Save flashcards from lesson
                    pages to populate this queue.
                  </div>
                )}
              </div>
            </div>
            <div
              className={cn(
                "border p-6",
                dark
                  ? "border-[#262626] bg-[#0b0d0f]"
                  : "border-[#c6d2c4] bg-[#f4f8f1]",
              )}
            >
              <div
                className={cn(
                  "font-pixel text-[9px] uppercase tracking-[0.2em]",
                  dark ? "text-white/45" : "text-[#6f7c74]",
                )}
              >
                Practice notes
              </div>
              <div
                className={cn(
                  "mt-4 space-y-3 text-sm leading-7",
                  dark ? "text-white/68" : "text-[#49584f]",
                )}
              >
                <div>
                  • Practice uses the same subject modules as Home, so saved
                  lessons become reusable drills.
                </div>
                <div>
                  • Quick quizzes use `/api/v1/quiz/generate` with the module
                  topic and lesson titles as subtopics.
                </div>
                <div>
                  • Due flashcards come from `/api/v1/learning/due`, so lesson
                  flashcards can flow into spaced repetition.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}

export function ProfileLearningWorkspace({ theme }: { theme: CyberTheme }) {
  const dark = theme === "dark";
  const router = useRouter();
  const profileQuery = useBackendProfileQuery();
  const statsQuery = useBackendMyStatsQuery();
  const uploadedDocumentsQuery = useBackendUploadedDocumentsQuery();
  const updateSubscriptionMutation = useBackendUpdateSubscriptionMutation();
  const session = useSessionQuery();

  const profile = profileQuery.data ?? session.data ?? null;
  const stats = getRecord(statsQuery.data);
  const uploadedDocuments = uploadedDocumentsQuery.data ?? [];

  const currentTier = normalizeSubscriptionTier(profile?.subscription_tier);
  const currentTierLevel = SUBSCRIPTION_ORDER[currentTier];
  const totalXp = getNumber(stats?.total_xp) ?? 0;
  const currentLevel = getNumber(stats?.current_level) ?? 1;
  const longestStreak = getNumber(stats?.longest_streak) ?? 0;
  const lastActivityDate = formatDate(getString(stats?.last_activity_date, ""));
  const profileName = formatProfileName(profile);
  const profileAlias = formatProfileAlias(profile);
  const profileId = profile?.id
    ? String(profile.id).slice(0, 8).toUpperCase()
    : "UNKNOWN";

  const handleSelectTier = async (plan: SubscriptionPlan) => {
    await updateSubscriptionMutation.mutateAsync({ new_tier: plan.tier });
    await profileQuery.refetch();
  };

  return (
    <WorkspaceShell
      active="profile"
      headerActions={
        <div className="flex flex-wrap gap-3">
          <ThemeToggle />
          <StatBadge
            label="Tier"
            tone="cyan"
            value={currentTier.toUpperCase()}
            theme={theme}
          />
          <StatBadge label="Docs" value={String(uploadedDocuments.length)} theme={theme} />
          <StatBadge label="XP" tone="purple" value={String(totalXp)} theme={theme} />
        </div>
      }
      subtitle="Profile · identity, docs, subscription"
      theme={theme}
      title="User Profile"
    >
      <div className="space-y-8">
        <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div
            className={cn(
              "border p-6",
              dark
                ? "border-[#262626] bg-[#0b0d0f]"
                : "border-[#c6d2c4] bg-[#f4f8f1]",
            )}
          >
            <div
              className={cn(
                "text-[11px] uppercase tracking-[0.28em]",
                dark ? "text-white/45" : "text-[#6f7c74]",
              )}
            >
              Account identity
            </div>
            <div className="mt-3 font-display text-3xl font-semibold uppercase">
              {profileName}
            </div>
            <div
              className={cn(
                "mt-2 text-sm uppercase tracking-[0.18em]",
                dark ? "text-white/55" : "text-[#6f7c74]",
              )}
            >
              {profileAlias}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div
                className={cn(
                  "rounded-[22px] border p-4",
                  dark
                    ? "border-white/10 bg-black/20"
                    : "border-[#d1dbcf] bg-[#eef4ec]",
                )}
              >
                <div
                  className={cn(
                    "text-[10px] uppercase tracking-[0.2em]",
                    dark ? "text-white/45" : "text-[#6f7c74]",
                  )}
                >
                  Email
                </div>
                <div
                  className={cn(
                    "mt-2 break-all text-sm",
                    dark ? "text-white/80" : "text-[#3f4d44]",
                  )}
                >
                  {profile?.email ?? "N/A"}
                </div>
              </div>
              <div
                className={cn(
                  "rounded-[22px] border p-4",
                  dark
                    ? "border-white/10 bg-black/20"
                    : "border-[#d1dbcf] bg-[#eef4ec]",
                )}
              >
                <div
                  className={cn(
                    "text-[10px] uppercase tracking-[0.2em]",
                    dark ? "text-white/45" : "text-[#6f7c74]",
                  )}
                >
                  User ID
                </div>
                <div
                  className={cn(
                    "mt-2 text-sm",
                    dark ? "text-white/80" : "text-[#3f4d44]",
                  )}
                >
                  {profileId}
                </div>
              </div>
              <div
                className={cn(
                  "rounded-[22px] border p-4",
                  dark
                    ? "border-white/10 bg-black/20"
                    : "border-[#d1dbcf] bg-[#eef4ec]",
                )}
              >
                <div
                  className={cn(
                    "text-[10px] uppercase tracking-[0.2em]",
                    dark ? "text-white/45" : "text-[#6f7c74]",
                  )}
                >
                  Account status
                </div>
                <div
                  className={cn(
                    "mt-2 text-sm",
                    dark ? "text-white/80" : "text-[#3f4d44]",
                  )}
                >
                  {profile?.is_active ? "Active" : "Inactive"}
                </div>
              </div>
              <div
                className={cn(
                  "rounded-[22px] border p-4",
                  dark
                    ? "border-white/10 bg-black/20"
                    : "border-[#d1dbcf] bg-[#eef4ec]",
                )}
              >
                <div
                  className={cn(
                    "text-[10px] uppercase tracking-[0.2em]",
                    dark ? "text-white/45" : "text-[#6f7c74]",
                  )}
                >
                  Current plan
                </div>
                <div
                  className={cn(
                    "mt-2 text-sm",
                    dark ? "text-[#9cff93]" : "text-[#5f8c61]",
                  )}
                >
                  {currentTier.toUpperCase()}
                </div>
              </div>
            </div>
            {profileQuery.isLoading || statsQuery.isLoading ? (
              <div
                className={cn(
                  "mt-4 text-xs uppercase tracking-[0.18em]",
                  dark ? "text-white/45" : "text-[#6f7c74]",
                )}
              >
                Syncing profile data...
              </div>
            ) : null}
            {profileQuery.isError ? (
              <div className="mt-4 text-sm text-rose-300">
                {profileQuery.error.message}
              </div>
            ) : null}
          </div>

          <div
            className={cn(
              "border p-6",
              dark
                ? "border-[#262626] bg-[#0b0d0f]"
                : "border-[#c6d2c4] bg-[#f4f8f1]",
            )}
          >
            <div
              className={cn(
                "text-[11px] uppercase tracking-[0.28em]",
                dark ? "text-white/45" : "text-[#6f7c74]",
              )}
            >
              Progress snapshot
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <StatBadge label="Total XP" value={String(totalXp)} theme={theme} />
              <StatBadge
                label="Level"
                tone="cyan"
                value={String(currentLevel)}
                theme={theme}
              />
              <StatBadge
                label="Longest streak"
                tone="purple"
                value={String(longestStreak)}
                theme={theme}
              />
              <StatBadge
                label="Last activity"
                tone="amber"
                value={lastActivityDate}
                theme={theme}
              />
            </div>
            <div
              className={cn(
                "mt-5 rounded-[22px] border p-4 text-sm leading-7",
                dark
                  ? "border-white/10 bg-black/20 text-white/65"
                  : "border-[#d1dbcf] bg-[#eef4ec] text-[#55645a]",
              )}
            >
              Subscription actions below call `/api/v1/users/subscription`
              directly. Payment gateway can be wired later without changing this
              UI flow.
            </div>
          </div>
        </section>

        <section
          className={cn(
            "border p-6",
            dark
              ? "border-[#262626] bg-[#0b0d0f]"
              : "border-[#c6d2c4] bg-[#f4f8f1]",
          )}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div
                className={cn(
                  "text-[11px] uppercase tracking-[0.28em]",
                  dark ? "text-white/45" : "text-[#6f7c74]",
                )}
              >
                Buy / Upgrade subscription
              </div>
              <div className="mt-2 font-display text-2xl font-semibold uppercase">
                Plans
              </div>
            </div>
            {updateSubscriptionMutation.isPending ? (
              <div
                className={cn(
                  "text-xs uppercase tracking-[0.18em]",
                  dark ? "text-[#69daff]" : "text-[#4f8798]",
                )}
              >
                Updating subscription...
              </div>
            ) : null}
          </div>
          <div className="mt-5 grid gap-4 xl:grid-cols-4">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isCurrent = plan.tier === currentTier;
              const targetLevel = SUBSCRIPTION_ORDER[plan.tier];
              const actionLabel = isCurrent
                ? "Current Plan"
                : targetLevel > currentTierLevel
                  ? plan.cta
                  : `Switch to ${plan.name}`;

              return (
                <article
                  className={cn(
                    "rounded-[26px] border p-5",
                    isCurrent
                      ? dark
                        ? "border-[#9cff93]/50 bg-[#9cff93]/10"
                        : "border-[#a4c2a8] bg-[#edf5eb]"
                      : dark
                        ? "border-white/10 bg-black/20"
                        : "border-[#d1dbcf] bg-[#eef4ec]",
                  )}
                  key={plan.tier}
                >
                  <div
                    className={cn(
                      "text-[11px] uppercase tracking-[0.24em]",
                      dark ? "text-white/45" : "text-[#6f7c74]",
                    )}
                  >
                    {plan.name}
                  </div>
                  <div className="mt-2 font-display text-2xl font-semibold uppercase">
                    {plan.price}
                  </div>
                  <div
                    className={cn(
                      "mt-3 text-sm leading-6",
                      dark ? "text-white/65" : "text-[#55645a]",
                    )}
                  >
                    {plan.description}
                  </div>
                  <div
                    className={cn(
                      "mt-4 space-y-2 text-sm",
                      dark ? "text-white/72" : "text-[#49584f]",
                    )}
                  >
                    {plan.features.map((feature) => (
                      <div key={feature}>• {feature}</div>
                    ))}
                  </div>
                  <div className="mt-5">
                    <PixelButton
                      disabled={
                        isCurrent || updateSubscriptionMutation.isPending
                      }
                      hollow={!isCurrent}
                      onClick={() => void handleSelectTier(plan)}
                      theme={theme}
                      tone={isCurrent ? "cyan" : "purple"}
                    >
                      {actionLabel}
                    </PixelButton>
                  </div>
                </article>
              );
            })}
          </div>
          {updateSubscriptionMutation.isError ? (
            <div className="mt-4 text-sm text-rose-300">
              {updateSubscriptionMutation.error.message}
            </div>
          ) : null}
          {updateSubscriptionMutation.isSuccess ? (
            <div
              className={cn(
                "mt-4 text-sm",
                dark ? "text-[#9cff93]" : "text-[#5f8c61]",
              )}
            >
              Subscription updated successfully.
            </div>
          ) : null}
        </section>

        <section
          className={cn(
            "border p-6",
            dark
              ? "border-[#262626] bg-[#0b0d0f]"
              : "border-[#c6d2c4] bg-[#f4f8f1]",
          )}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div
                className={cn(
                  "text-[11px] uppercase tracking-[0.28em]",
                  dark ? "text-white/45" : "text-[#6f7c74]",
                )}
              >
                Uploaded documents
              </div>
              <div className="mt-2 font-display text-2xl font-semibold uppercase">
                {uploadedDocuments.length} documents
              </div>
            </div>
            <PixelButton
              hollow
              onClick={() => router.push("/dashboard/notes")}
              theme={theme}
              tone="cyan"
            >
              Open Notes Workspace
            </PixelButton>
          </div>
          <div className="mt-5 space-y-3">
            {uploadedDocumentsQuery.isLoading ? (
              <div
                className={cn(
                  "rounded-[22px] border border-dashed p-5 text-sm",
                  dark
                    ? "border-white/10 text-white/55"
                    : "border-[#c6d2c4] text-[#6b7b72]",
                )}
              >
                Loading uploaded documents...
              </div>
            ) : null}
            {uploadedDocumentsQuery.isError ? (
              <div className="rounded-[22px] border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-100">
                {uploadedDocumentsQuery.error.message}
              </div>
            ) : null}
            {!uploadedDocumentsQuery.isLoading && !uploadedDocuments.length ? (
              <div
                className={cn(
                  "rounded-[22px] border border-dashed p-5 text-sm",
                  dark
                    ? "border-white/10 text-white/55"
                    : "border-[#c6d2c4] text-[#6b7b72]",
                )}
              >
                No uploaded documents yet. Upload a file in Notes Workspace to
                populate this list.
              </div>
            ) : null}
            {uploadedDocuments
              .slice(0, 12)
              .map((document: UploadedDocumentItem) => (
                <article
                  className={cn(
                    "rounded-[22px] border p-4",
                    dark
                      ? "border-white/10 bg-black/20"
                      : "border-[#d1dbcf] bg-[#eef4ec]",
                  )}
                  key={document.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-display text-lg font-semibold uppercase">
                      {document.title}
                    </div>
                    <div
                      className={cn(
                        "text-[10px] uppercase tracking-[0.18em]",
                        dark ? "text-white/45" : "text-[#6f7c74]",
                      )}
                    >
                      updated {formatDate(document.updated_at)}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "mt-2 text-[10px] uppercase tracking-[0.18em]",
                      dark ? "text-white/45" : "text-[#6f7c74]",
                    )}
                  >
                    folder: {document.folder_name ?? "root"} · synced:{" "}
                    {document.is_synced_with_graph ? "yes" : "no"} · chars:{" "}
                    {document.content.length}
                  </div>
                  <div
                    className={cn(
                      "mt-3 text-sm leading-6",
                      dark ? "text-white/75" : "text-[#49584f]",
                    )}
                  >
                    {getDocumentPreview(document.content)}
                  </div>
                </article>
              ))}
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}

function FlashcardReviewCard({
  card,
  isSubmitting,
  onReview,
  theme,
}: {
  card: FlashcardResponse;
  isSubmitting: boolean;
  onReview: (grade: 1 | 2 | 3 | 4) => void;
  theme: CyberTheme;
}) {
  const dark = theme === "dark";

  return (
    <div
      className={cn(
        "rounded-[28px] border p-5",
        dark
          ? "border-white/10 bg-black/20"
          : "border-[#d1dbcf] bg-[#eef4ec]",
      )}
    >
      <div
        className={cn(
          "text-[11px] uppercase tracking-[0.28em]",
          dark ? "text-white/45" : "text-[#6f7c74]",
        )}
      >
        Front
      </div>
      <div className="mt-2 font-display text-lg font-semibold uppercase">
        {card.front_content}
      </div>
      <div
        className={cn(
          "mt-4 text-[11px] uppercase tracking-[0.28em]",
          dark ? "text-white/45" : "text-[#6f7c74]",
        )}
      >
        Back
      </div>
      <div
        className={cn(
          "mt-2 text-sm leading-7",
          dark ? "text-white/72" : "text-[#49584f]",
        )}
      >
        {card.back_content}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { grade: 1 as const, label: "Again" },
          { grade: 2 as const, label: "Hard" },
          { grade: 3 as const, label: "Good" },
          { grade: 4 as const, label: "Easy" },
        ].map((option) => (
          <button
            className={cn(
              "rounded-full border px-3 py-2 text-xs uppercase tracking-[0.16em] transition",
              dark
                ? "border-white/10 bg-white/[0.05] text-white/70 hover:border-[#9cff93]/30 hover:bg-[#9cff93]/10 hover:text-white"
                : "border-[#c6d2c4] bg-[#f8fbf5] text-[#5f7066] hover:border-[#8cab90] hover:bg-[#edf5eb] hover:text-[#243127]",
            )}
            disabled={isSubmitting}
            key={option.grade}
            onClick={() => onReview(option.grade)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewQuestionCard({
  answer,
  index,
  onAnswerChange,
  question,
  theme,
  total,
}: {
  answer: unknown;
  index: number;
  onAnswerChange: (value: unknown) => void;
  question: QuizQuestion;
  theme: CyberTheme;
  total: number;
}) {
  const options = getStringArray(question.options);
  const answerText = typeof answer === "string" ? answer : "";
  const answerBool = typeof answer === "boolean" ? answer : null;
  const answerIndex = typeof answer === "number" ? answer : null;
  const dark = theme === "dark";

  return (
    <div
      className={cn(
        "rounded-[34px] border p-6 lg:p-7",
        dark
          ? "border-white/10 bg-white/[0.04]"
          : "border-[#c6d2c4] bg-[#f4f8f1]",
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.28em]",
          dark ? "text-white/45" : "text-[#6f7c74]",
        )}
      >
        <span>
          question {index + 1}/{total}
        </span>
        <span>·</span>
        <span>{getString(question.type, "question").replaceAll("_", " ")}</span>
        {getString(question.subtopic) ? (
          <>
            <span>·</span>
            <span>{getString(question.subtopic)}</span>
          </>
        ) : null}
      </div>
      <div className="mt-4 font-display text-3xl font-semibold uppercase leading-tight">
        {question.question}
      </div>
      {options.length ? (
        <div className="mt-6 grid gap-3">
          {options.map((option, optionIndex) => (
            <button
              className={cn(
                "rounded-[24px] border px-5 py-4 text-left text-sm leading-7 transition",
                answerIndex === optionIndex
                  ? dark
                    ? "border-[#69daff]/45 bg-[#69daff]/10 text-white"
                    : "border-[#b8ced7] bg-[#edf5f7] text-[#243127]"
                  : dark
                    ? "border-white/10 bg-black/20 text-white/75 hover:border-white/20 hover:bg-white/[0.05]"
                    : "border-[#d1dbcf] bg-[#eef4ec] text-[#49584f] hover:border-[#b8ced7] hover:bg-[#eef6f8]",
              )}
              key={option}
              onClick={() => onAnswerChange(optionIndex)}
              type="button"
            >
              <div className="flex items-start justify-between gap-5">
                <span>{option}</span>
                <span
                  className={cn(
                    "text-[11px] uppercase tracking-[0.22em]",
                    dark ? "text-white/35" : "text-[#7a887f]",
                  )}
                >
                  {String.fromCharCode(65 + optionIndex)}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : null}
      {question.type === "true_false" ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[true, false].map((value) => (
            <button
              className={cn(
                "rounded-[24px] border px-5 py-4 text-left text-sm uppercase tracking-[0.2em] transition",
                answerBool === value
                  ? dark
                    ? "border-[#9cff93]/45 bg-[#9cff93]/10 text-white"
                    : "border-[#a4c2a8] bg-[#edf5eb] text-[#243127]"
                  : dark
                    ? "border-white/10 bg-black/20 text-white/75 hover:border-white/20 hover:bg-white/[0.05]"
                    : "border-[#d1dbcf] bg-[#eef4ec] text-[#49584f] hover:border-[#a4c2a8] hover:bg-[#eef6ed]",
              )}
              key={String(value)}
              onClick={() => onAnswerChange(value)}
              type="button"
            >
              {value ? "True" : "False"}
            </button>
          ))}
        </div>
      ) : null}
      {question.type === "fill_blank" ? (
        <div className="mt-6">
          <WorkspaceTextarea
            onChange={(event) => onAnswerChange(event.target.value)}
            placeholder="Type your answer"
            rows={3}
            theme={theme}
            value={answerText}
          />
        </div>
      ) : null}
      {question.explanation ? (
        <div
          className={cn(
            "mt-6 rounded-[24px] border p-4 text-sm leading-7",
            dark
              ? "border-white/10 bg-black/20 text-white/65"
              : "border-[#d1dbcf] bg-[#eef4ec] text-[#55645a]",
          )}
        >
          {question.explanation}
        </div>
      ) : null}
    </div>
  );
}

function ReviewResults({
  result,
  theme,
}: {
  result: QuizEvaluationResponse;
  theme: CyberTheme;
}) {
  const dark = theme === "dark";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatBadge
          label="Score"
          value={`${Math.round(result.score_percent)}%`}
          theme={theme}
        />
        <StatBadge
          label="Correct"
          tone="cyan"
          value={`${result.correct_answers}/${result.total_questions}`}
          theme={theme}
        />
        <StatBadge
          label="Retry"
          tone="purple"
          value={result.is_retry ? "yes" : "no"}
          theme={theme}
        />
        <StatBadge label="Attempt" value={String(result.attempt_number)} theme={theme} />
      </div>
      <div
        className={cn(
          "rounded-[34px] border p-6",
          dark
            ? "border-white/10 bg-white/[0.04]"
            : "border-[#c6d2c4] bg-[#f4f8f1]",
        )}
      >
        <div
          className={cn(
            "text-[11px] uppercase tracking-[0.28em]",
            dark ? "text-white/45" : "text-[#6f7c74]",
          )}
        >
          Recommendations
        </div>
        <div
          className={cn(
            "mt-4 space-y-3 text-sm leading-7",
            dark ? "text-white/72" : "text-[#49584f]",
          )}
        >
          {(result.recommendations ?? []).map((recommendation) => (
            <div key={recommendation}>• {recommendation}</div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {result.per_question_results.map((questionResult) => (
          <div
            className={cn(
              "rounded-[26px] border p-5",
              questionResult.is_correct
                ? dark
                  ? "border-[#9cff93]/30 bg-[#9cff93]/8"
                  : "border-[#a4c2a8] bg-[#edf5eb]"
                : "border-rose-500/25 bg-rose-500/10",
            )}
            key={questionResult.question_id}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="font-display text-lg font-semibold uppercase">
                Question {questionResult.question_id}
              </div>
              <div className="text-[11px] uppercase tracking-[0.24em]">
                {questionResult.is_correct ? "correct" : "needs review"}
              </div>
            </div>
            {getString(questionResult.explanation) ? (
              <div
                className={cn(
                  "mt-3 text-sm leading-7",
                  dark ? "text-white/78" : "text-[#49584f]",
                )}
              >
                {getString(questionResult.explanation)}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReviewLearningWorkspace({ theme }: { theme: CyberTheme }) {
  const dark = theme === "dark";
  const router = useRouter();
  const evaluateQuizMutation = useBackendEvaluateQuizMutation();
  const updateLessonProgressMutation = useBackendUpdateLessonProgressMutation();
  const [reviewSession] = useState<ReviewSession | null>(() =>
    readReviewSession(),
  );
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [result, setResult] = useState<QuizEvaluationResponse | null>(null);

  const activeQuestion = reviewSession?.questions[activeQuestionIndex] ?? null;

  const submitQuiz = async () => {
    if (!reviewSession) {
      return;
    }

    const answeredQuestions = reviewSession.questions
      .filter(
        (question) =>
          answers[question.id] !== undefined && answers[question.id] !== "",
      )
      .map((question) => ({
        answer: answers[question.id],
        question_id: question.id,
      }));

    const evaluation = await evaluateQuizMutation.mutateAsync({
      answers: answeredQuestions,
      case_sensitive: false,
      passing_score: reviewSession.passingScore,
      questions: reviewSession.questions,
      quiz_id: reviewSession.quizId,
      source_lesson_id: reviewSession.sourceLessonId ?? undefined,
      topic: reviewSession.topic,
    });

    setResult(evaluation);

    if (reviewSession.sourceLessonId && reviewSession.sourcePageId) {
      await updateLessonProgressMutation.mutateAsync({
        lessonId: reviewSession.sourceLessonId,
        payload: {
          completed_page_ids: uniqueStrings([
            ...(reviewSession.completedPageIds ?? []),
            reviewSession.sourcePageId,
          ]),
          current_page_id: reviewSession.sourcePageId,
        },
      });
    }
  };

  return (
    <WorkspaceShell
      active="interview"
      headerActions={
        reviewSession ? (
          <div className="flex flex-wrap gap-3">
            <ThemeToggle />
            <StatBadge label="Topic" value={reviewSession.topic} theme={theme} />
            <StatBadge
              label="Questions"
              tone="cyan"
              value={String(reviewSession.questions.length)}
              theme={theme}
            />
            <StatBadge
              label="Passing score"
              tone="purple"
              value={`${reviewSession.passingScore}%`}
              theme={theme}
            />
          </div>
        ) : null
      }
      subtitle="Interview · MCQ, true/false, fill blank"
      theme={theme}
      title="Interview Mode"
    >
      {!reviewSession || !activeQuestion ? (
        <div
          className={cn(
            "border border-dashed p-10",
            dark
              ? "border-[#262626] bg-[#0b0d0f]"
              : "border-[#c6d2c4] bg-[#f4f8f1]",
          )}
        >
          <div className="font-display text-3xl font-semibold uppercase">
            No active quiz
          </div>
          <div
            className={cn(
              "mt-3 max-w-2xl text-sm leading-7",
              dark ? "text-white/60" : "text-[#55645a]",
            )}
          >
            Launch a quiz from the Home lesson viewer or the Practice sidebar,
            then this page will render the full review flow with answer
            submission and scoring.
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <PixelButton onClick={() => router.push("/dashboard")} theme={theme}>
              Go to Home
            </PixelButton>
            <PixelButton
              hollow
              onClick={() => router.push("/dashboard/practice/challenge")}
              theme={theme}
              tone="cyan"
            >
              Go to Practice
            </PixelButton>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <section
            className={cn(
              "border p-5",
              dark
                ? "border-[#262626] bg-[#0b0d0f]"
                : "border-[#c6d2c4] bg-[#f4f8f1]",
            )}
          >
            <div className="flex flex-wrap gap-2">
              {reviewSession.questions.map((question, index) => (
                <button
                  className={cn(
                    "border px-3 py-2 text-left font-pixel text-[9px] uppercase tracking-[0.12em] transition",
                    index === activeQuestionIndex
                      ? dark
                        ? "border-[#69daff] bg-[#0d171d] text-[#69daff]"
                        : "border-[#8cb6c6] bg-[#edf5f7] text-[#36606d]"
                      : dark
                        ? "border-[#262626] bg-[#05070a] text-white/60 hover:border-[#4b5563] hover:bg-[#111315]"
                        : "border-[#c6d2c4] bg-[#f8fbf5] text-[#5f7066] hover:border-[#9db09f] hover:bg-[#edf3ea]",
                  )}
                  key={question.id}
                  onClick={() =>
                    startTransition(() => setActiveQuestionIndex(index))
                  }
                  type="button"
                >
                  Q{index + 1}
                  {answers[question.id] !== undefined &&
                  answers[question.id] !== ""
                    ? "_DONE"
                    : ""}
                </button>
              ))}
            </div>
            <div
              className={cn(
                "mt-4 text-sm",
                dark ? "text-white/60" : "text-[#55645a]",
              )}
            >
              {reviewSession.title}
              {reviewSession.lessonTitle
                ? ` · from ${reviewSession.lessonTitle}`
                : ""}
            </div>
          </section>
          <ReviewQuestionCard
            answer={answers[activeQuestion.id]}
            index={activeQuestionIndex}
            onAnswerChange={(value) =>
              setAnswers((current) => ({
                ...current,
                [activeQuestion.id]: value,
              }))
            }
            question={activeQuestion}
            theme={theme}
            total={reviewSession.questions.length}
          />
          <div className="flex flex-wrap gap-3">
            <PixelButton
              disabled={activeQuestionIndex === 0}
              hollow
              onClick={() =>
                startTransition(() =>
                  setActiveQuestionIndex((current) => Math.max(0, current - 1)),
                )
              }
              theme={theme}
            >
              Previous
            </PixelButton>
            <PixelButton
              disabled={
                activeQuestionIndex >= reviewSession.questions.length - 1
              }
              onClick={() =>
                startTransition(() =>
                  setActiveQuestionIndex((current) =>
                    Math.min(reviewSession.questions.length - 1, current + 1),
                  ),
                )
              }
              theme={theme}
              tone="cyan"
            >
              Next
            </PixelButton>
            <PixelButton
              disabled={evaluateQuizMutation.isPending}
              onClick={() => void submitQuiz()}
              theme={theme}
            >
              {evaluateQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
            </PixelButton>
            {reviewSession.sourceLessonId ? (
              <PixelButton
                hollow
                onClick={() => {
                  persistSelectedLessonId(reviewSession.sourceLessonId ?? null);
                  router.push("/dashboard");
                }}
                theme={theme}
                tone="purple"
              >
                Back to Lesson
              </PixelButton>
            ) : null}
          </div>
          {evaluateQuizMutation.isError ? (
            <div className="rounded-[28px] border border-rose-500/30 bg-rose-500/10 p-5 text-sm leading-6 text-rose-100">
              {evaluateQuizMutation.error.message}
            </div>
          ) : null}
          {result ? <ReviewResults result={result} theme={theme} /> : null}
        </div>
      )}
    </WorkspaceShell>
  );
}
