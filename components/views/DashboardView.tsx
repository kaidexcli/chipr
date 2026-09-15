"use client";

import React, { useState, useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { RecordCard } from "@/components/ui/RecordCard";
import { BudgetMeter } from "@/components/ui/BudgetMeter";
import { RunwayCard } from "@/components/ui/RunwayCard";
import { CashFlowTrendChart } from "@/components/ui/Charts";
import { DebitCardMockup } from "@/components/ui/DebitCardMockup";
import { NewTransactionModal } from "@/components/modals/NewTransactionModal";
import { AccountModal } from "@/components/modals/AccountModal";
import { FinancialAccount, Transaction } from "@/types/finance";
import {
  PlusIcon,
  SparklesIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  BankIcon,
  PiggyBankIcon,
  CreditCardIcon,
  GridIcon,
  ListIcon,
  CreditPlusIcon,
} from "@/components/ui/Icons";

export function DashboardView() {
  const {
    workspace,
    privacyMask,
    metrics,
    accounts,
    budgets,
    transactions,
    settings,
    markReimbursed,
    deleteTransaction,
    setActiveTab,
    openAddCreditModal,
  } = useFinance();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinancialAccount | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [accountFilter, setAccountFilter] = useState<"all" | "liquid" | "savings" | "credit" | "investment">("all");
  const [activityViewMode, setActivityViewMode] = useState<"cards" | "compact">("cards");

  // Filter accounts by active workspace (Personal vs Business)
  const displayedAccounts = useMemo(() => {
    return accounts.filter((a) => a.entity === workspace);
  }, [accounts, workspace]);

  // Categorized accounts
  const filteredAccounts = useMemo(() => {
    if (accountFilter === "liquid") {
      return displayedAccounts.filter((a) => a.type === "checking");
    }
    if (accountFilter === "savings") {
      return displayedAccounts.filter((a) => a.type === "savings");
    }
    if (accountFilter === "credit") {
      return displayedAccounts.filter((a) => a.type === "credit" || a.type === "loan");
    }
    if (accountFilter === "investment") {
      return displayedAccounts.filter((a) => a.type === "investment");
    }
    return displayedAccounts;
  }, [displayedAccounts, accountFilter]);

  // Account category counts and sums
  const accountMetrics = useMemo(() => {
    let liquid = 0;
    let savings = 0;
    let credit = 0;
    let investment = 0;

    displayedAccounts.forEach((a) => {
      if (a.type === "checking") liquid += a.balance;
      if (a.type === "savings") savings += a.balance;
      if (a.type === "credit" || a.type === "loan") credit += a.balance;
      if (a.type === "investment") investment += a.balance;
    });

    return {
      liquid,
      savings,
      credit,
      investment,
      checkingCount: displayedAccounts.filter((a) => a.type === "checking").length,
      savingsCount: displayedAccounts.filter((a) => a.type === "savings").length,
      creditCount: displayedAccounts.filter((a) => a.type === "credit" || a.type === "loan").length,
      investCount: displayedAccounts.filter((a) => a.type === "investment").length,
    };
  }, [displayedAccounts]);

  // Recent transactions (latest 6, scoped to active workspace)
  const recentTransactions = useMemo(() => {
    return transactions.filter((t) => t.entity === workspace).slice(0, 6);
  }, [transactions, workspace]);

  const isCompletelyEmpty = accounts.length === 0 && transactions.length === 0;

  // Hero primary amount and label
  const heroData =
    workspace === "personal"
      ? {
          title: "Personal Net Worth",
          amount: metrics.netWorth,
          subtitle: "Liquid assets minus liabilities",
        }
      : {
          title: `${settings.businessName || "Business"} Liquid Cash`,
          amount: metrics.businessLiquidCash,
          subtitle: `${metrics.cashRunwayMonths.toFixed(1)} months operating runway`,
        };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl">
      {/* Upper Portion: Debit Card Showcase */}
      <div className="pt-1 pb-2 flex flex-col items-center">
        <DebitCardMockup />
      </div>

      {/* Empty State Guided Starter */}
      {isCompletelyEmpty && (
        <div className="rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-xs">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Welcome to Chipr
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-text-muted leading-relaxed max-w-xl">
                Start fresh by linking your financial accounts, or load our sample template to preview cash flow charts, invoicing, and tax tracking.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => openAddCreditModal()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-all cursor-pointer"
            >
              <CreditPlusIcon className="w-3.5 h-3.5" />
              <span>Add Credit / Top-Up</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover transition-all cursor-pointer"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Add First Account</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-canvas px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-raised transition-all cursor-pointer"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-brand" />
              <span>Log Expense via AI Chat</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Financial Position */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 pb-4 border-b border-border-subtle">
        <div className="space-y-1">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-text-muted font-mono">
            {heroData.title}
          </span>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-text-primary font-mono">
            <MoneyAmount
              amount={heroData.amount}
              size="xl"
              privacyMask={privacyMask}
            />
          </div>
          <p className="text-xs text-text-muted">{heroData.subtitle}</p>
        </div>

        {/* Quick Monthly Flow Readout */}
        <div className="flex items-center gap-5 sm:gap-8 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border-subtle/50">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <TrendingUpIcon className="w-3.5 h-3.5 text-inflow" />
              <span>Inflow</span>
            </div>
            <div className="font-mono text-base font-bold text-inflow">
              <MoneyAmount
                amount={
                  workspace === "business"
                    ? metrics.grossRevenue
                    : metrics.personalMonthlyInflow
                }
                size="md"
                showSign
                colored
                privacyMask={privacyMask}
              />
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <TrendingDownIcon className="w-3.5 h-3.5 text-outflow" />
              <span>Outflow</span>
            </div>
            <div className="font-mono text-base font-bold text-outflow">
              <MoneyAmount
                amount={
                  workspace === "business"
                    ? -metrics.monthlyBurnRate
                    : -metrics.personalMonthlyOutflow
                }
                size="md"
                colored
                privacyMask={privacyMask}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => openAddCreditModal()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 active:scale-[0.98] transition-all cursor-pointer"
            title="Add credit or top up funds"
          >
            <CreditPlusIcon className="w-3.5 h-3.5" />
            <span>Add Credit</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingTx(null);
              setIsTxModalOpen(true);
            }}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover active:scale-[0.98] transition-all cursor-pointer ml-1"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Transaction</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACCOUNTS & BALANCES SHOWCASE (COMPONENT CARDS)                            */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                Accounts & Balances
              </h3>
              <span className="rounded-full bg-brand-subtle px-2 py-0.5 text-[11px] font-mono font-bold text-brand">
                {displayedAccounts.length} Linked
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Real-time liquidity, high-yield reserves, credit limits & investment portfolios
            </p>
          </div>

          {/* Action Buttons: Add Credit & Connect Account */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => openAddCreditModal()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Add credit or top up funds"
            >
              <CreditPlusIcon className="w-3.5 h-3.5" />
              <span>Add Credit</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-raised hover:border-border-strong transition-all cursor-pointer shadow-xs"
            >
              <PlusIcon className="w-3.5 h-3.5 text-brand" />
              <span>Connect Account</span>
            </button>
          </div>
        </div>

        {/* Account Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button
            type="button"
            onClick={() => setAccountFilter("all")}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all cursor-pointer shrink-0 ${
              accountFilter === "all"
                ? "bg-text-primary text-text-inverse shadow-xs"
                : "bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-raised"
            }`}
          >
            All Accounts ({displayedAccounts.length})
          </button>

          {accountMetrics.checkingCount > 0 && (
            <button
              type="button"
              onClick={() => setAccountFilter("liquid")}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                accountFilter === "liquid"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-raised"
              }`}
            >
              <BankIcon className="w-3.5 h-3.5" />
              <span>Checking ({accountMetrics.checkingCount})</span>
            </button>
          )}

          {accountMetrics.savingsCount > 0 && (
            <button
              type="button"
              onClick={() => setAccountFilter("savings")}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                accountFilter === "savings"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-raised"
              }`}
            >
              <PiggyBankIcon className="w-3.5 h-3.5" />
              <span>Savings & HYSA ({accountMetrics.savingsCount})</span>
            </button>
          )}

          {accountMetrics.creditCount > 0 && (
            <button
              type="button"
              onClick={() => setAccountFilter("credit")}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                accountFilter === "credit"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-raised"
              }`}
            >
              <CreditCardIcon className="w-3.5 h-3.5" />
              <span>Credit Cards ({accountMetrics.creditCount})</span>
            </button>
          )}

          {accountMetrics.investCount > 0 && (
            <button
              type="button"
              onClick={() => setAccountFilter("investment")}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                accountFilter === "investment"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-raised"
              }`}
            >
              <TrendingUpIcon className="w-3.5 h-3.5" />
              <span>Investments ({accountMetrics.investCount})</span>
            </button>
          )}
        </div>

        {/* Balance Component Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredAccounts.map((acc) => (
            <BalanceCard
              key={acc.id}
              account={acc}
              privacyMask={privacyMask}
              onEdit={(accountToEdit) => {
                setEditingAccount(accountToEdit);
                setIsAccountModalOpen(true);
              }}
              onClick={(accountToEdit) => {
                setEditingAccount(accountToEdit);
                setIsAccountModalOpen(true);
              }}
            />
          ))}

          {/* Add Account Dashed Card */}
          <button
            type="button"
            onClick={() => {
              setEditingAccount(null);
              setIsAccountModalOpen(true);
            }}
            className="group rounded-2xl border-2 border-dashed border-border-subtle hover:border-brand/60 bg-surface/40 hover:bg-brand/5 p-5 flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 cursor-pointer min-h-[170px]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas border border-border-subtle text-text-muted group-hover:text-brand group-hover:border-brand/40 transition-colors shadow-2xs">
              <PlusIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary group-hover:text-brand transition-colors">
                Connect Financial Account
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">
                Checking, Savings, Credit, or Brokerage
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Cash Flow Visual Trajectory */}
      <CashFlowTrendChart transactions={transactions} privacyMask={privacyMask} />

      {/* ========================================================================= */}
      {/* TWO-COLUMN SECTION: RECENT ACTIVITY (RECORDS CARDS) & SOLVENCY           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Activity (Records Cards) (60%) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-primary tracking-tight">
                  Recent Activity
                </h3>
                <span className="rounded-full bg-raised px-2 py-0.5 text-[11px] font-mono font-semibold text-text-muted">
                  {recentTransactions.length}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Real-time ledger events with category badges & anti-commingling trail
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Card vs Compact view toggle */}
              <div className="flex items-center rounded-xl border border-border-subtle bg-surface p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActivityViewMode("cards")}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    activityViewMode === "cards"
                      ? "bg-canvas text-brand shadow-xs"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                  title="Card view"
                >
                  <GridIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActivityViewMode("compact")}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    activityViewMode === "compact"
                      ? "bg-canvas text-brand shadow-xs"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                  title="Compact view"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("transactions")}
                className="text-xs text-brand hover:text-brand-hover font-semibold flex items-center gap-1 cursor-pointer pl-1"
              >
                <span>View All</span>
                <ArrowRightIcon className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Records Rendered as Component Cards */}
          {recentTransactions.length > 0 ? (
            activityViewMode === "cards" ? (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <RecordCard
                    key={tx.id}
                    transaction={tx}
                    privacyMask={privacyMask}
                    onReimburse={() => markReimbursed(tx.id)}
                    onEdit={(transactionToEdit) => {
                      setEditingTx(transactionToEdit);
                      setIsTxModalOpen(true);
                    }}
                    onDelete={(id) => deleteTransaction(id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((tx) => (
                  <RecordCard
                    key={tx.id}
                    transaction={tx}
                    variant="compact"
                    privacyMask={privacyMask}
                    onReimburse={() => markReimbursed(tx.id)}
                    onEdit={(transactionToEdit) => {
                      setEditingTx(transactionToEdit);
                      setIsTxModalOpen(true);
                    }}
                    onDelete={(id) => deleteTransaction(id)}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-border-subtle bg-surface p-8 text-center text-xs text-text-muted shadow-xs">
              No recent transactions recorded. Click above to record an inflow or expense.
            </div>
          )}
        </div>

        {/* Right Column: Solvency, Runway, & Anti-Commingling (40%) */}
        <div className="space-y-6">
          {/* Quick Snapshot: Runway or Budget */}
          {workspace === "business" ? (
            <RunwayCard
              monthlyBurnRate={metrics.monthlyBurnRate}
              cashRunwayMonths={metrics.cashRunwayMonths}
              liquidReserves={metrics.businessLiquidCash}
              privacyMask={privacyMask}
            />
          ) : budgets.length > 0 ? (
            <BudgetMeter
              category={budgets[0].category}
              spent={budgets[0].spent}
              budget={budgets[0].monthlyLimit}
              privacyMask={privacyMask}
            />
          ) : null}

          {/* Liquidity Breakdown Card */}
          <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h4 className="text-sm font-bold text-text-primary tracking-tight">
                Liquidity & Solvency
              </h4>
              <span className="text-[10px] font-mono text-text-muted uppercase">
                {workspace}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Liquid Cash
                </span>
                <MoneyAmount
                  amount={accountMetrics.liquid}
                  size="sm"
                  privacyMask={privacyMask}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  High-Yield Reserves
                </span>
                <MoneyAmount
                  amount={accountMetrics.savings}
                  size="sm"
                  privacyMask={privacyMask}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  Investments
                </span>
                <MoneyAmount
                  amount={accountMetrics.investment}
                  size="sm"
                  privacyMask={privacyMask}
                />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border-subtle/60">
                <span className="text-text-muted flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Credit / Liabilities
                </span>
                <MoneyAmount
                  amount={accountMetrics.credit}
                  size="sm"
                  colored
                  privacyMask={privacyMask}
                />
              </div>
            </div>
          </div>

          {/* Anti-Commingling Protection Status Card */}
          <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-xs text-xs space-y-2">
            <div className="flex items-center gap-2 text-brand">
              <ShieldCheckIcon className="w-5 h-5" />
              <span className="font-bold text-text-primary">Anti-Commingling Guard</span>
            </div>
            <p className="text-text-muted leading-relaxed text-[11px]">
              Strict accounting isolation is active. Personal and commercial accounts are partitioned to safeguard LLC legal liability and simplify tax filings.
            </p>
            {metrics.pendingReimbursements > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-medium">
                  <span className="text-[11px]">Pending Reimbursements</span>
                  <MoneyAmount
                    amount={metrics.pendingReimbursements}
                    size="sm"
                    privacyMask={privacyMask}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        editingTx={editingTx}
      />
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        editingAccount={editingAccount}
      />
    </div>
  );
}
