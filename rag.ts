import {
  FinancialAccount,
  Transaction,
  Invoice,
  BudgetEnvelope,
  FinancialMetrics,
  UserSettings,
} from "@/types/finance";
import { ChatContextScope } from "@/types/chat";
import { ExpenseCategory, resolveCategory } from "@/lib/categories";

export interface PromptContextParams {
  scope: ChatContextScope;
  accounts?: FinancialAccount[];
  transactions?: Transaction[];
  invoices?: Invoice[];
  budgets?: BudgetEnvelope[];
  metrics?: FinancialMetrics;
  settings?: UserSettings;
  categories?: ExpenseCategory[];
  userQuery?: string;
}

/**
 * Format numbers as standard Philippine Peso (PHP) currency
 */
export function formatMoney(amount: number, currency = "PHP"): string {
  return new Intl.NumberFormat(currency === "PHP" ? "en-PH" : "en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parses and extracts a structured transaction JSON payload from the AI's response text.
 * Strips the raw code fence so the message displays clean narrative feedback.
 */
export function extractTransactionFromAiResponse(
  content: string,
  userQuery?: string
): {
  cleanContent: string;
  transaction: (Omit<Transaction, "id"> & { id?: string; createdVia?: string }) | null;
} {
  if (!content) {
    return { cleanContent: content, transaction: null };
  }

  // Look for ```json:transaction ... ``` or ```json ... ``` with amount and category
  const pattern =
    /```json:transaction\s*([\s\S]*?)\s*```|```json\s*(\{\s*"merchant"[\s\S]*?\})\s*```/i;

  const match = content.match(pattern);
  if (!match) {
    return { cleanContent: content, transaction: null };
  }

  const rawJson = (match[1] || match[2] || "").trim();
  try {
    const parsed = JSON.parse(rawJson);
    if (parsed.merchant && parsed.amount !== undefined && parsed.category) {
      // Ensure amount is negative for expense
      let amountNum = parseFloat(parsed.amount);
      if (isNaN(amountNum)) amountNum = 0;
      if (amountNum > 0 && parsed.isExpense !== false && !parsed.isIncome) {
        amountNum = -Math.abs(amountNum);
      }

      // Detect currency (support PHP / pesos, USD, EUR, etc.)
      let detectedCurrency = parsed.currency ? String(parsed.currency).toUpperCase().trim() : "";
      if (detectedCurrency === "PESO" || detectedCurrency === "PESOS" || detectedCurrency === "₱") {
        detectedCurrency = "PHP";
      }
      if (!detectedCurrency) {
        const lowerRaw = (content + " " + rawJson).toLowerCase();
        if (lowerRaw.includes("dollar") || lowerRaw.includes("usd") || lowerRaw.includes("$")) {
          detectedCurrency = "USD";
        } else {
          detectedCurrency = "PHP";
        }
      }

      // Determine entity scope
      const entity = parsed.entity === "business" ? "business" : "personal";

      // Normalize category using full taxonomy from db
      const cleanCategory = resolveCategory(parsed.category, parsed.merchant, entity);

      const promptNote = parsed.note
        ? String(parsed.note)
        : userQuery
        ? `Prompt: "${userQuery}"`
        : undefined;

      const txPayload: Omit<Transaction, "id"> & { id?: string; createdVia?: string } = {
        date: parsed.date || new Date().toISOString().split("T")[0],
        merchant: String(parsed.merchant).trim(),
        category: cleanCategory,
        amount: amountNum,
        entity,
        currency: detectedCurrency,
        accountId: parsed.accountId || "",
        accountName: parsed.accountName || (entity === "business" ? "Business Checking" : "Personal Checking"),
        isTaxDeductible: Boolean(parsed.isTaxDeductible),
        deductiblePercentage: parsed.deductiblePercentage ?? (parsed.isTaxDeductible ? 100 : 0),
        scheduleCCategory: parsed.scheduleCCategory || undefined,
        reimbursementStatus: parsed.reimbursementStatus || "none",
        isOwnerDraw: Boolean(parsed.isOwnerDraw),
        isCapitalContribution: Boolean(parsed.isCapitalContribution),
        note: promptNote,
        createdVia: "ai_chat",
      };

      // Strip the raw code block from the user-facing text
      const cleanContent = content.replace(match[0], "").trim();

      return { cleanContent, transaction: txPayload };
    }
  } catch (err) {
    console.warn("[rag.ts] Could not parse transaction JSON block:", err);
  }

  return { cleanContent: content, transaction: null };
}

/**
 * Search the user's ledger (transactions and invoices) for query relevance.
 * Simple, high-speed in-memory semantic token matching.
 */
export function searchRelevantLedgerEntries(
  query: string,
  transactions: Transaction[] = [],
  invoices: Invoice[] = [],
  limit = 10
): { transactions: Transaction[]; invoices: Invoice[] } {
  if (!query || !query.trim()) {
    return {
      transactions: transactions.slice(0, limit),
      invoices: invoices.slice(0, 5),
    };
  }

  const queryTerms = query
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((t) => t.length > 1);

  if (queryTerms.length === 0) {
    return {
      transactions: transactions.slice(0, limit),
      invoices: invoices.slice(0, 5),
    };
  }

  const scoredTransactions = transactions.map((tx) => {
    let score = 0;
    const searchable = [
      tx.merchant,
      tx.category,
      tx.note || "",
      tx.scheduleCCategory || "",
      tx.accountName,
      tx.entity,
      tx.amount.toString(),
    ]
      .join(" ")
      .toLowerCase();

    for (const term of queryTerms) {
      if (searchable.includes(term)) score += 1;
      if (tx.merchant.toLowerCase().includes(term)) score += 2;
      if (tx.category.toLowerCase().includes(term)) score += 2;
    }
    return { tx, score };
  });

  const matchedTransactions = scoredTransactions
    .filter((st) => st.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((st) => st.tx)
    .slice(0, limit);

  const scoredInvoices = invoices.map((inv) => {
    let score = 0;
    const searchable = [
      inv.invoiceNumber,
      inv.clientName,
      inv.clientEmail,
      inv.status,
      inv.total.toString(),
      inv.notes || "",
    ]
      .join(" ")
      .toLowerCase();

    for (const term of queryTerms) {
      if (searchable.includes(term)) score += 1;
      if (inv.clientName.toLowerCase().includes(term)) score += 2;
      if (inv.invoiceNumber.toLowerCase().includes(term)) score += 2;
    }
    return { inv, score };
  });

  const matchedInvoices = scoredInvoices
    .filter((si) => si.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((si) => si.inv)
    .slice(0, 5);

  return {
    transactions:
      matchedTransactions.length > 0
        ? matchedTransactions
        : transactions.slice(0, limit),
    invoices:
      matchedInvoices.length > 0 ? matchedInvoices : invoices.slice(0, 5),
  };
}

/**
 * Builds the comprehensive Financial Intelligence System Prompt
 * adhering to Chipr anti-commingling rules and ledger awareness.
 */
export function buildFinancialSystemPrompt(params: PromptContextParams): string {
  const {
    scope,
    accounts = [],
    transactions = [],
    invoices = [],
    budgets = [],
    metrics,
    settings,
    categories = [],
    userQuery,
  } = params;

  const userName = settings?.personalName || "User";
  const businessName = settings?.businessName || "My Business";
  const entityType = settings?.businessType || "Sole Proprietorship";

  // Filter accounts by active scope
  const scopedAccounts = accounts.filter((acc) => {
    if (scope === "personal") return acc.entity === "personal";
    if (scope === "business") return acc.entity === "business";
    return true;
  });

  const accountsText =
    scopedAccounts.length > 0
      ? scopedAccounts
          .map(
            (a) =>
              `- [${a.entity.toUpperCase()}] ${a.name} (${a.institution}, ${
                a.type
              }, ${a.accountNumberMasked}): ${formatMoney(a.balance)}`
          )
          .join("\n")
      : "No accounts connected in this scope.";

  // Format database categories for RAG category matching
  let categoriesText = "";
  if (categories.length > 0) {
    const personalCats = categories.filter(
      (c) => c.entity === "personal" || c.entity === "both"
    );
    const businessCats = categories.filter(
      (c) => c.entity === "business" || c.entity === "both"
    );

    categoriesText = `
AUTHORIZED DATABASE CATEGORIES (Exact Category Taxonomy for Expenses):
PERSONAL CATEGORIES:
${personalCats
  .map(
    (c) =>
      `• "${c.name}" - ${c.description}. Examples: [${c.examples.join(", ")}]`
  )
  .join("\n")}

BUSINESS CATEGORIES (IRS Schedule C Classifications):
${businessCats
  .map(
    (c) =>
      `• "${c.name}" - ${c.description} [Tax Deductible: ${
        c.isTaxDeductible ? `${c.deductiblePercentage}%` : "No"
      }${c.scheduleCCategory ? `, Schedule C: ${c.scheduleCCategory}` : ""}]. Examples: [${c.examples.join(
        ", "
      )}]`
  )
  .join("\n")}
`;
  }

  // Key metrics summary
  let metricsText = "";
  if (metrics) {
    if (scope === "personal" || scope === "all") {
      metricsText += `
PERSONAL WEALTH METRICS:
- Net Worth (Assets - Liabilities): ${formatMoney(metrics.netWorth)}
- Total Assets: ${formatMoney(metrics.totalAssets)}
- Total Liabilities: ${formatMoney(metrics.totalLiabilities)}
- Monthly Inflow: ${formatMoney(metrics.personalMonthlyInflow)}
- Monthly Outflow: ${formatMoney(metrics.personalMonthlyOutflow)}
- Savings Velocity Rate: ${Math.round(metrics.savingsRate)}%
`;
    }

    if (scope === "business" || scope === "all") {
      const runwayStr =
        metrics.cashRunwayMonths >= 99 || !isFinite(metrics.cashRunwayMonths)
          ? "> 24 months"
          : `${metrics.cashRunwayMonths.toFixed(1)} months`;

      metricsText += `
BUSINESS OPERATIONS METRICS (${businessName} - ${entityType}):
- Liquid Business Cash: ${formatMoney(metrics.businessLiquidCash)}
- Monthly Operating Burn Rate (COGS + OpEx): ${formatMoney(
        metrics.monthlyBurnRate
      )}/month
- Estimated Cash Runway: ${runwayStr}
- Gross Revenue: ${formatMoney(metrics.grossRevenue)}
- Cost of Goods Sold (COGS): ${formatMoney(metrics.cogs)}
- Gross Margin / Profit: ${formatMoney(metrics.grossProfit)}
- Operating Expenses (OpEx): ${formatMoney(metrics.operatingExpenses)}
- Net Operating Income: ${formatMoney(metrics.netOperatingIncome)}
- Net Profit Margin: ${Math.round(metrics.netMargin)}%
- Outstanding Invoiced Receivables: ${formatMoney(
        metrics.outstandingReceivables
      )}
- Overdue Receivables: ${formatMoney(metrics.overdueReceivables)}
- Tax Deductible Total (Schedule C Write-offs): ${formatMoney(
        metrics.taxDeductibleTotal
      )}
- Estimated Tax Shield Savings (~25% bracket): ~${formatMoney(
        metrics.estimatedTaxSavings
      )}
`;
    }

    if (scope === "all") {
      metricsText += `
CONSOLIDATED / UNIFIED PORTFOLIO METRICS:
- Total Liquid Cash across all entities: ${formatMoney(
        metrics.totalLiquidCash
      )}
- Total Portfolio Net Worth: ${formatMoney(metrics.totalNetWorth)}
- Pending Cross-Entity Reimbursements: ${formatMoney(
        metrics.pendingReimbursements
      )}
- Total Owner's Draws Taken: ${formatMoney(metrics.totalOwnerDraws)}
- Total Capital Contributions: ${formatMoney(
        metrics.totalCapitalContributions
      )}
`;
    }
  }

  // Budgets summary
  let budgetsText = "";
  if (scope !== "business" && budgets.length > 0) {
    budgetsText =
      "\nHOUSEHOLD BUDGET ENVELOPES:\n" +
      budgets
        .map((b) => {
          const pct = Math.round((b.spent / b.monthlyLimit) * 100);
          const alert =
            pct >= 100
              ? " [BREACH - OVER BUDGET]"
              : pct >= 80
              ? " [WARNING - >80% UTILIZED]"
              : "";
          return `- ${b.category}: Spent ${formatMoney(b.spent)} of ${formatMoney(
            b.monthlyLimit
          )} (${pct}% used)${alert}`;
        })
        .join("\n");
  }

  // Invoices summary
  let invoicesText = "";
  if (scope !== "personal" && invoices.length > 0) {
    invoicesText =
      "\nCLIENT INVOICES (ACCOUNTS RECEIVABLE):\n" +
      invoices
        .slice(0, 10)
        .map(
          (inv) =>
            `- ${inv.invoiceNumber} | ${inv.clientName} | ${formatMoney(
              inv.total
            )} | Status: ${inv.status.toUpperCase()} | Due: ${inv.dueDate}`
        )
        .join("\n");
  }

  // Query relevance retrieval for transactions
  const relevant = searchRelevantLedgerEntries(
    userQuery || "",
    transactions,
    invoices,
    8
  );

  const transactionsText =
    relevant.transactions.length > 0
      ? "\nRECENT / RELEVANT TRANSACTIONS FROM DATABASE LEDGER:\n" +
        relevant.transactions
          .map((t) => {
            const taxTag = t.isTaxDeductible
              ? ` [Tax Deductible: ${t.deductiblePercentage || 100}% - ${
                  t.scheduleCCategory || "General"
                }]`
              : "";
            const flow = t.amount >= 0 ? "+" : "";
            return `- ${t.date} | [${t.entity.toUpperCase()}] ${
              t.merchant
            } | ${t.category} | ${flow}${formatMoney(t.amount)} via ${
              t.accountName
            }${taxTag}`;
          })
          .join("\n")
      : "";

  const todayStr = new Date().toISOString().split("T")[0];

  return `You are Chipr Financial AI, an expert Chief Financial Officer (CFO) and Personal Wealth Advisor directly embedded in Chipr.

PRIMARY IDENTITY & USER CONTEXT:
- Primary User: ${userName}
- Business Entity: ${businessName} (${entityType})
- Today's Date: ${todayStr}
- Active Scope: ${scope.toUpperCase()} SCOPE (${
    scope === "personal"
      ? "Personal Household Finances"
      : scope === "business"
      ? "Business Operations & Invoicing"
      : "Consolidated Portfolio (Unified View)"
  })

CORE DIRECTIVE 1: EXPENSE CHAT & AUTOMATIC CATEGORIZATION
The primary purpose of this AI chat is for the user to chat their expenses, purchases, or bills (e.g., "Spent 250 pesos on jollibee", "Spent ₱450 on groceries at Supermarket", "Bought jacket at Zara ₱1,850", "Electric bill ₱2,400", "Bought Figma annual ₱1,200").
Whenever the user communicates an expense or purchase:
1. Parse the details:
   - Merchant (store, provider, or vendor name)
   - Amount (numerical value)
   - Currency: Default currency is Philippine Peso ("PHP" / "₱"). Detect currency from input, defaulting to "PHP".
   - Date (default to ${todayStr} unless specified)
   - Context (food/dining/fast food, clothing/apparel, other personal, or business software/services)
2. Map it to the EXACT corresponding category name from the AUTHORIZED DATABASE CATEGORIES below:
   - FOR PERSONAL EXPENSES, choose the most accurate category from the complete personal categories taxonomy:
     • "Food & Dining": Groceries, supermarkets, restaurants, cafes, fast food, food delivery, coffee, snacks, drinks.
       * EXPLICIT RESTAURANTS & MERCHANTS: Jollibee, McDonald's, Starbucks, KFC, Chipotle, Burger King, Wendy's, Subway, Chowking, Mang Inasal, GrabFood, Foodpanda, local restaurants, supermarkets.
       * FEW-SHOT EXAMPLE: "Spent 250 pesos on jollibee" -> merchant: "Jollibee", amount: -250.00, category: "Food & Dining", entity: "personal", currency: "PHP", note: "Prompt: \"Spent 250 pesos on jollibee\"".
     • "Shopping & Clothing": Apparel, clothing, footwear, shoes, jackets, shirts, pants, accessories, garments (Zara, Nike, Uniqlo, H&M, Shein).
     • "Housing & Rent": Rent, mortgage, home maintenance, furniture, home repairs.
     • "Utilities & Bills": Electricity (e.g. Meralco), water, internet, phone bill, cellular, natural gas.
     • "Transportation & Fuel": Gas, petrol, diesel, public transit, subway, bus, Grab, Uber, taxi, parking, tolls.
     • "Healthcare & Medical": Doctor visits, dental care, pharmacy (Mercury Drug, CVS, Walgreens), prescription drugs, hospital.
     • "Personal Care & Fitness": Gym memberships, barber, hair salon, spa, cosmetics, skincare.
     • "Entertainment & Leisure": Movies, cinema, concerts, gaming (Steam, PlayStation), hobbies.
     • "Subscriptions & Streaming": Digital subscriptions, streaming (Netflix, Spotify, YouTube Premium, iCloud).
     • "Education & Learning": Tuition, online courses (Coursera, Udemy), textbooks, workshops.
     • "Travel & Vacations": Airfare (Cebu Pacific, PAL, Delta), hotels, Airbnb, resorts.
     • "Gifts & Donations": Charitable donations, birthday gifts, family support / remittances.
     • "Pets & Animals": Pet food, veterinary clinic, grooming, supplies.
     • "Financial & Bank Fees": Bank service fees, ATM fees, wire transfer fees, interest.
     • "Others & Miscellaneous": General retail, convenience store purchases (7-Eleven), cash withdrawals, miscellaneous expenses.
   - FOR BUSINESS EXPENSES, map to the matching IRS Schedule C category (e.g., Office & Software Subscriptions, Advertising & Marketing, Travel, Meals & Entertainment 50%, Contract Labor).
3. Determine Entity Segregation (Personal vs Business):
   - Personal expenses map to personal categories and household budget envelopes.
   - Business expenses map to IRS Schedule C categories and deductible percentage (e.g., Software 100%, Meals 50%).
4. In your message response:
   - Confirm the recorded purchase cleanly with bullet points:
     • **Merchant & Amount**: Verified purchase amount formatted in the user's currency (e.g. **-₱250.00** for PHP/pesos)
     • **Assigned Category**: State the exact category and explain why it fits (e.g. "Food & Dining")
     • **Financial & Tax Impact**: If personal, note the budget category impact (e.g. allocated to your Food & Dining envelope); if business, mention the Schedule C write-off
5. AT THE VERY END OF YOUR RESPONSE, append an exact JSON block in a \`\`\`json:transaction\`\`\` code block:
\`\`\`json:transaction
{
  "merchant": "Merchant Name",
  "amount": -250.00,
  "category": "Exact Category Name (e.g. Food & Dining, Shopping & Clothing, etc.)",
  "entity": "personal",
  "currency": "PHP",
  "isTaxDeductible": false,
  "deductiblePercentage": 0,
  "scheduleCCategory": null,
  "date": "${todayStr}",
  "note": "Prompt: \"User prompt text\""
}
\`\`\`

CORE DIRECTIVE 2: STRICT ANTI-COMMINGLING
- Never mix personal expenses on business cards without noting an Owner's Draw or Cross-Entity Reimbursement.
- If the user paid for a business expense with a personal card, advise marking it as "Reimbursable Business Expense" with reimbursementStatus: "pending".
- Personal lifestyle expenses (groceries, home rent) are NEVER business tax deductions.

${categoriesText}

FINANCIAL LEDGER SNAPSHOT:
CONNECTED ACCOUNTS:
${accountsText}

${metricsText}
${budgetsText}
${invoicesText}
${transactionsText}

COMMUNICATION STYLE:
- Always format currency amounts with the Philippine Peso sign (e.g. **-₱250.00** for pesos/PHP).
- Keep responses concise, direct, helpful, and analytical.
- When an expense is mentioned, ALWAYS include the \`\`\`json:transaction\`\`\` block at the end so the app automatically logs it into the SQLite database.`;
}
