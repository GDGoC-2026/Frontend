import { NextResponse } from "next/server";
import {
  createProviderRedirect,
  getOAuthCookieConfig,
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
  const requestedNextPath = normalizeNextPath(requestUrl.searchParams.get("next"));

  try {
    const oauthRedirect = await createProviderRedirect("github", requestUrl, requestedNextPath);
    const response = NextResponse.redirect(oauthRedirect.providerUrl);
    const cookieConfig = getOAuthCookieConfig();

    response.cookies.set({
      ...cookieConfig,
      name: OAUTH_NEXT_COOKIE_NAME,
      value: oauthRedirect.nextPath,
    });

    if (oauthRedirect.sessionCookieValue) {
      response.cookies.set({
        ...cookieConfig,
        name: OAUTH_SESSION_COOKIE_NAME,
        value: oauthRedirect.sessionCookieValue,
      });
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "GitHub OAuth login failed";
    return NextResponse.redirect(buildLoginUrl(requestUrl, message, requestedNextPath));
  }
}
