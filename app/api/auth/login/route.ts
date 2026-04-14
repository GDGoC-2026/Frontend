import { NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/auth/cookie";
import { loginWithBackend, type LoginPayload } from "@/lib/api/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginPayload;
    const token = await loginWithBackend(body);
    const response = NextResponse.json(token);

    setAuthCookie(response, token.access_token);

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to login.",
      },
      { status: 401 },
    );
  }
}
