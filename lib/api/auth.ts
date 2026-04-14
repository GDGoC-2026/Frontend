import type { components } from "@/types/api.generated";
import { backendClient } from "@/lib/api/backend-client";

export type LoginPayload = components["schemas"]["UserLogin"];
export type RegisterPayload = components["schemas"]["UserCreate"];
export type AuthToken = components["schemas"]["Token"];
export type UserProfile = components["schemas"]["UserProfile"];

export async function loginWithBackend(payload: LoginPayload) {
  const { data, error, response } = await backendClient.POST("/api/v1/auth/login", {
    body: payload,
  });
  const status = response?.status ?? "unknown";

  if (error || !data) {
    throw new Error(`Login failed with status ${status}`);
  }

  return data;
}

export async function registerWithBackend(payload: RegisterPayload) {
  const { data, error, response } = await backendClient.POST("/api/v1/auth/register", {
    body: payload,
  });
  const status = response?.status ?? "unknown";

  if (error || !data) {
    throw new Error(`Register failed with status ${status}`);
  }

  return data;
}

export async function getMeFromBackend(token: string) {
  const { data, error, response } = await backendClient.GET("/api/v1/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const status = response?.status ?? "unknown";

  if (error || !data) {
    throw new Error(`Session lookup failed with status ${status}`);
  }

  return data;
}
