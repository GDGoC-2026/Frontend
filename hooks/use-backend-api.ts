"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  askChatbotFromFrontend,
  createFlashcardFromFrontend,
  createFolderFromFrontend,
  createNoteFromFrontend,
  deleteKnowledgeGraphFromFrontend,
  deleteFlashcardFromFrontend,
  deleteFolderFromFrontend,
  deleteNoteFromFrontend,
  executeCodeFromFrontend,
  evaluateQuizFromFrontend,
  generateLessonCodingProblemsFromFrontend,
  generateLessonFromFrontend,
  generateQuizFromFrontend,
  getBackendHealthFromFrontend,
  getCodingProblemAttemptsFromFrontend,
  getCodingProblemFromFrontend,
  getCodingProblemSessionFromFrontend,
  getDueFlashcardsFromFrontend,
  getFlashcardsFromFrontend,
  getFolderDetailsFromFrontend,
  getKnowledgeGraphDataFromFrontend,
  getKnowledgeGraphFromFrontend,
  getKnowledgeIngestStatusFromFrontend,
  getLeaderboardFromFrontend,
  getMeFromFrontend,
  getMyStatsFromFrontend,
  getNoteFromFrontend,
  getNotesFromFrontend,
  getProfileFromFrontend,
  getQuizAttemptsFromFrontend,
  getRootFoldersFromFrontend,
  getSavedLessonFromFrontend,
  getSavedLessonsFromFrontend,
  getUploadedDocumentsFromFrontend,
  ingestKnowledgeFromFrontend,
  listLessonCodingProblemsFromFrontend,
  loginFromFrontend,
  queryKnowledgeFromFrontend,
  registerFromFrontend,
  runCodingProblemFromFrontend,
  saveCodeSessionFromFrontend,
  saveLessonFromFrontend,
  streamRecommendationsFromFrontend,
  submitCodingProblemFromFrontend,
  submitCodingProblemStreamFromFrontend,
  submitReviewFromFrontend,
  subscribePushNotificationsFromFrontend,
  upsertCodingProblemSessionFromFrontend,
  updateLessonProgressFromFrontend,
  updateFlashcardFromFrontend,
  updateNoteFromFrontend,
  updateSubscriptionFromFrontend,
  uploadMarkdownNoteFromFrontend,
  type ChatbotAskPayload,
  type CodeRunPayload,
  type CodeSessionSavePayload,
  type CodeSessionUpdatePayload,
  type CodeSubmissionPayload,
  type CodeSubmitPayload,
  type CodeSubmitStreamEvent,
  type CodingProblemGeneratePayload,
  type FlashcardCreateUpdatePayload,
  type FolderCreatePayload,
  type KnowledgeIngestPayload,
  type KnowledgeIngestStatusResponse,
  type KnowledgeQueryPayload,
  type LessonGeneratePayload,
  type LessonProgressUpdatePayload,
  type LessonSavePayload,
  type LoginPayload,
  type MarkdownUploadPayload,
  type NoteCreatePayload,
  type NoteUpdatePayload,
  type PaginationQuery,
  type PushSubscriptionPayload,
  type QuizAttemptsQuery,
  type QuizEvaluationPayload,
  type QuizGenerationPayload,
  type RecommendationStreamPayload,
  type RegisterPayload,
  type ReviewSubmitPayload,
  type UploadedDocumentItem,
  type SubscriptionUpdatePayload,
} from "@/lib/api/frontend";

