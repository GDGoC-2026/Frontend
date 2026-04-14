import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth/cookie";
import { getMeFromBackend } from "@/lib/api/auth";
import { AUTH_COOKIE_NAME } from "@/lib/config";
import { isTokenExpired } from "@/lib/auth/token";

export async function GET() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token || isTokenExpired(token)) {
    const response = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    clearAuthCookie(response);
    return response;
  }

  try {
    const user = await getMeFromBackend(token);

    return NextResponse.json(user);
  } catch {
    const response = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    clearAuthCookie(response);
    return response;
  }
}
