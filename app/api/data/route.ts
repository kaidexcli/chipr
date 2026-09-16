import { NextResponse } from "next/server";
import {
  getDbAccounts,
  getDbTransactions,
  getDbCategories,
  getDbBudgets,
  getDbInvoices,
  getDbSettings,
  clearDbData,
} from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/data
 * Fetches the entire synchronized financial dataset from the SQLite database.
 */
export async function GET() {
  try {
    const accounts = getDbAccounts();
    const transactions = getDbTransactions(150);
    const categories = getDbCategories();
    const budgets = getDbBudgets();
    const invoices = getDbInvoices();
    const settings = getDbSettings();

    return NextResponse.json({
      status: "ok",
      accounts,
      transactions,
      categories,
      budgets,
      invoices,
      settings,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.warn("[GET /api/data Notice]:", err.message);
    return NextResponse.json({
      status: "ok",
      accounts: [],
      transactions: [],
      categories: [],
      budgets: [],
      invoices: [],
      settings: null,
      fallback: true,
    });
  }
}

/**
 * DELETE /api/data
 * Wipes all user transactions, accounts, budgets, invoices, and settings from SQLite.
 */
export async function DELETE() {
  try {
    clearDbData();
    return NextResponse.json({
      status: "ok",
      message: "SQLite database wiped clean.",
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[DELETE /api/data Error]:", err);
    return NextResponse.json(
      {
        status: "error",
        error: err.message || "Failed to clear SQLite database",
      },
      { status: 500 }
    );
  }
}
