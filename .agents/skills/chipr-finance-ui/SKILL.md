---
name: chipr-finance-ui
description: >-
  Industry-standard UI/UX design and frontend engineering skill for Chipr, a modern personal and business financial tracking web application.
  Synthesizes the systemic token-driven architecture of @lhi/ui-skill with the domain-specific fintech design intelligence
  of uipro (UI/UX Pro Max). Activates when planning layouts, scaffolding personal and business financial dashboards, building transaction tables,
  styling monetary amounts, managing invoices, rendering P&L and burn rate reports, tagging tax write-offs, formatting currencies, or auditing visual hierarchy and accessibility.
---

# Chipr Finance UI Engine

See the root workspace specification: [SKILLS.md](../../../SKILLS.md)

This skill provides:
1. **Context Load & Stack Detection**: Automated adherence to Next.js 16 (React 19) and Tailwind CSS v4 design tokens.
2. **Fintech Domain Intelligence (uipro rules)**:
   - Personal & business entity switching and anti-commingling markers.
   - Tabular currency alignment (`tabular-nums`), privacy masking (`$••••••`), monetary color semantics (emerald inflow, rose outflow, distinct error red), and density hierarchy.
   - Invoicing states (`Draft`, `Sent`, `Paid`, `Overdue`) and Schedule C tax deduction tags.
   - Business metrics (P&L, Gross Margin, Burn Rate, Runway) and Personal metrics (Net Worth, Budget Envelopes, Savings Rate).
3. **Systemic Design Engine (@lhi/ui-skill rules)**: Phased execution modes (Architect, Build, Theme, Motion, Audit), token-only styling, and the 10-point self-review quality rubric.
4. **Production Component Recipes**: Ready-to-use patterns for `MoneyAmount`, `KPICard`, `TransactionRow`, `BudgetMeter`, `EmptyState`, `EntityBadge`, and `InvoiceStatusBadge`.
