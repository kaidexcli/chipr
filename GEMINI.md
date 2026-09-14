# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Chipr — Gemini Project Context

## Project Overview

Chipr is a web application for **personal and business financial tracking**, built with Next.js 16 (App Router), React 19, TypeScript 5, and Tailwind CSS v4.

The application bridges personal wealth management (budgeting, net worth, cash flow) and small business/freelance financial tracking (invoicing, accounts receivable/payable, tax categorization & deductions, P&L, burn rate, runway, and entity segregation).

## Key Files & Context

- [`AGENTS.md`](./AGENTS.md): Master AI Agent instructions, domain scope, and architectural conventions.
- [`SKILLS.md`](./SKILLS.md): Master specification for the Chipr Finance UI Engine, design tokens, component recipes, and the 10-point fintech quality rubric.
- [`.agents/skills/chipr-finance-ui/SKILL.md`](./.agents/skills/chipr-finance-ui/SKILL.md): Local skill definition for UI/UX engineering in Chipr.
- [`README.md`](./README.md): Project overview, feature breakdown, setup instructions, and roadmap.

## Domain Structure

1. **Personal Finance**:
   - Accounts (Checking, Savings, Credit Cards, Investments, Loans)
   - Net Worth calculation (Assets - Liabilities)
   - Envelope Budgeting & Spending Limits (with 80% warning / 100% breach alerts)
   - Monthly Cash Flow & Savings Rate
   - Subscriptions & Recurring Bills
   - Privacy balance masking (`$••••••`)

2. **Business Finance & Operations**:
   - Multi-Entity Workspaces (Sole Proprietorship, LLC, S-Corp, side-hustles)
   - Invoicing & Accounts Receivable (AR) with lifecycle states (`Draft`, `Sent`, `Paid`, `Overdue`)
   - Accounts Payable (AP) & Vendor Expense Tracking
   - Tax Deductions & IRS Schedule C expense categorization (Advertising, Mileage, Contractors, Meals 50%, Software, etc.)
   - P&L (Income Statement), Monthly Burn Rate, and Cash Runway
   - Owner's Draws, Capital Contributions, and Personal-to-Business Reimbursement tracking

3. **Unified View & Anti-Commingling**:
   - Clean entity isolation to avoid commingling funds while providing a consolidated portfolio view of total liquidity.

## Styling & Design Tokens

- Framework: Tailwind CSS v4 with inline `@theme` tokens in `app/globals.css`.
- Typography: Geist Sans & Geist Mono. Tabular figures (`tabular-nums` / `font-mono`) are mandatory for all currency, percentages, and dates.
- Monetary Colors:
  - Inflow / Revenue: Emerald (`--money-inflow`)
  - Outflow / Expenses: Rose (`--money-outflow`)
  - Warning / Approaching Limit: Amber (`--money-warning`)
  - Critical / Overdue: Red
  - Neutral / Transfers: Slate (`--money-neutral`)
  - Entity Badges: Personal (violet), Business (sky)
  - Invoice Status: Draft (slate), Sent (amber), Paid (emerald), Overdue (red)
