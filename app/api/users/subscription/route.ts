import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth/cookie";
import { AUTH_COOKIE_NAME } from "@/lib/config";
import { isTokenExpired } from "@/lib/auth/token";
import {
  updateSubscriptionWithBackend,
  type SubscriptionUpdatePayload,
} from "@/lib/api/users";

export async function PUT(request: Request) {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token || isTokenExpired(token)) {
    const response = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    clearAuthCookie(response);
    return response;
  }

  try {
    const body = (await request.json()) as SubscriptionUpdatePayload;
    const user = await updateSubscriptionWithBackend(token, body);

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to update subscription.",
      },
      { status: 400 },
    );
  }
}
