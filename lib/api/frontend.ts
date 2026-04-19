import type { components, operations } from "@/types/api.generated";
import { frontendClient } from "@/lib/api/frontend-client";
import {
  ApiError,
  assertApiData,
  assertApiSuccess,
  extractErrorMessage,
} from "@/lib/api/http";

export type LoginPayload = components["schemas"]["UserLogin"];
export type RegisterPayload = components["schemas"]["UserCreate"];
export type AuthToken = components["schemas"]["Token"];
export type UserProfile = components["schemas"]["UserProfile"];

export type OAuthLoginResponse =
  operations["google_login_api_v1_auth_google_login_get"]["responses"][200]["content"]["application/json"];

export type SubscriptionUpdatePayload = components["schemas"]["SubscriptionUpdate"];
export type PushSubscriptionPayload = components["schemas"]["PushSubCreate"];

export type FolderCreatePayload = components["schemas"]["FolderCreate"];
export type FolderResponse = components["schemas"]["FolderResponse"];
export type FolderDetailResponse = components["schemas"]["FolderDetailResponse"];
export type NoteCreatePayload = components["schemas"]["NoteCreate"];
export type NoteUpdatePayload = components["schemas"]["NoteUpdate"];
export type NoteResponse = components["schemas"]["NoteResponse"];
export type UploadedDocumentItem = NoteResponse & {
  folder_name: string | null;
};
export type MarkdownUploadPayload =
  components["schemas"]["Body_upload_markdown_note_api_v1_notes_upload_post"];
export type KnowledgeGraphResponse =
  operations["get_knowledge_graph_api_v1_notes_graph_visualizer_get"]["responses"][200]["content"]["application/json"];
export type KnowledgeGraphDataResponse = components["schemas"]["GraphDataResponse"];
export type KnowledgeGraphNode = components["schemas"]["GraphNode"];
export type KnowledgeGraphEdge = components["schemas"]["GraphEdge"];
export type KnowledgeIngestPayload = components["schemas"]["NoteIngestRequest"];
export type KnowledgeIngestResponse = components["schemas"]["NoteIngestResponse"];
export type KnowledgeQueryPayload = components["schemas"]["KnowledgeQueryRequest"];
export type KnowledgeQueryResponse = components["schemas"]["KnowledgeQueryResponse"];
export type KnowledgeIngestDocumentStatus = {
  chunks_count: number;
  content_summary: string | null;
  created_at: string | null;
  doc_id: string;
  error: string | null;
  status: string;
  updated_at: string | null;
};
export type KnowledgeIngestStatusResponse = {
  documents: KnowledgeIngestDocumentStatus[];
  failed_docs: number;
  graph_edges: number;
  graph_nodes: number;
  processed_docs: number;
  processing_docs: number;
  total_docs: number;
};
export type ChatbotAskPayload = components["schemas"]["ChatRequest"];
export type ChatbotAskResponse = components["schemas"]["ChatResponse"];

export type FlashcardCreateUpdatePayload = components["schemas"]["FlashcardCreateUpdate"];
export type FlashcardResponse = components["schemas"]["FlashcardResponse"];
export type ReviewSubmitPayload = components["schemas"]["ReviewSubmit"];
export type LessonGeneratePayload =
  components["schemas"]["Body_generate_lesson_api_v1_lessons_generate_post"];
export type LessonGenerationResponse = components["schemas"]["LessonGenerationResponse"];
export type LessonPage = components["schemas"]["LessonPage"];
export type LessonNavigation = components["schemas"]["LessonNavigation"];
export type LessonSourceDocument = components["schemas"]["LessonSourceDocument"];
export type SavedLessonSummary = components["schemas"]["SavedLessonSummary"];
export type SavedLessonDetail = components["schemas"]["SavedLessonDetail"];
export type LessonSavePayload = components["schemas"]["LessonSaveRequest"];
export type LessonProgressUpdatePayload =
  components["schemas"]["LessonProgressUpdateRequest"];
