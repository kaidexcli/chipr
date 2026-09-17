import { NextRequest, NextResponse } from "next/server";
import { getDbSettings, updateDbSettings } from "@/lib/db";
import { UserSettings } from "@/types/finance";

export const dynamic = "force-dynamic";

/**
 * GET /api/settings
 * Returns user settings from SQLite database
 */
export async function GET() {
  try {
    const settings = getDbSettings();
    return NextResponse.json({
      status: "ok",
      settings,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings
 * Updates user settings in SQLite database
 */
export async function POST(req: NextRequest) {
  try {
    const body: Partial<UserSettings> = await req.json();
    const updated = updateDbSettings(body);
    return NextResponse.json({
      status: "ok",
      settings: updated,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
