import { NextRequest, NextResponse } from "next/server";
import {
  getDbTransactions,
  insertDbTransaction,
  deleteDbTransaction,
} from "@/lib/db";
import { Transaction } from "@/types/finance";

export const dynamic = "force-dynamic";

/**
 * GET /api/transactions
 * Returns transactions from SQLite database
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const transactions = getDbTransactions(limit);

    return NextResponse.json({
      status: "ok",
      transactions,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transactions
 * Inserts a new transaction into SQLite database and updates account balance
 */
export async function POST(req: NextRequest) {
  try {
    const body: Omit<Transaction, "id"> & { id?: string; createdVia?: string } =
      await req.json();

    if (!body.merchant || body.amount === undefined || !body.category) {
      return NextResponse.json(
        { error: "Merchant, amount, and category are required." },
        { status: 400 }
      );
    }

    const createdTx = insertDbTransaction(body);

    return NextResponse.json({
      status: "ok",
      transaction: createdTx,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[POST /api/transactions Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to record transaction in database" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/transactions
 * Deletes a transaction from SQLite database
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required." },
        { status: 400 }
      );
    }

    const deleted = deleteDbTransaction(id);

    return NextResponse.json({
      status: "ok",
      deleted,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
