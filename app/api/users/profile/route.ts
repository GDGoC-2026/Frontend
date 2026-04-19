import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth/cookie";
import { isTokenExpired } from "@/lib/auth/token";
import { AUTH_COOKIE_NAME } from "@/lib/config";
import { getProfileFromBackend } from "@/lib/api/users";

export async function GET() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token || isTokenExpired(token)) {
    const response = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    clearAuthCookie(response);
    return response;
  }

  try {
    const profile = await getProfileFromBackend(token);
    return NextResponse.json(profile);
  } catch {
    const response = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    clearAuthCookie(response);
    return response;
  }
}