export type QuizGenerationPayload = components["schemas"]["QuizGenerationRequest"];
export type QuizGenerationResponse = components["schemas"]["QuizGenerationResponse"];
export type QuizQuestion = components["schemas"]["QuizQuestion"];
export type QuizAnswerInput = components["schemas"]["QuizAnswerInput"];
export type QuizEvaluationPayload = components["schemas"]["QuizEvaluationRequest"];
export type QuizEvaluationResponse = components["schemas"]["QuizEvaluationResponse"];
export type QuizAttemptSummary = components["schemas"]["QuizAttemptSummary"];
export type QuestionEvaluationResult = components["schemas"]["QuestionEvaluationResult"];

export type GamificationStatsResponse =
  operations["get_my_stats_api_v1_gamification_my_stats_get"]["responses"][200]["content"]["application/json"];
export type GamificationLeaderboardResponse =
  operations["get_leaderboard_api_v1_gamification_leaderboard_get"]["responses"][200]["content"]["application/json"];

export type CodeSubmissionPayload = components["schemas"]["CodeSubmission"];
export type CodeSessionSavePayload = components["schemas"]["CodeSessionSave"];
export type CodingProblemGeneratePayload = components["schemas"]["CodingProblemGenerateRequest"];
export type CodingProblemsGenerationResponse =
  components["schemas"]["CodingProblemsGenerationResponse"];
export type CodingProblemSummary = components["schemas"]["CodingProblemSummary"];
export type CodingProblemDetail = components["schemas"]["CodingProblemDetail"];
export type CodingAttemptsResponse = components["schemas"]["CodingAttemptsResponse"];
export type CodeRunPayload = components["schemas"]["CodeRunRequest"];
export type CodeRunResponse = components["schemas"]["CodeRunResponse"];
export type CodeSubmitPayload = components["schemas"]["CodeSubmitRequest"];
export type CodeSubmitResponse = components["schemas"]["CodeSubmitResponse"];
export type SubmitStreamStartedEvent = {
  status: "started";
  total_tests: number;
};
export type SubmitStreamCaseEvent = {
  case_result: components["schemas"]["TestCaseResult"];
  passed_tests: number;
  status: "case";
  total_tests: number;
};
export type SubmitStreamCompletedEvent = {
  attempt_id: string;
  passed: boolean;
  passed_tests: number;
  result_status?: string;
  results: components["schemas"]["TestCaseResult"][];
  status: "completed";
  total_tests: number;
};
export type SubmitStreamErrorEvent = {
  error: string;
  status: "error";
};
export type CodeSubmitStreamEvent =
  | SubmitStreamStartedEvent
  | SubmitStreamCaseEvent
  | SubmitStreamCompletedEvent
  | SubmitStreamErrorEvent;
export type CodeSessionUpdatePayload = components["schemas"]["CodeSessionUpdate"];
export type RecommendationStreamPayload = components["schemas"]["RecommendationRequest"];
export type RecommendationStreamResponse = {
  content_type?: string;
  error?: string;
  status?: string;
  text: string;
};
export type CodingProblemSessionResponse = {
  coding_problem_id: string;
  current_code: string;
  language_id: number;
};
export type JudgeExecuteResponse =
  operations["execute_code_api_v1_judge_execute_post"]["responses"][200]["content"]["application/json"];
export type JudgeSessionResponse =
  operations["save_code_session_api_v1_judge_sessions_post"]["responses"][200]["content"]["application/json"];

export type HealthResponse =
  operations["health_check_health_get"]["responses"][200]["content"]["application/json"];

export type PaginationQuery = {
  limit?: number;
  offset?: number;
};

