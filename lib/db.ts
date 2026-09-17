import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import os from "os";
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

const globalForDb = globalThis as unknown as {
  chiprDb?: Database.Database;
};

/**
 * Resolves a safe writable database path across local, Docker, and serverless environments (e.g. Vercel, AWS Lambda).
 */
function resolveDatabaseLocation(): { dbPath: string; isMemory: boolean } {
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY ||
    process.env.NOW_REGION
  );

  // In serverless environments (Vercel / AWS Lambda), the root filesystem is read-only.
  // The only writable directory is os.tmpdir() (/tmp).
  if (isServerless) {
    try {
      const tmpDir = path.join(os.tmpdir(), "chipr_db");
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      return { dbPath: path.join(tmpDir, "chipr.db"), isMemory: false };
    } catch {
      return { dbPath: ":memory:", isMemory: true };
    }
  }

  // Local or containerized environments with writable filesystem
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return { dbPath: path.join(dataDir, "chipr.db"), isMemory: false };
  } catch {
    // If process.cwd() is read-only for any reason, fallback to /tmp
    try {
      const tmpDir = path.join(os.tmpdir(), "chipr_db");
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      return { dbPath: path.join(tmpDir, "chipr.db"), isMemory: false };
    } catch {
      return { dbPath: ":memory:", isMemory: true };
    }
  }
}

export function getDb(): Database.Database {
  if (globalForDb.chiprDb) {
    try {
      // Test liveness
      globalForDb.chiprDb.prepare("SELECT 1").get();
      return globalForDb.chiprDb;
    } catch {
      globalForDb.chiprDb = undefined;
    }
  }

  const { dbPath, isMemory } = resolveDatabaseLocation();

  // Retry opening up to 3 times to handle temporary file locks on Windows
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const db = new Database(dbPath, { timeout: 10000 });

      // Busy timeout so concurrent operations on Windows wait instead of throwing SQLITE_BUSY
      db.pragma("busy_timeout = 10000");

      if (!isMemory && dbPath !== ":memory:") {
        try {
          db.pragma("journal_mode = WAL");
        } catch {
          db.pragma("journal_mode = DELETE");
        }
      } else {
        db.pragma("journal_mode = MEMORY");
      }

      db.pragma("foreign_keys = ON");

      initializeSchema(db);
      seedInitialData(db);

      globalForDb.chiprDb = db;
      return db;
    } catch (err) {
      lastError = err;
      // If not the last attempt and not in-memory, brief delay before retry
      if (attempt < 3 && dbPath !== ":memory:") {
        const start = Date.now();
        while (Date.now() - start < 100) {} // 100ms busy-wait
      }
    }
  }

  console.warn("[Chipr DB] Failed to open SQLite at", dbPath, "- falling back to :memory:", lastError);
  try {
    const memDb = new Database(":memory:");
    memDb.pragma("journal_mode = MEMORY");
    memDb.pragma("foreign_keys = ON");

    initializeSchema(memDb);
    seedInitialData(memDb);

    globalForDb.chiprDb = memDb;
    return memDb;
  } catch (criticalErr) {
    console.error("[Chipr DB Critical] Could not initialize SQLite database:", criticalErr);
    throw criticalErr;
  }
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

