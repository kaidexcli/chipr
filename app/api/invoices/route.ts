import { NextRequest, NextResponse } from "next/server";
import {
  getDbInvoices,
  insertDbInvoice,
  updateDbInvoice,
  deleteDbInvoice,
} from "@/lib/db";
import { Invoice } from "@/types/finance";

export const dynamic = "force-dynamic";

/**
 * GET /api/invoices
 * Returns all invoices from SQLite database
 */
export async function GET() {
  try {
    const invoices = getDbInvoices();
    return NextResponse.json({
      status: "ok",
      invoices,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invoices
 * Creates a new invoice in SQLite database
 */
export async function POST(req: NextRequest) {
  try {
    const body: Invoice = await req.json();

    if (!body.clientName || !body.issueDate || !body.dueDate) {
      return NextResponse.json(
        { error: "Client name, issue date, and due date are required." },
        { status: 400 }
      );
    }

    const created = insertDbInvoice(body);
    return NextResponse.json({
      status: "ok",
      invoice: created,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/invoices
 * Updates an existing invoice in SQLite database
 */
export async function PUT(req: NextRequest) {
  try {
    const body: { id: string } & Partial<Invoice> = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Invoice ID is required." },
        { status: 400 }
      );
    }

    const updated = updateDbInvoice(body.id, body);
    if (!updated) {
      return NextResponse.json(
        { error: "Invoice not found." },
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
      { error: err.message || "Failed to update invoice" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/invoices?id=...
 * Deletes an invoice from SQLite database
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required." },
        { status: 400 }
      );
    }

    const deleted = deleteDbInvoice(id);
    return NextResponse.json({
      status: "ok",
      deleted,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
