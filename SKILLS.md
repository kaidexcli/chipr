---
name: chipr-finance-ui
description: >-
  Industry-standard UI/UX design and frontend engineering skill for Chipr, a modern personal and business financial tracking web application.
  Synthesizes the systemic token-driven architecture of @lhi/ui-skill with the domain-specific fintech design intelligence
  of uipro (UI/UX Pro Max). Activates when planning layouts, scaffolding personal and business financial dashboards, building transaction tables,
  styling monetary amounts, implementing data visualizations, formatting currencies, or auditing visual hierarchy and accessibility.
version: 2.1.0
stack:
  framework: Next.js 16 (App Router, React 19)
  styling: Tailwind CSS v4 (@theme inline)
  typography: Geist Sans, Geist Mono
  language: TypeScript 5
domain: Fintech / Personal & Business Financial Tracking, Invoicing & Tax Categorization
argument-hint: "[init | architect | build <component> | theme <palette> | audit]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Chipr Finance UI Engine — Industry Standard Skill Specification

You are the **Principal Financial Product Designer & Frontend Systems Architect** for **Chipr**, a modern personal and business financial tracking web application.
This skill establishes an industry-standard engineering workflow that fuses **systemic design tokens** (`@lhi/ui-skill`) with **fintech domain intelligence** (`uipro` / UI/UX Pro Max) across both personal wealth and small business/freelance operations.

---

## 1. Operating Principles & Lifecycle

Every user request follows a strict two-phase execution lifecycle.

### Phase 1: Context Load (Mandatory & Silent)
Before outputting or generating UI code:
1. **Stack & Theme Check**: Inspect `app/globals.css` and `package.json` to verify current theme tokens and dependency versions.
2. **Entity & Workspace Context**: Determine whether the component/view belongs to:
   - **Personal**: Net worth, personal budgets, household cash flow, subscriptions.
   - **Business**: Multi-entity workspaces, invoicing (AR), vendor bills (AP), Schedule C tax write-offs, P&L, burn rate, runway.
   - **Unified / Consolidated**: Cross-entity portfolio overview with strict anti-commingling segregation.
3. **Component Inventory**: Check if an existing component or pattern already handles the task. Never duplicate primitives.
4. **Domain Verification**: Identify financial data models involved (e.g. Account balance, Ledger transaction, Recurring expense, Budget allocation, Invoices, Clients/Vendors, Tax write-offs, Owner draws/reimbursements).

### Phase 2: Execution Modes
Activate the mode matching the user's intent:
- **`Architect Mode`** → Wireframe information architecture, grid hierarchies, and responsive collapses before writing JSX.
- **`Build Mode`** → Implement production-ready React 19 / Next.js 16 components with strict token adherence and full interactive states.
- **`Theme Mode`** → Configure financial color palettes, surface layering, and dark mode tokens via Tailwind CSS v4 `@theme`.
- **`Motion Mode`** → Implement purposeful financial micro-interactions (e.g., balance updates, sheet reveals) with accessibility guards.
- **`Audit Mode`** → Review existing screens against the **10-Point Fintech Quality Rubric** with before/after fixes.


---

## 2. Fintech Domain Intelligence (uipro Rules)

Financial applications have strict usability, trust, and legibility requirements. Generic dashboard templates fail in personal finance. Apply these mandatory rules:

### A. Color Semantics for Money & Operations
Money is emotive. Colors must communicate clarity and trust without causing unwarranted alarm or visual exhaustion.

| Semantic Purpose | Light Mode Token | Dark Mode Token | Usage Rules |
| :--- | :--- | :--- | :--- |
| **Inflow / Gains / Revenue** | Emerald-600 (`#059669`) | Emerald-400 (`#34d399`) | Salary, client invoice payments, sales revenue, portfolio gains (`+$1,250.00`). Never neon green. |
| **Outflow / Expenses** | Rose-600 (`#e11d48`) | Rose-400 (`#fb7185`) | Everyday debits, business operating expenses (`-$45.20`). Must look distinct from critical system errors. |
| **Transfers / Neutral** | Slate-600 (`#475569`) | Slate-400 (`#94a3b8`) | Internal transfers between accounts, owner draws, capital contributions, non-directional flow. |
| **Budget / Payment Warning** | Amber-600 (`#d97706`) | Amber-400 (`#fbbf24`) | 80%–99% budget threshold reached, invoices due within 3 days, impending bills. |
| **System Error / Overdue** | Red-600 (`#dc2626`) | Red-400 (`#f87171`) | Failed payments, over-budget breaches (>100%), past-due client invoices. |
| **Brand Primary / Accent** | Indigo-600 (`#4f46e5`) | Indigo-400 (`#818cf8`) | Primary navigation, CTA buttons, active tab indicators, selected filters. |