export function insertDbAccount(acc: FinancialAccount): FinancialAccount {
  const db = getDb();
  const id = acc.id || `acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  db.prepare(`
    INSERT INTO accounts (id, name, type, entity, balance, institution, account_number_masked, currency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      type = excluded.type,
      entity = excluded.entity,
      balance = excluded.balance,
      institution = excluded.institution,
      account_number_masked = excluded.account_number_masked,
      currency = excluded.currency
  `).run(
    id,
    acc.name,
    acc.type,
    acc.entity,
    acc.balance || 0,
    acc.institution || "Primary Ledger",
    acc.accountNumberMasked || "•••• 0000",
    acc.currency || "PHP"
  );

  return {
    ...acc,
    id,
    currency: acc.currency || "PHP",
  };
}

export function updateDbAccount(id: string, updates: Partial<FinancialAccount>): boolean {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM accounts WHERE id = ?").get(id) as
    | {
        id: string;
        name: string;
        type: string;
        entity: string;
        balance: number;
        institution: string;
        account_number_masked: string;
        currency: string;
      }
    | undefined;

  if (!existing) return false;

  const newName = updates.name !== undefined ? updates.name : existing.name;
  const newType = updates.type !== undefined ? updates.type : existing.type;
  const newEntity = updates.entity !== undefined ? updates.entity : existing.entity;
  const newBalance = updates.balance !== undefined ? updates.balance : existing.balance;
  const newInst = updates.institution !== undefined ? updates.institution : existing.institution;
  const newMasked = updates.accountNumberMasked !== undefined ? updates.accountNumberMasked : existing.account_number_masked;
  const newCurr = updates.currency !== undefined ? updates.currency : existing.currency;

  const res = db.prepare(`
    UPDATE accounts
    SET name = ?, type = ?, entity = ?, balance = ?, institution = ?, account_number_masked = ?, currency = ?
    WHERE id = ?
  `).run(newName, newType, newEntity, newBalance, newInst, newMasked, newCurr, id);

  return res.changes > 0;
}

export function deleteDbAccount(id: string): boolean {
  const db = getDb();
  const res = db.prepare("DELETE FROM accounts WHERE id = ?").run(id);
  return res.changes > 0;
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

export function updateDbTransaction(id: string, updates: Partial<Transaction>): boolean {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id) as
    | {
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
      }
    | undefined;

  if (!existing) return false;

  // If amount or account_id changed, adjust account balance
  const oldAmount = existing.amount;
  const oldAccountId = existing.account_id;
  const newAmount = updates.amount !== undefined ? updates.amount : oldAmount;
  const newAccountId = updates.accountId !== undefined ? updates.accountId : oldAccountId;

  if (oldAccountId && (oldAmount !== newAmount || oldAccountId !== newAccountId)) {
    // Revert old amount from old account
    db.prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?").run(oldAmount, oldAccountId);
    // Apply new amount to new account
    if (newAccountId) {
      db.prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?").run(newAmount, newAccountId);
    }
  }

  const newDate = updates.date !== undefined ? updates.date : existing.date;
  const newMerchant = updates.merchant !== undefined ? updates.merchant : existing.merchant;
  const newCategory = updates.category !== undefined ? resolveCategory(updates.category, newMerchant, (updates.entity || existing.entity) as "personal" | "business") : existing.category;
  const newEntity = updates.entity !== undefined ? updates.entity : existing.entity;
  const newAccountName = updates.accountName !== undefined ? updates.accountName : existing.account_name;
  const newCurrency = updates.currency !== undefined ? updates.currency : (existing.currency || "PHP");
  const newIsTaxDeductible = updates.isTaxDeductible !== undefined ? (updates.isTaxDeductible ? 1 : 0) : existing.is_tax_deductible;
  const newDeductiblePct = updates.deductiblePercentage !== undefined ? updates.deductiblePercentage : existing.deductible_percentage;
  const newScheduleC = updates.scheduleCCategory !== undefined ? updates.scheduleCCategory : existing.schedule_c_category;
  const newReimbStatus = updates.reimbursementStatus !== undefined ? updates.reimbursementStatus : (existing.reimbursement_status || "none");
  const newOwnerDraw = updates.isOwnerDraw !== undefined ? (updates.isOwnerDraw ? 1 : 0) : existing.is_owner_draw;
  const newCapitalContrib = updates.isCapitalContribution !== undefined ? (updates.isCapitalContribution ? 1 : 0) : existing.is_capital_contribution;
  const newNote = updates.note !== undefined ? updates.note : existing.note;

  const res = db.prepare(`
    UPDATE transactions
    SET date = ?, merchant = ?, category = ?, amount = ?, entity = ?,
        account_id = ?, account_name = ?, currency = ?, is_tax_deductible = ?,
        deductible_percentage = ?, schedule_c_category = ?, reimbursement_status = ?,
        is_owner_draw = ?, is_capital_contribution = ?, note = ?
    WHERE id = ?
  `).run(
    newDate,
    newMerchant,
    newCategory,
    newAmount,
    newEntity,
    newAccountId,
    newAccountName,
    newCurrency,
    newIsTaxDeductible,
    newDeductiblePct,
    newScheduleC,
    newReimbStatus,
    newOwnerDraw,
    newCapitalContrib,
    newNote,
    id
  );

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

  return budgets.map((b) => {
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

export function insertDbInvoice(inv: Invoice): Invoice {
  const db = getDb();
  const id = inv.id || `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const invoiceNumber = inv.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;

  const insertTx = db.transaction(() => {
    db.prepare(`
      INSERT INTO invoices (
        id, invoice_number, client_name, client_email, issue_date,
        due_date, payment_terms, status, subtotal, tax, total, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        invoice_number = excluded.invoice_number,
        client_name = excluded.client_name,
        client_email = excluded.client_email,
        issue_date = excluded.issue_date,
        due_date = excluded.due_date,
        payment_terms = excluded.payment_terms,
        status = excluded.status,
        subtotal = excluded.subtotal,
        tax = excluded.tax,
        total = excluded.total,
        notes = excluded.notes
    `).run(
      id,
      invoiceNumber,
      inv.clientName,
      inv.clientEmail || "",
      inv.issueDate,
      inv.dueDate,
      inv.paymentTerms,
      inv.status,
      inv.subtotal,
      inv.tax,
      inv.total,
      inv.notes || ""
    );

    db.prepare("DELETE FROM invoice_items WHERE invoice_id = ?").run(id);

    const insertItem = db.prepare(`
      INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, amount)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of inv.lineItems || []) {
      const itemId = item.id || `li-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      insertItem.run(itemId, id, item.description, item.quantity, item.unitPrice, item.amount);
    }
  });

  insertTx();

  return {
    ...inv,
    id,
    invoiceNumber,
  };
}

export function updateDbInvoice(id: string, updates: Partial<Invoice>): boolean {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM invoices WHERE id = ?").get(id) as
    | {
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
      }
    | undefined;

  if (!existing) return false;

  const newNum = updates.invoiceNumber !== undefined ? updates.invoiceNumber : existing.invoice_number;
  const newName = updates.clientName !== undefined ? updates.clientName : existing.client_name;
  const newEmail = updates.clientEmail !== undefined ? updates.clientEmail : existing.client_email;
  const newIssue = updates.issueDate !== undefined ? updates.issueDate : existing.issue_date;
  const newDue = updates.dueDate !== undefined ? updates.dueDate : existing.due_date;
  const newTerms = updates.paymentTerms !== undefined ? updates.paymentTerms : existing.payment_terms;
  const newStatus = updates.status !== undefined ? updates.status : existing.status;
  const newSubtotal = updates.subtotal !== undefined ? updates.subtotal : existing.subtotal;
  const newTax = updates.tax !== undefined ? updates.tax : existing.tax;
  const newTotal = updates.total !== undefined ? updates.total : existing.total;
  const newNotes = updates.notes !== undefined ? updates.notes : existing.notes;

  const updateTx = db.transaction(() => {
    db.prepare(`
      UPDATE invoices
      SET invoice_number = ?, client_name = ?, client_email = ?, issue_date = ?,
          due_date = ?, payment_terms = ?, status = ?, subtotal = ?, tax = ?,
          total = ?, notes = ?
      WHERE id = ?
    `).run(
      newNum, newName, newEmail, newIssue, newDue, newTerms,
      newStatus, newSubtotal, newTax, newTotal, newNotes, id
    );

    if (updates.lineItems) {
      db.prepare("DELETE FROM invoice_items WHERE invoice_id = ?").run(id);
      const insertItem = db.prepare(`
        INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, amount)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const item of updates.lineItems) {
        const itemId = item.id || `li-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        insertItem.run(itemId, id, item.description, item.quantity, item.unitPrice, item.amount);
      }
    }
  });

  updateTx();
  return true;
}

export function deleteDbInvoice(id: string): boolean {
  const db = getDb();
  const deleteTx = db.transaction(() => {
    db.prepare("DELETE FROM invoice_items WHERE invoice_id = ?").run(id);
    const res = db.prepare("DELETE FROM invoices WHERE id = ?").run(id);
    return res.changes > 0;
  });
  return deleteTx();
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

export function updateDbSettings(settings: Partial<UserSettings>): UserSettings {
  const db = getDb();
  const current = getDbSettings();

  const merged: UserSettings = {
    personalName: settings.personalName !== undefined ? settings.personalName : current.personalName,
    businessName: settings.businessName !== undefined ? settings.businessName : current.businessName,
    email: settings.email !== undefined ? settings.email : current.email,
    phone: settings.phone !== undefined ? settings.phone : current.phone,
    role: settings.role !== undefined ? settings.role : current.role,
    businessType: settings.businessType !== undefined ? settings.businessType : current.businessType,
    taxIdMasked: settings.taxIdMasked !== undefined ? settings.taxIdMasked : current.taxIdMasked,
    currency: settings.currency !== undefined ? settings.currency : current.currency,
    fiscalYearStart: settings.fiscalYearStart !== undefined ? settings.fiscalYearStart : current.fiscalYearStart,
    defaultWorkspace: settings.defaultWorkspace !== undefined ? settings.defaultWorkspace : current.defaultWorkspace,
    defaultPrivacyMask: settings.defaultPrivacyMask !== undefined ? settings.defaultPrivacyMask : current.defaultPrivacyMask,
  };

  db.prepare(`
    INSERT INTO user_settings (
      id, personal_name, business_name, email, phone, role,
      business_type, tax_id_masked, currency, fiscal_year_start,
      default_workspace, default_privacy_mask
    ) VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      personal_name = excluded.personal_name,
      business_name = excluded.business_name,
      email = excluded.email,
      phone = excluded.phone,
      role = excluded.role,
      business_type = excluded.business_type,
      tax_id_masked = excluded.tax_id_masked,
      currency = excluded.currency,
      fiscal_year_start = excluded.fiscal_year_start,
      default_workspace = excluded.default_workspace,
      default_privacy_mask = excluded.default_privacy_mask
  `).run(
    merged.personalName,
    merged.businessName,
    merged.email || null,
    merged.phone || null,
    merged.role || null,
    merged.businessType || "Sole Proprietorship",
    merged.taxIdMasked || null,
    merged.currency || "PHP",
    merged.fiscalYearStart || "January",
    merged.defaultWorkspace || "personal",
    merged.defaultPrivacyMask ? 1 : 0
  );

  return merged;
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


