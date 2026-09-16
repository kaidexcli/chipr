import { NextRequest, NextResponse } from "next/server";
import {
  AUTHORIZED_USER,
  AUTH_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  const token = cookie?.value || request.headers.get("authorization")?.replace("Bearer ", "");

  const isValid = verifySessionToken(token);

  if (isValid) {
    return NextResponse.json({
      status: "ok",
      authenticated: true,
      user: {
        email: AUTHORIZED_USER.email,
        name: AUTHORIZED_USER.name,
        role: AUTHORIZED_USER.role,
      },
    });
  }

  return NextResponse.json({
    status: "ok",
    authenticated: false,
    user: null,
  });
}
