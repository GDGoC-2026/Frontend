"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type { AuthToken, LoginPayload, RegisterPayload, UserProfile } from "@/lib/api/auth";
import type { SubscriptionUpdatePayload } from "@/lib/api/users";

const sessionKey = ["auth", "session"] as const;

class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function requestJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => null)) as T | { message?: string } | null;

  if (!response.ok) {
    throw new HttpError(
      (payload && typeof payload === "object" && "message" in payload && payload.message) ||
        "Request failed",
      response.status,
    );
  }

  return payload as T;
}

export function useSessionQuery() {
  return useQuery({
    queryFn: async () => {
      try {
        return await requestJson<UserProfile>("/api/auth/session", {
          cache: "no-store",
          method: "GET",
        });
      } catch (error) {
        if (error instanceof HttpError && error.status === 401) {
          return null;
        }

        throw error;
      }
    },
    queryKey: sessionKey,
    refetchOnMount: "always",
    refetchInterval: 60_000,
    retry: false,
  });
}

function useAuthMutation<TPayload>(
  endpoint: string,
  options?: UseMutationOptions<AuthToken, Error, TPayload>,
) {
  const queryClient = useQueryClient();

  return useMutation<AuthToken, Error, TPayload>({
    ...options,
    mutationFn: async (payload) =>
      requestJson<AuthToken>(endpoint, {
        body: JSON.stringify(payload),
        method: "POST",
      }),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: sessionKey });
      await options?.onSuccess?.(data, variables, context);
    },
  });
}

export function useLoginMutation(options?: UseMutationOptions<AuthToken, Error, LoginPayload>) {
  return useAuthMutation<LoginPayload>("/api/auth/login", options);
}

export function useRegisterMutation(
  options?: UseMutationOptions<AuthToken, Error, RegisterPayload>,
) {
  return useAuthMutation<RegisterPayload>("/api/auth/register", options);
}

export function useUpdateSubscriptionMutation(
  options?: UseMutationOptions<UserProfile, Error, SubscriptionUpdatePayload>,
) {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, Error, SubscriptionUpdatePayload>({
    ...options,
    mutationFn: async (payload) =>
      requestJson<UserProfile>("/api/users/subscription", {
        body: JSON.stringify(payload),
        method: "PUT",
      }),
    onSuccess: async (data, variables, context) => {
      queryClient.setQueryData(sessionKey, data);
      await queryClient.invalidateQueries({ queryKey: sessionKey });
      await options?.onSuccess?.(data, variables, context);
    },
  });
}

export function useLogoutMutation(options?: UseMutationOptions<{ ok: boolean }, Error, void>) {
  const queryClient = useQueryClient();

  return useMutation<{ ok: boolean }, Error, void>({
    ...options,
    mutationFn: async () =>
      requestJson<{ ok: boolean }>("/api/auth/logout", {
        method: "POST",
      }),
    onSuccess: async (data, variables, context) => {
      queryClient.setQueryData(sessionKey, null);
      await queryClient.invalidateQueries({ queryKey: sessionKey });
      await options?.onSuccess?.(data, variables, context);
    },
  });
}

export async function logout() {
  await fetch("/api/auth/logout", {
    method: "POST",
  });
}
