import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/auth/cookie";
import {
  clearOAuthTempCookies,
  exchangeOAuthCallback,
  normalizeNextPath,
  OAUTH_NEXT_COOKIE_NAME,
  OAUTH_SESSION_COOKIE_NAME,
} from "@/lib/auth/oauth";

function buildLoginUrl(requestUrl: URL, message: string, nextPath: string) {
  const url = new URL("/auth/login", requestUrl);
  url.searchParams.set("oauth_error", message);
  if (nextPath && nextPath !== "/dashboard") {
    url.searchParams.set("next", nextPath);
  }
  return url;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const cookieStore = await cookies();
  const nextPath = normalizeNextPath(cookieStore.get(OAUTH_NEXT_COOKIE_NAME)?.value);
  const oauthSessionCookie = cookieStore.get(OAUTH_SESSION_COOKIE_NAME)?.value;

  if (requestUrl.searchParams.get("error")) {
    const response = NextResponse.redirect(
      buildLoginUrl(
        requestUrl,
        requestUrl.searchParams.get("error_description") ??
          requestUrl.searchParams.get("error") ??
          "OAuth login was cancelled",
        nextPath,
      ),
    );
    clearOAuthTempCookies(response);
    return response;
  }

  if (!oauthSessionCookie) {
    const response = NextResponse.redirect(
      buildLoginUrl(requestUrl, "OAuth session is missing. Please try again.", nextPath),
    );
    clearOAuthTempCookies(response);
    return response;
  }

  try {
    const token = await exchangeOAuthCallback("google", requestUrl, oauthSessionCookie);
    const destination = new URL(nextPath, requestUrl.origin);
    const response = NextResponse.redirect(destination);

    setAuthCookie(response, token.access_token);
    clearOAuthTempCookies(response);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google OAuth callback failed";
    const response = NextResponse.redirect(buildLoginUrl(requestUrl, message, nextPath));
    clearOAuthTempCookies(response);
    return response;
  }
}
