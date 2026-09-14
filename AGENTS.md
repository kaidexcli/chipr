<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Chipr — Personal & Business Financial Tracking Web Application
## AI Agent Guidelines & Project Context

Welcome to **Chipr**, a modern, high-performance web application designed for comprehensive **personal and business financial tracking**. Chipr bridges the gap between individual wealth management and small business/freelance financial operations, providing unified financial visibility while strictly preserving accounting boundaries.

---

### 1. Product Overview & Domain Scope

Chipr serves a dual-mode financial tracking mission:
1. **Personal Finance Tracking**: Helping individuals and households track net worth, budget envelopes, cash flows, recurring subscriptions, and personal accounts.
2. **Business Finance & Operations**: Helping freelancers, sole proprietors, contractors, and small business owners manage invoicing, accounts receivable/payable, tax write-offs/deductions, profit & loss (P&L), burn rate, runway, and client/vendor relationships.
3. **Entity Segregation & Anti-Commingling**: Preventing the accidental mixing of personal and business funds, offering explicit tracking for Owner's Draws, Capital Contributions, and Cross-Entity Reimbursements (e.g., paying for business software using a personal card).

---

### 2. Core Domain Models & Features

#### A. Personal Finance Domain
- **Account Aggregation**: Checking, High-Yield Savings, Credit Cards, Investments (Brokerage, 401k, IRA, Crypto), Mortgages, and Personal Loans.
- **Net Worth Tracking**: Real-time calculation of Assets minus Liabilities with historical progress charts.
- **Budgeting & Envelopes**: Flexible category budgeting (e.g., Housing, Groceries, Discretionary), rollover support, and 80% warning / 100% breach notifications.
- **Cash Flow Analysis**: Monthly inflows (salary, dividends, gifts) vs. outflows, savings rate percentages, and cash runway.
- **Recurring Subscriptions**: Cadence tracking, upcoming renewal alerts, and cancellation audit recommendations.

#### B. Business Finance Domain
- **Multi-Entity Workspaces**: Support for distinct business entities (Sole Proprietorship, LLC, S-Corp, side-ventures) within one account.
- **Invoicing & Accounts Receivable (AR)**:
  - Client profiles and payment terms (Net 15, Net 30, Due on Receipt).
  - Invoice lifecycle states: `Draft`, `Sent`, `Viewed`, `Partially Paid`, `Paid`, `Overdue`, `Cancelled`.
  - Automated late fee calculations and payment reconciliation.
- **Accounts Payable (AP) & Vendor Bills**:
  - Vendor records, payment due dates, recurring business services (SaaS, cloud infrastructure, office rent).
- **Tax Deductions & Categorization**:
  - Tax schedule classifications (IRS Schedule C / Form 1065 / 1120-S expense categories: Advertising, Car & Truck/Mileage, Contract Labor, Legal/Professional, Travel, Meals 50%, Software).
  - Deductible percentage tagging (0%–100%) and receipt capture status.
  - 1099 contractor expense tracking for year-end reporting.
- **Business Financial Statements & Metrics**:
  - **P&L (Profit & Loss / Income Statement)**: Gross Revenue, Cost of Goods Sold (COGS), Gross Margin, Operating Expenses (OpEx), Net Operating Income.
  - **Cash Runway & Burn Rate**: Monthly net cash burn and months of runway based on liquid business reserves.
- **Owner's Equity & Reimbursement Workflows**:
  - Owner's Draws (distributions) and Capital Contributions.
  - Cross-entity reimbursement tracker for expenses mistakenly or conveniently paid with personal funds.

#### C. Workspace & Context Switching
- **Personal View**: Tailored for household finances, savings goals, and lifestyle budgeting.
- **Business View**: Tailored for cash flow forecasting, client billing, tax preparation, and operational burn.
- **Consolidated / Portfolio View**: Executive overview showing total liquidity across all personal and corporate entities without violating accounting segregation.

---

### 3. Tech Stack & Engineering Architecture

- **Framework**: Next.js 16 (App Router, Server Components by default, React 19).
  - Read relevant guides in `node_modules/next/dist/docs/` for any new APIs or breaking changes.
  - Use Client Components (`"use client"`) only when local state, browser APIs, or interactivity are strictly required.
- **Styling**: Tailwind CSS v4 using inline `@theme` configuration and CSS custom properties in `app/globals.css`.
- **Language**: TypeScript 5 with strict mode enabled.
- **Typography**: Geist Sans for clean UI text, Geist Mono with tabular figures (`tabular-nums`) for all monetary amounts, dates, and financial metrics.
- **Icons & Assets**: Modern, lightweight SVG iconography (Lucide-style conventions) with consistent stroke widths.

---

### 4. Fintech UI/UX & Design System Principles

When designing or writing UI components for Chipr, follow the **Chipr Finance UI Engine** specification (see [SKILLS.md](file:///C:/Users/kai/Desktop/chipr/SKILLS.md)):

1. **Tabular Numerals Everywhere**:
   - All currency values, percentages, invoice numbers, and dates must use `tabular-nums` (`font-mono`) to prevent visual jitter and column misalignment.
2. **Semantic Color Hierarchy**:
   - **Inflow / Gains / Revenue**: Emerald-600 (Light) / Emerald-400 (Dark) (`--money-inflow`).
   - **Outflow / Everyday Expenses**: Rose-600 (Light) / Rose-400 (Dark) (`--money-outflow`). *Never use high-alert error red for routine expenses.*
   - **System Errors / Critical Alerts**: Red-600 / Red-400.
   - **Transfers / Neutral Flows**: Slate-600 / Slate-400 (`--money-neutral`).
   - **Warnings / Approaching Thresholds**: Amber-600 / Amber-400 (`--money-warning`).
   - **Brand Accent**: Indigo-600 / Indigo-400 (`--brand-primary`).
3. **Invoice & Entity Status Semantics**:
   - **Invoice Status**: Draft (`slate`), Sent/Pending (`amber`), Paid (`emerald`), Overdue (`red`).
   - **Entity Badges**: Personal (`violet`/`indigo`), Business (`sky`/`blue`).
   - **Tax Deductible Badge**: Subtle emerald/teal tag indicating tax write-off eligibility.
4. **Privacy & Masking**:
   - All balance displays must support privacy masking mode (`$••••••`) for discreet viewing in public or shared spaces.
5. **Quality & Resilience Standards**:
   - Complete interactive states (`hover`, `active`, `focus-visible`, `disabled`).
   - Skeleton loaders (`animate-pulse`) for all asynchronous widgets.
   - Meaningful empty states with actionable call-to-actions (CTAs).
   - Strict adherence to WCAG AA contrast ratios and `prefers-reduced-motion`.

---

### 5. AI Agent Rules of Engagement

- **Always Clarify Entity Context**: When creating or modifying data models, UI components, or routes, specify whether the feature operates within Personal, Business, or Unified scope.
- **Token-Only Styling**: Do not introduce hardcoded hex colors (`#ffffff`, `#000000`) or arbitrary Tailwind sizes (`w-[312px]`). Reference design tokens from `app/globals.css`.
- **Currency & Precision Handling**: Store all financial amounts in integer cents (or high-precision decimals for multi-currency) to prevent floating-point rounding errors. Format with `Intl.NumberFormat` on display.
- **Security & Confidentiality**: Financial data is sensitive. Never log plain-text account credentials, full account numbers, or Personally Identifiable Information (PII).
- **Document Integrity**: Preserve existing configurations, agent blocks, and comments unless explicitly instructed to modify them.