export type QuizAttemptsQuery = PaginationQuery & {
  topic?: string | null;
  quiz_id?: string | null;
  retries_only?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function requestMultipartFormData<T>(
  path: string,
  payload: Record<string, unknown>,
  fallbackMessage: string,
) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null) {
          return;
        }

        if (item instanceof File) {
          formData.append(key, item);
          return;
        }

        formData.append(key, String(item));
      });
      return;
    }

    formData.append(key, String(value));
  });

  const response = await fetch(`/api/backend${path}`, {
    body: formData,
    method: "POST",
  });
  const rawPayload = (await response.json().catch(() => undefined)) as
    | T
    | { detail?: string; message?: string }
    | undefined;

  if (!response.ok) {
    const detailMessage = extractErrorMessage(rawPayload) ?? fallbackMessage;

    throw new ApiError(`${detailMessage} (status ${response.status})`, response.status);
  }

  if (rawPayload === undefined) {
    throw new ApiError(`${fallbackMessage} (empty response)`, response.status);
  }

  return rawPayload as T;
}

export async function loginFromFrontend(payload: LoginPayload) {
  const { data, error, response } = await frontendClient.POST("/api/v1/auth/login", {
    body: payload,
  });

  return assertApiData(data, error, response, "Login failed");
}

export async function registerFromFrontend(payload: RegisterPayload) {
  const { data, error, response } = await frontendClient.POST("/api/v1/auth/register", {
    body: payload,
  });

  return assertApiData(data, error, response, "Register failed");
}

export async function getMeFromFrontend() {
  const { data, error, response } = await frontendClient.GET("/api/v1/auth/me");

  return assertApiData(data, error, response, "Session lookup failed");
}

export async function getGoogleLoginFromFrontend() {
  const { data, error, response } = await frontendClient.GET("/api/v1/auth/google/login");

  return assertApiData(data, error, response, "Google login handshake failed");
}

export async function getGoogleCallbackFromFrontend() {
  const { data, error, response } = await frontendClient.GET("/api/v1/auth/google/callback");

  return assertApiData(data, error, response, "Google callback failed");
}

export async function getGithubLoginFromFrontend() {
  const { data, error, response } = await frontendClient.GET("/api/v1/auth/github/login");

  return assertApiData(data, error, response, "GitHub login handshake failed");
}

export async function getGithubCallbackFromFrontend() {
  const { data, error, response } = await frontendClient.GET("/api/v1/auth/github/callback");

  return assertApiData(data, error, response, "GitHub callback failed");
}

export async function getProfileFromFrontend() {
  const { data, error, response } = await frontendClient.GET("/api/v1/users/profile");

  return assertApiData(data, error, response, "Failed to fetch user profile");
}

export async function updateSubscriptionFromFrontend(payload: SubscriptionUpdatePayload) {
  const { data, error, response } = await frontendClient.PUT("/api/v1/users/subscription", {
    body: payload,
  });

  return assertApiData(data, error, response, "Failed to update subscription");
}

export async function subscribePushNotificationsFromFrontend(
  payload: PushSubscriptionPayload,
) {
  const { data, error, response } = await frontendClient.POST(
    "/api/v1/notifications/subscribe",
    {
      body: payload,
    },
  );

  return assertApiData(data, error, response, "Failed to subscribe notifications");
}

export async function getKnowledgeGraphFromFrontend() {
  const { data, error, response } = await frontendClient.GET("/api/v1/notes/graph-visualizer");

  return assertApiData(data, error, response, "Failed to fetch knowledge graph");
}

export async function getKnowledgeGraphDataFromFrontend() {
  const { data, error, response } = await frontendClient.GET("/api/v1/knowledge/graph");

  return assertApiData(data, error, response, "Failed to fetch knowledge graph data");
}

