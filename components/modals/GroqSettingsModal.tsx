"use client";

import React, { useState, useEffect } from "react";
import { AVAILABLE_GROQ_MODELS } from "@/lib/groq";
import {
  SparklesIcon,
  CheckIcon,
  ShieldCheckIcon,
  RefreshIcon,
  ZapIcon,
} from "@/components/ui/Icons";

interface GroqSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  isServerEnvConfigured: boolean;
}

export function GroqSettingsModal({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  selectedModel,
  onSelectModel,
  isServerEnvConfigured,
}: GroqSettingsModalProps) {
  const [inputKey, setInputKey] = useState(apiKey);
  const [prevApiKey, setPrevApiKey] = useState(apiKey);
  if (apiKey !== prevApiKey) {
    setPrevApiKey(apiKey);
    setInputKey(apiKey);
  }
  const [showKey, setShowKey] = useState(false);
  const [testingStatus, setTestingStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [testErrorMessage, setTestErrorMessage] = useState("");
  const [saveConfirmation, setSaveConfirmation] = useState(false);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestingStatus("testing");
    setTestErrorMessage("");

    try {
      const res = await fetch("/api/chat/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: inputKey.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setTestingStatus("success");
      } else {
        setTestingStatus("error");
        setTestErrorMessage(data.message || "Invalid credentials or unauthorized.");
      }
    } catch {
      setTestingStatus("error");
      setTestErrorMessage("Network error verifying API key.");
    }
  };

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    setSaveConfirmation(true);
    setTimeout(() => {
      setSaveConfirmation(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setInputKey("");
    onSaveApiKey("");
    setTestingStatus("idle");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="groq-settings-title"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border-subtle bg-surface shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand to-indigo-600 text-white shadow-xs">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="groq-settings-title"
                className="text-base font-extrabold text-text-primary tracking-tight"
              >
                Groq AI Model & API Configuration
              </h3>
              <p className="text-xs text-text-muted">
                Ultra-fast LPU inference engine for financial analysis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-raised hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Environment Status Notice */}
          {isServerEnvConfigured ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-800 dark:text-emerald-200">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">Server Environment Detected: </span>
                <code className="px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 font-mono text-[11px]">
                  GROQ_API_KEY
                </code>{" "}
                is set in <code className="font-mono text-[11px]">.env.local</code>. You can override it below or leave it blank to use the server key.
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-800 dark:text-amber-200">
              <ZapIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Enter your Groq API Key: </span>
                Paste your API key below to activate live AI answers, or add{" "}
                <code className="font-mono text-[11px] bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">
                  GROQ_API_KEY=gsk_...
                </code>{" "}
                to your project&apos;s <code className="font-mono text-[11px]">.env.local</code>.
              </div>
            </div>
          )}

          {/* API Key Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="groq-api-key" className="font-bold text-text-primary">
                Groq API Key
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-brand hover:underline font-semibold flex items-center gap-1"
              >
                <span>Get API key from Groq Console</span>
                <span className="text-[10px]">↗</span>
              </a>
            </div>

            <div className="relative flex items-center">
              <input
                id="groq-api-key"
                type={showKey ? "text" : "password"}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setTestingStatus("idle");
                }}
                placeholder={
                  isServerEnvConfigured
                    ? "Using GROQ_API_KEY from environment (paste here to override)"
                    : "gsk_••••••••••••••••••••••••••••••••"
                }
                className="w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2.5 pr-20 text-xs font-mono text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="px-2 py-1 text-[11px] font-medium text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  {showKey ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Test Connection Button & Status */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingStatus === "testing" || (!inputKey.trim() && !isServerEnvConfigured)}
                  className="rounded-lg border border-border-subtle bg-raised px-2.5 py-1 text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {testingStatus === "testing" ? (
                    <>
                      <RefreshIcon className="w-3 h-3 animate-spin text-brand" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Test Connection</span>
                  )}
                </button>

                {inputKey && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-[11px] text-text-muted hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Status Indicator */}
              {testingStatus === "success" && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-150">
                  <CheckIcon className="w-3.5 h-3.5" />
                  Connection Verified!
                </span>
              )}
              {testingStatus === "error" && (
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 truncate max-w-[200px]" title={testErrorMessage}>
                  {testErrorMessage || "Verification failed"}
                </span>
              )}
            </div>
          </div>

          {/* Model Selector */}
          <div className="space-y-2 pt-2 border-t border-border-subtle">
            <label className="block text-xs font-bold text-text-primary">
              Select Groq LLM Architecture
            </label>

            <div className="grid grid-cols-1 gap-2">
              {AVAILABLE_GROQ_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                return (
                  <button
                    type="button"
                    key={model.id}
                    onClick={() => onSelectModel(model.id)}
                    className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-brand bg-brand/5 dark:bg-brand/10 shadow-xs"
                        : "border-border-subtle bg-canvas hover:border-border-strong hover:bg-raised"
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? "text-brand" : "text-text-primary"
                          }`}
                        >
                          {model.name}
                        </span>
                        {model.recommended && (
                          <span className="rounded-full bg-brand/10 text-brand px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wide">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted leading-snug">
                        {model.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end shrink-0 text-right">
                      <span className="font-mono text-[10px] text-text-muted">
                        {(model.contextWindow / 1000).toFixed(0)}k context
                      </span>
                      {isSelected && (
                        <CheckIcon className="w-4 h-4 text-brand mt-1.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle shrink-0">
          <span className="text-[10px] text-text-muted font-mono">
            Encrypted in local browser storage
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-raised transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brand-hover active:scale-[0.98] transition-all cursor-pointer"
            >
              {saveConfirmation ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5" />
                  Saved!
                </>
              ) : (
                "Save Preferences"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
