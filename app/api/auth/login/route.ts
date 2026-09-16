import { NextRequest, NextResponse } from "next/server";
import {
  AUTHORIZED_USER,
  AUTH_COOKIE_NAME,
  createSessionToken,
  validateCredentials,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe = true } = body || {};

    if (!validateCredentials(email, password)) {
      return NextResponse.json(
        {
          status: "error",
          error:
            "Invalid credentials. Access to Chipr is currently exclusive to authorized accounts.",
        },
        { status: 401 }
      );
    }

    const token = createSessionToken();
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 1 day

    const response = NextResponse.json({
      status: "ok",
      user: {
        email: AUTHORIZED_USER.email,
        name: AUTHORIZED_USER.name,
        role: AUTHORIZED_USER.role,
      },
      token,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { status: "error", error: err.message || "Authentication error" },
      { status: 500 }
    );
  }
}
