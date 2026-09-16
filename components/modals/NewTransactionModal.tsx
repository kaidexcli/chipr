"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { ScheduleCCategory, Transaction } from "@/types/finance";
import { XMarkIcon } from "@/components/ui/Icons";

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTx?: Transaction | null;
}

const SCHEDULE_C_CATEGORIES: ScheduleCCategory[] = [
  "Advertising & Marketing",
  "Car & Truck / Mileage",
  "Contract Labor (1099)",
  "Legal & Professional Services",
  "Office & Software Subscriptions",
  "Travel",
  "Meals & Entertainment (50%)",
  "Taxes & Licenses",
  "Other Business Expenses",
];

export function NewTransactionModal({
  isOpen,
  onClose,
  editingTx,
}: NewTransactionModalProps) {
  const { accounts, addTransaction, updateTransaction, settings } = useFinance();

  const [type, setType] = useState<"expense" | "income">("expense");
  const [entity, setEntity] = useState<"personal" | "business">("personal");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [accountId, setAccountId] = useState("");
  const [isTaxDeductible, setIsTaxDeductible] = useState(false);
  const [deductiblePercentage, setDeductiblePercentage] = useState(100);
  const [scheduleCCategory, setScheduleCCategory] = useState<ScheduleCCategory>(
    "Office & Software Subscriptions"
  );
  const [isCrossEntityReimbursement, setIsCrossEntityReimbursement] = useState(false);
  const [isOwnerDraw, setIsOwnerDraw] = useState(false);
  const [note, setNote] = useState("");

  const [prevEditingTx, setPrevEditingTx] = useState(editingTx);
  if (prevEditingTx !== editingTx) {
    setPrevEditingTx(editingTx);
    if (editingTx) {
      setType(editingTx.amount < 0 ? "expense" : "income");
      setEntity(editingTx.entity);
      setMerchant(editingTx.merchant);
      setCategory(editingTx.category);
      setAmount(Math.abs(editingTx.amount).toString());
      setDate(editingTx.date);
      setAccountId(editingTx.accountId);
      setIsTaxDeductible(!!editingTx.isTaxDeductible);
      setDeductiblePercentage(editingTx.deductiblePercentage ?? 100);
      if (editingTx.scheduleCCategory) {
        setScheduleCCategory(editingTx.scheduleCCategory);
      }
      setIsCrossEntityReimbursement(editingTx.reimbursementStatus === "pending");
      setIsOwnerDraw(!!editingTx.isOwnerDraw);
      setNote(editingTx.note || "");
    } else {
      setType("expense");
      setEntity("personal");
      setMerchant("");
      setCategory("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setAccountId(accounts[0]?.id || "unlinked");
      setIsTaxDeductible(false);
      setDeductiblePercentage(100);
      setScheduleCCategory("Office & Software Subscriptions");
      setIsCrossEntityReimbursement(false);
      setIsOwnerDraw(false);
      setNote("");
    }
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const selectedAccount = accounts.find((a) => a.id === accountId);
    const accountName = selectedAccount?.name || (accounts.length === 0 ? "Unlinked" : "Manual");

    const finalAmount = type === "expense" ? -parsedAmount : parsedAmount;

    if (editingTx) {
      updateTransaction(editingTx.id, {
        date,
        merchant: merchant.trim(),
        category: category.trim() || (type === "expense" ? "General Expense" : "General Income"),
        amount: finalAmount,
        entity,
        accountId: selectedAccount?.id || "unlinked",
        accountName,
        isTaxDeductible: entity === "business" && isTaxDeductible,
        deductiblePercentage: isTaxDeductible ? deductiblePercentage : undefined,
        scheduleCCategory: isTaxDeductible ? scheduleCCategory : undefined,
        reimbursementStatus: isCrossEntityReimbursement ? "pending" : "none",
        isOwnerDraw,
        note: note.trim() || undefined,
        receiptAttached: isTaxDeductible,
      });
    } else {
      addTransaction({
        date,
        merchant: merchant.trim(),
        category: category.trim() || (type === "expense" ? "General Expense" : "General Income"),
        amount: finalAmount,
        entity,
        accountId: selectedAccount?.id || "unlinked",
        accountName,
        isTaxDeductible: entity === "business" && isTaxDeductible,
        deductiblePercentage: isTaxDeductible ? deductiblePercentage : undefined,
        scheduleCCategory: isTaxDeductible ? scheduleCCategory : undefined,
        reimbursementStatus: isCrossEntityReimbursement ? "pending" : "none",
        isOwnerDraw,
        note: note.trim() || undefined,
        receiptAttached: isTaxDeductible,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile sheet pull indicator */}
        <div className="sm:hidden w-10 h-1 bg-border-strong rounded-full mx-auto mb-1 opacity-70" />
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              {editingTx ? "Edit Ledger Record" : "Record Transaction"}
            </h3>
            <p className="text-xs text-text-muted">
              Add personal or commercial ledger activity with strict entity isolation
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-raised hover:text-text-primary cursor-pointer"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Income vs Expense & Entity Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Flow Direction
              </label>
              <div className="flex rounded-xl border border-border-subtle bg-canvas p-1">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    type === "expense"
                      ? "bg-outflow-subtle text-outflow shadow-xs"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  - Outflow
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    type === "income"
                      ? "bg-inflow-subtle text-inflow shadow-xs"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  + Inflow
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Entity Scope
              </label>
              <div className="flex rounded-xl border border-border-subtle bg-canvas p-1">
                <button
                  type="button"
                  onClick={() => {
                    setEntity("personal");
                    setIsTaxDeductible(false);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    entity === "personal"
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 shadow-xs"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Personal
                </button>
                <button
                  type="button"
                  onClick={() => setEntity("business")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer truncate ${
                    entity === "business"
                      ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 shadow-xs"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {settings.businessName || "Business"}
                </button>
              </div>
            </div>
          </div>

          {/* Merchant & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Merchant / Counterparty
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AWS, Client Name, Supermarket"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Amount (₱ PHP)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs font-mono text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-text-secondary">
                  Category
                </label>
                {entity === "personal" && (
                  <span className="text-[10px] text-text-muted">Food, Clothes, Others</span>
                )}
              </div>
              <input
                type="text"
                list="category-suggestions"
                placeholder={entity === "personal" ? "Food, Clothes, or Others" : "e.g. Software, Retainer"}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
              <datalist id="category-suggestions">
                {entity === "personal" ? (
                  <>
                    <option value="Food" />
                    <option value="Clothes" />
                    <option value="Others" />
                  </>
                ) : (
                  SCHEDULE_C_CATEGORIES.map((sc) => (
                    <option key={sc} value={sc} />
                  ))
                )}
              </datalist>
              {entity === "personal" && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  {(["Food", "Clothes", "Others"] as const).map((catName) => (
                    <button
                      key={catName}
                      type="button"
                      onClick={() => setCategory(catName)}
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer border ${
                        category.toLowerCase() === catName.toLowerCase()
                          ? "bg-brand text-white border-brand shadow-2xs"
                          : "bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:bg-raised"
                      }`}
                    >
                      {catName}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs font-mono text-text-primary focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Account */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Payment Account
            </label>
            {accounts.length > 0 ? (
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary focus:border-brand focus:outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.institution}) • {acc.entity.toUpperCase()}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-text-muted italic bg-canvas p-2.5 rounded-xl border border-border-subtle">
                No accounts created yet. Transaction will be tagged as Unlinked.
              </p>
            )}
          </div>

          {/* Business Deductibility & Schedule C options */}
          {entity === "business" && type === "expense" && (
            <div className="rounded-xl border border-border-subtle bg-canvas p-3.5 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTaxDeductible}
                  onChange={(e) => setIsTaxDeductible(e.target.checked)}
                  className="rounded border-border-subtle text-brand focus:ring-brand"
                />
                <span className="text-xs font-semibold text-text-primary">
                  IRS Schedule C Tax Deductible Expense
                </span>
              </label>

              {isTaxDeductible && (
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] text-text-secondary mb-1">
                      Schedule C Tax Category
                    </label>
                    <select
                      value={scheduleCCategory}
                      onChange={(e) =>
                        setScheduleCCategory(e.target.value as ScheduleCCategory)
                      }
                      className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-xs text-text-primary focus:border-brand focus:outline-none"
                    >
                      {SCHEDULE_C_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-text-secondary mb-1">
                      Deductible Portion: {deductiblePercentage}%
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDeductiblePercentage(100)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                          deductiblePercentage === 100
                            ? "bg-emerald-600 text-white"
                            : "bg-raised text-text-secondary"
                        }`}
                      >
                        100% (Standard)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeductiblePercentage(50)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                          deductiblePercentage === 50
                            ? "bg-emerald-600 text-white"
                            : "bg-raised text-text-secondary"
                        }`}
                      >
                        50% (Business Meals)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Anti-Commingling Guards */}
          <div className="rounded-xl border border-border-subtle bg-canvas p-3.5 space-y-2">
            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Anti-Commingling Safeguards
            </p>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCrossEntityReimbursement}
                onChange={(e) => setIsCrossEntityReimbursement(e.target.checked)}
                className="mt-0.5 rounded border-border-subtle text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs text-text-primary leading-tight">
                <strong>Paid with personal funds for business?</strong> Tag as pending
                reimbursement from commercial entity to preserve corporate veil.
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isOwnerDraw}
                onChange={(e) => setIsOwnerDraw(e.target.checked)}
                className="mt-0.5 rounded border-border-subtle text-purple-600 focus:ring-purple-500"
              />
              <span className="text-xs text-text-primary leading-tight">
                <strong>Owner&apos;s Draw / Distribution?</strong> Track equity
                withdrawals cleanly for tax filing.
              </span>
            </label>
          </div>

          {/* Memo / Note */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Internal Memo / Note
            </label>
            <input
              type="text"
              placeholder="e.g. Receipt captured, invoice reference, project debrief"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary rounded-xl hover:bg-raised transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover active:scale-[0.98] rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {editingTx ? "Update Record" : "Save Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
