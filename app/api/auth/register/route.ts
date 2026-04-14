import { NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/auth/cookie";
import {
  loginWithBackend,
  registerWithBackend,
  type RegisterPayload,
} from "@/lib/api/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterPayload;

    await registerWithBackend(body);

    const token = await loginWithBackend({
      email: body.email,
      password: body.password,
    });
    const response = NextResponse.json(token, { status: 201 });

    setAuthCookie(response, token.access_token);

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to register.",
      },
      { status: 400 },
    );
  }
}
