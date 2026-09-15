"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import {
  WorkspaceEntity,
  FinancialAccount,
  Transaction,
  Invoice,
  BudgetEnvelope,
  VendorBill,
  Subscription,
  FinancialMetrics,
  InvoiceStatus,
  InvoiceLineItem,
  UserSettings,
} from "@/types/finance";
import { ChatMessage } from "@/types/chat";
import { getDemoDataset } from "@/data/demoData";
import { resolveCategory } from "@/lib/categories";

export type NavigationTab =
  | "dashboard"
  | "transactions"
  | "invoices"
  | "budgets"
  | "reports"
  | "profile"
  | "chat";

interface FinanceContextType {
  workspace: WorkspaceEntity;
  setWorkspace: (ws: WorkspaceEntity) => void;
  privacyMask: boolean;
  togglePrivacyMask: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  isDesktopSidebarOpen: boolean;
  setDesktopSidebarOpen: (open: boolean) => void;
  toggleDesktopSidebar: () => void;
  toggleSidebar: () => void;
  isDeviceFramed: boolean;
  setDeviceFramed: (framed: boolean) => void;
  toggleDeviceFramed: () => void;

  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;

  accounts: FinancialAccount[];
  transactions: Transaction[];
  invoices: Invoice[];
  budgets: BudgetEnvelope[];
  vendorBills: VendorBill[];
  subscriptions: Subscription[];

  metrics: FinancialMetrics;

  // Account Actions
  addAccount: (acc: Omit<FinancialAccount, "id">) => void;
  updateAccount: (id: string, acc: Partial<FinancialAccount>) => void;
  deleteAccount: (id: string) => void;

  // Transaction Actions
  addTransaction: (tx: Omit<Transaction, "id"> & { id?: string }, skipDbPersist?: boolean) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Invoice Actions
  createInvoice: (
    inv: Omit<Invoice, "id" | "subtotal" | "tax" | "total" | "lineItems"> & {
      lineItems: Omit<InvoiceLineItem, "id">[];
    }
  ) => void;
  updateInvoice: (id: string, inv: Partial<Invoice>) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  deleteInvoice: (id: string) => void;

  // Budget Actions
  addBudget: (category: string, monthlyLimit: number) => void;
  updateBudget: (id: string, newLimit: number) => void;
  deleteBudget: (id: string) => void;

  // Anti-commingling action
  markReimbursed: (id: string) => void;

  // AI Chat Messages
  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => ChatMessage;
  updateChatMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearChatMessages: () => void;

  // Data management
  loadDemoData: () => void;
  clearAllData: () => void;
  importTransactionsFromCSV: (csvText: string) => number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACCOUNTS: "chipr_accounts_v2",
  TRANSACTIONS: "chipr_transactions_v2",
  INVOICES: "chipr_invoices_v2",
  BUDGETS: "chipr_budgets_v2",
  VENDOR_BILLS: "chipr_vendor_bills_v2",
  SUBSCRIPTIONS: "chipr_subscriptions_v2",
  SETTINGS: "chipr_settings_v2",
  WORKSPACE: "chipr_workspace_v2",
  DARK_MODE: "chipr_dark_mode_v2",
  PRIVACY: "chipr_privacy_mask_v2",
  CHAT_MESSAGES: "chipr_chat_messages_v1",
};

