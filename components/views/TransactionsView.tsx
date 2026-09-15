"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { TransactionTable } from "@/components/ui/TransactionTable";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { NewTransactionModal } from "@/components/modals/NewTransactionModal";
import { Transaction } from "@/types/finance";
import {
  PlusIcon,
  TransactionIcon,
  TaxIcon,
  ArrowsExchangeIcon,
  UserIcon,
} from "@/components/ui/Icons";

export function TransactionsView() {
  const { transactions, workspace, privacyMask, markReimbursed, metrics, settings } = useFinance();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const displayedTransactions = transactions.filter((t) => t.entity === workspace);

  const isPersonal = workspace === "personal";

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-border-subtle bg-surface p-4 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
              {isPersonal ? "Personal Financial Ledger" : `${settings.businessName || "Business"} Ledger`}
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isPersonal
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                  : "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"
              }`}
            >
              {isPersonal ? "Personal" : settings.businessName || "Business"}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-text-muted">
            {isPersonal
              ? "Household accounts, everyday spending, discretionary cards & savings flows."
              : "Commercial operations, invoice payments, tax write-offs & vendor accounts payable."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingTx(null);
              setIsTxModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 sm:px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover active:scale-[0.98] transition-all cursor-pointer"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Ledger Summary Stats (Component Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-5 shadow-xs flex flex-col justify-between hover:border-border-strong hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-text-muted">
              {isPersonal ? "Personal Records" : "Business Records"}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400">
              <TransactionIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-xl font-extrabold font-mono text-text-primary">
            {displayedTransactions.length} <span className="text-xs font-normal text-text-muted">records</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-5 shadow-xs flex flex-col justify-between hover:border-border-strong hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-text-muted">
              {isPersonal ? "Savings Rate" : "Tax Deductibles"}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TaxIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            {isPersonal ? (
              <span className="font-mono text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {Math.max(0, Math.min(100, Math.round(metrics.savingsRate)))}%
              </span>
            ) : (
              <MoneyAmount
                amount={metrics.taxDeductibleTotal}
                size="md"
                colored
                privacyMask={privacyMask}
              />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-5 shadow-xs flex flex-col justify-between hover:border-border-strong hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-text-muted">Reimbursements</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ArrowsExchangeIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <MoneyAmount
              amount={metrics.pendingReimbursements}
              size="md"
              privacyMask={privacyMask}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-5 shadow-xs flex flex-col justify-between hover:border-border-strong hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-text-muted">
              {isPersonal ? "Net Worth" : "Owner Draws"}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <MoneyAmount
              amount={isPersonal ? metrics.netWorth : metrics.totalOwnerDraws}
              size="md"
              privacyMask={privacyMask}
            />
          </div>
        </div>
      </div>

      {/* Full Transaction Table (Scoped to Active Workspace) */}
      <TransactionTable
        transactions={displayedTransactions}
        privacyMask={privacyMask}
        onReimburse={markReimbursed}
        onAddNew={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        onEditTx={(tx) => {
          setEditingTx(tx);
          setIsTxModalOpen(true);
        }}
        title={isPersonal ? "Personal Ledger Records" : `${settings.businessName || "Business"} Records`}
      />

      <NewTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        editingTx={editingTx}
      />
    </div>
  );
}
