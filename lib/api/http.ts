type ValidationDetail = {
  msg?: string;
};

type ErrorPayload = {
  detail?: ValidationDetail[] | string;
  message?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | "unknown",
  ) {
    super(message);
  }
}

export function extractErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") {
    return null;
  }

  const payload = error as ErrorPayload;

  if (typeof payload.message === "string" && payload.message.length > 0) {
    return payload.message;
  }

  if (typeof payload.detail === "string" && payload.detail.length > 0) {
    return payload.detail;
  }

  if (Array.isArray(payload.detail) && payload.detail.length > 0) {
    const firstMessage = payload.detail.find((detail) => typeof detail?.msg === "string")?.msg;

    if (firstMessage) {
      return firstMessage;
    }
  }

  return null;
}

export function assertApiSuccess(
  error: unknown,
  response: Response | undefined,
  fallbackMessage: string,
) {
  if (!error) {
    return;
  }

  const message = extractErrorMessage(error) ?? fallbackMessage;
  const status = response?.status ?? "unknown";

  throw new ApiError(`${message} (status ${status})`, status);
}

export function assertApiData<T>(
  data: T | undefined,
  error: unknown,
  response: Response | undefined,
  fallbackMessage: string,
) {
  assertApiSuccess(error, response, fallbackMessage);

  if (data === undefined) {
    throw new ApiError(`${fallbackMessage} (empty response)`, response?.status ?? "unknown");
  }

  return data;
}