export async function getKnowledgeIngestStatusFromFrontend() {
  const response = await fetch("/api/backend/api/v1/knowledge/ingest-status", {
    cache: "no-store",
    method: "GET",
  });
  const rawPayload = (await response.json().catch(() => undefined)) as
    | KnowledgeIngestStatusResponse
    | { detail?: string; message?: string }
    | undefined;

  if (!response.ok) {
    const detailMessage = extractErrorMessage(rawPayload) ?? "Failed to fetch ingest status";
    throw new ApiError(`${detailMessage} (status ${response.status})`, response.status);
  }

  if (!rawPayload || !isRecord(rawPayload)) {
    throw new ApiError(
      `Failed to fetch ingest status (empty response)`,
      response.status ?? "unknown",
    );
  }

  return rawPayload as KnowledgeIngestStatusResponse;
}

export async function deleteKnowledgeGraphFromFrontend() {
  const { error, response } = await frontendClient.DELETE("/api/v1/knowledge/graph");

  assertApiSuccess(error, response, "Failed to reset knowledge graph");
}

export async function ingestKnowledgeFromFrontend(payload: KnowledgeIngestPayload) {
  const { data, error, response } = await frontendClient.POST("/api/v1/knowledge/ingest", {
    body: payload,
  });

  return assertApiData(data, error, response, "Failed to ingest note into knowledge graph");
}

export async function queryKnowledgeFromFrontend(payload: KnowledgeQueryPayload) {
  const { data, error, response } = await frontendClient.POST("/api/v1/knowledge/query", {
    body: payload,
  });

  return assertApiData(data, error, response, "Failed to query knowledge graph");
}

export async function askChatbotFromFrontend(payload: ChatbotAskPayload) {
  const { data, error, response } = await frontendClient.POST("/api/v1/chatbot/ask", {
    body: payload,
  });

  return assertApiData(data, error, response, "Failed to ask chatbot");
}

export async function getRootFoldersFromFrontend() {
  const { data, error, response } = await frontendClient.GET("/api/v1/notes/folders");

  return assertApiData(data, error, response, "Failed to fetch note folders");
}

export async function createFolderFromFrontend(payload: FolderCreatePayload) {
  const { data, error, response } = await frontendClient.POST("/api/v1/notes/folders", {
    body: payload,
  });

  return assertApiData(data, error, response, "Failed to create note folder");
}

export async function getFolderDetailsFromFrontend(folderId: string) {
  const { data, error, response } = await frontendClient.GET(
    "/api/v1/notes/folders/{folder_id}",
    {
      params: {
        path: {
          folder_id: folderId,
        },
      },
    },
  );

  return assertApiData(data, error, response, "Failed to fetch folder details");
}

export async function deleteFolderFromFrontend(folderId: string) {
  const { error, response } = await frontendClient.DELETE(
    "/api/v1/notes/folders/{folder_id}",
    {
      params: {
        path: {
          folder_id: folderId,
        },
      },
    },
  );

  assertApiSuccess(error, response, "Failed to delete folder");
}

export async function uploadMarkdownNoteFromFrontend(
  payload: MarkdownUploadPayload,
  folderId?: string | null,
) {
  const { data, error, response } = await frontendClient.POST("/api/v1/notes/upload", {
    body: payload,
    params: {
      query: {
        folder_id: folderId,
      },
    },
  });

  return assertApiData(data, error, response, "Failed to upload markdown note");
}

export async function getNotesFromFrontend(folderId?: string | null) {
  const { data, error, response } = await frontendClient.GET("/api/v1/notes/", {
    params: {
      query: {
        folder_id: folderId,
      },
    },
  });

  return assertApiData(data, error, response, "Failed to fetch notes");
}

