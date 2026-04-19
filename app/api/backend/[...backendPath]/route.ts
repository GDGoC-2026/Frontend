import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { clearAuthCookie } from "@/lib/auth/cookie";
import { isTokenExpired } from "@/lib/auth/token";
import { AUTH_COOKIE_NAME, BACKEND_API_URL } from "@/lib/config";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);
const SAME_ORIGIN_REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const MAX_SAME_ORIGIN_REDIRECTS = 5;

type BackendRouteContext = {
  params: Promise<{ backendPath: string[] }>;
};

function filterHeaders(headers: Headers, options?: { stripContentHeaders?: boolean }) {
  const output = new Headers();

  headers.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();

    if (
      normalizedKey === "host" ||
      normalizedKey === "cookie" ||
      HOP_BY_HOP_HEADERS.has(normalizedKey)
    ) {
      return;
    }

    if (
      options?.stripContentHeaders &&
      (normalizedKey === "content-length" || normalizedKey === "content-encoding")
    ) {
      return;
    }

    output.set(key, value);
  });

  return output;
}

function buildTargetUrl(request: NextRequest, backendPath: string[]) {
  const joinedPath = backendPath.join("/");
  const normalizedPath = request.nextUrl.pathname.endsWith("/")
    ? `${joinedPath}/`
    : joinedPath;
  const target = new URL(normalizedPath, `${BACKEND_API_URL}/`);
  target.search = request.nextUrl.search;

  return target;
}

async function resolveAuthorizationHeader() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return { shouldClearCookie: false, token: null as string | null };
  }

  if (isTokenExpired(token)) {
    return { shouldClearCookie: true, token: null as string | null };
  }

  return { shouldClearCookie: false, token };
}

function isSameOriginRedirect(
  response: Response,
  currentUrl: URL,
  origin: string,
) {
  if (!SAME_ORIGIN_REDIRECT_STATUSES.has(response.status)) {
    return null;
  }

  const location = response.headers.get("location");

  if (!location) {
    return null;
  }

  const redirectedUrl = new URL(location, currentUrl);

  if (redirectedUrl.origin !== origin) {
    return null;
  }

  return redirectedUrl;
}

async function fetchBackendWithSameOriginRedirects(
  initialUrl: URL,
  init: RequestInit,
) {
  let currentUrl = initialUrl;
  let currentMethod = init.method;
  let currentBody = init.body;

  for (let attempt = 0; attempt <= MAX_SAME_ORIGIN_REDIRECTS; attempt += 1) {
    const response = await fetch(currentUrl, {
      ...init,
      body: currentBody,
      method: currentMethod,
      redirect: "manual",
    });
    const redirectedUrl = isSameOriginRedirect(
      response,
      currentUrl,
      initialUrl.origin,
    );

    if (!redirectedUrl) {
      return response;
    }

    currentUrl = redirectedUrl;

    if (response.status === 303) {
      currentMethod = "GET";
      currentBody = undefined;
    }
  }

  return fetch(currentUrl, {
    ...init,
    body: currentBody,
    method: currentMethod,
    redirect: "manual",
  });
}

async function proxyToBackend(request: NextRequest, context: BackendRouteContext) {
  const { backendPath } = await context.params;

  if (!backendPath || backendPath.length === 0) {
    return NextResponse.json({ message: "Backend path is required." }, { status: 400 });
  }

  const targetUrl = buildTargetUrl(request, backendPath);
  const requestHeaders = filterHeaders(request.headers);
  const { shouldClearCookie, token } = await resolveAuthorizationHeader();

  if (token && !requestHeaders.has("authorization")) {
    requestHeaders.set("authorization", `Bearer ${token}`);
  }

  const shouldSendBody = request.method !== "GET" && request.method !== "HEAD";
  const requestBody = shouldSendBody ? await request.arrayBuffer() : undefined;

  let backendResponse: Response;
  try {
    backendResponse = await fetchBackendWithSameOriginRedirects(targetUrl, {
      body: requestBody,
      cache: "no-store",
      headers: requestHeaders,
      method: request.method,
    });
  } catch {
    const response = NextResponse.json(
      { message: "Unable to reach backend API." },
      { status: 502 },
    );

    if (shouldClearCookie) {
      clearAuthCookie(response);
    }

    return response;
  }

  const responseHeaders = filterHeaders(backendResponse.headers, {
    stripContentHeaders: request.method === "HEAD",
  });
  const isEventStream =
    request.method !== "HEAD" &&
    (backendResponse.headers.get("content-type") ?? "").includes("text/event-stream");

  if (isEventStream) {
    const streamResponse = new NextResponse(backendResponse.body, {
      headers: responseHeaders,
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });

    if (shouldClearCookie || backendResponse.status === 401) {
      clearAuthCookie(streamResponse);
    }

    return streamResponse;
  }

  const responseBody =
    request.method === "HEAD" ? null : await backendResponse.arrayBuffer();
  const response = new NextResponse(responseBody, {
    headers: responseHeaders,
    status: backendResponse.status,
    statusText: backendResponse.statusText,
  });

  if (shouldClearCookie || backendResponse.status === 401) {
    clearAuthCookie(response);
  }

  return response;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = proxyToBackend;
export const POST = proxyToBackend;
export const PUT = proxyToBackend;
export const PATCH = proxyToBackend;
export const DELETE = proxyToBackend;
export const OPTIONS = proxyToBackend;
export const HEAD = proxyToBackend;
