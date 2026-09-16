import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import {
  FinancialAccount,
  Transaction,
  Invoice,
  BudgetEnvelope,
  UserSettings,
  ScheduleCCategory,
} from "@/types/finance";

import {
  ExpenseCategory,
  STANDARD_CATEGORIES,
  resolveCategory,
  getPersonalCategories,
  getBusinessCategories,
} from "@/lib/categories";

export {
  type ExpenseCategory,
  STANDARD_CATEGORIES,
  resolveCategory,
  getPersonalCategories,
  getBusinessCategories,
};

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "chipr.db");
  const db = new Database(dbPath);

  // Enable WAL mode for high performance concurrent read/writes
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  initializeSchema(db);
  seedInitialData(db);

  dbInstance = db;
  return db;
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      entity TEXT NOT NULL,
      balance REAL NOT NULL,
      institution TEXT NOT NULL,
      account_number_masked TEXT,
      currency TEXT DEFAULT 'PHP',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      entity TEXT NOT NULL,
      schedule_c_category TEXT,
      is_tax_deductible INTEGER DEFAULT 0,
      deductible_percentage INTEGER DEFAULT 0,
      description TEXT,
      examples TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      merchant TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      entity TEXT NOT NULL,
      account_id TEXT,
      account_name TEXT,
      currency TEXT DEFAULT 'PHP',
      is_tax_deductible INTEGER DEFAULT 0,
      deductible_percentage INTEGER DEFAULT 0,
      schedule_c_category TEXT,
      reimbursement_status TEXT DEFAULT 'none',
      is_owner_draw INTEGER DEFAULT 0,
      is_capital_contribution INTEGER DEFAULT 0,
      note TEXT,
      created_via TEXT DEFAULT 'manual',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL UNIQUE,
      monthly_limit REAL NOT NULL,
      entity TEXT DEFAULT 'personal'
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT NOT NULL UNIQUE,
      client_name TEXT NOT NULL,
      client_email TEXT,
      issue_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      payment_terms TEXT NOT NULL,
      status TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      total REAL NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      personal_name TEXT,
      business_name TEXT,
      email TEXT,
      phone TEXT,
      role TEXT,
      business_type TEXT,
      tax_id_masked TEXT,
      currency TEXT DEFAULT 'PHP',
      fiscal_year_start TEXT DEFAULT 'January',
      default_workspace TEXT DEFAULT 'personal',
      default_privacy_mask INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      context_scope TEXT,
      status TEXT DEFAULT 'sent',
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  try {
    db.exec("ALTER TABLE transactions ADD COLUMN currency TEXT DEFAULT 'PHP'");
  } catch {
    // Column already exists
  }
}