export async function getUploadedDocumentsFromFrontend(): Promise<UploadedDocumentItem[]> {
  const documentsById = new Map<string, UploadedDocumentItem>();
  const visitedFolderIds = new Set<string>();

  const rootNotes = await getNotesFromFrontend(undefined);
  rootNotes.forEach((note) => {
    documentsById.set(note.id, {
      ...note,
      folder_name: null,
    });
  });

  const rootFolders = await getRootFoldersFromFrontend();
  const queue: Array<{ id: string; name: string }> = rootFolders.map((folder) => ({
    id: folder.id,
    name: folder.name,
  }));

  while (queue.length) {
    const folder = queue.shift();
    if (!folder || visitedFolderIds.has(folder.id)) {
      continue;
    }

    visitedFolderIds.add(folder.id);

    const detail = await getFolderDetailsFromFrontend(folder.id);

    detail.notes.forEach((note) => {
      documentsById.set(note.id, {
        ...note,
        folder_name: folder.name,
      });
    });

    detail.subfolders.forEach((subfolder) => {
      if (!visitedFolderIds.has(subfolder.id)) {
        queue.push({ id: subfolder.id, name: subfolder.name });
      }
    });
  }

  return Array.from(documentsById.values()).sort((a, b) => {
    const aTime = new Date(a.updated_at).getTime();
    const bTime = new Date(b.updated_at).getTime();
    return bTime - aTime;
  });
}

export async function createNoteFromFrontend(payload: NoteCreatePayload) {
  const { data, error, response } = await frontendClient.POST("/api/v1/notes/", {
    body: payload,
  });

  return assertApiData(data, error, response, "Failed to create note");
}

export async function getNoteFromFrontend(noteId: string) {
  const { data, error, response } = await frontendClient.GET("/api/v1/notes/{note_id}", {
    params: {
      path: {
        note_id: noteId,
      },
    },
  });

  return assertApiData(data, error, response, "Failed to fetch note");
}

export async function updateNoteFromFrontend(noteId: string, payload: NoteUpdatePayload) {
  const { data, error, response } = await frontendClient.PUT("/api/v1/notes/{note_id}", {
    body: payload,
    params: {
      path: {
        note_id: noteId,
      },
    },
  });

  return assertApiData(data, error, response, "Failed to update note");
}

export async function deleteNoteFromFrontend(noteId: string) {
  const { error, response } = await frontendClient.DELETE("/api/v1/notes/{note_id}", {
    params: {
      path: {
        note_id: noteId,
      },
    },
  });

  assertApiSuccess(error, response, "Failed to delete note");
}

export async function getFlashcardsFromFrontend(query?: PaginationQuery) {
  const { data, error, response } = await frontendClient.GET("/api/v1/learning", {
    params: {
      query: {
        limit: query?.limit,
        offset: query?.offset,
      },
    },
  });

  return assertApiData(data, error, response, "Failed to fetch flashcards");
}

export async function generateLessonFromFrontend(payload: LessonGeneratePayload) {
  return requestMultipartFormData<LessonGenerationResponse>(
    "/api/v1/lessons/generate",
    payload,
    "Failed to generate lesson",
  );
}

export async function saveLessonFromFrontend(payload: LessonSavePayload) {
  const { data, error, response } = await frontendClient.POST("/api/v1/lessons/save", {
    body: payload,
  });

  return assertApiData(data, error, response, "Failed to save lesson");
}

export async function getSavedLessonsFromFrontend(query?: PaginationQuery) {
  const { data, error, response } = await frontendClient.GET("/api/v1/lessons", {
    params: {
      query: {
        limit: query?.limit,
        offset: query?.offset,
      },
    },
  });

  return assertApiData(data, error, response, "Failed to fetch saved lessons");
}

export async function getSavedLessonFromFrontend(lessonId: string) {
  const { data, error, response } = await frontendClient.GET("/api/v1/lessons/{lesson_id}", {
    params: {
      path: {
        lesson_id: lessonId,
      },
    },
  });

  return assertApiData(data, error, response, "Failed to fetch lesson detail");
}

export async function listLessonCodingProblemsFromFrontend(lessonId: string) {
  const { data, error, response } = await frontendClient.GET(
    "/api/v1/lessons/{lesson_id}/coding-problems",
    {
      params: {
        path: {
          lesson_id: lessonId,
        },
      },
    },
  );

  return assertApiData(data, error, response, "Failed to fetch coding problems");
}

