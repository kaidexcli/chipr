"use client";

import React from "react";
import { FinanceProvider, useFinance } from "@/context/FinanceContext";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardView } from "@/components/views/DashboardView";
import { TransactionsView } from "@/components/views/TransactionsView";
import { BudgetsView } from "@/components/views/BudgetsView";
import { InvoicesView } from "@/components/views/InvoicesView";
import { ReportsView } from "@/components/views/ReportsView";
import { ProfileView } from "@/components/views/ProfileView";
import { ChatView } from "@/components/views/ChatView";
import { AddCreditModal } from "@/components/modals/AddCreditModal";
import { BrandLoadingScreen } from "@/components/ui/BrandLoadingScreen";
import { LoginScreen } from "@/components/auth/LoginScreen";
import {
  DashboardIcon,
  TransactionIcon,
  BudgetIcon,
  InvoiceIcon,
  PnLIcon,
  UserIcon,
  XMarkIcon,
  SparklesIcon,
} from "@/components/ui/Icons";

function MainContent() {
  const { activeTab, setActiveTab, transactions, invoices } = useFinance();

  const pendingReimbursementsCount = transactions.filter(
    (t) => t.reimbursementStatus === "pending"
  ).length;

  const overdueInvoicesCount = invoices.filter(
    (i) => i.status === "overdue"
  ).length;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-canvas text-text-primary transition-colors duration-200">
      {/* Top Application Header */}
      <Header />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Dynamic View Area */}
        <main className="flex-1 overflow-x-hidden p-3.5 sm:p-5 max-w-6xl mx-auto w-full pb-6">
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "transactions" && <TransactionsView />}
          {activeTab === "invoices" && <InvoicesView />}
          {activeTab === "budgets" && <BudgetsView />}
          {activeTab === "reports" && <ReportsView />}
          {activeTab === "chat" && <ChatView />}
          {activeTab === "profile" && <ProfileView />}
        </main>
      </div>

      {/* Mobile Sticky Bottom Tab Bar */}
      <nav className="md:hidden flex sticky bottom-0 left-0 right-0 z-40 items-center justify-around border-t border-border-subtle bg-surface/95 backdrop-blur-md px-1 pt-1.5 pb-2 shadow-lg shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
            activeTab === "dashboard"
              ? "text-brand font-bold bg-brand/10 dark:bg-brand/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <DashboardIcon className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 tracking-tight">Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("transactions")}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
            activeTab === "transactions"
              ? "text-brand font-bold bg-brand/10 dark:bg-brand/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <div className="relative">
            <TransactionIcon className="w-4 h-4" />
            {pendingReimbursementsCount > 0 && (
              <span className="absolute -top-1 -right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-surface" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("invoices")}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
            activeTab === "invoices"
              ? "text-brand font-bold bg-brand/10 dark:bg-brand/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <div className="relative">
            <InvoiceIcon className="w-4 h-4" />
            {overdueInvoicesCount > 0 && (
              <span className="absolute -top-1 -right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-surface" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Invoices</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
            activeTab === "chat"
              ? "text-brand font-bold bg-brand/10 dark:bg-brand/20"
              : "text-text-muted hover:text-text-primary"
          }`}
          title="Chipr Financial AI"
        >
          <SparklesIcon className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 tracking-tight">AI Chat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("budgets")}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
            activeTab === "budgets"
              ? "text-brand font-bold bg-brand/10 dark:bg-brand/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <BudgetIcon className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 tracking-tight">Budgets</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
            activeTab === "reports"
              ? "text-brand font-bold bg-brand/10 dark:bg-brand/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <PnLIcon className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 tracking-tight">Reports</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (activeTab === "profile") {
              setActiveTab("dashboard");
            } else {
              setActiveTab("profile");
            }
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
            activeTab === "profile"
              ? "text-brand font-bold bg-brand/10 dark:bg-brand/20"
              : "text-text-muted hover:text-text-primary"
          }`}
          title={activeTab === "profile" ? "Close Profile & Return to Overview" : "Profile & Settings"}
        >
          {activeTab === "profile" ? (
            <XMarkIcon className="w-4 h-4" />
          ) : (
            <UserIcon className="w-4 h-4" />
          )}
          <span className="text-[10px] mt-0.5 tracking-tight">
            {activeTab === "profile" ? "Close" : "Profile"}
          </span>
        </button>
      </nav>

      {/* Global Add Credit Modal */}
      <AddCreditModal />
    </div>
  );
}

function AppRouter({ isSplashDone }: { isSplashDone: boolean }) {
  const { isAuthenticated, isAuthChecking } = useFinance();

  // Keep screen clean while splash screen runs
  if (!isSplashDone) {
    return null;
  }

  // If not authenticated and checking is complete, show the exclusive Login Screen
  if (!isAuthenticated && !isAuthChecking) {
    return <LoginScreen />;
  }

  // Smooth fallback while checking local/session auth state
  if (isAuthChecking && !isAuthenticated) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-canvas" />
    );
  }

  return <MainContent />;
}

export default function Home() {
  const [showSplash, setShowSplash] = React.useState(true);

  return (
    <FinanceProvider>
      {showSplash && (
        <BrandLoadingScreen
          minDuration={2600}
          onComplete={() => setShowSplash(false)}
        />
      )}
      <AppRouter isSplashDone={!showSplash} />
    </FinanceProvider>
  );
}
