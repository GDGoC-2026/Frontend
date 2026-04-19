import { BACKEND_API_URL } from "@/lib/config";

export const OAUTH_SESSION_COOKIE_NAME = "versera_oauth_session";
export const OAUTH_NEXT_COOKIE_NAME = "versera_oauth_next";

const OAUTH_REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const OAUTH_TEMP_COOKIE_MAX_AGE_SECONDS = 60 * 10;

export type OAuthProvider = "github" | "google";

type OAuthToken = {
  access_token: string;
  token_type?: string;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractCookieValue(setCookieHeader: string | null, cookieName: string) {
  if (!setCookieHeader) {
    return null;
  }

  const expression = new RegExp(`${escapeRegex(cookieName)}=([^;]+)`);
  const match = expression.exec(setCookieHeader);
  return match?.[1] ?? null;
}

export function normalizeNextPath(rawNextPath: string | null | undefined) {
  if (!rawNextPath) {
    return "/dashboard";
  }

  if (!rawNextPath.startsWith("/") || rawNextPath.startsWith("//")) {
    return "/dashboard";
  }

  return rawNextPath;
}

export function getOAuthCookieConfig(maxAge = OAUTH_TEMP_COOKIE_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function parseOauthErrorMessage(payload: unknown, fallbackStatus: number) {
  if (payload && typeof payload === "object") {
    if ("detail" in payload && typeof payload.detail === "string") {
      return payload.detail;
    }
    if ("message" in payload && typeof payload.message === "string") {
      return payload.message;
    }
  }

  return `OAuth request failed with status ${fallbackStatus}`;
}

export async function readResponseError(response: Response) {
  const payload = (await response.json().catch(() => null)) as unknown;
  return parseOauthErrorMessage(payload, response.status);
}

export async function createProviderRedirect(
  provider: OAuthProvider,
  requestUrl: URL,
  requestHeaders: Headers,
  nextPath: string,
) {
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const callbackOrigin =
    forwardedHost && forwardedProto ? `${forwardedProto}://${forwardedHost}` : requestUrl.origin;
  const callbackUrl = `${callbackOrigin}/api/auth/${provider}/callback`;
  const backendLoginUrl = new URL(`/api/v1/auth/${provider}/login`, `${BACKEND_API_URL}/`);
  backendLoginUrl.searchParams.set("redirect_uri", callbackUrl);

  const backendResponse = await fetch(backendLoginUrl, {
    cache: "no-store",
    method: "GET",
    redirect: "manual",
  });

  if (!OAUTH_REDIRECT_STATUSES.has(backendResponse.status)) {
    throw new Error(await readResponseError(backendResponse));
  }

  const location = backendResponse.headers.get("location");
  if (!location) {
    throw new Error("OAuth provider redirect location is missing");
  }

  return {
    nextPath: normalizeNextPath(nextPath),
    providerUrl: new URL(location, backendLoginUrl).toString(),
    sessionCookieValue: extractCookieValue(backendResponse.headers.get("set-cookie"), "session"),
  };
}

export async function exchangeOAuthCallback(
  provider: OAuthProvider,
  callbackUrl: URL,
  oauthSessionCookie: string,
) {
  const backendCallbackUrl = new URL(`/api/v1/auth/${provider}/callback`, `${BACKEND_API_URL}/`);
  backendCallbackUrl.search = callbackUrl.search;

  const backendResponse = await fetch(backendCallbackUrl, {
    cache: "no-store",
    headers: {
      Cookie: `session=${oauthSessionCookie}`,
    },
    method: "GET",
    redirect: "manual",
  });

  if (!backendResponse.ok) {
    throw new Error(await readResponseError(backendResponse));
  }

  const token = (await backendResponse.json()) as OAuthToken | null;
  if (!token?.access_token) {
    throw new Error("OAuth callback did not return a valid access token");
  }

  return token;
}

export function clearOAuthTempCookies(response: {
  cookies: {
    set: (options: {
      name: string;
      value: string;
      maxAge: number;
      httpOnly: boolean;
      path: string;
      sameSite: "lax";
      secure: boolean;
    }) => void;
  };
}) {
  const base = getOAuthCookieConfig(0);

  response.cookies.set({
    ...base,
    name: OAUTH_SESSION_COOKIE_NAME,
    value: "",
  });
  response.cookies.set({
    ...base,
    name: OAUTH_NEXT_COOKIE_NAME,
    value: "",
  });
}
