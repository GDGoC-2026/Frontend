import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/config";
import { isTokenExpired } from "@/lib/auth/token";

function buildLoginUrl(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/auth/login";

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    url.searchParams.set("next", request.nextUrl.pathname);
  }

  return url;
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");

  if (!isDashboardRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  if (!token) {
    if (isDashboardRoute) {
      return NextResponse.redirect(buildLoginUrl(request));
    }

    return NextResponse.next();
  }

  if (isTokenExpired(token)) {
    const response = isDashboardRoute
      ? NextResponse.redirect(buildLoginUrl(request))
      : NextResponse.next();

    response.cookies.delete(AUTH_COOKIE_NAME);

    if (isAuthRoute) {
      return response;
    }

    return response;
  }

  if (isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/dashboard/:path*"],
};
