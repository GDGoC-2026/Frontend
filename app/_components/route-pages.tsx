"use client";

import {
  DashboardScreen,
  DocsExplorerScreen,
  FlashcardScreen,
  PathScreen,
  PracticeChallengeScreen,
  ProfileScreen,
  QuizScreen,
  SubjectSelectScreen,
} from "@/app/_components/cyber-screens";
import { useTheme } from "@/app/_components/theme-provider";
import { useSessionQuery } from "@/hooks/use-auth";

export function HomeRoutePage() {
  const { theme } = useTheme();

  return <DashboardScreen theme={theme} />;
}

export function SubjectsRoutePage() {
  const { theme } = useTheme();

  return <SubjectSelectScreen theme={theme} />;
}

export function LearnPathRoutePage() {
  const { theme } = useTheme();

  return <PathScreen theme={theme} />;
}

export function LearnDocsRoutePage() {
  const { theme } = useTheme();

  return <DocsExplorerScreen theme={theme} />;
}

export function PracticeChallengeRoutePage() {
  const { theme } = useTheme();

  return <PracticeChallengeScreen theme={theme} />;
}

export function PracticeFlashcardsRoutePage() {
  return <FlashcardScreen />;
}

export function ProfileRoutePage() {
  const { theme } = useTheme();
  const session = useSessionQuery();

  return (
    <ProfileScreen
      errorMessage={session.error instanceof Error ? session.error.message : null}
      isLoading={session.isPending}
      theme={theme}
      user={session.data}
    />
  );
}

export function ReviewQuizRoutePage() {
  return <QuizScreen />;
}