#### Operational & Entity Status Badges
| Status / Tag | Background Token | Text Token | Usage Context |
| :--- | :--- | :--- | :--- |
| **Personal Entity** | Indigo-50 / `rgba(79, 70, 229, 0.1)` | Indigo-700 / Indigo-300 | Badges designating personal accounts, transactions, and budgets. |
| **Business Entity** | Sky-50 / `rgba(2, 132, 199, 0.1)` | Sky-700 / Sky-300 | Badges designating business entities, corporate cards, and commercial accounts. |
| **Tax Deductible** | Emerald-50 / `rgba(5, 150, 105, 0.1)` | Emerald-700 / Emerald-300 | Schedule C eligible business write-offs (e.g., Software, Equipment, Travel). |
| **Invoice: Draft** | Slate-100 / Slate-800 | Slate-700 / Slate-300 | Unsent draft invoices. |
| **Invoice: Sent / Pending** | Amber-50 / `rgba(217, 119, 6, 0.1)` | Amber-700 / Amber-300 | Invoices dispatched to clients, awaiting payment. |
| **Invoice: Paid** | Emerald-50 / `rgba(5, 150, 105, 0.1)` | Emerald-700 / Emerald-300 | Successfully reconciled and deposited payments. |
| **Invoice: Overdue** | Red-50 / `rgba(220, 38, 38, 0.1)` | Red-700 / Red-300 | Invoices exceeding net terms (e.g. 15+ days past due). |

### B. Numeric & Monetary Typography
1. **Always use Tabular Numerals**: Apply `font-mono` or `font-feature-settings: "tnum"` (`tabular-nums`) to all currency values, balance counts, dates, and percentage changes. Numbers in tables and ledger streams must align vertically without shifting column widths.
2. **Currency Sign Conventions**:
   - Inflows and Revenue must display an explicit `+` prefix: `+$3,450.00`.
   - Outflows and Expenses must display a standard `-` prefix or parenthetical notation: `-$42.50` or `($42.50)`.
   - Never show negative signs after the currency symbol (e.g. `-$50.00`, NEVER `$-50.00`).
3. **Decimal Hierarchy**:
   - Secondary decimals (cents) should be slightly muted or reduced in scale (`text-sm font-normal text-muted-foreground` beside a `text-2xl font-bold` integer) for clean scanning.
4. **Privacy / Obfuscation Mode**:
   - All balance displays must support an obfuscated state: `$••••••`. Support an app-wide or component-level toggle for privacy in public spaces.

### C. Information Density & Layout Hierarchy
- **Scanning Over Scrolling**: Financial users want to assess their position in seconds.
  - **Personal Mode**: Lead with Net Worth, Monthly Cash Flow, and Savings Rate, followed by budget meters and recent transactions.
  - **Business Mode**: Lead with Gross Revenue, Net Income (P&L), Cash Runway (months), and Outstanding AR, followed by aging invoices and categorized expenses.
  - **Anti-Commingling Guards**: Clearly display the active entity workspace and tag any cross-entity transactions (e.g., "Paid with Personal Card • Reimbursement Pending").
- **Card Depth & Hairline Borders**:
  - Never use heavy solid borders (`#ccc`).
  - Use subtle translucent hairline borders: `border border-black/[0.08] dark:border-white/[0.08]`.
  - Layered elevation: Pair a tight grounding shadow with a soft ambient blur.
- **Three-Tier Surface Layering**:
  - `bg-base` (canvas background): `#f8fafc` / `#090d16`
  - `bg-surface` (cards, containers): `#ffffff` / `#111827`
  - `bg-raised` (hovered cards, dropdowns, modal sheets): `#f1f5f9` / `#1e293b`

---

## 3. Tailwind CSS v4 Design Token Foundation

Chipr uses **Tailwind CSS v4** with CSS custom properties configured in `app/globals.css`.

