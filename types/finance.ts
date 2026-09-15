export type WorkspaceEntity = "personal" | "business";

export type AccountType =
  | "checking"
  | "savings"
  | "credit"
  | "investment"
  | "loan";

export interface FinancialAccount {
  id: string;
  name: string;
  type: AccountType;
  entity: "personal" | "business";
  balance: number;
  institution: string;
  accountNumberMasked: string; // e.g. "•••• 4821"
  currency: string;
}

export type ScheduleCCategory =
  | "Advertising & Marketing"
  | "Car & Truck / Mileage"
  | "Contract Labor (1099)"
  | "Legal & Professional Services"
  | "Office & Software Subscriptions"
  | "Travel"
  | "Meals & Entertainment (50%)"
  | "Taxes & Licenses"
  | "Other Business Expenses";

export type ReimbursementStatus = "none" | "pending" | "reimbursed";

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  merchant: string;
  category: string;
  amount: number; // positive = inflow/revenue, negative = outflow/expense
  entity: "personal" | "business";
  accountId: string;
  accountName: string;
  currency?: string;
  isTaxDeductible?: boolean;
  deductiblePercentage?: number; // 0 to 100
  scheduleCCategory?: ScheduleCCategory;
  reimbursementStatus?: ReimbursementStatus;
  isOwnerDraw?: boolean;
  isCapitalContribution?: boolean;
  note?: string;
  createdVia?: string;
  receiptAttached?: boolean;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type PaymentTerms = "Due on Receipt" | "Net 15" | "Net 30" | "Net 60";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-004"
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: PaymentTerms;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

export interface BudgetEnvelope {
  id: string;
  category: string;
  monthlyLimit: number;
  spent: number;
  entity: "personal";
}

export interface VendorBill {
  id: string;
  vendorName: string;
  category: string;
  dueDate: string;
  amount: number;
  cadence: "monthly" | "annual" | "one-time";
  autoPay: boolean;
  status: "unpaid" | "paid" | "overdue";
}

export interface Subscription {
  id: string;
  name: string;
  category: string;
  cadence: "monthly" | "yearly";
  amount: number;
  nextRenewalDate: string;
  entity: "personal" | "business";
  recommendation?: "keep" | "review" | "cancel";
}

export interface UserSettings {
  businessName: string;
  personalName: string;
  currency: string;
  email?: string;
  phone?: string;
  role?: string;
  businessType?: "LLC" | "Sole Proprietorship" | "S-Corp" | "C-Corp" | "Freelance" | "Partnership";
  taxIdMasked?: string;
  fiscalYearStart?: string;
  defaultWorkspace?: WorkspaceEntity;
  defaultPrivacyMask?: boolean;
}

export interface FinancialMetrics {
  // Personal
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  personalMonthlyInflow: number;
  personalMonthlyOutflow: number;
  savingsRate: number; // percentage

  // Business
  grossRevenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  netOperatingIncome: number;
  netMargin: number; // percentage
  cashRunwayMonths: number;
  monthlyBurnRate: number;
  outstandingReceivables: number;
  overdueReceivables: number;
  taxDeductibleTotal: number;
  estimatedTaxSavings: number; // e.g. 25% of deductible
  businessLiquidCash: number;
  businessEquity: number;

  // Unified Portfolio
  totalLiquidCash: number;
  totalNetWorth: number;

  // Growth / Delta percentages (computed dynamically)
  revenueGrowthPct?: number;
  netWorthGrowthPct?: number;

  // Anti-commingling & Reimbursements
  pendingReimbursements: number;
  totalOwnerDraws: number;
  totalCapitalContributions: number;
}
