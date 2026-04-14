import type { components } from "@/types/api.generated";
import { backendClient } from "@/lib/api/backend-client";

export type SubscriptionUpdatePayload = components["schemas"]["SubscriptionUpdate"];
export type UserProfile = components["schemas"]["UserProfile"];

export async function updateSubscriptionWithBackend(
  token: string,
  payload: SubscriptionUpdatePayload,
) {
  const { data, error, response } = await backendClient.PUT(
    "/api/v1/users/subscription",
    {
      body: payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const status = response?.status ?? "unknown";

  if (error || !data) {
    throw new Error(`Subscription update failed with status ${status}`);
  }

  return data;
}
