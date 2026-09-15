import React from "react";

interface MoneyAmountProps {
  amount: number; // In base currency units (e.g. 1250.50)
  currency?: string; // Default: 'USD'
  showSign?: boolean; // Force '+' for positive
  colored?: boolean; // Apply green for inflow, rose for outflow
  privacyMask?: boolean; // Obfuscate as $••••••
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export function MoneyAmount({
  amount,
  currency = "USD",
  showSign = false,
  colored = false,
  privacyMask = false,
  size = "md",
  className = "",
}: MoneyAmountProps) {
  if (privacyMask) {
    return (
      <span
        className={`font-mono font-medium select-none tracking-wider text-text-muted opacity-60 ${className}`}
      >
        $••••••
      </span>
    );
  }

  const isPositive = amount > 0;
  const isNegative = amount < 0;

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  let colorClass = "text-text-primary";
  if (colored) {
    if (isPositive) colorClass = "text-inflow";
    else if (isNegative) colorClass = "text-outflow";
    else colorClass = "text-text-muted";
  }

  const sizeClasses = {
    xs: "text-xs font-medium",
    sm: "text-sm font-medium",
    md: "text-base font-semibold",
    lg: "text-xl font-bold",
    xl: "text-2xl sm:text-3xl font-extrabold tracking-tight",
    "2xl": "text-3xl sm:text-4xl font-extrabold tracking-tight",
  };

  const sign = isPositive && showSign ? "+" : isNegative ? "-" : "";

  return (
    <span
      className={`inline-flex items-baseline font-mono tabular-nums select-none ${sizeClasses[size]} ${colorClass} ${className}`}
    >
      <span className="opacity-80">{sign}</span>
      <span>{formatted}</span>
    </span>
  );
}
