import { NextResponse } from "next/server";
import { verifyGroqApiKey } from "@/lib/groq";

export const dynamic = "force-dynamic";

/**
 * POST /api/chat/verify
 * Tests whether the server's environment GROQ_API_KEY is properly configured and authenticates with Groq.
 */
export async function POST() {
  try {
    const result = await verifyGroqApiKey();

    return NextResponse.json(result, {
      status: result.valid ? 200 : 401,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      {
        valid: false,
        message: err.message || "Unexpected verification error.",
      },
      { status: 500 }
    );
  }
}
