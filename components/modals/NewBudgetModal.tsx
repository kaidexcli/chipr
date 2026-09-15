"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { XMarkIcon } from "@/components/ui/Icons";

interface NewBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
  initialLimit?: number;
  budgetId?: string;
}

import { getPersonalCategories } from "@/lib/categories";

export function NewBudgetModal({
  isOpen,
  onClose,
  initialCategory = "",
  initialLimit = 500,
  budgetId,
}: NewBudgetModalProps) {
  const { addBudget, updateBudget, settings, transactions } = useFinance();
  const [category, setCategory] = useState(initialCategory);
  const [monthlyLimit, setMonthlyLimit] = useState(initialLimit.toString());

  const personalCategories = getPersonalCategories();
  const effectiveCurrency =
    settings.currency ||
    transactions.find((t) => t.currency)?.currency ||
    "USD";

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(monthlyLimit);
    if (isNaN(limit) || limit <= 0) return;

    if (budgetId) {
      updateBudget(budgetId, limit);
    } else {
      if (!category.trim()) return;
      addBudget(category.trim(), limit);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile sheet pull indicator */}
        <div className="sm:hidden w-10 h-1 bg-border-strong rounded-full mx-auto mb-1 opacity-70" />
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              {budgetId ? "Adjust Budget Limit" : "New Envelope Budget"}
            </h3>
            <p className="text-xs text-text-muted">
              Configure monthly spending ceiling with 80% and 100% threshold alerts
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
          {!budgetId && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-text-secondary">
                  Category Name
                </label>
                <span className="text-[10px] text-text-muted">Select or enter custom</span>
              </div>
              <input
                type="text"
                required
                list="budget-category-suggestions"
                placeholder="e.g. Food & Dining, Shopping & Clothing"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
              <datalist id="budget-category-suggestions">
                {personalCategories.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
              <div className="flex flex-wrap items-center gap-1.5 mt-2 max-h-24 overflow-y-auto pr-1">
                {personalCategories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.name)}
                    className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors cursor-pointer border ${
                      category.toLowerCase() === c.name.toLowerCase()
                        ? "bg-brand text-white border-brand shadow-2xs"
                        : "bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:bg-raised"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Monthly Ceiling ({effectiveCurrency})
            </label>
            <input
              type="number"
              min="1"
              step="10"
              required
              placeholder="500"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-xs font-mono text-text-primary focus:border-brand focus:outline-none"
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
              {budgetId ? "Update Limit" : "Create Envelope"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
