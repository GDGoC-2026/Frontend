import type { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/config";
import { getTokenExpiration } from "@/lib/auth/token";

export function setAuthCookie(response: NextResponse, token: string) {
  const expiration = getTokenExpiration(token);
  const maxAge =
    expiration !== null ? Math.max(expiration - Math.floor(Date.now() / 1000), 0) : undefined;

  response.cookies.set({
    httpOnly: true,
    maxAge,
    name: AUTH_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    value: token,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    httpOnly: true,
    maxAge: 0,
    name: AUTH_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    value: "",
  });
}
