export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

export interface GroqModelOption {
  id: string;
  name: string;
  description: string;
  contextWindow: number;
  recommended?: boolean;
}

/**
 * Currently active and verified Groq free-tier & open-source models (Fall 2026 / Groq LPU platform).
 * Compound models are deprecated; GPT-OSS and Qwen 3.8 provide fast, reliable, open-source inference.
 */
export const AVAILABLE_GROQ_MODELS: GroqModelOption[] = [
  {
    id: "openai/gpt-oss-120b",
    name: "OpenAI GPT-OSS 120B",
    description: "Flagship 120B open-weights model for deep financial analysis, tax strategy & forecasting",
    contextWindow: 128000,
    recommended: true,
  },
  {
    id: "qwen/qwen3.8-27b",
    name: "Qwen 3.8 27B",
    description: "High-accuracy multi-task reasoning for P&L, burn rate, and financial ledgers",
    contextWindow: 128000,
  },
  {
    id: "openai/gpt-oss-20b",
    name: "OpenAI GPT-OSS 20B",
    description: "Lightweight and rapid response generation for quick queries",
    contextWindow: 64000,
  },
];
