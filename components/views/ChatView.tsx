"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFinance } from "@/context/FinanceContext";
import { ChatContextScope } from "@/types/chat";
import {
  SparklesIcon,
  PaperAirplaneIcon,
  StopIcon,
  TrashIcon,
  CopyIcon,
  CheckIcon,
  ThumbUpIcon,
  ThumbDownIcon,
  UserIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ArrowsExchangeIcon,
  KeyIcon,
  ZapIcon,
  TransactionIcon,
} from "@/components/ui/Icons";
import { GroqSettingsModal } from "@/components/modals/GroqSettingsModal";
import { DEFAULT_GROQ_MODEL, AVAILABLE_GROQ_MODELS } from "@/lib/groq";
import { extractTransactionFromAiResponse } from "@/rag";

const GROQ_API_KEY_STORAGE = "chipr_groq_api_key";
const GROQ_MODEL_STORAGE = "chipr_groq_model";

export function ChatView() {
  const {
    workspace,
    settings,
    chatMessages,
    addChatMessage,
    updateChatMessage,
    clearChatMessages,
    accounts,
    transactions,
    invoices,
    budgets,
    metrics,
    addTransaction,
    deleteTransaction,
    updateSettings,
  } = useFinance();

  // Selected context scope for prompts: "personal" | "business" | "all"
  const [contextScope, setContextScope] = useState<ChatContextScope>(workspace);
  const [prevWorkspace, setPrevWorkspace] = useState(workspace);
  if (workspace !== prevWorkspace) {
    setPrevWorkspace(workspace);
    setContextScope(workspace);
  }

  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Groq API & Model state (lazy load from localStorage)
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem(GROQ_API_KEY_STORAGE) || "";
      } catch {
        return "";
      }
    }
    return "";
  });
  const [selectedModel, setSelectedModel] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(GROQ_MODEL_STORAGE);
        if (stored && !stored.includes("llama")) {
          return stored;
        }
        return DEFAULT_GROQ_MODEL;
      } catch {
        return DEFAULT_GROQ_MODEL;
      }
    }
    return DEFAULT_GROQ_MODEL;
  });
  const [isServerEnvConfigured, setIsServerEnvConfigured] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check server environment configuration on mount
  useEffect(() => {
    fetch("/api/chat")
      .then((res) => res.json())
      .then((data) => {
        if (data.isConfigured) {
          setIsServerEnvConfigured(true);
        }
        if (data.defaultModel) {
          try {
            const stored = localStorage.getItem(GROQ_MODEL_STORAGE);
            if (!stored || stored.includes("llama")) {
              setSelectedModel(data.defaultModel);
              localStorage.setItem(GROQ_MODEL_STORAGE, data.defaultModel);
            }
          } catch {
            // Ignore storage error
          }
        }
      })
      .catch(() => {
        // Ignore connection check failure
      });
  }, []);

  // Save API key
  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    try {
      if (newKey) {
        localStorage.setItem(GROQ_API_KEY_STORAGE, newKey);
      } else {
        localStorage.removeItem(GROQ_API_KEY_STORAGE);
      }
    } catch {
      // Ignore storage error
    }
  };

  // Save Model
  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    try {
      localStorage.setItem(GROQ_MODEL_STORAGE, modelId);
    } catch {
      // Ignore storage error
    }
  };

  const isGroqActive = Boolean(isServerEnvConfigured || apiKey.trim());

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isThinking]);

  // Focus textarea on load
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  };

  // Copy individual message text
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export full transcript to clipboard
  const handleExportTranscript = () => {
    if (chatMessages.length === 0) return;
    const transcript = chatMessages
      .map((m) => `[${m.timestamp}] ${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");
    navigator.clipboard.writeText(transcript);
    setCopiedId("transcript");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle feedback
  const handleFeedback = (id: string, type: "up" | "down") => {
    setFeedback((prev) => ({
      ...prev,
      [id]: prev[id] === type ? undefined! : type,
    }));
  };

  // Stop currently streaming response
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsThinking(false);
  };

  // Send message to Groq API
  const handleSendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isThinking) return;

    // 1. Add user message
    addChatMessage({
      role: "user",
      content: trimmed,
      contextScope,
    });

    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setIsThinking(true);

    // 2. Add placeholder assistant message for streaming
    const assistantMsg = addChatMessage({
      role: "assistant",
      content: "",
      contextScope,
      status: "sending",
      metadata: {
        model: selectedModel,
      },
    });

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Build conversation payload
      const messagesPayload = [
        ...chatMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user" as const, content: trimmed },
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-groq-api-key": apiKey } : {}),
        },
        signal: abortController.signal,
        body: JSON.stringify({
          messages: messagesPayload,
          contextScope,
          model: selectedModel,
          apiKey: apiKey || undefined,
          stream: true,
          financialContext: {
            accounts,
            transactions,
            invoices,
            budgets,
            metrics,
            settings,
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.code === "MISSING_API_KEY") {
          updateChatMessage(assistantMsg.id, {
            content: `⚠️ **Groq API Key Required**\n\nTo activate live AI expense categorization, please configure your Groq API key:\n\n• **Direct in App**: Click the **Key** icon in the toolbar above to paste your API key.\n• **Environment Variable**: Add \`GROQ_API_KEY=gsk_...\` in your **\`.env.local\`** file.\n\n*You can obtain a free API key at [console.groq.com/keys](https://console.groq.com/keys).*`,
            status: "error",
          });
          setIsSettingsModalOpen(true);
        } else {
          updateChatMessage(assistantMsg.id, {
            content: `❌ **Groq API Error**: ${
              errData.error || errData.message || "Failed to generate response."
            }`,
            status: "error",
          });
        }
        setIsThinking(false);
        return;
      }

      // Handle streaming SSE
      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No response stream received from Groq API.");
      }

      const decoder = new TextDecoder();
      let accumulatedText = "";
      let buffer = "";
      let recordedTxFound = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith("data: ")) {
            const dataStr = trimmedLine.slice(6).trim();
            if (dataStr === "[DONE]") {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                // Live preview: strip any raw json:transaction codeblock
                const displayContent = accumulatedText
                  .replace(/```json:transaction[\s\S]*?```/i, "")
                  .trim();
                updateChatMessage(assistantMsg.id, {
                  content: displayContent || accumulatedText,
                  status: "sent",
                });
              } else if (parsed.transaction) {
                recordedTxFound = true;
                // Add to client state so Dashboard, Budgets & Transactions update immediately (skip redundant DB POST)
                addTransaction(parsed.transaction, true);
                if (parsed.transaction.currency === "PHP" && settings.currency === "USD") {
                  updateSettings({ currency: "PHP" });
                }
                const displayContent = (
                  parsed.cleanContent ||
                  accumulatedText.replace(/```json:transaction[\s\S]*?```/i, "")
                ).trim();

                updateChatMessage(assistantMsg.id, {
                  metadata: {
                    model: selectedModel,
                    recordedTransaction: parsed.transaction,
                  },
                  content: displayContent,
                  status: "sent",
                });
              } else if (parsed.error) {
                accumulatedText += `\n\n*[Error: ${parsed.error}]*`;
                updateChatMessage(assistantMsg.id, {
                  content: accumulatedText,
                  status: "error",
                });
              }
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }
      }

      // Final pass: clean up raw codeblock if present
      const { cleanContent, transaction } =
        extractTransactionFromAiResponse(accumulatedText);

      if (transaction && !recordedTxFound) {
        // Fallback auto-insert if not already handled by stream
        fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transaction),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status === "ok" && data.transaction) {
              addTransaction(data.transaction, true);
              if (data.transaction.currency === "PHP" && settings.currency === "USD") {
                updateSettings({ currency: "PHP" });
              }
              updateChatMessage(assistantMsg.id, {
                metadata: {
                  model: selectedModel,
                  recordedTransaction: data.transaction,
                },
                content: cleanContent,
                status: "sent",
              });
            }
          })
          .catch((e) => console.warn("Could not record tx:", e));
      } else if (cleanContent && cleanContent !== accumulatedText) {
        updateChatMessage(assistantMsg.id, {
          content: cleanContent,
          status: "sent",
        });
      }

      if (!accumulatedText) {
        updateChatMessage(assistantMsg.id, {
          content: "No response was generated by Groq. Please check your model settings and prompt.",
          status: "error",
        });
      }
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      if (error.name === "AbortError") {
        return;
      }
      console.error("[ChatView] Groq API Request Error:", err);
      // Offline fallback
      const fallback = generateFallbackContextualResponse(trimmed, contextScope);
      updateChatMessage(assistantMsg.id, {
        content: `${fallback}\n\n*(Note: Groq API request was unavailable (${
          error.message || "Network Error"
        }). Displayed local ledger projection.)*`,
        status: "sent",
      });
    } finally {
      setIsThinking(false);
      abortControllerRef.current = null;
    }
  };

  // Local fallback response if network fails
  const generateFallbackContextualResponse = (
    query: string,
    scope: ChatContextScope
  ): string => {
    const q = query.toLowerCase();
    const curCode = settings.currency || "PHP";
    const formatCurr = (val: number) =>
      new Intl.NumberFormat(curCode === "PHP" ? "en-PH" : "en-US", {
        style: "currency",
        currency: curCode,
      }).format(val);

    if (q.includes("runway") || q.includes("burn")) {
      const burnFormatted = formatCurr(metrics.monthlyBurnRate);
      const runwayStr =
        metrics.cashRunwayMonths >= 99 || !isFinite(metrics.cashRunwayMonths)
          ? "> 24 months"
          : `${metrics.cashRunwayMonths.toFixed(1)} months`;
      const liquidCashFormatted = formatCurr(metrics.businessLiquidCash);

      return `Based on your **${
        settings.businessName || "Business"
      }** financial ledgers:\n\n• **Liquid Cash Reserves**: ${liquidCashFormatted}\n• **Monthly Burn Rate (COGS + OpEx)**: ${burnFormatted}/mo\n• **Estimated Runway**: **${runwayStr}**\n\n*Note: Runway calculation reflects active business checking and savings accounts divided by average monthly operating cash outflow.*`;
    } else if (
      q.includes("net worth") ||
      q.includes("wealth") ||
      q.includes("asset")
    ) {
      const netWorthFormatted = formatCurr(metrics.netWorth);
      const assetsFormatted = formatCurr(metrics.totalAssets);
      const liabilitiesFormatted = formatCurr(metrics.totalLiabilities);

      return `Here is your current **Personal Net Worth** position:\n\n• **Total Assets**: ${assetsFormatted}\n• **Total Liabilities**: ${liabilitiesFormatted}\n• **Net Worth (Assets - Liabilities)**: **${netWorthFormatted}**\n• **Monthly Savings Velocity**: ${Math.round(
        metrics.savingsRate
      )}%\n\nYour portfolio is tracking across ${
        accounts.filter((a) => a.entity === "personal").length
      } personal accounts.`;
    } else if (
      q.includes("invoice") ||
      q.includes("receivable") ||
      q.includes("client")
    ) {
      const arFormatted = formatCurr(metrics.outstandingReceivables);
      const overdueFormatted = formatCurr(metrics.overdueReceivables);
      const overdueCount = invoices.filter((i) => i.status === "overdue").length;

      return `**Accounts Receivable Status** for ${
        settings.businessName || "Business"
      }:\n\n• **Total Outstanding Receivables**: ${arFormatted}\n• **Past Due / Overdue**: ${overdueFormatted} (${overdueCount} overdue invoices)\n• **Total Invoices Recorded**: ${
        invoices.length
      }\n\nAll invoices are monitored according to their Net payment terms.`;
    }

    const scopeLabel =
      scope === "personal"
        ? "Personal Household"
        : scope === "business"
        ? (settings.businessName ? `Business Operations (${settings.businessName})` : "Business Operations")
        : "Unified Consolidated Portfolio";

    return `I have received your inquiry in **${scopeLabel}** context:

> "${query}"

Your financial workspace currently has:
• **${accounts.length}** connected financial accounts
• **${transactions.length}** recorded transactions in the database
• **${invoices.length}** issued client invoices
• **${budgets.length}** budget envelopes active`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const userInitials = settings.personalName
    ? settings.personalName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "AM"
    : "AM";

  const activeModelMeta =
    AVAILABLE_GROQ_MODELS.find((m) => m.id === selectedModel) ||
    AVAILABLE_GROQ_MODELS[0];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] sm:h-[calc(100vh-6.5rem)] max-w-5xl mx-auto rounded-2xl border border-border-subtle bg-surface shadow-xs overflow-hidden">
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 border-b border-border-subtle bg-surface/90 backdrop-blur-md shrink-0 gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand to-indigo-500 text-white shadow-xs shrink-0">
            <SparklesIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-text-primary tracking-tight truncate">
                Chipr Financial AI
              </h2>
              {/* Interactive Groq Status Pill */}
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all cursor-pointer ${
                  isGroqActive
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                }`}
                title="Configure Groq AI Model & Key"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isGroqActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                <span>
                  {isGroqActive
                    ? `Groq: ${activeModelMeta.name.split(" ")[0]} ${activeModelMeta.name.split(" ")[1] || ""}`
                    : "Configure Groq API"}
                </span>
              </button>
            </div>
            <p className="text-[11px] text-text-muted truncate">
              Chat expenses to auto-categorize & save to SQLite database
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Context Scope Switcher Pill */}
          <div className="flex items-center rounded-xl border border-border-subtle bg-canvas p-0.5 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setContextScope("personal")}
              className={`rounded-lg px-2 sm:px-2.5 py-1 transition-all cursor-pointer flex items-center gap-1 ${
                contextScope === "personal"
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
              title="Scope AI context to Personal finances"
            >
              <UserIcon className="w-3 h-3 shrink-0" />
              <span className="hidden md:inline">Personal</span>
            </button>
            <button
              type="button"
              onClick={() => setContextScope("business")}
              className={`rounded-lg px-2 sm:px-2.5 py-1 transition-all cursor-pointer flex items-center gap-1 ${
                contextScope === "business"
                  ? "bg-sky-600 text-white shadow-xs font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
              title="Scope AI context to Business operations"
            >
              <BuildingOfficeIcon className="w-3 h-3 shrink-0" />
              <span className="hidden md:inline">Business</span>
            </button>
            <button
              type="button"
              onClick={() => setContextScope("all")}
              className={`rounded-lg px-2 sm:px-2.5 py-1 transition-all cursor-pointer flex items-center gap-1 ${
                contextScope === "all"
                  ? "bg-brand text-white shadow-xs font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
              title="Scope AI context across all portfolio entities"
            >
              <ArrowsExchangeIcon className="w-3 h-3 shrink-0" />
              <span className="hidden md:inline">Unified</span>
            </button>
          </div>

          {/* Groq Settings Button */}
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className={`flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-xl border transition-colors cursor-pointer ${
              !isGroqActive
                ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 animate-pulse"
                : "border-border-subtle bg-canvas text-text-secondary hover:bg-raised hover:text-text-primary"
            }`}
            title="Groq AI Settings (Model & API Key)"
            aria-label="Groq AI Settings"
          >
            <KeyIcon className="w-3.5 h-3.5" />
          </button>

          {/* Export Transcript Button */}
          {chatMessages.length > 0 && (
            <button
              type="button"
              onClick={handleExportTranscript}
              className="flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-xl border border-border-subtle bg-canvas text-text-secondary hover:bg-raised hover:text-text-primary transition-colors cursor-pointer"
              title="Copy conversation transcript"
              aria-label="Copy conversation transcript"
            >
              {copiedId === "transcript" ? (
                <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <CopyIcon className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Clear Conversation Trigger */}
          {chatMessages.length > 0 && (
            <button
              type="button"
              onClick={() => setIsConfirmClearOpen(true)}
              className="flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-xl border border-border-subtle bg-canvas text-text-secondary hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors cursor-pointer"
              title="Clear conversation"
              aria-label="Clear conversation"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Clear Confirmation Modal / Banner */}
      {isConfirmClearOpen && (
        <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/50 px-4 py-2 text-xs border-b border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 animate-in fade-in duration-100 shrink-0">
          <span>Are you sure you want to clear this conversation?</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                clearChatMessages();
                setIsConfirmClearOpen(false);
              }}
              className="px-2 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmClearOpen(false)}
              className="px-2 py-1 rounded-lg border border-border-subtle hover:bg-raised transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Missing Key Notification Banner (if unconfigured) */}
      {!isGroqActive && (
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-brand/10 to-indigo-500/10 px-4 py-2 text-xs border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-2 text-text-primary min-w-0">
            <ZapIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">
              Groq API key not yet connected. Add your free key to activate live AI expense categorization.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="ml-3 shrink-0 rounded-lg bg-brand px-2.5 py-1 text-[11px] font-bold text-white hover:bg-brand-hover transition-colors cursor-pointer shadow-xs"
          >
            Connect Groq
          </button>
        </div>
      )}

      {/* 2. Messages Viewport Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {chatMessages.length === 0 ? (
          /* Clean, Non-Redundant Hero (No Duplicate Icon) */
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 max-w-xl mx-auto my-auto animate-in fade-in duration-200">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 dark:bg-brand/10 px-3 py-1 text-xs font-bold text-brand mb-3">
              <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
              <span>Smart Expense Logging & Categorization</span>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight">
              Chat Your Expenses & Ledger Inquiries
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-text-muted leading-relaxed max-w-md">
              Chat any expense (e.g. groceries, subscriptions, client dinners). Chipr AI determines the exact category, tags Schedule C tax write-offs, and logs it directly to your SQLite database.
            </p>

            {/* Quick interactive expense prompt pills */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-lg">
              {[
                "Spent ₱450 on groceries at Supermarket",
                "Bought clothes at Zara ₱1,850",
                "Paid electric bill ₱2,400",
                "Figma team subscription ₱1,200",
              ].map((promptText, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setInputValue(promptText);
                    textareaRef.current?.focus();
                  }}
                  className="rounded-xl border border-border-subtle bg-canvas px-3 py-1.5 text-xs text-text-secondary hover:border-brand hover:text-text-primary hover:bg-raised transition-all cursor-pointer shadow-xs text-left"
                >
                  &ldquo;{promptText}&rdquo;
                </button>
              ))}
            </div>

            {/* Scope awareness indicator */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  contextScope === "personal"
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    : contextScope === "business"
                    ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Active Context:{" "}
                <strong className="capitalize">{contextScope} Scope</strong>
              </span>

              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1 text-[11px] font-medium text-text-secondary border border-border-subtle hover:border-brand transition-colors cursor-pointer"
              >
                <ZapIcon className="w-3 h-3 text-amber-500" />
                Model: <strong className="text-text-primary">{activeModelMeta.name}</strong>
              </button>

              <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1 text-[11px] font-medium text-text-muted border border-border-subtle">
                <ShieldCheckIcon className="w-3 h-3 text-emerald-500" />
                SQLite Database Active
              </span>
            </div>
          </div>
        ) : (
          /* Render Message History */
          chatMessages.map((msg) => {
            const isUser = msg.role === "user";
            const isCopied = copiedId === msg.id;
            const currentFeedback = feedback[msg.id];
            const isError = msg.status === "error";
            const recordedTx = msg.metadata?.recordedTransaction;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3.5 max-w-3xl ${
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto flex-row"
                }`}
              >
                {/* Avatar */}
                {isUser ? (
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-brand to-indigo-500 text-white font-bold text-xs shadow-xs shrink-0 mt-0.5">
                    {userInitials}
                  </div>
                ) : (
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-brand text-white shadow-xs shrink-0 mt-0.5">
                    <SparklesIcon className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div
                  className={`flex flex-col group ${
                    isUser ? "items-end" : "items-start"
                  } max-w-[88%] sm:max-w-[85%]`}
                >
                  {/* Meta Label Row */}
                  <div className="flex items-center gap-2 mb-1 px-1 text-[10px] text-text-muted font-mono">
                    <span className="font-semibold text-text-secondary">
                      {isUser ? "You" : "Chipr AI (Groq)"}
                    </span>
                    {msg.contextScope && (
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] uppercase font-bold tracking-wider ${
                          msg.contextScope === "personal"
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                            : msg.contextScope === "business"
                            ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                        }`}
                      >
                        {msg.contextScope}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Bubble Content */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      isUser
                        ? "bg-brand text-white rounded-tr-xs shadow-xs"
                        : isError
                        ? "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-100 rounded-tl-xs shadow-xs"
                        : "bg-canvas border border-border-subtle text-text-primary rounded-tl-xs shadow-xs"
                    }`}
                  >
                    {msg.content
                      ? renderFormattedMessage(msg.content, isUser)
                      : isThinking && !isUser ? (
                        <div className="flex items-center gap-2 text-text-muted py-1">
                          <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:-0.3s]" />
                            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:-0.15s]" />
                            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" />
                          </span>
                          <span className="text-[11px] font-mono">
                            Analyzing & categorizing expense...
                          </span>
                        </div>
                      ) : null}

                    {/* Interactive Recorded Transaction Card */}
                    {!isUser && recordedTx && (
                      <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 text-xs text-text-primary animate-in fade-in duration-200">
                        <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px]">
                              ✓
                            </span>
                            <span>Recorded in SQLite Database</span>
                          </div>
                          <span className="font-mono text-[10px] text-text-muted">
                            {recordedTx.date}
                          </span>
                        </div>

                        <div className="flex items-start justify-between pt-2.5">
                          <div className="space-y-1">
                            <div className="font-extrabold text-sm text-text-primary flex items-center gap-1.5">
                              <TransactionIcon className="w-3.5 h-3.5 text-brand" />
                              <span>{recordedTx.merchant}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="rounded-md bg-canvas px-2 py-0.5 text-[11px] font-semibold text-text-secondary border border-border-subtle">
                                {recordedTx.category}
                              </span>
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                  recordedTx.entity === "business"
                                    ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                                    : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                                }`}
                              >
                                {recordedTx.entity}
                              </span>
                              {recordedTx.isTaxDeductible && (
                                <span className="rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-1.5 py-0.5 text-[10px] font-semibold">
                                  Tax Write-Off ({recordedTx.deductiblePercentage}%)
                                </span>
                              )}
                            </div>
                            {recordedTx.scheduleCCategory && (
                              <div className="text-[11px] text-text-muted">
                                IRS Form:{" "}
                                <span className="font-medium text-text-secondary">
                                  {recordedTx.scheduleCCategory}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="text-right flex flex-col items-end">
                            <span className="font-mono font-extrabold text-sm text-rose-600 dark:text-rose-400 tabular-nums">
                              {new Intl.NumberFormat("en-PH", {
                                style: "currency",
                                currency: recordedTx.currency || settings.currency || "PHP",
                              }).format(recordedTx.amount)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                deleteTransaction(recordedTx.id);
                                updateChatMessage(msg.id, {
                                  metadata: {
                                    ...msg.metadata,
                                    recordedTransaction: undefined,
                                  },
                                });
                              }}
                              className="mt-2 text-[10px] text-text-muted hover:text-rose-600 transition-colors cursor-pointer hover:underline"
                              title="Delete this transaction from database"
                            >
                              Undo
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Toolbar for Assistant Messages */}
                  {!isUser && msg.content && (
                    <div className="flex items-center gap-1.5 mt-1.5 px-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-text-muted hover:bg-raised hover:text-text-primary transition-colors cursor-pointer"
                        title="Copy message text"
                      >
                        {isCopied ? (
                          <>
                            <CheckIcon className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              Copied
                            </span>
                          </>
                        ) : (
                          <>
                            <CopyIcon className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <div className="h-3 w-px bg-border-subtle mx-0.5" />

                      <button
                        type="button"
                        onClick={() => handleFeedback(msg.id, "up")}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          currentFeedback === "up"
                            ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                            : "text-text-muted hover:text-text-primary hover:bg-raised"
                        }`}
                        title="Helpful response"
                      >
                        <ThumbUpIcon className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFeedback(msg.id, "down")}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          currentFeedback === "down"
                            ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40"
                            : "text-text-muted hover:text-text-primary hover:bg-raised"
                        }`}
                        title="Not helpful"
                      >
                        <ThumbDownIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Thinking Indicator (if waiting for initial stream tokens) */}
        {isThinking && (
          <div className="flex gap-2.5 sm:gap-3.5 max-w-3xl mr-auto animate-in fade-in duration-200">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-brand text-white shadow-xs shrink-0 mt-0.5">
              <SparklesIcon className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-text-muted font-mono mb-1">
                Chipr AI • Categorizing Expense
              </span>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs border border-border-subtle bg-canvas px-4 py-3 text-xs text-text-secondary shadow-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-brand animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-brand animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-brand animate-bounce" />
                </span>
                <span className="text-[11px] text-text-muted ml-1">
                  Categorizing with {activeModelMeta.name}...
                </span>
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="ml-2 p-1 rounded-md hover:bg-raised text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  title="Stop generating"
                >
                  <StopIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Console */}
      <div className="border-t border-border-subtle bg-surface p-3 sm:p-4 shrink-0 space-y-2">
        <div className="relative flex flex-col rounded-2xl border border-border-subtle bg-canvas focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 transition-all shadow-xs">
          {/* Active Context Tag inside input */}
          <div className="flex items-center justify-between px-3 pt-2.5 pb-1 text-[11px] border-b border-border-subtle/50">
            <div className="flex items-center gap-1.5 text-text-muted">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  contextScope === "personal"
                    ? "bg-indigo-500"
                    : contextScope === "business"
                    ? "bg-sky-500"
                    : "bg-brand"
                }`}
              />
              <span>Scoping:</span>
              <span className="font-semibold text-text-primary capitalize">
                {contextScope === "all" ? "Consolidated (All Entities)" : `${contextScope} Context`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="text-[10px] text-text-muted hover:text-brand transition-colors font-mono hidden sm:inline"
              >
                Model: {activeModelMeta.name}
              </button>
              <span className="text-[10px] text-text-muted hidden sm:inline font-mono">
                Shift + Enter for new line
              </span>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your expense here (e.g. 'Spent ₱450 on groceries', 'Bought clothes at Zara ₱1,850', 'Electric bill ₱2,400')..."
            className="w-full bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none min-h-[50px] max-h-[160px]"
          />

          {/* Action Row */}
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            <div className="flex items-center gap-1 text-[11px] text-text-muted">
              {inputValue.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setInputValue("");
                    if (textareaRef.current) {
                      textareaRef.current.style.height = "auto";
                    }
                  }}
                  className="text-text-muted hover:text-text-primary hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isThinking ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 px-3 sm:px-4 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 shadow-xs hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all cursor-pointer"
                >
                  <StopIcon className="w-3.5 h-3.5" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-brand px-3 sm:px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-hover active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand transition-all cursor-pointer"
                >
                  <span>Send</span>
                  <PaperAirplaneIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Privacy & Anti-Commingling Microcopy */}
        <div className="flex items-center justify-between px-1 text-[10px] text-text-muted">
          <span>
            Expenses are categorized and saved into your SQLite database.
          </span>
          <span className="hidden sm:inline font-mono">
            SQLite ACID Engine • Groq LPU
          </span>
        </div>
      </div>

      {/* Groq Settings Modal */}
      <GroqSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
        isServerEnvConfigured={isServerEnvConfigured}
      />
    </div>
  );
}

/**
 * Formats message markdown-like markers (bold, lists, tabular amounts)
 */
function renderFormattedMessage(content: string, isUser: boolean) {
  if (isUser) {
    return content;
  }

  const lines = content.split("\n");

  return lines.map((line, idx) => {
    // Bullet item
    if (line.startsWith("• ") || line.startsWith("- ")) {
      const text = line.slice(2);
      return (
        <div key={idx} className="flex items-baseline gap-2 my-0.5">
          <span className="text-brand shrink-0 font-bold">•</span>
          <span className="flex-1">{formatInlineMarkers(text)}</span>
        </div>
      );
    }

    // Numbered list item: 1. 2. etc.
    const numberedMatch = line.match(/^([0-9]+\.)\s+(.*)$/);
    if (numberedMatch) {
      return (
        <div key={idx} className="flex items-baseline gap-2 my-0.5">
          <span className="font-mono text-[11px] font-bold text-brand shrink-0">
            {numberedMatch[1]}
          </span>
          <span className="flex-1">{formatInlineMarkers(numberedMatch[2])}</span>
        </div>
      );
    }

    // Blockquote
    if (line.startsWith("> ")) {
      return (
        <blockquote
          key={idx}
          className="border-l-2 border-brand/50 pl-2.5 my-1.5 italic text-text-muted"
        >
          {formatInlineMarkers(line.slice(2))}
        </blockquote>
      );
    }

    // Headers
    if (line.startsWith("### ")) {
      return (
        <h4 key={idx} className="font-extrabold text-text-primary text-xs sm:text-sm mt-2 mb-1">
          {formatInlineMarkers(line.slice(4))}
        </h4>
      );
    }
    if (line.startsWith("## ") || line.startsWith("# ")) {
      return (
        <h3 key={idx} className="font-extrabold text-text-primary text-sm sm:text-base mt-2.5 mb-1 tracking-tight">
          {formatInlineMarkers(line.replace(/^#+\s/, ""))}
        </h3>
      );
    }

    // Empty line
    if (!line.trim()) {
      return <div key={idx} className="h-1.5" />;
    }

    return (
      <div key={idx} className="my-0.5">
        {formatInlineMarkers(line)}
      </div>
    );
  });
}

/**
 * Highlight bold text and monetary figures
 */
function formatInlineMarkers(text: string): React.ReactNode {
  // Regex match bold **text**, code `code`, or currency amounts $XX.XX
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\$[0-9,]+(?:\.[0-9]{2})?)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-canvas/80 border border-border-subtle px-1 py-0.2 font-mono text-[11px] text-text-primary"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("₱") || part.startsWith("$")) {
      return (
        <span key={i} className="font-mono tabular-nums font-semibold">
          {part}
        </span>
      );
    }
    return part;
  });
}
