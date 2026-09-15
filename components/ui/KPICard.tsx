import React from "react";
import { MoneyAmount } from "./MoneyAmount";

interface KPICardProps {
  title: string;
  amount: number;
  currency?: string;
  changePercentage?: number; // e.g. +5.4 or -2.1
  periodLabel?: string; // e.g. "vs last month"
  icon?: React.ReactNode;
  loading?: boolean;
  privacyMask?: boolean;
  badgeText?: string;
  badgeVariant?: "inflow" | "outflow" | "warning" | "neutral" | "brand";
  onClick?: () => void;
  className?: string;
}

export function KPICard({
  title,
  amount,
  currency = "USD",
  changePercentage,
  periodLabel = "vs last month",
  icon,
  loading = false,
  privacyMask = false,
  badgeText,
  badgeVariant,
  onClick,
  className = "",
}: KPICardProps) {
  if (loading) {
    return (
      <div className={`rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-sm ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-raised" />
          <div className="h-9 w-9 animate-pulse rounded-xl bg-raised" />
        </div>
        <div className="mt-4 h-8 w-36 animate-pulse rounded bg-raised" />
        <div className="mt-3 h-3.5 w-24 animate-pulse rounded bg-raised" />
      </div>
    );
  }

  const isUp = (changePercentage ?? 0) >= 0;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">{title}</span>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-raised text-text-secondary transition-colors duration-150 group-hover:text-brand">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <MoneyAmount
          amount={amount}
          currency={currency}
          size="xl"
          privacyMask={privacyMask}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium">
        {changePercentage !== undefined && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono ${
              isUp
                ? "bg-inflow-subtle text-inflow"
                : "bg-outflow-subtle text-outflow"
            }`}
          >
            {isUp ? "↑" : "↓"} {Math.abs(changePercentage).toFixed(1)}%
          </span>
        )}

        {badgeText && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono ${
              badgeVariant === "inflow"
                ? "bg-inflow-subtle text-inflow"
                : badgeVariant === "outflow"
                ? "bg-outflow-subtle text-outflow"
                : badgeVariant === "warning"
                ? "bg-warning-subtle text-warning"
                : badgeVariant === "brand"
                ? "bg-brand-subtle text-brand"
                : "bg-raised text-text-muted"
            }`}
          >
            {badgeText}
          </span>
        )}

        <span className="text-text-muted">{periodLabel}</span>
      </div>
    </div>
  );
}