export async function generateLessonCodingProblemsFromFrontend(
  lessonId: string,
  payload: CodingProblemGeneratePayload,
) {
  const { data, error, response } = await frontendClient.POST(
    "/api/v1/lessons/{lesson_id}/coding-problems/generate",
    {
      body: payload,
      params: {
        path: {
          lesson_id: lessonId,
        },
      },
    },
  );

  return assertApiData(data, error, response, "Failed to generate coding problems");
}

export async function getCodingProblemFromFrontend(problemId: string) {
  const { data, error, response } = await frontendClient.GET(
    "/api/v1/coding-problems/{problem_id}",
    {
      params: {
        path: {
          problem_id: problemId,
        },
      },
    },
  );

  return assertApiData(data, error, response, "Failed to fetch coding problem");
}

export async function getCodingProblemAttemptsFromFrontend(
  problemId: string,
  query?: PaginationQuery,
) {
  const { data, error, response } = await frontendClient.GET(
    "/api/v1/coding-problems/{problem_id}/attempts",
    {
      params: {
        path: {
          problem_id: problemId,
        },
        query: {
          limit: query?.limit,
          offset: query?.offset,
        },
      },
    },
  );

  return assertApiData(data, error, response, "Failed to fetch coding attempts");
}

export async function runCodingProblemFromFrontend(problemId: string, payload: CodeRunPayload) {
  const { data, error, response } = await frontendClient.POST(
    "/api/v1/coding-problems/{problem_id}/run",
    {
      body: payload,
      params: {
        path: {
          problem_id: problemId,
        },
      },
    },
  );

  return assertApiData(data, error, response, "Failed to run code");
}

export async function submitCodingProblemFromFrontend(
  problemId: string,
  payload: CodeSubmitPayload,
) {
  const { data, error, response } = await frontendClient.POST(
    "/api/v1/coding-problems/{problem_id}/submit",
    {
      body: payload,
      params: {
        path: {
          problem_id: problemId,
        },
      },
    },
  );

  return assertApiData(data, error, response, "Failed to submit code");
}

export async function submitCodingProblemStreamFromFrontend(
  problemId: string,
  payload: CodeSubmitPayload,
  onEvent?: (event: CodeSubmitStreamEvent) => void,
): Promise<SubmitStreamCompletedEvent> {
  const response = await fetch(`/api/backend/api/v1/coding-problems/${problemId}/submit/stream`, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const rawText = await response.text();
    let parsed: unknown = null;

    try {
      parsed = rawText ? JSON.parse(rawText) : null;
    } catch {
      parsed = { detail: rawText };
    }

    const message = extractErrorMessage(parsed) ?? "Failed to submit code";
    throw new ApiError(`${message} (status ${response.status})`, response.status);
  }

  if (!response.body) {
    throw new ApiError("Submit stream was empty", response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completedEvent: SubmitStreamCompletedEvent | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    let separatorIndex = buffer.indexOf("\n\n");
    while (separatorIndex !== -1) {
      const rawEvent = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);

      const dataLines = rawEvent
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.startsWith("data:"));

      for (const line of dataLines) {
        const jsonPayload = line.slice(5).trim();
        if (!jsonPayload) {
          continue;
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(jsonPayload);
        } catch {
          continue;
        }

        if (!isRecord(parsed) || typeof parsed.status !== "string") {
          continue;
        }

        const status = parsed.status;
        if (status === "started") {
          const event: SubmitStreamStartedEvent = {
            status: "started",
            total_tests: Number(parsed.total_tests ?? 0),
          };
          onEvent?.(event);
          continue;
        }

        if (status === "case" && isRecord(parsed.case_result)) {
          const event: SubmitStreamCaseEvent = {
            case_result: parsed.case_result as components["schemas"]["TestCaseResult"],
            passed_tests: Number(parsed.passed_tests ?? 0),
            status: "case",
            total_tests: Number(parsed.total_tests ?? 0),
          };
          onEvent?.(event);
          continue;
        }

        if (status === "completed" && Array.isArray(parsed.results)) {
          const event: SubmitStreamCompletedEvent = {
            attempt_id: String(parsed.attempt_id ?? ""),
            passed: Boolean(parsed.passed),
            passed_tests: Number(parsed.passed_tests ?? 0),
            result_status:
              typeof parsed.result_status === "string" ? parsed.result_status : undefined,
            results: parsed.results as components["schemas"]["TestCaseResult"][],
            status: "completed",
            total_tests: Number(parsed.total_tests ?? 0),
          };
          completedEvent = event;
          onEvent?.(event);
          continue;
        }

        if (status === "error") {
          const errorMessage =
            typeof parsed.error === "string" && parsed.error.trim()
              ? parsed.error
              : "Submit stream failed";
          const event: SubmitStreamErrorEvent = {
            error: errorMessage,
            status: "error",
          };
          onEvent?.(event);
          throw new ApiError(errorMessage, response.status);
        }
      }

      separatorIndex = buffer.indexOf("\n\n");
    }
  }

  if (!completedEvent) {
    throw new ApiError("Submit stream ended before completion", response.status);
  }

  return completedEvent;
}

