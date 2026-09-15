"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { LogoMark } from "@/components/ui/Icons";

interface DebitCardMockupProps {
  className?: string;
}

export function DebitCardMockup({ className = "" }: DebitCardMockupProps) {
  const { workspace, settings, metrics, privacyMask } = useFinance();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);

  const cardholderName =
    workspace === "business"
      ? (settings.businessName || "BUSINESS ACCOUNT").toUpperCase()
      : (settings.personalName || "CARDHOLDER").toUpperCase();

  // Balance displayed on card: liquid cash or primary checking balance
  const cardBalance =
    workspace === "business"
      ? metrics.businessLiquidCash
      : metrics.netWorth;

  const cardTier =
    workspace === "business"
      ? "COMMERCIAL TITANIUM"
      : "PERSONAL PLATINUM";

  return (
    <div className={`w-full max-w-[390px] mx-auto space-y-3.5 ${className}`}>
      {/* 3D Perspective Card Container */}
      <div
        className="relative w-full aspect-[1.586/1] cursor-pointer select-none group"
        style={{ perspective: "1000px" }}
        onClick={() => setIsFlipped((prev) => !prev)}
        title="Click to flip card"
      >
        <div
          className={`relative w-full h-full rounded-[22px] transition-transform duration-700 [transform-style:preserve-3d] shadow-[0_12px_35px_rgba(0,0,0,0.35)] ring-1 ring-white/15 ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* ================= FRONT OF CARD ================= */}
          <div
            className={`absolute inset-0 w-full h-full rounded-[22px] p-4 sm:p-5 flex flex-col justify-between overflow-hidden [backface-visibility:hidden] ${
              workspace === "business"
                ? "bg-gradient-to-tr from-slate-950 via-[#0a192f] to-sky-950 text-white"
                : workspace === "personal"
                ? "bg-gradient-to-tr from-neutral-950 via-[#1e1435] to-indigo-950 text-white"
                : "bg-gradient-to-tr from-stone-950 via-neutral-900 to-zinc-900 text-white"
            }`}
          >
            {/* Holographic Specular Sheen Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent opacity-60 pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />

            {/* Subtle Metallic Grid Texture */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
                backgroundSize: "16px 16px",
              }}
            />

            {/* Top Bar: Chipr Brand + Tier + Contactless Wave */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-xs">
                  <LogoMark className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-xs font-black tracking-widest uppercase">
                    Chipr
                  </span>
                  <p className="text-[8px] font-mono tracking-wider text-white/60">
                    {cardTier}
                  </p>
                </div>
              </div>

              {/* Contactless Wave Icon SVG */}
              <div className="flex items-center gap-2 text-white/70">
                <svg
                  className="w-5 h-5 -rotate-90"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                  <path d="M12 19a8.5 8.5 0 0 1 0-14" />
                  <path d="M15.5 21.5a12 12 0 0 1 0-19" />
                </svg>
              </div>
            </div>

            {/* Middle Section: EMV Smart Chip + Live Balance */}
            <div className="relative z-10 flex items-center justify-between my-auto">
              {/* EMV Gold Chip SVG */}
              <div className="relative w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-0.5 shadow-inner border border-amber-300/40">
                <svg
                  className="w-full h-full text-amber-950/60"
                  viewBox="0 0 44 32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <rect x="1" y="1" width="42" height="30" rx="3" strokeWidth="0.8" />
                  <path d="M1 10h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H1" />
                  <path d="M43 10H29a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14" />
                  <line x1="17" y1="1" x2="17" y2="31" />
                  <line x1="27" y1="1" x2="27" y2="31" />
                  <circle cx="22" cy="16" r="3" fill="currentColor" fillOpacity="0.2" />
                </svg>
              </div>

              {/* Balance Readout on Card */}
              <div className="text-right">
                <span className="text-[9px] font-mono uppercase tracking-wider text-white/50 block">
                  Available Balance
                </span>
                <MoneyAmount
                  amount={cardBalance}
                  size="sm"
                  privacyMask={privacyMask}
                  className="text-white font-bold tracking-tight"
                />
              </div>
            </div>

            {/* Bottom Section: User Name (Replacing Card Number) + Workspace Details */}
            <div className="relative z-10 space-y-2">
              {/* User Name in place of card number */}
              <div className="space-y-0.5">
                <span className="text-[8px] uppercase tracking-widest text-white/50 block font-mono">
                  Account Owner
                </span>
                <div className="text-sm sm:text-base font-bold tracking-wider text-white drop-shadow-xs truncate font-sans">
                  {cardholderName}
                </div>
              </div>

              <div className="flex items-end justify-between text-[10px] pt-0.5">
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-white/50 block font-mono">
                    Workspace Scope
                  </span>
                  <span className="font-semibold tracking-wider truncate max-w-[170px] block text-white/90">
                    {workspace === "business"
                      ? "Commercial Operations"
                      : workspace === "personal"
                      ? "Personal Wealth"
                      : "Unified Portfolio"}
                  </span>
                </div>

                <div className="text-center font-mono">
                  <span className="text-[8px] uppercase tracking-wider text-white/50 block">
                    Established
                  </span>
                  <span className="font-bold text-white/90">2026</span>
                </div>

                {/* Holographic Security Emblem */}
                <div className="flex items-center -space-x-2 shrink-0">
                  <div className="w-6 h-6 rounded-full bg-rose-500/85 backdrop-blur-xs shadow-xs" />
                  <div className="w-6 h-6 rounded-full bg-amber-400/85 backdrop-blur-xs shadow-xs mix-blend-screen" />
                </div>
              </div>
            </div>

            {/* Frozen Overlay */}
            {isFrozen && (
              <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-xs rounded-[22px] flex flex-col items-center justify-center text-center p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400 border border-red-500/30 mb-2 animate-pulse">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <span className="text-xs font-bold tracking-wider text-white uppercase">
                  Account Locked
                </span>
                <span className="text-[10px] text-white/60 mt-0.5">
                  Transactions and actions temporarily frozen
                </span>
              </div>
            )}
          </div>

          {/* ================= BACK OF CARD ================= */}
          <div
            className={`absolute inset-0 w-full h-full rounded-[22px] flex flex-col justify-between overflow-hidden [transform:rotateY(180deg)] [backface-visibility:hidden] ${
              workspace === "business"
                ? "bg-slate-950 text-white"
                : workspace === "personal"
                ? "bg-[#140d25] text-white"
                : "bg-neutral-950 text-white"
            }`}
          >
            {/* Magnetic Stripe Accent */}
            <div className="w-full h-10 bg-black mt-5" />

            {/* Signature & Member Identifier Strip */}
            <div className="px-5 space-y-1.5">
              <div className="flex items-center justify-between text-[8px] font-mono text-white/50 uppercase tracking-wider">
                <span>Authorized Signature</span>
                <span>Security Token</span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="flex-1 h-7 bg-neutral-200 rounded text-neutral-800 flex items-center px-3 font-mono text-[9px] italic"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, #e5e7eb, #e5e7eb 8px, #f3f4f6 8px, #f3f4f6 16px)",
                  }}
                >
                  {cardholderName}
                </div>
                <div className="h-7 px-2.5 bg-white rounded text-neutral-900 font-mono font-black text-[11px] flex items-center justify-center tracking-wider shadow-inner">
                  {privacyMask ? "••••" : "CHIPR-01"}
                </div>
              </div>
            </div>

            {/* Legal / Concierge Info */}
            <div className="px-5 pb-4 space-y-1">
              <p className="text-[7.5px] leading-tight text-white/40">
                Digital identity card for Chipr Financial Platform. Used for wealth management, tax tracking, and corporate accounts.
              </p>
              <div className="flex items-center justify-between text-[8px] font-mono text-white/60 pt-1 border-t border-white/10">
                <span>chipr.fi • 24/7 Concierge</span>
                <span>Tap anywhere to flip</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quick Action Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Flip Card Action */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFlipped((prev) => !prev);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-surface border border-border-subtle text-text-secondary hover:bg-raised hover:text-text-primary transition-all cursor-pointer shadow-xs"
          title="Flip card between front and back"
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6" />
            <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>{isFlipped ? "Show Front" : "Card Details"}</span>
        </button>

        {/* Freeze Account Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFrozen((prev) => !prev);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
            isFrozen
              ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border-red-300 dark:border-red-800"
              : "bg-surface border-border-subtle text-text-secondary hover:bg-raised hover:text-text-primary"
          }`}
          title={isFrozen ? "Unlock account actions" : "Lock account actions"}
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>{isFrozen ? "Unlock" : "Lock"}</span>
        </button>
      </div>
    </div>
  );
}
