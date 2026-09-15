import React from "react";
import { InvoiceStatus } from "@/types/finance";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

const statusConfig: Record<
  InvoiceStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  draft: {
    label: "Draft",
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
    dot: "bg-slate-500",
  },
  sent: {
    label: "Sent / Pending",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  paid: {
    label: "Paid",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  overdue: {
    label: "Overdue",
    bg: "bg-red-50 dark:bg-red-950/50",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-600 dark:text-zinc-400",
    dot: "bg-zinc-500",
  },
};

export function InvoiceStatusBadge({
  status,
  className = "",
}: InvoiceStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold ${config.bg} ${config.text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
