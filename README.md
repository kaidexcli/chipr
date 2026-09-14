# Chipr 🪙

**Personal & Business Financial Tracking Web Application**

Chipr is a modern, high-performance financial tracking web application built with **Next.js 16**, **React 19**, **TypeScript**, and **Tailwind CSS v4**. It bridges the divide between individual wealth management and small business/freelance operations—providing unified financial visibility while strictly preserving entity and accounting boundaries.

---

## 🌟 Why Chipr?

Most financial tools force a false choice: consumer budgeting apps (which lack invoicing, tax deductions, and entity isolation) or complex corporate ERP/accounting software (which are bloated, expensive, and disconnect personal wealth from business cash flows).

Freelancers, independent contractors, creators, and small business owners frequently navigate both worlds. **Chipr solves this by delivering dual-mode financial tracking in one cohesive workspace:**

- **Strict Entity Segregation**: Prevent commingling of personal and business funds.
- **Unified Net Worth & Liquidity**: View your holistic financial health without mixing tax liabilities.
- **Reimbursement & Draw Workflows**: Effortlessly track Owner's Draws, Capital Contributions, and personal cards used for business expenses.

---

## 🚀 Key Features

### 👤 Personal Finance Hub
- **Net Worth Tracking**: Real-time aggregation of Assets (checking, high-yield savings, brokerage, retirement accounts, crypto, property) minus Liabilities (credit cards, loans, mortgages).
- **Envelope Budgeting & Limits**: Set monthly category allocations with dynamic warning thresholds (80% warning, 100% breach notifications).
- **Cash Flow Analytics**: Visual breakdowns of monthly inflows, lifestyle burn, and savings rates over time.
- **Subscription Management**: Track recurring subscriptions, renewal dates, and flag redundant recurring expenses.
- **Privacy Mode**: Discreet `$••••••` balance masking for public and shared environments.

### 🏢 Business Finance & Operations Hub
- **Multi-Entity Workspaces**: Manage distinct entities (Sole Proprietorship, LLC, S-Corp, consulting agency, side ventures) from a single account.
- **Invoicing & Accounts Receivable (AR)**:
  - Generate professional client invoices with configurable payment terms (Due on Receipt, Net 15, Net 30).
  - Full lifecycle tracking: `Draft`, `Sent`, `Viewed`, `Partially Paid`, `Paid`, `Overdue`, `Cancelled`.
  - Aging receivables and overdue payment alerts.
- **Accounts Payable (AP) & Vendor Bills**:
  - Track vendor obligations, recurring SaaS subscriptions, contractor costs, and upcoming payment deadlines.
- **Tax Deductions & Schedule C Categorization**:
  - Classify expenses into IRS Schedule C / corporate tax write-off categories (Advertising, Office Supplies, Car & Mileage, Contractor Labor, Legal & Professional, Travel, 50% Meals).
  - Deductible percentage tagging (0%–100%) and receipt capture status.
  - 1099 contractor payment tracking for year-end compliance.
- **Financial Statements & Health Metrics**:
  - **P&L (Profit & Loss / Income Statement)**: Real-time calculation of Gross Revenue, Cost of Goods Sold (COGS), Gross Profit, Operating Expenses (OpEx), and Net Operating Income.
  - **Cash Runway & Burn Rate**: Monitor monthly net cash burn and calculate runway in months based on liquid reserves.
- **Owner's Equity & Reimbursement Tracking**:
  - Track Owner's Draws and Equity Contributions with audit clarity.
  - Flag business expenses paid with personal funds for seamless reimbursement.

---

## 🎨 Fintech Design System & UI Standards

Chipr adheres to the **Chipr Finance UI Engine** specification (see [`SKILLS.md`](./SKILLS.md)), combining strict design tokens with fintech usability intelligence:

- **Tabular Numerals Everywhere**: All monetary figures, percentages, dates, and invoice codes use `tabular-nums` (`font-mono`) to guarantee precise vertical alignment.
- **Semantic Financial Color Palette**:
  - **Inflows / Revenue / Gains**: Emerald (`text-emerald-600` / `dark:text-emerald-400`).
  - **Outflows / Normal Expenses**: Rose (`text-rose-600` / `dark:text-rose-400`). *Never uses alarm red for routine expenses.*
  - **Warnings / Approaching Limits**: Amber (`text-amber-600` / `dark:text-amber-400`).
  - **System Errors / Overdue Invoices**: Red (`text-red-600` / `dark:text-red-400`).
  - **Transfers / Neutral Balances**: Slate (`text-slate-600` / `dark:text-slate-400`).
- **Resilient UI States**: Every component implements four interactive states (`hover`, `active`, `focus-visible`, `disabled`), skeleton loaders (`animate-pulse`), and contextual empty states.
- **Accessibility**: Built to comply with WCAG AA contrast standards and `prefers-reduced-motion` preferences.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Components) |
| **Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) (Inline `@theme` tokens) |
| **Typography** | Geist Sans & Geist Mono (Vercel) |
| **Code Quality** | ESLint 9 |

---

## 📁 Project Structure

```text
chipr/
├── .agents/
│   └── skills/
│       └── chipr-finance-ui/   # UI/UX engineering skill for agents
├── app/
│   ├── favicon.ico
│   ├── globals.css             # Tailwind CSS v4 setup & financial theme tokens
│   ├── layout.tsx              # Root layout with Geist font variables
│   └── page.tsx                # App landing / entry dashboard
├── public/                     # Static media & SVG assets
├── AGENTS.md                   # AI Agent operating guidelines & domain context
├── CLAUDE.md                   # Claude Code integration context
├── GEMINI.md                   # Gemini / Antigravity agent context
├── SKILLS.md                   # Master UI/UX and domain skill specification
├── next.config.ts              # Next.js configuration
├── package.json                # Project dependencies and npm scripts
└── tsconfig.json               # TypeScript compiler options
```

---

## 🏁 Getting Started

### Prerequisites
- **Node.js**: v20.x or later
- **Package Manager**: `npm`, `pnpm`, or `yarn`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kaidexcli/chipr.git
   cd chipr
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` — Starts the Next.js development server with hot-reloading.
- `npm run build` — Builds the application for production deployment.
- `npm run start` — Starts the production Next.js server after building.
- `npm run lint` — Runs ESLint across the project to enforce code standards.

---

## 🛣️ Roadmap

- [x] Next.js 16 & Tailwind CSS v4 foundation
- [x] Personal & Business financial domain context and design tokens
- [ ] Multi-entity workspace switcher (Personal / Business / Consolidated)
- [ ] Interactive KPI dashboards (Net Worth, Cash Flow, P&L, Runway)
- [ ] Invoicing builder with PDF generation & status lifecycle
- [ ] Tax classification engine with Schedule C categorization
- [ ] Bank sync integration & CSV/OFX statement importer
- [ ] Receipt OCR scanning and attachment storage

---

## 📄 License

Private repository — All rights reserved.