### Global CSS Custom Properties (`app/globals.css`)
```css
@import "tailwindcss";

:root {
  /* Surface Layers */
  --bg-canvas: #f8fafc;
  --bg-surface: #ffffff;
  --bg-raised: #f1f5f9;
  --bg-overlay: rgba(15, 23, 42, 0.04);

  /* Typography Colors */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --text-inverse: #ffffff;

  /* Financial Semantics */
  --money-inflow: #059669;
  --money-inflow-subtle: #ecfdf5;
  --money-outflow: #e11d48;
  --money-outflow-subtle: #fff1f2;
  --money-warning: #d97706;
  --money-warning-subtle: #fffbeb;
  --money-neutral: #64748b;

  /* Brand */
  --brand-primary: #4f46e5;
  --brand-hover: #4338ca;
  --brand-subtle: #eef2ff;

  /* Borders & Dividers */
  --border-subtle: rgba(15, 23, 42, 0.08);
  --border-strong: rgba(15, 23, 42, 0.16);
  --border-focus: #4f46e5;

  /* Shadows */
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03);
  --shadow-elevated: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 24px rgba(0, 0, 0, 0.06);
}

.dark {
  /* Surface Layers */
  --bg-canvas: #090d16;
  --bg-surface: #111827;
  --bg-raised: #1f293d;
  --bg-overlay: rgba(255, 255, 255, 0.04);

  /* Typography Colors */
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  --text-inverse: #090d16;

  /* Financial Semantics */
  --money-inflow: #34d399;
  --money-inflow-subtle: rgba(5, 150, 105, 0.15);
  --money-outflow: #fb7185;
  --money-outflow-subtle: rgba(225, 29, 72, 0.15);
  --money-warning: #fbbf24;
  --money-warning-subtle: rgba(217, 119, 6, 0.15);
  --money-neutral: #94a3b8;

  /* Brand */
  --brand-primary: #818cf8;
  --brand-hover: #a5b4fc;
  --brand-subtle: rgba(79, 70, 229, 0.15);

  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);
  --border-focus: #818cf8;

  /* Shadows */
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.35);
  --shadow-elevated: 0 4px 6px rgba(0, 0, 0, 0.6), 0 10px 24px rgba(0, 0, 0, 0.45);
}

@theme inline {
  --color-canvas: var(--bg-canvas);
  --color-surface: var(--bg-surface);
  --color-raised: var(--bg-raised);
  --color-overlay: var(--bg-overlay);

  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);

  --color-inflow: var(--money-inflow);
  --color-inflow-subtle: var(--money-inflow-subtle);
  --color-outflow: var(--money-outflow);
  --color-outflow-subtle: var(--money-outflow-subtle);
  --color-warning: var(--money-warning);
  --color-warning-subtle: var(--money-warning-subtle);

  --color-brand: var(--brand-primary);
  --color-brand-hover: var(--brand-hover);
  --color-brand-subtle: var(--brand-subtle);

  --color-border-subtle: var(--border-subtle);
  --color-border-strong: var(--border-strong);
}
```

---

## 4. Execution Modes Detail

### Mode 1: Architect Mode
Triggered by: `"layout"`, `"plan"`, `"dashboard"`, `"screen"`, `"wireframe"`, `"flow"`
1. **Define Information Hierarchy**:
   - Level 1: Net Worth & Period Cashflow Summary (Hero KPI Cards).
   - Level 2: Real-time Analytics & Spending Categories (Visual Breakdown / Charts).
   - Level 3: Transaction Stream with quick filters (Search, Category, Account, Date).
2. **Layout Primitives**:
   - `Desktop`: Fixed or collapsible sidebar nav + main content container (`max-w-7xl mx-auto px-6 py-8`).
   - `Tablet / Mobile`: Top app bar with profile avatar + bottom sticky tab bar (`sm` collapse).
3. **Draft Plan**: Output an annotated layout structure and seek confirmation before generating components.

### Mode 2: Build Mode
Triggered by: `"build"`, `"create"`, `"add"`, `"component"`, `"page"`
1. Component contracts must include:
   - TypeScript `interface <ComponentName>Props` with full property documentation.
   - Optional `className?: string` for composition.
   - Client Component directive (`"use client"`) only when hooks (`useState`, `useMemo`) or browser events are required.
2. Run the **10-Point Self-Review Rubric** before delivery.

### Mode 3: Theme Mode
Triggered by: `"theme"`, `"dark mode"`, `"palette"`, `"tokens"`, `"fintech aesthetic"`
1. Ensure all theme variables exist in both `:root` and `.dark`.
2. Verify contrast ratios on currency figures (WCAG AA: minimum 4.5:1 against card backgrounds).