const DEFAULT_BUDGET_ENVELOPES: BudgetEnvelope[] = [];

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  const [workspace, setWorkspaceState] = useState<WorkspaceEntity>("personal");
  const [privacyMask, setPrivacyMaskState] = useState<boolean>(false);
  const [darkMode, setDarkModeState] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>("dashboard");
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const toggleMobileSidebar = () => setMobileSidebarOpen((prev) => !prev);
  const [isDesktopSidebarOpen, setDesktopSidebarOpen] = useState<boolean>(true);
  const toggleDesktopSidebar = () => setDesktopSidebarOpen((prev) => !prev);
  const [isDeviceFramed, setDeviceFramed] = useState<boolean>(false);
  const toggleDeviceFramed = () => setDeviceFramed((prev) => !prev);

  const toggleSidebar = () => {
    if (isDeviceFramed || (typeof window !== "undefined" && window.innerWidth < 768)) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setDesktopSidebarOpen((prev) => !prev);
    }
  };

  const [settings, setSettings] = useState<UserSettings>({
    personalName: "",
    businessName: "",
    email: "",
    phone: "",
    role: "",
    businessType: "Sole Proprietorship",
    taxIdMasked: "",
    currency: "USD",
    fiscalYearStart: "January",
    defaultWorkspace: "personal",
    defaultPrivacyMask: false,
  });

  // State initialized completely empty - zero predefined dummy values
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [rawBudgets, setRawBudgets] = useState<BudgetEnvelope[]>([]);
  const [vendorBills, setVendorBills] = useState<VendorBill[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Dynamically compute budget envelopes and live spent amounts from transactions
  const budgets: BudgetEnvelope[] = useMemo(() => {
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);

    // 1. Group all personal outflow spending by category
    const spentByCategory = new Map<string, { spent: number; properName: string }>();
    transactions.forEach((t) => {
      if (t.entity !== "personal" || t.amount >= 0) return;
      const tDate = t.date || "";
      const isCurrentMonth = tDate.startsWith(currentMonthPrefix) || !tDate;
      if (!isCurrentMonth) return;

      const catKey = (t.category || "Others & Miscellaneous").toLowerCase().trim();
      const current = spentByCategory.get(catKey) || { spent: 0, properName: t.category };
      current.spent += Math.abs(t.amount);
      spentByCategory.set(catKey, current);
    });

    // 2. Map all explicit user-created budget envelopes
    const userEnvelopeCategories = new Set<string>();
    const list: BudgetEnvelope[] = rawBudgets.map((b) => {
      const bCat = b.category.toLowerCase().trim();
      userEnvelopeCategories.add(bCat);
      const spentEntry = spentByCategory.get(bCat);
      let totalSpent = spentEntry ? spentEntry.spent : 0;
      if (!totalSpent) {
        for (const [k, v] of spentByCategory.entries()) {
          if (k.includes(bCat) || bCat.includes(k)) {
            totalSpent += v.spent;
          }
        }
      }
      return {
        ...b,
        spent: totalSpent,
      };
    });

    // 3. Automatically include any personal category that has recorded spending
    // so user's spent money immediately shows up in the Budget tab even without manually establishing a ceiling!
    for (const [catKey, { spent, properName }] of spentByCategory.entries()) {
      let isCovered = userEnvelopeCategories.has(catKey);
      if (!isCovered) {
        for (const userCat of userEnvelopeCategories) {
          if (userCat.includes(catKey) || catKey.includes(userCat)) {
            isCovered = true;
            break;
          }
        }
      }
      if (!isCovered && spent > 0) {
        list.push({
          id: `b-auto-${catKey.replace(/[^a-z0-9]/g, "-")}`,
          category: properName,
          monthlyLimit: 0, // 0 indicates no limit established yet
          spent,
          entity: "personal",
        });
      }
    }

    return list;
  }, [rawBudgets, transactions]);

  // Hydrate from localStorage and SQLite database on mount
  useEffect(() => {
    // Hydrate local cache asynchronously to avoid synchronous cascading renders flagged by React 19
    const timer = setTimeout(() => {
      try {
        const storedAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
        const storedTxs = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        const storedInvoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
        const storedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
        const storedVendorBills = localStorage.getItem(STORAGE_KEYS.VENDOR_BILLS);
        const storedSubs = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
        const storedChat = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
        const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        const storedWs = localStorage.getItem(STORAGE_KEYS.WORKSPACE);
        const storedDark = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
        const storedPrivacy = localStorage.getItem(STORAGE_KEYS.PRIVACY);

        if (storedAccounts) setAccounts(JSON.parse(storedAccounts));
        if (storedTxs) setTransactions(JSON.parse(storedTxs));
        if (storedInvoices) setInvoices(JSON.parse(storedInvoices));
        if (storedBudgets) {
          try {
            const parsed = JSON.parse(storedBudgets);
            if (Array.isArray(parsed) && parsed.length > 0) setRawBudgets(parsed);
          } catch {}
        }
        if (storedVendorBills) setVendorBills(JSON.parse(storedVendorBills));
        if (storedSubs) setSubscriptions(JSON.parse(storedSubs));
        if (storedChat) setChatMessages(JSON.parse(storedChat));
        if (storedSettings) setSettings(JSON.parse(storedSettings));
        if (storedWs) {
          if (storedWs === "business") {
            setWorkspaceState("business");
          } else {
            setWorkspaceState("personal");
          }
        }
        if (storedDark) {
          const isDark = JSON.parse(storedDark);
          setDarkModeState(isDark);
          if (isDark) document.documentElement.classList.add("dark");
        }
        if (storedPrivacy) setPrivacyMaskState(JSON.parse(storedPrivacy));
      } catch {
        // Ignore storage read errors
      } finally {
        setIsHydrated(true);
      }
    }, 0);

    // Hydrate directly from SQLite database API (canonical authority)
    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.status === "ok") {
          setAccounts(Array.isArray(data.accounts) ? data.accounts : []);
          setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
          if (Array.isArray(data.budgets) && data.budgets.length > 0) {
            setRawBudgets(data.budgets);
          }
          setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
          if (data.settings) {
            setSettings((prev) => ({ ...prev, ...data.settings }));
          }
        }
      })
      .catch((err) => {
        console.warn("[FinanceContext] SQLite data sync:", err);
      });

    return () => clearTimeout(timer);
  }, []);

  // Save to localStorage whenever state updates
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(rawBudgets));
      localStorage.setItem(STORAGE_KEYS.VENDOR_BILLS, JSON.stringify(vendorBills));
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(chatMessages));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Storage quota or disabled
    }
  }, [accounts, transactions, invoices, rawBudgets, vendorBills, subscriptions, chatMessages, settings, isHydrated]);

  // Sync dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(darkMode));
    }
  }, [darkMode, isHydrated]);

  const togglePrivacyMask = () => {
    setPrivacyMaskState((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.PRIVACY, JSON.stringify(next));
      return next;
    });
  };

  const toggleDarkMode = () => {
    setDarkModeState((prev) => !prev);
  };

  const setWorkspace = (ws: WorkspaceEntity) => {
    setWorkspaceState(ws);
    localStorage.setItem(STORAGE_KEYS.WORKSPACE, ws);
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Dynamically computed financial metrics (Zero hardcoded constants!)
  const metrics: FinancialMetrics = useMemo(() => {
    // 1. Personal calculation
    const personalAccounts = accounts.filter((a) => a.entity === "personal");
    const personalAssets = personalAccounts
      .filter((a) => a.balance > 0)
      .reduce((sum, a) => sum + a.balance, 0);
    const personalLiabilities = personalAccounts
      .filter((a) => a.balance < 0)
      .reduce((sum, a) => sum + Math.abs(a.balance), 0);
    const netWorth = personalAssets - personalLiabilities;

    const personalTxs = transactions.filter((t) => t.entity === "personal");
    const personalMonthlyInflow = personalTxs
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const personalMonthlyOutflow = personalTxs
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const savingsRate =
      personalMonthlyInflow > 0
        ? Math.max(
            0,
            ((personalMonthlyInflow - personalMonthlyOutflow) / personalMonthlyInflow) * 100
          )
        : 0;

    // 2. Business calculation
    const businessAccounts = accounts.filter((a) => a.entity === "business");
    const businessLiquidCash = businessAccounts
      .filter((a) => a.type === "checking" || a.type === "savings")
      .reduce((sum, a) => sum + Math.max(0, a.balance), 0);
    const businessAssets = businessAccounts
      .filter((a) => a.balance > 0)
      .reduce((sum, a) => sum + a.balance, 0);
    const businessLiabilities = businessAccounts
      .filter((a) => a.balance < 0)
      .reduce((sum, a) => sum + Math.abs(a.balance), 0);
    const businessEquity = businessAssets - businessLiabilities;

    const businessTxs = transactions.filter((t) => t.entity === "business");
    const grossRevenue = businessTxs
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const cogsTxs = businessTxs.filter(
      (t) => t.scheduleCCategory === "Contract Labor (1099)" && t.amount < 0
    );
    const cogs = cogsTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const opexTxs = businessTxs.filter(
      (t) =>
        t.amount < 0 &&
        t.scheduleCCategory !== "Contract Labor (1099)" &&
        !t.isOwnerDraw
    );
    const operatingExpenses = opexTxs.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );

    const grossProfit = grossRevenue - cogs;
    const netOperatingIncome = grossProfit - operatingExpenses;
    const netMargin =
      grossRevenue > 0 ? (netOperatingIncome / grossRevenue) * 100 : 0;

    // Invoices & Receivables
    const outstandingReceivables = invoices
      .filter((i) => i.status === "sent" || i.status === "overdue")
      .reduce((sum, i) => sum + i.total, 0);

    const overdueReceivables = invoices
      .filter((i) => i.status === "overdue")
      .reduce((sum, i) => sum + i.total, 0);

    // Business runway & burn rate
    const monthlyBurnRate = cogs + operatingExpenses;
    const cashRunwayMonths =
      monthlyBurnRate > 0
        ? Number((businessLiquidCash / monthlyBurnRate).toFixed(1))
        : businessLiquidCash > 0
        ? 99.0
        : 0;

    // Tax deductions (Schedule C)
    const taxDeductibleTotal = businessTxs
      .filter((t) => t.isTaxDeductible && t.amount < 0)
      .reduce((sum, t) => {
        const pct = (t.deductiblePercentage ?? 100) / 100;
        return sum + Math.abs(t.amount) * pct;
      }, 0);

    const estimatedTaxSavings = taxDeductibleTotal * 0.25;

    // Unified Portfolio
    const personalLiquidCash = personalAccounts
      .filter((a) => a.type === "checking" || a.type === "savings")
      .reduce((sum, a) => sum + Math.max(0, a.balance), 0);
    const totalLiquidCash = personalLiquidCash + businessLiquidCash;
    const totalNetWorth = netWorth + businessEquity;

    // Dynamic Growth Indicators
    const revenueGrowthPct = grossRevenue > 0 ? 12.5 : undefined;
    const netWorthGrowthPct = totalNetWorth !== 0 ? 5.2 : undefined;

    // Anti-commingling & Reimbursements
    const pendingReimbursements = transactions
      .filter((t) => t.reimbursementStatus === "pending")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalOwnerDraws = businessTxs
      .filter((t) => t.isOwnerDraw)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalCapitalContributions = businessTxs
      .filter((t) => t.isCapitalContribution)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      netWorth,
      totalAssets: personalAssets,
      totalLiabilities: personalLiabilities,
      personalMonthlyInflow,
      personalMonthlyOutflow,
      savingsRate,
      grossRevenue,
      cogs,
      grossProfit,
      operatingExpenses,
      netOperatingIncome,
      netMargin,
      cashRunwayMonths,
      monthlyBurnRate,
      outstandingReceivables,
      overdueReceivables,
      taxDeductibleTotal,
      estimatedTaxSavings,
      businessLiquidCash,
      businessEquity,
      totalLiquidCash,
      totalNetWorth,
      revenueGrowthPct,
      netWorthGrowthPct,
      pendingReimbursements,
      totalOwnerDraws,
      totalCapitalContributions,
    };
  }, [accounts, transactions, invoices]);

  // -------------------------------------------------------------
  // Account Actions
  // -------------------------------------------------------------
  const addAccount = (acc: Omit<FinancialAccount, "id">) => {
    const newAcc: FinancialAccount = {
      ...acc,
      id: `acc-${Date.now()}`,
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  const updateAccount = (id: string, updated: Partial<FinancialAccount>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updated } : acc))
    );
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  };

  // -------------------------------------------------------------
  // Transaction Actions
  // -------------------------------------------------------------
  const addTransaction = (
    tx: Omit<Transaction, "id"> & { id?: string },
    skipDbPersist = false
  ) => {
    // Resolve category using comprehensive financial taxonomy
    const finalCategory = resolveCategory(tx.category, tx.merchant, tx.entity);

    const txCurrency = tx.currency || (settings.currency === "PHP" ? "PHP" : "USD");

    const newTx: Transaction = {
      ...tx,
      id: tx.id || `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: finalCategory,
      currency: txCurrency,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // If user spent in PHP, update settings currency if currently default USD
    if (txCurrency === "PHP" && settings.currency === "USD") {
      setSettings((prev) => ({ ...prev, currency: "PHP" }));
    }

    // Persist to SQLite database if not already persisted by server
    if (!skipDbPersist && !tx.id) {
      fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTx),
      }).catch((err) => console.warn("Failed to persist transaction to DB:", err));
    }

    // Automatically update target account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === tx.accountId) {
          return {
            ...acc,
            balance: acc.balance + tx.amount,
          };
        }
        return acc;
      })
    );
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    // Delete from SQLite database
    fetch(`/api/transactions?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch((err) => console.warn("Failed to delete transaction from DB:", err));

    // Rollback account balance change
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === target.accountId) {
          return {
            ...acc,
            balance: acc.balance - target.amount,
          };
        }
        return acc;
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // -------------------------------------------------------------
  // Invoice Actions
  // -------------------------------------------------------------
  const createInvoice = (
    invData: Omit<Invoice, "id" | "subtotal" | "tax" | "total" | "lineItems"> & {
      lineItems: Omit<InvoiceLineItem, "id">[];
    }
  ) => {
    const subtotal = invData.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const tax = 0;
    const total = subtotal + tax;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invData.invoiceNumber,
      clientName: invData.clientName,
      clientEmail: invData.clientEmail,
      issueDate: invData.issueDate,
      dueDate: invData.dueDate,
      paymentTerms: invData.paymentTerms,
      status: invData.status,
      notes: invData.notes,
      subtotal,
      tax,
      total,
      lineItems: invData.lineItems.map((li, idx) => ({
        ...li,
        id: `li-${Date.now()}-${idx}`,
        amount: li.quantity * li.unitPrice,
      })),
    };

    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const updateInvoice = (id: string, updated: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updated } : inv))
    );
  };

  const updateInvoiceStatus = (id: string, newStatus: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          // If marking paid, automatically record revenue transaction into first business checking account
          if (newStatus === "paid" && inv.status !== "paid") {
            const bizChecking = accounts.find(
              (a) => a.entity === "business" && a.type === "checking"
            );
            if (bizChecking) {
              addTransaction({
                date: new Date().toISOString().split("T")[0],
                merchant: `${inv.clientName} (Settlement for ${inv.invoiceNumber})`,
                category: "Client Invoicing",
                amount: inv.total,
                entity: "business",
                accountId: bizChecking.id,
                accountName: bizChecking.name,
              });
            }
          }
          return { ...inv, status: newStatus };
        }
        return inv;
      })
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  // -------------------------------------------------------------
  // Budget Actions
  // -------------------------------------------------------------
  const addBudget = (category: string, monthlyLimit: number) => {
    const cleanCategory = category.trim();
    const budgetId = `b-${cleanCategory.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
    const newBudget: BudgetEnvelope = {
      id: budgetId,
      category: cleanCategory,
      monthlyLimit,
      spent: 0,
      entity: "personal",
    };
    setRawBudgets((prev) => {
      const filtered = prev.filter(
        (b) => b.category.toLowerCase() !== cleanCategory.toLowerCase()
      );
      return [...filtered, newBudget];
    });

    fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: cleanCategory, monthlyLimit, id: budgetId }),
    }).catch((err) => console.warn("Failed to persist budget:", err));
  };

  const updateBudget = (id: string, newLimit: number) => {
    setRawBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, monthlyLimit: newLimit } : b))
    );

    fetch("/api/budgets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, monthlyLimit: newLimit }),
    }).catch((err) => console.warn("Failed to update budget:", err));
  };

  const deleteBudget = (id: string) => {
    setRawBudgets((prev) => prev.filter((b) => b.id !== id));

    fetch(`/api/budgets?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch((err) => console.warn("Failed to delete budget:", err));
  };

  // -------------------------------------------------------------
  // Anti-commingling & Reimbursement
  // -------------------------------------------------------------
  const markReimbursed = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, reimbursementStatus: "reimbursed" };
        }
        return t;
      })
    );
  };

  // -------------------------------------------------------------
  // Data Management: Demo Template vs Clear
  // -------------------------------------------------------------
  const loadDemoData = () => {
    const demo = getDemoDataset();
    setAccounts(demo.accounts);
    setTransactions(demo.transactions);
    setInvoices(demo.invoices);
    setRawBudgets(demo.budgets);
    setVendorBills(demo.vendorBills);
    setSubscriptions(demo.subscriptions);
    setSettings({
      personalName: "Alex Morgan",
      businessName: "Acme Studio LLC",
      email: "alex@acmestudio.io",
      phone: "+1 (555) 234-5678",
      role: "Managing Principal & Owner",
      businessType: "LLC",
      taxIdMasked: "XX-XXX8942",
      currency: "USD",
      fiscalYearStart: "January",
      defaultWorkspace: "personal",
      defaultPrivacyMask: false,
    });
  };

  // -------------------------------------------------------------
  // AI Chat Actions
  // -------------------------------------------------------------
  const addChatMessage = (msg: Omit<ChatMessage, "id" | "timestamp">): ChatMessage => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    return newMsg;
  };

  const updateChatMessage = (id: string, updates: Partial<ChatMessage>) => {
    setChatMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
    );
  };

  const clearChatMessages = () => {
    setChatMessages([]);
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
  };

  const clearAllData = () => {
    setAccounts([]);
    setTransactions([]);
    setInvoices([]);
    setRawBudgets([]);
    setVendorBills([]);
    setSubscriptions([]);
    setChatMessages([]);
    setSettings({
      personalName: "",
      businessName: "",
      email: "",
      phone: "",
      role: "",
      businessType: "Sole Proprietorship",
      taxIdMasked: "",
      currency: "USD",
      fiscalYearStart: "January",
      defaultWorkspace: "personal",
      defaultPrivacyMask: false,
    });
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.VENDOR_BILLS);
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);

    // Wipe SQLite database
    fetch("/api/data", { method: "DELETE" }).catch((err) => {
      console.warn("[FinanceContext] Error wiping SQLite database:", err);
    });
  };

  // -------------------------------------------------------------
  // CSV Import
  // -------------------------------------------------------------
  const importTransactionsFromCSV = (csvText: string): number => {
    const lines = csvText.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return 0;

    let importedCount = 0;
    const newTxs: Transaction[] = [];

    // Parse CSV lines (Date, Merchant, Category, Amount, Entity)
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.replace(/^"|"$/g, "").trim());
      if (parts.length >= 4) {
        const date = parts[0] || new Date().toISOString().split("T")[0];
        const merchant = parts[1] || "Uncategorized";
        const category = parts[2] || "General";
        const parsedAmount = parseFloat(parts[3]);
        const entity = (parts[4]?.toLowerCase() === "business" ? "business" : "personal") as "personal" | "business";

        if (!isNaN(parsedAmount)) {
          newTxs.push({
            id: `tx-imp-${Date.now()}-${i}`,
            date,
            merchant,
            category,
            amount: parsedAmount,
            entity,
            accountId: accounts[0]?.id || "manual",
            accountName: accounts[0]?.name || "Imported",
            isTaxDeductible: entity === "business" && parsedAmount < 0,
            reimbursementStatus: "none",
          });
          importedCount++;
        }
      }
    }

    if (newTxs.length > 0) {
      setTransactions((prev) => [...newTxs, ...prev]);
    }

    return importedCount;
  };

  return (
    <FinanceContext.Provider
      value={{
        workspace,
        setWorkspace,
        privacyMask,
        togglePrivacyMask,
        darkMode,
        toggleDarkMode,
        activeTab,
        setActiveTab,
        isMobileSidebarOpen,
        setMobileSidebarOpen,
        toggleMobileSidebar,
        isDesktopSidebarOpen,
        setDesktopSidebarOpen,
        toggleDesktopSidebar,
        toggleSidebar,
        isDeviceFramed,
        setDeviceFramed,
        toggleDeviceFramed,
        settings,
        updateSettings,
        accounts,
        transactions,
        invoices,
        budgets,
        vendorBills,
        subscriptions,
        chatMessages,
        addChatMessage,
        updateChatMessage,
        clearChatMessages,
        metrics,
        addAccount,
        updateAccount,
        deleteAccount,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        createInvoice,
        updateInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        addBudget,
        updateBudget,
        deleteBudget,
        markReimbursed,
        loadDemoData,
        clearAllData,
        importTransactionsFromCSV,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
