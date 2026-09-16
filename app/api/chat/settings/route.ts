import { NextRequest, NextResponse } from "next/server";
import {
  AVAILABLE_GROQ_MODELS,
  getActiveGroqApiKey,
  getActiveGroqModel,
  saveServerGroqModel,
} from "@/lib/groq";

export const dynamic = "force-dynamic";

/**
 * GET /api/chat/settings
 * Returns AI engine status and active model for client applications across all devices.
 * Sensitive API keys are never exposed over the network.
 */
export async function GET() {
  const isConfigured = Boolean(getActiveGroqApiKey());
  const activeModel = getActiveGroqModel();

  return NextResponse.json({
    status: "ok",
    isConfigured,
    model: activeModel,
    models: AVAILABLE_GROQ_MODELS,
    multiDeviceSync: true,
  });
}

/**
 * POST /api/chat/settings
 * Updates user model preferences globally so all devices automatically share the selected model.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { model } = body || {};

    if (model && typeof model === "string" && model.trim()) {
      saveServerGroqModel(model.trim());
    }

    return NextResponse.json({
      status: "ok",
      message: "Groq model configuration updated globally across all devices.",
      model: getActiveGroqModel(),
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      {
        status: "error",
        error: err.message || "Failed to update Groq settings.",
      },
      { status: 500 }
    );
  }
}
