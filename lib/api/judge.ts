import type { components } from "@/types/api.generated";
import { backendClient } from "@/lib/api/backend-client";

export type CodeSubmission = components["schemas"]["CodeSubmission"];
export type CodeSessionSave = components["schemas"]["CodeSessionSave"];

// Execute code
export async function executeCode(token: string, payload: CodeSubmission) {
  const { data, error, response } = await backendClient.POST(
    "/api/v1/judge/execute",
    {
      body: payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (error || !data) {
    throw new Error(
      `Failed to execute code with status ${response?.status ?? "unknown"}`,
    );
  }

  return data;
}

// Save code session
export async function saveCodeSession(token: string, payload: CodeSessionSave) {
  const { data, error, response } = await backendClient.POST(
    "/api/v1/judge/sessions",
    {
      body: payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (error || !data) {
    throw new Error(
      `Failed to save code session with status ${response?.status ?? "unknown"}`,
    );
  }

  return data;
}
