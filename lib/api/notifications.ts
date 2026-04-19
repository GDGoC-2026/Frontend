import type { components } from "@/types/api.generated";
import { backendClient } from "@/lib/api/backend-client";

export type PushSubCreate = components["schemas"]["PushSubCreate"];

// Subscribe to push notifications
export async function subscribePush(token: string, payload: PushSubCreate) {
  const { data, error, response } = await backendClient.POST(
    "/api/v1/notifications/subscribe",
    {
      body: payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (error || !data) {
    throw new Error(
      `Failed to subscribe to push notifications with status ${response?.status ?? "unknown"}`,
    );
  }

  return data;
}
