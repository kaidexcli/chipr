"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { NewTransactionModal } from "@/components/modals/NewTransactionModal";
import { NewInvoiceModal } from "@/components/modals/NewInvoiceModal";
import { AccountModal } from "@/components/modals/AccountModal";
import { NewBudgetModal } from "@/components/modals/NewBudgetModal";
import { CommandPalette } from "@/components/ui/CommandPalette";
import {
  LogoMark,
  EyeIcon,
  EyeSlashIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  WalletIcon,
  InvoiceIcon,
  BudgetIcon,
  TransactionIcon,
  ChevronDownIcon,
  MenuIcon,
  UserIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  SparklesIcon,
} from "@/components/ui/Icons";

export function Header() {
  const {
    workspace,
    setWorkspace,
    privacyMask,
    togglePrivacyMask,
    darkMode,
    toggleDarkMode,
    settings,
    toggleSidebar,
    activeTab,
    setActiveTab,
  } = useFinance();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  const initials = settings.personalName
    ? settings.personalName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "AM"
    : "AM";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border-subtle bg-surface/85 px-4 sm:px-6 backdrop-blur-md">
        {/* Left: Brand & Workspace Switcher */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Sidebar Slide Toggle */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border-subtle bg-canvas text-text-secondary hover:bg-raised hover:text-text-primary transition-colors cursor-pointer"
              aria-label="Toggle navigation sidebar"
              title="Toggle sidebar"
            >
              <MenuIcon className="w-4 h-4" />
            </button>
            {/* Brand Logo & Name (Click to return to overview dashboard) */}
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-2 sm:gap-2.5 shrink-0 group cursor-pointer focus:outline-hidden"
              title="Chipr - Back to Overview"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white shadow-xs group-hover:scale-105 transition-transform">
                <LogoMark className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-extrabold tracking-tight text-text-primary hidden sm:inline group-hover:text-brand transition-colors">
                Chipr
              </span>
            </button>
          </div>

          {/* Desktop Workspace Pill Switcher (Personal vs Business) */}
          <div className="hidden sm:flex items-center rounded-xl border border-border-subtle bg-canvas p-0.5 sm:p-1 text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setWorkspace("personal")}
              className={`rounded-lg px-2.5 sm:px-3 py-1 transition-all cursor-pointer shrink-0 ${
                workspace === "personal"
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <span>Personal</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkspace("business")}
              className={`rounded-lg px-2.5 sm:px-3 py-1 transition-all cursor-pointer shrink-0 max-w-[120px] sm:max-w-[160px] truncate ${
                workspace === "business"
                  ? "bg-sky-600 text-white shadow-xs font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <span>{settings.businessName || "Business"}</span>
            </button>
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between rounded-xl border border-border-subtle bg-canvas px-3 py-1.5 text-xs text-text-muted hover:border-border-strong hover:text-text-primary transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <SearchIcon className="w-3.5 h-3.5" />
              <span>Search or run command...</span>
            </span>
            <kbd className="rounded border border-border-subtle bg-surface px-1.5 py-0.5 text-[10px] font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Controls & Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile search button */}
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-xl border border-border-subtle bg-surface text-text-secondary hover:bg-raised transition-colors cursor-pointer"
            title="Search or commands"
          >
            <SearchIcon className="w-3.5 h-3.5" />
          </button>

          {/* Privacy Mask Toggle (Desktop & Tablet) */}
          <button
            type="button"
            onClick={togglePrivacyMask}
            title={privacyMask ? "Reveal financial balances" : "Obfuscate balances ($••••••)"}
            className={`hidden sm:flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-xl border border-border-subtle px-2 sm:px-2.5 text-xs font-semibold transition-all cursor-pointer ${
              privacyMask
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                : "bg-surface text-text-secondary hover:bg-raised"
            }`}
          >
            {privacyMask ? (
              <>
                <EyeSlashIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="font-mono hidden sm:inline">$••••••</span>
              </>
            ) : (
              <>
                <EyeIcon className="w-3.5 h-3.5 text-text-muted" />
                <span className="hidden sm:inline">Visible</span>
              </>
            )}
          </button>

          {/* Dark / Light Toggle (Desktop & Tablet) */}
          <button
            type="button"
            onClick={toggleDarkMode}
            title="Toggle theme appearance"
            className="hidden sm:flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-xl border border-border-subtle bg-surface text-text-secondary hover:bg-raised transition-colors cursor-pointer"
          >
            {darkMode ? <SunIcon className="w-4 h-4 text-amber-400" /> : <MoonIcon className="w-4 h-4 text-text-muted" />}
          </button>

          {/* Quick Action Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsQuickActionsOpen((prev) => !prev)}
              className="flex h-8 sm:h-9 items-center gap-1 sm:gap-1.5 rounded-xl bg-brand px-2.5 sm:px-3 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Create</span>
              <ChevronDownIcon className="w-3 h-3 opacity-70" />
            </button>

            {isQuickActionsOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-2xl border border-border-subtle bg-surface p-1.5 shadow-xl text-xs z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsQuickActionsOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(true)}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-text-primary hover:bg-raised font-medium transition-colors cursor-pointer"
                >
                  <TransactionIcon className="w-4 h-4 text-brand" />
                  <span>Record Transaction</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(true)}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-text-primary hover:bg-raised font-medium transition-colors cursor-pointer"
                >
                  <InvoiceIcon className="w-4 h-4 text-sky-500" />
                  <span>Issue Client Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(true)}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-text-primary hover:bg-raised font-medium transition-colors cursor-pointer"
                >
                  <WalletIcon className="w-4 h-4 text-emerald-500" />
                  <span>Add Financial Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-text-primary hover:bg-raised font-medium transition-colors cursor-pointer"
                >
                  <BudgetIcon className="w-4 h-4 text-amber-500" />
                  <span>New Budget Envelope</span>
                </button>
                <div className="my-1 border-t border-border-subtle" />
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-text-primary hover:bg-raised font-medium transition-colors cursor-pointer"
                >
                  <SparklesIcon className="w-4 h-4 text-brand" />
                  <span>Ask Chipr AI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-text-primary hover:bg-raised font-medium transition-colors cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-indigo-500" />
                  <span>Profile & Settings</span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile Avatar / Exit Trigger */}
          <button
            type="button"
            onClick={() => {
              if (activeTab === "profile") {
                setActiveTab("dashboard");
              } else {
                setActiveTab("profile");
              }
            }}
            title={
              activeTab === "profile"
                ? "Close Profile & Return to Overview"
                : `Profile & Settings (${settings.personalName || "Account"})`
            }
            aria-label={activeTab === "profile" ? "Close Profile" : "User Profile & Settings"}
            className={`flex h-8 sm:h-9 items-center gap-1.5 rounded-xl border px-2 sm:px-2.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "profile"
                ? "border-brand bg-brand text-white shadow-xs ring-2 ring-brand/30"
                : "border-border-subtle bg-surface text-text-secondary hover:bg-raised hover:text-text-primary"
            }`}
          >
            {activeTab === "profile" ? (
              <>
                <XMarkIcon className="w-3.5 h-3.5" />
                <span className="font-bold">Close</span>
              </>
            ) : (
              <>
                <div className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-lg bg-gradient-to-tr from-brand to-indigo-500 text-white text-[10px] font-bold shadow-xs">
                  {initials}
                </div>
                <span className="hidden sm:inline font-medium max-w-[84px] truncate text-text-primary">
                  {settings.personalName ? settings.personalName.split(" ")[0] : "Profile"}
                </span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Dedicated Full-Width Workspace Segmented Control */}
      <div className="sm:hidden sticky top-16 z-20 w-full border-b border-border-subtle bg-surface/95 px-3 py-2 backdrop-blur-md shadow-xs">
        <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-border-subtle bg-canvas p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setWorkspace("personal")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer ${
              workspace === "personal"
                ? "bg-indigo-600 text-white shadow-xs font-bold"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Personal</span>
          </button>
          <button
            type="button"
            onClick={() => setWorkspace("business")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer ${
              workspace === "business"
                ? "bg-sky-600 text-white shadow-xs font-bold"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <BuildingOfficeIcon className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px]">{settings.businessName || "Business"}</span>
          </button>
        </div>
      </div>

      {/* Global Modals */}
      <NewTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
      />
      <NewInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
      <NewBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenTxModal={() => setIsTxModalOpen(true)}
        onOpenInvoiceModal={() => setIsInvoiceModalOpen(true)}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
      />
    </>
  );
}