const backendKeys = {
  dueFlashcards: (query?: PaginationQuery) =>
    ["backend", "learning", "due", query?.limit ?? null, query?.offset ?? null] as const,
  flashcards: (query?: PaginationQuery) =>
    ["backend", "learning", "flashcards", query?.limit ?? null, query?.offset ?? null] as const,
  folder: (folderId: string | null) => ["backend", "notes", "folder", folderId] as const,
  folders: ["backend", "notes", "folders"] as const,
  health: ["backend", "health"] as const,
  knowledgeGraph: ["backend", "notes", "graph"] as const,
  knowledgeGraphData: ["backend", "knowledge", "graph"] as const,
  knowledgeIngestStatus: ["backend", "knowledge", "ingest-status"] as const,
  codingAttempts: (problemId: string | null, query?: PaginationQuery) =>
    [
      "backend",
      "coding",
      "attempts",
      problemId,
      query?.limit ?? null,
      query?.offset ?? null,
    ] as const,
  codingProblem: (problemId: string | null) => ["backend", "coding", "problem", problemId] as const,
  codingProblems: (lessonId: string | null) => ["backend", "coding", "problems", lessonId] as const,
  codingSession: (problemId: string | null) => ["backend", "coding", "session", problemId] as const,
  leaderboard: ["backend", "gamification", "leaderboard"] as const,
  lesson: (lessonId: string | null) => ["backend", "lessons", "detail", lessonId] as const,
  lessons: (query?: PaginationQuery) =>
    ["backend", "lessons", query?.limit ?? null, query?.offset ?? null] as const,
  me: ["backend", "auth", "me"] as const,
  myStats: ["backend", "gamification", "my-stats"] as const,
  note: (noteId: string | null) => ["backend", "notes", "note", noteId] as const,
  notes: (folderId?: string | null) => ["backend", "notes", folderId ?? null] as const,
  profile: ["backend", "users", "profile"] as const,
  uploadedDocuments: ["backend", "users", "uploaded-documents"] as const,
  quizAttempts: (query?: QuizAttemptsQuery) =>
    [
      "backend",
      "quiz",
      "attempts",
      query?.limit ?? null,
      query?.offset ?? null,
      query?.topic ?? null,
      query?.quiz_id ?? null,
      query?.retries_only ?? null,
    ] as const,
};

export function useBackendHealthQuery() {
  return useQuery({
    queryFn: getBackendHealthFromFrontend,
    queryKey: backendKeys.health,
  });
}

export function useBackendMeQuery() {
  return useQuery({
    queryFn: getMeFromFrontend,
    queryKey: backendKeys.me,
  });
}

export function useBackendProfileQuery() {
  return useQuery({
    queryFn: getProfileFromFrontend,
    queryKey: backendKeys.profile,
  });
}

export function useBackendUploadedDocumentsQuery() {
  return useQuery<UploadedDocumentItem[]>({
    queryFn: getUploadedDocumentsFromFrontend,
    queryKey: backendKeys.uploadedDocuments,
  });
}

export function useBackendMyStatsQuery() {
  return useQuery({
    queryFn: getMyStatsFromFrontend,
    queryKey: backendKeys.myStats,
  });
}

export function useBackendLeaderboardQuery() {
  return useQuery({
    queryFn: getLeaderboardFromFrontend,
    queryKey: backendKeys.leaderboard,
  });
}

export function useBackendRootFoldersQuery() {
  return useQuery({
    queryFn: getRootFoldersFromFrontend,
    queryKey: backendKeys.folders,
  });
}

export function useBackendFolderDetailsQuery(
  folderId: string | null,
  options?: {
    enabled?: boolean;
  },
) {
  return useQuery({
    enabled: Boolean(folderId) && (options?.enabled ?? true),
    queryFn: () => getFolderDetailsFromFrontend(folderId as string),
    queryKey: backendKeys.folder(folderId),
  });
}

export function useBackendKnowledgeGraphQuery() {
  return useQuery({
    queryFn: getKnowledgeGraphFromFrontend,
    queryKey: backendKeys.knowledgeGraph,
  });
}

export function useBackendKnowledgeGraphDataQuery() {
  return useQuery({
    queryFn: getKnowledgeGraphDataFromFrontend,
    queryKey: backendKeys.knowledgeGraphData,
  });
}

export function useBackendKnowledgeIngestStatusQuery(options?: { enabled?: boolean }) {
  return useQuery<KnowledgeIngestStatusResponse>({
    enabled: options?.enabled ?? true,
    queryFn: getKnowledgeIngestStatusFromFrontend,
    queryKey: backendKeys.knowledgeIngestStatus,
    refetchInterval: (query) =>
      (query.state.data?.processing_docs ?? 0) > 0 ? 3000 : false,
  });
}

export function useBackendNotesQuery(folderId?: string | null) {
  return useQuery({
    queryFn: () => getNotesFromFrontend(folderId),
    queryKey: backendKeys.notes(folderId),
  });
}

export function useBackendNoteQuery(noteId: string | null) {
  return useQuery({
    enabled: Boolean(noteId),
    queryFn: () => getNoteFromFrontend(noteId as string),
    queryKey: backendKeys.note(noteId),
  });
}

