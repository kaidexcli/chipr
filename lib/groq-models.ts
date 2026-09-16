export const DEFAULT_GROQ_MODEL = "groq/compound-mini";

export interface GroqModelOption {
  id: string;
  name: string;
  description: string;
  contextWindow: number;
  recommended?: boolean;
}

/**
 * Currently active and verified Groq models (Fall 2026 / Groq LPU platform).
 */
export const AVAILABLE_GROQ_MODELS: GroqModelOption[] = [
  {
    id: "groq/compound-mini",
    name: "Groq Compound Mini",
    description: "Ultra-fast LPU inference, exceptional for real-time ledger & financial tracking",
    contextWindow: 128000,
    recommended: true,
  },
  {
    id: "openai/gpt-oss-120b",
    name: "OpenAI GPT-OSS 120B",
    description: "Flagship 120B open-weights model for deep financial analysis & tax strategy",
    contextWindow: 128000,
  },
  {
    id: "qwen/qwen3.8-27b",
    name: "Qwen 3.8 27B",
    description: "High-accuracy multi-task reasoning for P&L, burn rate, and financial ledgers",
    contextWindow: 128000,
  },
  {
    id: "groq/compound",
    name: "Groq Compound",
    description: "Agentic reasoning system with tool-assisted financial calculations",
    contextWindow: 128000,
  },
  {
    id: "openai/gpt-oss-20b",
    name: "OpenAI GPT-OSS 20B",
    description: "Lightweight and rapid response generation for quick queries",
    contextWindow: 64000,
  },
];
