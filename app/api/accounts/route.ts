import { NextRequest, NextResponse } from "next/server";
import {
  getDbAccounts,
  insertDbAccount,
  updateDbAccount,
  deleteDbAccount,
} from "@/lib/db";
import { FinancialAccount } from "@/types/finance";

export const dynamic = "force-dynamic";

/**
 * GET /api/accounts
 * Returns all financial accounts from SQLite database
 */
export async function GET() {
  try {
    const accounts = getDbAccounts();
    return NextResponse.json({
      status: "ok",
      accounts,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accounts
 * Creates or upserts an account in SQLite database
 */
export async function POST(req: NextRequest) {
  try {
    const body: FinancialAccount = await req.json();

    if (!body.name || !body.type || !body.entity) {
      return NextResponse.json(
        { error: "Name, type, and entity are required for an account." },
        { status: 400 }
      );
    }

    const created = insertDbAccount(body);
    return NextResponse.json({
      status: "ok",
      account: created,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to create account" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/accounts
 * Updates an account in SQLite database
 */
export async function PUT(req: NextRequest) {
  try {
    const body: { id: string } & Partial<FinancialAccount> = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Account ID is required." },
        { status: 400 }
      );
    }

    const updated = updateDbAccount(body.id, body);
    if (!updated) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "ok",
      id: body.id,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to update account" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/accounts?id=...
 * Deletes an account from SQLite database
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Account ID is required." },
        { status: 400 }
      );
    }

    const deleted = deleteDbAccount(id);
    return NextResponse.json({
      status: "ok",
      deleted,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}
