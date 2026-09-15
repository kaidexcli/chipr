import Groq from "groq-sdk";

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
 * Older models like llama-3.3-70b-versatile and llama-3.1-8b-instant were deprecated on Groq.
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

/**
 * Returns an initialized Groq SDK client instance using either
 * an explicitly provided key or the GROQ_API_KEY environment variable.
 */
export function getGroqClient(explicitApiKey?: string): Groq {
  const apiKey = explicitApiKey || process.env.GROQ_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      "Groq API Key is not configured. Please supply GROQ_API_KEY in your .env.local file or via the chat settings."
    );
  }

  return new Groq({
    apiKey: apiKey.trim(),
  });
}

/**
 * Validates a Groq API key by attempting a lightweight model list query.
 */
export async function verifyGroqApiKey(
  apiKey?: string
): Promise<{ valid: boolean; message?: string }> {
  try {
    const client = getGroqClient(apiKey);
    const models = await client.models.list();
    if (models && models.data) {
      return { valid: true };
    }
    return { valid: true };
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    return {
      valid: false,
      message: err.message || "Failed to authenticate with Groq API.",
    };
  }
}

/**
 * Resolves a model ID to an active model on Groq.
 * If the requested model is deprecated or not found (e.g. 'llama-3.3-70b-versatile'),
 * it automatically maps to a supported chat model to prevent 404 errors.
 */
export async function resolveActiveModel(
  client: Groq,
  requestedModel?: string
): Promise<string> {
  const target = (requestedModel || "").trim();

  // Known active models that we know work directly
  const knownActive = AVAILABLE_GROQ_MODELS.map((m) => m.id);
  if (target && knownActive.includes(target)) {
    return target;
  }

  try {
    const modelList = await client.models.list();
    const availableIds = modelList.data.map((m) => m.id);

    // If requested model exists verbatim, use it
    if (target && availableIds.includes(target)) {
      return target;
    }

    // If a deprecated llama model was requested, find best match
    if (target.toLowerCase().includes("llama")) {
      const match = availableIds.find(
        (id) => id.includes("llama") && !id.includes("guard")
      );
      if (match) return match;
    }

    // Default to first known active model that exists in Groq's catalog
    for (const model of AVAILABLE_GROQ_MODELS) {
      if (availableIds.includes(model.id)) {
        return model.id;
      }
    }

    // Fallback to any non-whisper, non-guard model
    const genericChatModel = availableIds.find(
      (id) => !id.includes("whisper") && !id.includes("guard")
    );
    if (genericChatModel) {
      return genericChatModel;
    }
  } catch (err) {
    console.warn("[Groq] Could not list models for auto-resolution:", err);
  }

  // Safe ultimate default
  return DEFAULT_GROQ_MODEL;
}
