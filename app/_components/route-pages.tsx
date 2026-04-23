"use client";

import {
  DocsExplorerScreen,
  FlashcardScreen,
  PathScreen,
  SubjectSelectScreen,
} from "@/app/_components/cyber-screens";
import {
  HomeLearningWorkspace,
  ProfileLearningWorkspace,
  PracticeLearningWorkspace,
  ReviewLearningWorkspace,
} from "@/app/_components/learning-workspace";
import { useTheme } from "@/app/_components/theme-provider";
import { NotesWorkspacePage } from "@/app/_components/notes-workspace";

export function HomeRoutePage() {
  const { theme } = useTheme();

  return <HomeLearningWorkspace theme={theme} />;
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

  return <PracticeLearningWorkspace theme={theme} />;
}

export function PracticeFlashcardsRoutePage() {
  return <FlashcardScreen />;
}

export function NotesRoutePage() {
  const { theme } = useTheme();

  return <NotesWorkspacePage theme={theme} />;
}

export function ProfileRoutePage() {
  const { theme } = useTheme();

  return <ProfileLearningWorkspace theme={theme} />;
}

export function ReviewQuizRoutePage() {
  const { theme } = useTheme();

  return <ReviewLearningWorkspace theme={theme} />;
}
