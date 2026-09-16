import { NextRequest, NextResponse } from "next/server";
import {
  getDbBudgets,
  insertDbBudget,
  updateDbBudget,
  deleteDbBudget,
} from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/budgets
 * Returns all budget envelopes with live calculated spent amounts.
 */
export async function GET() {
  try {
    const budgets = getDbBudgets();
    return NextResponse.json({
      status: "ok",
      budgets,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/budgets
 * Creates or upserts a budget envelope.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, monthlyLimit, id } = body;

    if (!category || typeof monthlyLimit !== "number") {
      return NextResponse.json(
        { error: "Category name and monthly limit are required." },
        { status: 400 }
      );
    }

    const budget = insertDbBudget(category, monthlyLimit, id);
    return NextResponse.json({
      status: "ok",
      budget,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to create budget envelope" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/budgets
 * Updates a budget envelope monthly limit.
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, monthlyLimit, category } = body;

    if (!id || typeof monthlyLimit !== "number") {
      return NextResponse.json(
        { error: "Budget ID and numeric monthly limit are required." },
        { status: 400 }
      );
    }

    const updated = updateDbBudget(id, monthlyLimit, category);
    if (!updated) {
      return NextResponse.json(
        { error: "Budget envelope not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "ok",
      id,
      monthlyLimit,
      category,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to update budget envelope" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/budgets?id=...&category=...
 * Deletes a budget envelope from SQLite database.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const category = searchParams.get("category") || undefined;

    if (!id) {
      return NextResponse.json(
        { error: "Budget ID is required." },
        { status: 400 }
      );
    }

    const deleted = deleteDbBudget(id, category);
    return NextResponse.json({
      status: "ok",
      deleted,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to delete budget envelope" },
      { status: 500 }
    );
  }
}