function seedInitialData(db: Database.Database) {
  // Check if categories are already seeded
  const categoryCount = (
    db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number }
  ).count;

  const insertCat = db.prepare(`
    INSERT OR REPLACE INTO categories (id, name, entity, schedule_c_category, is_tax_deductible, deductible_percentage, description, examples)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Seed or update all standard categories in SQLite
  const insertTx = db.transaction(() => {
    for (const cat of STANDARD_CATEGORIES) {
      insertCat.run(
        cat.id,
        cat.name,
        cat.entity,
        cat.scheduleCCategory || null,
        cat.isTaxDeductible ? 1 : 0,
        cat.deductiblePercentage,
        cat.description,
        JSON.stringify(cat.examples)
      );
    }
  });
  insertTx();

  // Seed default settings with clean empty defaults if empty
  const settingsCount = (
    db.prepare("SELECT COUNT(*) as count FROM user_settings").get() as { count: number }
  ).count;

  if (settingsCount === 0) {
    db.prepare(`
      INSERT INTO user_settings (id, personal_name, business_name, email, role, business_type, currency, default_workspace)
      VALUES ('default', '', '', '', '', 'Sole Proprietorship', 'PHP', 'personal')
    `).run();
  }

  // Ensure default currency is migrated to PHP if currently USD or null
  try {
    db.prepare("UPDATE user_settings SET currency = 'PHP' WHERE currency = 'USD' OR currency IS NULL").run();
    db.prepare("UPDATE accounts SET currency = 'PHP' WHERE currency = 'USD' OR currency IS NULL").run();
    db.prepare("UPDATE transactions SET currency = 'PHP' WHERE currency = 'USD' OR currency IS NULL").run();
  } catch {
    // Ignore migration failure if tables are not yet populated
  }
}

// ============================================================================
// Database Query & Mutation API
// ============================================================================

export function getDbAccounts(): FinancialAccount[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM accounts ORDER BY name ASC").all() as Array<{
    id: string;
    name: string;
    type: string;
    entity: string;
    balance: number;
    institution: string;
    account_number_masked: string;
    currency: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type as FinancialAccount["type"],
    entity: r.entity as FinancialAccount["entity"],
    balance: r.balance,
    institution: r.institution,
    accountNumberMasked: r.account_number_masked || "•••• 0000",
    currency: r.currency || "PHP",
  }));
}

export function getDbCategories(entityFilter?: "personal" | "business"): ExpenseCategory[] {
  const db = getDb();
  let query = "SELECT * FROM categories";
  const params: unknown[] = [];

  if (entityFilter) {
    query += " WHERE entity = ? OR entity = 'both'";
    params.push(entityFilter);
  }

  query += " ORDER BY name ASC";
  const rows = db.prepare(query).all(...params) as Array<{
    id: string;
    name: string;
    entity: string;
    schedule_c_category: string | null;
    is_tax_deductible: number;
    deductible_percentage: number;
    description: string;
    examples: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    entity: r.entity as ExpenseCategory["entity"],
    scheduleCCategory: r.schedule_c_category as ScheduleCCategory | undefined,
    isTaxDeductible: Boolean(r.is_tax_deductible),
    deductiblePercentage: r.deductible_percentage,
    description: r.description,
    examples: r.examples ? JSON.parse(r.examples) : [],
  }));
}

export function getDbTransactions(limit = 100): Transaction[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM transactions ORDER BY date DESC, created_at DESC LIMIT ?")
    .all(limit) as Array<{
    id: string;
    date: string;
    merchant: string;
    category: string;
    amount: number;
    entity: string;
    account_id: string | null;
    account_name: string | null;
    currency: string | null;
    is_tax_deductible: number;
    deductible_percentage: number;
    schedule_c_category: string | null;
    reimbursement_status: string | null;
    is_owner_draw: number;
    is_capital_contribution: number;
    note: string | null;
    created_via: string | null;
  }>;

  return rows.map((r) => ({
    id: r.id,
    date: r.date,
    merchant: r.merchant,
    category: r.category,
    amount: r.amount,
    entity: r.entity as Transaction["entity"],
    accountId: r.account_id || "",
    accountName: r.account_name || "Account",
    currency: r.currency || "PHP",
    isTaxDeductible: Boolean(r.is_tax_deductible),
    deductiblePercentage: r.deductible_percentage,
    scheduleCCategory: r.schedule_c_category as ScheduleCCategory | undefined,
    reimbursementStatus: (r.reimbursement_status as Transaction["reimbursementStatus"]) || "none",
    isOwnerDraw: Boolean(r.is_owner_draw),
    isCapitalContribution: Boolean(r.is_capital_contribution),
    note: r.note || undefined,
    createdVia: r.created_via || "manual",
  }));
}



export function insertDbTransaction(
  tx: Omit<Transaction, "id"> & { id?: string; createdVia?: string }
): Transaction {
  const db = getDb();
  const id = tx.id || `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // Find account if not provided
  let accountId = tx.accountId;
  let accountName = tx.accountName;

  if (!accountId || !accountName) {
    const defaultAcc = db
      .prepare("SELECT id, name FROM accounts WHERE entity = ? LIMIT 1")
      .get(tx.entity) as { id: string; name: string } | undefined;

    if (defaultAcc) {
      accountId = defaultAcc.id;
      accountName = defaultAcc.name;
    } else {
      accountId = tx.entity === "business" ? "acc-biz-checking" : "acc-personal-checking";
      accountName = tx.entity === "business" ? "Business Checking" : "Personal Checking";
    }
  }

  // Ensure account exists in accounts table so balance is tracked
  const existingAcc = db
    .prepare("SELECT id FROM accounts WHERE id = ?")
    .get(accountId);
  if (!existingAcc) {
    db.prepare(`
      INSERT INTO accounts (id, name, type, entity, balance, institution, currency)
      VALUES (?, ?, 'checking', ?, 0, 'Primary Ledger', ?)
    `).run(accountId, accountName, tx.entity, tx.currency || "PHP");
  }

  // Dynamically resolve category using full financial taxonomy
  const finalCategory = resolveCategory(tx.category, tx.merchant, tx.entity);

  // Currency detection and settings sync
  const txCurrency = tx.currency || "PHP";
  if (txCurrency === "PHP") {
    try {
      const currentSetting = db.prepare("SELECT currency FROM user_settings WHERE id = 'default'").get() as { currency: string } | undefined;
      if (!currentSetting || currentSetting.currency === "USD") {
        db.prepare("UPDATE user_settings SET currency = 'PHP' WHERE id = 'default'").run();
      }
    } catch {
      // Ignore settings sync failure
    }
  }

  // Check if category exists in database, or if it has Schedule C deduction info
  const categoryInfo = db
    .prepare("SELECT * FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1")
    .get(finalCategory) as
    | {
        schedule_c_category: string | null;
        is_tax_deductible: number;
        deductible_percentage: number;
      }
    | undefined;

  const isDeductible =
    tx.isTaxDeductible !== undefined
      ? tx.isTaxDeductible ? 1 : 0
      : categoryInfo ? categoryInfo.is_tax_deductible : 0;

  const deductiblePct =
    tx.deductiblePercentage !== undefined
      ? tx.deductiblePercentage
      : categoryInfo ? categoryInfo.deductible_percentage : 0;

  const scheduleC =
    tx.scheduleCCategory || categoryInfo?.schedule_c_category || null;

  const stmt = db.prepare(`
    INSERT INTO transactions (
      id, date, merchant, category, amount, entity, account_id, account_name,
      currency, is_tax_deductible, deductible_percentage, schedule_c_category,
      reimbursement_status, is_owner_draw, is_capital_contribution, note, created_via
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    tx.date || new Date().toISOString().split("T")[0],
    tx.merchant,
    finalCategory,
    tx.amount,
    tx.entity,
    accountId,
    accountName,
    txCurrency,
    isDeductible,
    deductiblePct,
    scheduleC,
    tx.reimbursementStatus || "none",
    tx.isOwnerDraw ? 1 : 0,
    tx.isCapitalContribution ? 1 : 0,
    tx.note || null,
    tx.createdVia || "ai_chat"
  );

  // Update account balance
  try {
    db.prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?").run(
      tx.amount,
      accountId
    );
  } catch (err) {
    console.warn("Could not update account balance:", err);
  }

  return {
    id,
    date: tx.date || new Date().toISOString().split("T")[0],
    merchant: tx.merchant,
    category: finalCategory,
    amount: tx.amount,
    entity: tx.entity,
    accountId,
    accountName,
    currency: txCurrency,
    isTaxDeductible: Boolean(isDeductible),
    deductiblePercentage: deductiblePct,
    scheduleCCategory: scheduleC as ScheduleCCategory | undefined,
    reimbursementStatus: tx.reimbursementStatus || "none",
    isOwnerDraw: tx.isOwnerDraw,
    isCapitalContribution: tx.isCapitalContribution,
    note: tx.note,
  };
}

export function deleteDbTransaction(id: string): boolean {
  const db = getDb();
  // Get transaction to revert account balance
  const tx = db.prepare("SELECT amount, account_id FROM transactions WHERE id = ?").get(id) as
    | { amount: number; account_id: string }
    | undefined;

  if (tx && tx.account_id) {
    db.prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?").run(
      tx.amount,
      tx.account_id
    );
  }

  const res = db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
  return res.changes > 0;
}

export function getDbBudgets(): BudgetEnvelope[] {
  const db = getDb();

  // Fetch all user-defined budget envelopes from SQLite
  const budgets = db.prepare("SELECT * FROM budgets").all() as Array<{
    id: string;
    category: string;
    monthly_limit: number;
    entity: string;
  }>;

  // Calculate actual spent this month from transactions
  const currentMonthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
  const spentRows = db
    .prepare(
      `SELECT category, ABS(SUM(amount)) as spent
       FROM transactions
       WHERE amount < 0 AND entity = 'personal' AND (date LIKE ? OR date IS NULL OR date = '')
       GROUP BY category`
    )
    .all(`${currentMonthPrefix}%`) as Array<{ category: string; spent: number }>;

  const spentMap = new Map<string, number>();
  for (const r of spentRows) {
    const key = r.category.toLowerCase().trim();
    spentMap.set(key, (spentMap.get(key) || 0) + r.spent);
  }

  const budgetList: BudgetEnvelope[] = budgets.map((b) => {
    const catKey = b.category.toLowerCase().trim();
    let spent = spentMap.get(catKey) || 0;
    if (!spent) {
      for (const [k, v] of spentMap.entries()) {
        if (k.includes(catKey) || catKey.includes(k)) {
          spent += v;
        }
      }
    }
    return {
      id: b.id,
      category: b.category,
      monthlyLimit: b.monthly_limit,
      spent,
      entity: "personal" as const,
    };
  });

  // Automatically include any category with recorded personal expenses so it immediately
  // surfaces in the Budget tab even before an explicit ceiling limit is established
  const existingCategories = new Set(budgets.map((b) => b.category.toLowerCase().trim()));
  for (const [catKey, spentAmount] of spentMap.entries()) {
    if (!existingCategories.has(catKey) && spentAmount > 0) {
      const matchingRow = spentRows.find((r) => r.category.toLowerCase().trim() === catKey);
      const properName = matchingRow ? matchingRow.category : catKey;
      budgetList.push({
        id: `b-auto-${catKey.replace(/[^a-z0-9]/g, "-")}`,
        category: properName,
        monthlyLimit: 0,
        spent: spentAmount,
        entity: "personal",
      });
    }
  }

  return budgetList;
}

export function insertDbBudget(
  category: string,
  monthlyLimit: number,
  id?: string
): BudgetEnvelope {
  const db = getDb();
  const cleanCategory = category.trim();
  const budgetId = id || `b-${cleanCategory.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;

  db.prepare(`
    INSERT INTO budgets (id, category, monthly_limit, entity)
    VALUES (?, ?, ?, 'personal')
    ON CONFLICT(category) DO UPDATE SET monthly_limit = excluded.monthly_limit
  `).run(budgetId, cleanCategory, monthlyLimit);

  const currentMonthPrefix = new Date().toISOString().slice(0, 7);
  const spentRow = db
    .prepare(
      `SELECT ABS(SUM(amount)) as spent FROM transactions
       WHERE amount < 0 AND entity = 'personal' AND LOWER(category) = LOWER(?) AND (date LIKE ? OR date IS NULL OR date = '')`
    )
    .get(cleanCategory, `${currentMonthPrefix}%`) as { spent: number | null } | undefined;

  return {
    id: budgetId,
    category: cleanCategory,
    monthlyLimit,
    spent: spentRow?.spent || 0,
    entity: "personal",
  };
}

export function updateDbBudget(id: string, monthlyLimit: number, category?: string): boolean {
  const db = getDb();
  if (category && category.trim()) {
    const cleanCat = category.trim();
    const res = db
      .prepare("UPDATE budgets SET monthly_limit = ?, category = ? WHERE id = ?")
      .run(monthlyLimit, cleanCat, id);
    if (res.changes > 0) return true;

    // If ID was an auto-budget (b-auto-...) or not found by ID, upsert by category
    insertDbBudget(cleanCat, monthlyLimit, id);
    return true;
  }

  const res = db.prepare("UPDATE budgets SET monthly_limit = ? WHERE id = ?").run(monthlyLimit, id);
  return res.changes > 0;
}

export function deleteDbBudget(id: string, category?: string): boolean {
  const db = getDb();
  let deleted = false;
  const res1 = db.prepare("DELETE FROM budgets WHERE id = ?").run(id);
  if (res1.changes > 0) deleted = true;

  if (category && category.trim()) {
    const res2 = db
      .prepare("DELETE FROM budgets WHERE LOWER(category) = LOWER(?)")
      .run(category.trim());
    if (res2.changes > 0) deleted = true;
  }
  return deleted;
}

export function getDbInvoices(): Invoice[] {
  const db = getDb();
  const invoices = db.prepare("SELECT * FROM invoices ORDER BY issue_date DESC").all() as Array<{
    id: string;
    invoice_number: string;
    client_name: string;
    client_email: string;
    issue_date: string;
    due_date: string;
    payment_terms: string;
    status: string;
    subtotal: number;
    tax: number;
    total: number;
    notes: string;
  }>;

  const itemsStmt = db.prepare("SELECT * FROM invoice_items WHERE invoice_id = ?");

  return invoices.map((inv) => {
    const items = itemsStmt.all(inv.id) as Array<{
      id: string;
      description: string;
      quantity: number;
      unit_price: number;
      amount: number;
    }>;

    return {
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      clientName: inv.client_name,
      clientEmail: inv.client_email,
      issueDate: inv.issue_date,
      dueDate: inv.due_date,
      paymentTerms: inv.payment_terms as Invoice["paymentTerms"],
      status: inv.status as Invoice["status"],
      subtotal: inv.subtotal,
      tax: inv.tax,
      total: inv.total,
      notes: inv.notes || undefined,
      lineItems: items.map((it) => ({
        id: it.id,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unit_price,
        amount: it.amount,
      })),
    };
  });
}

export function getDbSettings(): UserSettings {
  const db = getDb();
  const row = db.prepare("SELECT * FROM user_settings WHERE id = 'default'").get() as {
    personal_name: string;
    business_name: string;
    email: string;
    phone: string;
    role: string;
    business_type: string;
    tax_id_masked: string;
    currency: string;
    fiscal_year_start: string;
    default_workspace: string;
    default_privacy_mask: number;
  } | undefined;

  if (!row) {
    return {
      personalName: "",
      businessName: "",
      currency: "PHP",
      businessType: "Sole Proprietorship",
      defaultWorkspace: "personal",
    };
  }

  return {
    personalName: row.personal_name || "",
    businessName: row.business_name || "",
    email: row.email || undefined,
    phone: row.phone || undefined,
    role: row.role || undefined,
    businessType: (row.business_type as UserSettings["businessType"]) || "Sole Proprietorship",
    taxIdMasked: row.tax_id_masked || undefined,
    currency: row.currency || "PHP",
    fiscalYearStart: row.fiscal_year_start || "January",
    defaultWorkspace: (row.default_workspace as UserSettings["defaultWorkspace"]) || "personal",
    defaultPrivacyMask: Boolean(row.default_privacy_mask),
  };
}

/**
 * Completely clears all user financial data in the SQLite database,
 * leaving only the category taxonomy intact.
 */
export function clearDbData() {
  const db = getDb();
  db.prepare("DELETE FROM transactions").run();
  db.prepare("DELETE FROM accounts").run();
  db.prepare("DELETE FROM budgets").run();
  db.prepare("DELETE FROM invoice_items").run();
  db.prepare("DELETE FROM invoices").run();
  db.prepare("DELETE FROM chat_messages").run();
  db.prepare(`
    UPDATE user_settings
    SET personal_name = '', business_name = '', email = '', phone = '', role = '', tax_id_masked = '', currency = 'PHP'
    WHERE id = 'default'
  `).run();
}

export function getDbAppConfig(key: string): string | null {
  const db = getDb();
  try {
    const row = db.prepare("SELECT value FROM app_config WHERE key = ?").get(key) as
      | { value: string }
      | undefined;
    return row ? row.value : null;
  } catch {
    return null;
  }
}

export function setDbAppConfig(key: string, value: string): void {
  const db = getDb();
  db.prepare("INSERT OR REPLACE INTO app_config (key, value) VALUES (?, ?)").run(key, value);
}

export function deleteDbAppConfig(key: string): void {
  const db = getDb();
  db.prepare("DELETE FROM app_config WHERE key = ?").run(key);
}