export async function getCodingProblemSessionFromFrontend(problemId: string) {
  const { data, error, response } = await frontendClient.GET("/api/v1/judge/sessions/{problem_id}", {
    params: {
      path: {
        problem_id: problemId,
      },
    },
  });

  return assertApiData(
    data as CodingProblemSessionResponse | undefined,
    error,
    response,
    "Failed to load coding session",
  );
}

export async function upsertCodingProblemSessionFromFrontend(
  problemId: string,
  payload: CodeSessionUpdatePayload,
) {
  const { data, error, response } = await frontendClient.PUT("/api/v1/judge/sessions/{problem_id}", {
    body: payload,
    params: {
      path: {
        problem_id: problemId,
      },
    },
  });

  return assertApiData(data, error, response, "Failed to save coding session");
}

export async function updateLessonProgressFromFrontend(
  lessonId: string,
  payload: LessonProgressUpdatePayload,
) {
  const { data, error, response } = await frontendClient.PATCH(
    "/api/v1/lessons/{lesson_id}/progress",
    {
      body: payload,
      params: {
        path: {
          lesson_id: lessonId,
        },
      },
    },
  );

  return assertApiData(data, error, response, "Failed to update lesson progress");
}

export async function generateQuizFromFrontend(payload: QuizGenerationPayload) {
  const { data, error, response } = await frontendClient.POST("/api/v1/quiz/generate", {
    body: payload,
  });

  return assertApiData(data, error, response, "Failed to generate quiz");
}

export async function evaluateQuizFromFrontend(payload: QuizEvaluationPayload) {
  const { data, error, response } = await frontendClient.POST("/api/v1/quiz/evaluate", {
    body: payload,
  });

  return assertApiData(data, error, response, "Failed to evaluate quiz");
}

export async function getQuizAttemptsFromFrontend(query?: QuizAttemptsQuery) {
  const { data, error, response } = await frontendClient.GET("/api/v1/quiz/attempts", {
    params: {
      query: {
        limit: query?.limit,
        offset: query?.offset,
        quiz_id: query?.quiz_id,
        retries_only: query?.retries_only,
        topic: query?.topic,
      },
    },
  });

  return assertApiData(data, error, response, "Failed to fetch quiz attempts");
}

export async function createFlashcardFromFrontend(payload: FlashcardCreateUpdatePayload) {
  const { data, error, response } = await frontendClient.POST("/api/v1/learning", {
    body: payload,
  });

  return assertApiData(data, error, response, "Failed to create flashcard");
}