export function useBackendFlashcardsQuery(query?: PaginationQuery) {
  return useQuery({
    queryFn: () => getFlashcardsFromFrontend(query),
    queryKey: backendKeys.flashcards(query),
  });
}

export function useBackendDueFlashcardsQuery(query?: PaginationQuery) {
  return useQuery({
    queryFn: () => getDueFlashcardsFromFrontend(query),
    queryKey: backendKeys.dueFlashcards(query),
  });
}

export function useBackendSavedLessonsQuery(query?: PaginationQuery) {
  return useQuery({
    queryFn: () => getSavedLessonsFromFrontend(query),
    queryKey: backendKeys.lessons(query),
  });
}

export function useBackendSavedLessonQuery(
  lessonId: string | null,
  options?: {
    enabled?: boolean;
  },
) {
  return useQuery({
    enabled: Boolean(lessonId) && (options?.enabled ?? true),
    queryFn: () => getSavedLessonFromFrontend(lessonId as string),
    queryKey: backendKeys.lesson(lessonId),
  });
}

export function useBackendLessonCodingProblemsQuery(
  lessonId: string | null,
  options?: {
    enabled?: boolean;
  },
) {
  return useQuery({
    enabled: Boolean(lessonId) && (options?.enabled ?? true),
    queryFn: () => listLessonCodingProblemsFromFrontend(lessonId as string),
    queryKey: backendKeys.codingProblems(lessonId),
  });
}

export function useBackendCodingProblemQuery(
  problemId: string | null,
  options?: {
    enabled?: boolean;
  },
) {
  return useQuery({
    enabled: Boolean(problemId) && (options?.enabled ?? true),
    queryFn: () => getCodingProblemFromFrontend(problemId as string),
    queryKey: backendKeys.codingProblem(problemId),
  });
}

export function useBackendCodingAttemptsQuery(
  problemId: string | null,
  query?: PaginationQuery,
  options?: {
    enabled?: boolean;
  },
) {
  return useQuery({
    enabled: Boolean(problemId) && (options?.enabled ?? true),
    queryFn: () => getCodingProblemAttemptsFromFrontend(problemId as string, query),
    queryKey: backendKeys.codingAttempts(problemId, query),
  });
}

export function useBackendCodingProblemSessionQuery(
  problemId: string | null,
  options?: {
    enabled?: boolean;
  },
) {
  return useQuery({
    enabled: Boolean(problemId) && (options?.enabled ?? true),
    retry: false,
    queryFn: () => getCodingProblemSessionFromFrontend(problemId as string),
    queryKey: backendKeys.codingSession(problemId),
  });
}

export function useBackendQuizAttemptsQuery(query?: QuizAttemptsQuery) {
  return useQuery({
    queryFn: () => getQuizAttemptsFromFrontend(query),
    queryKey: backendKeys.quizAttempts(query),
  });
}

export function useBackendLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginFromFrontend(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: backendKeys.me });
      await queryClient.invalidateQueries({ queryKey: backendKeys.profile });
    },
  });
}

export function useBackendRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerFromFrontend(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: backendKeys.me });
      await queryClient.invalidateQueries({ queryKey: backendKeys.profile });
    },
  });
}

export function useBackendUpdateSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubscriptionUpdatePayload) =>
      updateSubscriptionFromFrontend(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: backendKeys.profile });
    },
  });
}

export function useBackendSubscribeNotificationsMutation() {
  return useMutation({
    mutationFn: (payload: PushSubscriptionPayload) =>
      subscribePushNotificationsFromFrontend(payload),
  });
}

export function useBackendCreateFolderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FolderCreatePayload) => createFolderFromFrontend(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: backendKeys.folders });
    },
  });
}

export function useBackendDeleteFolderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) => deleteFolderFromFrontend(folderId),
    onSuccess: async (_, folderId) => {
      await queryClient.invalidateQueries({ queryKey: backendKeys.folders });
      await queryClient.invalidateQueries({ queryKey: backendKeys.folder(folderId) });
      await queryClient.invalidateQueries({ queryKey: ["backend", "notes"] });
      await queryClient.invalidateQueries({ queryKey: backendKeys.uploadedDocuments });
    },
  });
}

export function useBackendUploadMarkdownMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      folderId,
      payload,
    }: {
      folderId?: string | null;
      payload: MarkdownUploadPayload;
    }) => uploadMarkdownNoteFromFrontend(payload, folderId),
    onSuccess: async (_, { folderId }) => {
      await queryClient.invalidateQueries({ queryKey: backendKeys.notes(folderId) });
      await queryClient.invalidateQueries({ queryKey: backendKeys.folder(folderId ?? null) });
      await queryClient.invalidateQueries({ queryKey: backendKeys.uploadedDocuments });
    },
  });
}

export function useBackendCreateNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NoteCreatePayload) => createNoteFromFrontend(payload),
    onSuccess: async (_, payload) => {
      await queryClient.invalidateQueries({
        queryKey: backendKeys.notes(payload.folder_id ?? null),
      });
      await queryClient.invalidateQueries({
        queryKey: backendKeys.folder(payload.folder_id ?? null),
      });
      await queryClient.invalidateQueries({ queryKey: backendKeys.uploadedDocuments });
    },
  });
}

export function useBackendUpdateNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      noteId: string;
      payload: NoteUpdatePayload;
      previousFolderId?: string | null;
    }) => updateNoteFromFrontend(variables.noteId, variables.payload),
    onSuccess: async (updatedNote, variables) => {
      await queryClient.invalidateQueries({
        queryKey: backendKeys.note(updatedNote.id),
      });
      await queryClient.invalidateQueries({
        queryKey: backendKeys.notes(updatedNote.folder_id ?? null),
      });
      await queryClient.invalidateQueries({
        queryKey: backendKeys.folder(updatedNote.folder_id ?? null),
      });
      if (variables.previousFolderId && variables.previousFolderId !== updatedNote.folder_id) {
        await queryClient.invalidateQueries({
          queryKey: backendKeys.notes(variables.previousFolderId),
        });
        await queryClient.invalidateQueries({
          queryKey: backendKeys.folder(variables.previousFolderId),
        });
      }
      await queryClient.invalidateQueries({
        queryKey: ["backend", "notes"],
      });
      await queryClient.invalidateQueries({ queryKey: backendKeys.uploadedDocuments });
    },
  });
}

export function useBackendDeleteNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => deleteNoteFromFrontend(noteId),
    onSuccess: async (_, noteId) => {
      await queryClient.invalidateQueries({ queryKey: backendKeys.note(noteId) });
      await queryClient.invalidateQueries({ queryKey: ["backend", "notes"] });
      await queryClient.invalidateQueries({ queryKey: backendKeys.uploadedDocuments });
    },
  });
}

export function useBackendCreateFlashcardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FlashcardCreateUpdatePayload) =>
      createFlashcardFromFrontend(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["backend", "learning"] });
    },
  });
}

export function useBackendGenerateLessonMutation() {
  return useMutation({
    mutationFn: (payload: LessonGeneratePayload) => generateLessonFromFrontend(payload),
  });
}

export function useBackendGenerateLessonCodingProblemsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      payload,
    }: {
      lessonId: string;
      payload: CodingProblemGeneratePayload;
    }) => generateLessonCodingProblemsFromFrontend(lessonId, payload),
    onSuccess: async (_, { lessonId }) => {
      await queryClient.invalidateQueries({ queryKey: backendKeys.codingProblems(lessonId) });
    },
  });
}

export function useBackendSaveLessonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LessonSavePayload) => saveLessonFromFrontend(payload),
    onSuccess: async (savedLesson) => {
      queryClient.setQueryData(backendKeys.lesson(savedLesson.id), savedLesson);
      await queryClient.invalidateQueries({ queryKey: ["backend", "lessons"] });
    },
  });
}

export function useBackendUpdateLessonProgressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      payload,
    }: {
      lessonId: string;
      payload: LessonProgressUpdatePayload;
    }) => updateLessonProgressFromFrontend(lessonId, payload),
    onSuccess: async (savedLesson) => {
      queryClient.setQueryData(backendKeys.lesson(savedLesson.id), savedLesson);
      await queryClient.invalidateQueries({ queryKey: ["backend", "lessons"] });
    },
  });
}

export function useBackendGenerateQuizMutation() {
  return useMutation({
    mutationFn: (payload: QuizGenerationPayload) => generateQuizFromFrontend(payload),
  });
}

export function useBackendEvaluateQuizMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: QuizEvaluationPayload) => evaluateQuizFromFrontend(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["backend", "quiz"] });
      await queryClient.invalidateQueries({ queryKey: backendKeys.myStats });
    },
  });
}

export function useBackendUpdateFlashcardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, payload }: { cardId: string; payload: FlashcardCreateUpdatePayload }) =>
      updateFlashcardFromFrontend(cardId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["backend", "learning"] });
    },
  });
}

export function useBackendDeleteFlashcardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardId: string) => deleteFlashcardFromFrontend(cardId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["backend", "learning"] });
    },
  });
}

export function useBackendSubmitReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, payload }: { cardId: string; payload: ReviewSubmitPayload }) =>
      submitReviewFromFrontend(cardId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["backend", "learning", "due"] });
      await queryClient.invalidateQueries({ queryKey: backendKeys.myStats });
    },
  });
}

export function useBackendExecuteCodeMutation() {
  return useMutation({
    mutationFn: (payload: CodeSubmissionPayload) => executeCodeFromFrontend(payload),
  });
}

export function useBackendRunCodingProblemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      problemId,
    }: {
      payload: CodeRunPayload;
      problemId: string;
    }) => runCodingProblemFromFrontend(problemId, payload),
    onSuccess: async (_, { problemId }) => {
      await queryClient.invalidateQueries({ queryKey: backendKeys.codingAttempts(problemId) });
    },
  });
}

export function useBackendSubmitCodingProblemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      problemId,
    }: {
      payload: CodeSubmitPayload;
      problemId: string;
    }) => submitCodingProblemFromFrontend(problemId, payload),
    onSuccess: async (_, { problemId }) => {
      await queryClient.invalidateQueries({ queryKey: backendKeys.codingAttempts(problemId) });
      await queryClient.invalidateQueries({ queryKey: backendKeys.myStats });
    },
  });
}

export function useBackendStreamSubmitCodingProblemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      onEvent,
      payload,
      problemId,
    }: {
      onEvent?: (event: CodeSubmitStreamEvent) => void;
      payload: CodeSubmitPayload;
      problemId: string;
    }) => submitCodingProblemStreamFromFrontend(problemId, payload, onEvent),
    onSuccess: async (_, { problemId }) => {
      await queryClient.invalidateQueries({ queryKey: backendKeys.codingAttempts(problemId) });
      await queryClient.invalidateQueries({ queryKey: backendKeys.myStats });
    },
  });
}

export function useBackendSaveCodeSessionMutation() {
  return useMutation({
    mutationFn: (payload: CodeSessionSavePayload) =>
      saveCodeSessionFromFrontend(payload),
  });
}

export function useBackendUpsertCodingProblemSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      problemId,
    }: {
      payload: CodeSessionUpdatePayload;
      problemId: string;
    }) => upsertCodingProblemSessionFromFrontend(problemId, payload),
    onSuccess: async (_, { problemId }) => {
      await queryClient.invalidateQueries({ queryKey: backendKeys.codingSession(problemId) });
    },
  });
}

export function useBackendCodeRecommendationMutation() {
  return useMutation({
    mutationFn: (payload: RecommendationStreamPayload) => streamRecommendationsFromFrontend(payload),
  });
}

export function useBackendKnowledgeIngestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: KnowledgeIngestPayload) => ingestKnowledgeFromFrontend(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: backendKeys.knowledgeGraph });
      await queryClient.invalidateQueries({ queryKey: backendKeys.knowledgeGraphData });
      await queryClient.invalidateQueries({ queryKey: backendKeys.knowledgeIngestStatus });
    },
  });
}

export function useBackendKnowledgeQueryMutation() {
  return useMutation({
    mutationFn: (payload: KnowledgeQueryPayload) => queryKnowledgeFromFrontend(payload),
  });
}

export function useBackendDeleteKnowledgeGraphMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteKnowledgeGraphFromFrontend(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: backendKeys.knowledgeGraph });
      await queryClient.invalidateQueries({ queryKey: backendKeys.knowledgeGraphData });
      await queryClient.invalidateQueries({ queryKey: backendKeys.knowledgeIngestStatus });
    },
  });
}

export function useBackendAskChatbotMutation() {
  return useMutation({
    mutationFn: (payload: ChatbotAskPayload) => askChatbotFromFrontend(payload),
  });
}
