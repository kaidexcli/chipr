import { NextRequest, NextResponse } from "next/server";
import { verifyGroqApiKey } from "@/lib/groq";

export const dynamic = "force-dynamic";

/**
 * POST /api/chat/verify
 * Tests whether a provided Groq API key (or the server's GROQ_API_KEY) is valid.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const headerKey = req.headers.get("x-groq-api-key");
    const keyToTest = headerKey || body?.apiKey || process.env.GROQ_API_KEY;

    if (!keyToTest || !keyToTest.trim()) {
      return NextResponse.json(
        {
          valid: false,
          message: "No API key was provided to test.",
        },
        { status: 400 }
      );
    }

    const result = await verifyGroqApiKey(keyToTest.trim());

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
