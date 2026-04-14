const backendBaseUrl =
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000";

export const BACKEND_API_URL = backendBaseUrl.replace(/\/$/, "");
export const BACKEND_OPENAPI_URL =
  process.env.BACKEND_OPENAPI_URL ?? `${BACKEND_API_URL}/openapi.json`;

export const AUTH_COOKIE_NAME = "versera_access_token";