export async function updateFlashcardFromFrontend(
  cardId: string,
  payload: FlashcardCreateUpdatePayload,
) {
  const { data, error, response } = await frontendClient.PUT("/api/v1/learning/{card_id}", {
    body: payload,
    params: {
      path: {
        card_id: cardId,
      },
    },
  });

  return assertApiData(data, error, response, "Failed to update flashcard");
}

export async function deleteFlashcardFromFrontend(cardId: string) {
  const { data, error, response } = await frontendClient.DELETE("/api/v1/learning/{card_id}", {
    params: {
      path: {
        card_id: cardId,
      },
    },
  });

  return assertApiData(data, error, response, "Failed to delete flashcard");
}

export async function getDueFlashcardsFromFrontend(query?: PaginationQuery) {
  const { data, error, response } = await frontendClient.GET("/api/v1/learning/due", {
    params: {
      query: {
        limit: query?.limit,
        offset: query?.offset,
      },
    },
  });

  return assertApiData(data, error, response, "Failed to fetch due flashcards");
}

export async function submitReviewFromFrontend(cardId: string, payload: ReviewSubmitPayload) {
  const { data, error, response } = await frontendClient.POST(
    "/api/v1/learning/{card_id}/review",
    {
      body: payload,
      params: {
        path: {
          card_id: cardId,
        },
      },
    },
  );

  return assertApiData(data, error, response, "Failed to submit flashcard review");
}

export async function getMyStatsFromFrontend() {
  const { data, error, response } = await frontendClient.GET("/api/v1/gamification/my-stats");

  return assertApiData(data, error, response, "Failed to fetch gamification stats");
}

export async function getLeaderboardFromFrontend() {
  const { data, error, response } = await frontendClient.GET(
    "/api/v1/gamification/leaderboard",
  );

  return assertApiData(data, error, response, "Failed to fetch leaderboard");
}

export async function executeCodeFromFrontend(payload: CodeSubmissionPayload) {
  const { data, error, response } = await frontendClient.POST("/api/v1/judge/execute", {
    body: payload,
  });

  return assertApiData(data, error, response, "Failed to execute code");
}

export async function saveCodeSessionFromFrontend(payload: CodeSessionSavePayload) {
  const { data, error, response } = await frontendClient.POST("/api/v1/judge/sessions", {
    body: payload,
  });

  return assertApiData(data, error, response, "Failed to save coding session");
}

export async function streamRecommendationsFromFrontend(
  payload: RecommendationStreamPayload,
): Promise<RecommendationStreamResponse> {
  const response = await fetch("/api/backend/api/v1/recommendations/stream", {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const rawText = await response.text();

  if (!response.ok) {
    let parsed: unknown = null;
    try {
      parsed = rawText ? JSON.parse(rawText) : null;
    } catch {
      parsed = { detail: rawText };
    }

    const message = extractErrorMessage(parsed) ?? "Failed to stream recommendations";
    throw new ApiError(`${message} (status ${response.status})`, response.status);
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("data:"));

  const chunks: string[] = [];
  let status: string | undefined;
  let contentType: string | undefined;

  for (const line of lines) {
    const jsonPayload = line.slice(5).trim();
    if (!jsonPayload) {
      continue;
    }

    try {
      const parsed = JSON.parse(jsonPayload) as {
        chunk?: string;
        content_type?: string;
        error?: string;
        status?: string;
      };

      if (parsed.error) {
        throw new ApiError(parsed.error, response.status);
      }

      if (parsed.chunk) {
        chunks.push(parsed.chunk);
      }

      if (parsed.status) {
        status = parsed.status;
      }

      if (parsed.content_type) {
        contentType = parsed.content_type;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
    }
  }

  return {
    content_type: contentType,
    status,
    text: chunks.join("").trim(),
  };
}

export async function getBackendHealthFromFrontend() {
  const { data, error, response } = await frontendClient.GET("/health");

  return assertApiData(data, error, response, "Failed to fetch backend health");
}