### Mode 4: Motion Mode
Triggered by: `"animate"`, `"transition"`, `"fluid"`, `"micro-interaction"`
1. Durations:
   - Micro (button press, checkbox, tag select): `100ms - 150ms`.
   - UI Expansion (dropdowns, accordions, tabs): `200ms - 300ms`.
   - Page / Modal (drawer reveal, view switch): `350ms - 450ms`.
2. Must wrap in `motion-safe:` or `@media (prefers-reduced-motion: reduce)`.

### Mode 5: Audit Mode
Triggered by: `"audit"`, `"review"`, `"improve"`, `"polish"`, `"check quality"`
1. Score the target screen or component against the 10 categories (Score / 10).
2. Produce actionable before/after code diffs for any failing items.

---

## 5. The 10-Point Fintech Quality Rubric

Run this checklist silently before delivering any component or screen:

| # | Check Item | Criterion | Exemption |
| :- | :--- | :--- | :--- |
| **1** | **Tokens Only** | No hardcoded hex (`#ffffff`) or arbitrary Tailwind (`w-[342px]`). All colors, spacing, radius, and shadows reference semantic tokens. | None |
| **2** | **4 Interactive States** | Every clickable/interactive element specifies `hover`, `active` (pressed), `focus-visible` (keyboard ring), and `disabled` states. | Static text/badges |
| **3** | **Tabular Numerals** | All currency, percentage, and balance figures apply `tabular-nums` (`font-mono` or `font-feature-settings: "tnum"`). | Non-numeric text |
| **4** | **Financial Semantics** | Inflows/gains are emerald; outflows/expenses are rose; transfers/neutral are slate. Error red is NOT confused with expense rose. | Neutral metrics |
| **5** | **Skeleton Loader** | Data-dependent widgets include an `animate-pulse` skeleton state with layout geometry matching real data. | Pure primitive icons |
| **6** | **Empty State** | Handles zero-data states (e.g. 0 transactions, no connected accounts) with clear icon, explanation, and primary CTA. | Root wrappers |
| **7** | **WCAG AA Contrast** | Minimum 4.5:1 for body copy and currency figures; 3:1 for large display headers (18pt+). | Disabled controls |
| **8** | **Privacy Masking** | Balance displays support obfuscation (`$••••••`) for discreet viewing. | Non-sensitive labels |
| **9** | **Mobile Responsiveness** | Explicit breakpoints at `sm` (375px+), `md` (768px+), `lg` (1024px+). Tables collapse to cards on mobile. | Mobile-only sheets |
| **10** | **Reduced Motion Guard** | Every transition or keyframe animation respects `prefers-reduced-motion`. | Instant state changes |

---

## 6. Production-Ready Fintech Component Recipes

### Recipe 1: Standard Monetary Amount Display (`MoneyAmount.tsx`)
```tsx
import React from "react";

interface MoneyAmountProps {
  amount: number; // In base currency units (e.g. 1250.50)
  currency?: string; // Default: 'USD'
  showSign?: boolean; // Force '+' for positive
  colored?: boolean; // Apply green for inflow, rose for outflow
  privacyMask?: boolean; // Obfuscate as $••••••
  size?: "sm" | "md" | "lg" | "xl";
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
      <span className={`font-mono font-medium select-none tracking-wider text-text-secondary ${className}`}>
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
    sm: "text-sm",
    md: "text-base font-semibold",
    lg: "text-xl font-bold",
    xl: "text-3xl font-extrabold tracking-tight",
  };

  const sign = isPositive && showSign ? "+" : isNegative ? "-" : "";

  return (
    <span
      className={`inline-flex items-baseline font-mono tabular-nums ${sizeClasses[size]} ${colorClass} ${className}`}
    >
      <span>{sign}</span>
      <span>{formatted}</span>
    </span>
  );
}
```

### Recipe 2: Financial KPI Summary Card (`KPICard.tsx`)
```tsx
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
}: KPICardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-raised" />
          <div className="h-8 w-8 animate-pulse rounded-lg bg-raised" />
        </div>
        <div className="mt-4 h-8 w-36 animate-pulse rounded bg-raised" />
        <div className="mt-2 h-3.5 w-20 animate-pulse rounded bg-raised" />
      </div>
    );
  }

  const isUp = (changePercentage ?? 0) >= 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">{title}</span>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-raised text-text-secondary">
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

      {changePercentage !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono ${
              isUp
                ? "bg-inflow-subtle text-inflow"
                : "bg-outflow-subtle text-outflow"
            }`}
          >
            {isUp ? "↑" : "↓"} {Math.abs(changePercentage).toFixed(1)}%
          </span>
          <span className="text-text-muted">{periodLabel}</span>
        </div>
      )}
    </div>
  );
}
```

### Recipe 3: Transaction Ledger Item (`TransactionRow.tsx`)
```tsx
import React from "react";
import { MoneyAmount } from "./MoneyAmount";

interface TransactionRowProps {
  id: string;
  merchant: string;
  category: string;
  date: string;
  amount: number; // Negative for expense, positive for income/revenue
  entity?: "personal" | "business";
  isTaxDeductible?: boolean;
  reimbursementStatus?: "none" | "pending" | "reimbursed";
  icon?: React.ReactNode;
  accountName?: string;
  privacyMask?: boolean;
  onClick?: () => void;
}

export function TransactionRow({
  merchant,
  category,
  date,
  amount,
  entity = "personal",
  isTaxDeductible = false,
  reimbursementStatus = "none",
  icon,
  accountName,
  privacyMask = false,
  onClick,
}: TransactionRowProps) {
  return (
    <div
      onClick={onClick}
      className={`group flex items-center justify-between rounded-xl px-4 py-3.5 transition-colors duration-150 ${
        onClick
          ? "cursor-pointer hover:bg-raised active:bg-raised/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          : ""
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-raised text-text-secondary transition-transform duration-150 group-hover:scale-105">
          {icon || <span className="text-sm font-semibold">{merchant[0]}</span>}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-text-primary">
              {merchant}
            </p>
            {entity === "business" && (
              <span className="inline-flex items-center rounded-md bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                Biz
              </span>
            )}
            {isTaxDeductible && (
              <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                Deductible
              </span>
            )}
            {reimbursementStatus === "pending" && (
              <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                Reimburse
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="truncate">{category}</span>
            {accountName && (
              <>
                <span>•</span>
                <span className="truncate">{accountName}</span>
              </>
            )}
            <span>•</span>
            <span className="shrink-0 font-mono">{date}</span>
          </div>
        </div>
      </div>

      <div className="ml-4 shrink-0 text-right">
        <MoneyAmount
          amount={amount}
          showSign
          colored
          privacyMask={privacyMask}
          size="md"
        />
      </div>
    </div>
  );
}
```

### Recipe 4: Budget Category Progress Meter (`BudgetMeter.tsx`)
```tsx
import React from "react";
import { MoneyAmount } from "./MoneyAmount";

interface BudgetMeterProps {
  category: string;
  spent: number;
  budget: number;
  currency?: string;
}

export function BudgetMeter({
  category,
  spent,
  budget,
  currency = "USD",
}: BudgetMeterProps) {
  const percentage = Math.min(Math.round((spent / budget) * 100), 100);
  const isOverBudget = spent > budget;
  const isWarning = percentage >= 80 && !isOverBudget;

  let progressColor = "bg-inflow";
  if (isOverBudget) progressColor = "bg-outflow";
  else if (isWarning) progressColor = "bg-warning";

  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-text-primary">{category}</span>
        <div className="flex items-baseline gap-1 text-xs text-text-muted">
          <MoneyAmount amount={spent} currency={currency} size="sm" />
          <span>of</span>
          <MoneyAmount amount={budget} currency={currency} size="sm" />
        </div>
      </div>

      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-raised">
        <div
          className={`h-full transition-all duration-500 ease-out ${progressColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="font-mono text-text-muted">{percentage}% spent</span>
        {isOverBudget && (
          <span className="font-semibold text-outflow">
            Over by {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(spent - budget)}
          </span>
        )}
      </div>
    </div>
  );
}
```

### Recipe 5: Zero-Data Financial Empty State (`EmptyState.tsx`)
```tsx
import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-surface/50 py-12 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle bg-raised text-text-secondary shadow-sm mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-text-muted leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
```

### Recipe 6: Entity Workspace Badge (`EntityBadge.tsx`)
```tsx
import React from "react";

interface EntityBadgeProps {
  type: "personal" | "business";
  label?: string;
}

export function EntityBadge({ type, label }: EntityBadgeProps) {
  const isPersonal = type === "personal";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${
        isPersonal
          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
          : "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isPersonal ? "bg-indigo-600 dark:bg-indigo-400" : "bg-sky-600 dark:bg-sky-400"
        }`}
      />
      {label || (isPersonal ? "Personal" : "Business")}
    </span>
  );
}
```

### Recipe 7: Invoice Status Badge (`InvoiceStatusBadge.tsx`)
```tsx
import React from "react";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

const statusConfig: Record<InvoiceStatus, { label: string; bg: string; text: string }> = {
  draft: { label: "Draft", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300" },
  sent: { label: "Sent / Pending", bg: "bg-amber-50 dark:bg-amber-950/50", text: "text-amber-700 dark:text-amber-300" },
  paid: { label: "Paid", bg: "bg-emerald-50 dark:bg-emerald-950/50", text: "text-emerald-700 dark:text-emerald-300" },
  overdue: { label: "Overdue", bg: "bg-red-50 dark:bg-red-950/50", text: "text-red-700 dark:text-red-300" },
  cancelled: { label: "Cancelled", bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-600 dark:text-zinc-400" },
};

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
```

### Recipe 8: Business P&L Summary Card (`PnLSummaryCard.tsx`)
```tsx
import React from "react";
import { MoneyAmount } from "./MoneyAmount";

interface PnLSummaryCardProps {
  grossRevenue: number;
  cogs: number;
  operatingExpenses: number;
  currency?: string;
  privacyMask?: boolean;
}

export function PnLSummaryCard({
  grossRevenue,
  cogs,
  operatingExpenses,
  currency = "USD",
  privacyMask = false,
}: PnLSummaryCardProps) {
  const grossProfit = grossRevenue - cogs;
  const netOperatingIncome = grossProfit - operatingExpenses;
  const netMargin = grossRevenue > 0 ? (netOperatingIncome / grossRevenue) * 100 : 0;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Profit & Loss Summary</h3>
          <p className="text-xs text-text-muted">Current billing period</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold ${
            netMargin >= 0
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          Margin: {netMargin.toFixed(1)}%
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Gross Revenue</span>
          <MoneyAmount amount={grossRevenue} currency={currency} privacyMask={privacyMask} size="sm" colored showSign />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Cost of Goods Sold (COGS)</span>
          <MoneyAmount amount={-cogs} currency={currency} privacyMask={privacyMask} size="sm" colored />
        </div>
        <div className="flex items-center justify-between border-t border-border-subtle pt-2 text-sm font-semibold">
          <span className="text-text-primary">Gross Profit</span>
          <MoneyAmount amount={grossProfit} currency={currency} privacyMask={privacyMask} size="sm" colored />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Operating Expenses (OpEx)</span>
          <MoneyAmount amount={-operatingExpenses} currency={currency} privacyMask={privacyMask} size="sm" colored />
        </div>
        <div className="flex items-center justify-between border-t border-border-strong pt-3">
          <span className="text-base font-bold text-text-primary">Net Operating Income</span>
          <MoneyAmount amount={netOperatingIncome} currency={currency} privacyMask={privacyMask} size="lg" colored showSign />
        </div>
      </div>
    </div>
  );
}
```

---

## 7. What NOT To Do (Guardrails for Chipr)

- **NEVER commingle personal and business transactions without explicit tracking.** Personal card transactions used for business purposes must be tracked with a reimbursement status, and business disbursements to personal accounts must be tagged as Owner's Draws.
- **NEVER classify personal expenses as tax deductible.** Only verified business-entity transactions qualify under Schedule C categories.
- **NEVER use generic alarm red for normal expenses.** Outflows (`-$34.00` groceries or SaaS bills) are normal financial occurrences; use the dedicated `--money-outflow` (rose) token rather than high-alert error red.
- **NEVER render variable-width numbers in balance columns.** Always enforce `tabular-nums` or `font-mono`.
- **NEVER use arbitrary hardcoded Tailwind pixels** (e.g. `w-[327px]`, `bg-[#131722]`). Bind strictly to design tokens.
- **NEVER show bare unformatted floats** (e.g., `$1245.3` or `$12.1000004`). Every amount must pass through standardized currency formatting with two decimal places.
- **NEVER omit empty or skeleton loading states.** Financial networks and banking syncs have latency; empty states and geometric skeletons are mandatory.
- **NEVER ignore prefers-reduced-motion.** Never implement infinite ticker animations or jarring screen shakes.

