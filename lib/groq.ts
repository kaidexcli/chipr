import Groq from "groq-sdk";
import {
  DEFAULT_GROQ_MODEL,
  AVAILABLE_GROQ_MODELS,
  type GroqModelOption,
} from "@/lib/groq-models";
import { getDbAppConfig, setDbAppConfig } from "@/lib/db";

export { DEFAULT_GROQ_MODEL, AVAILABLE_GROQ_MODELS, type GroqModelOption };

/**
 * Resolves the active Groq API key:
 * Checks process.env.GROQ_API_KEY, NEXT_PUBLIC_GROQ_API_KEY, and GROQ_KEY.
 * Cleans any surrounding quotes and whitespace.
 * Never hardcodes or leaks keys.
 */
export function getActiveGroqApiKey(explicitApiKey?: string): string {
  if (explicitApiKey && explicitApiKey.trim()) {
    return explicitApiKey.trim().replace(/^["']|["']$/g, "");
  }

  const envKey =
    process.env.GROQ_API_KEY ||
    process.env.NEXT_PUBLIC_GROQ_API_KEY ||
    process.env.GROQ_KEY;

  if (envKey && envKey.trim()) {
    return envKey.trim().replace(/^["']|["']$/g, "");
  }

  try {
    const dbKey = getDbAppConfig("groq_api_key");
    if (dbKey && dbKey.trim()) {
      return dbKey.trim().replace(/^["']|["']$/g, "");
    }
  } catch {}

  return "";
}

/**
 * Checks whether the server has a valid Groq API key configured in its environment.
 */
export function isGroqConfigured(): boolean {
  return Boolean(getActiveGroqApiKey());
}

/**
 * Resolves the active Groq model:
 * Checks requestedModel, process.env.GROQ_MODEL, NEXT_PUBLIC_GROQ_MODEL, database, and defaults.
 * Automatically filters out deprecated models (e.g. compound or llama).
 */
export function getActiveGroqModel(requestedModel?: string): string {
  const isDeprecatedOrInvalid = (m?: string | null): boolean => {
    if (!m) return true;
    const clean = m.trim().toLowerCase();
    return clean.includes("llama") || clean.includes("compound");
  };

  if (
    requestedModel &&
    requestedModel.trim() &&
    !isDeprecatedOrInvalid(requestedModel)
  ) {
    return requestedModel.trim().replace(/^["']|["']$/g, "");
  }

  const envModel =
    process.env.GROQ_MODEL ||
    process.env.NEXT_PUBLIC_GROQ_MODEL;

  if (
    envModel &&
    envModel.trim() &&
    !isDeprecatedOrInvalid(envModel)
  ) {
    return envModel.trim().replace(/^["']|["']$/g, "");
  }

  try {
    const dbModel = getDbAppConfig("groq_model");
    if (dbModel && dbModel.trim() && !isDeprecatedOrInvalid(dbModel)) {
      return dbModel.trim().replace(/^["']|["']$/g, "");
    }
  } catch {}

  return DEFAULT_GROQ_MODEL;
}

/**
 * Saves the selected Groq model to SQLite so that all devices immediately share it.
 */
export function saveServerGroqModel(model: string): void {
  try {
    setDbAppConfig("groq_model", model.trim());
  } catch (err) {
    console.warn("[Groq] Could not save model preference to DB:", err);
  }
}

/**
 * Returns an initialized Groq SDK client instance using the active server key.
 */
export function getGroqClient(explicitApiKey?: string): Groq {
  const apiKey = getActiveGroqApiKey(explicitApiKey);
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not configured on the server. Please ensure GROQ_API_KEY is set in your environment variables."
    );
  }

  return new Groq({
    apiKey,
  });
}

/**
 * Validates a Groq API key by attempting a lightweight model list query.
 */
export async function verifyGroqApiKey(
  apiKey?: string
): Promise<{ valid: boolean; message?: string }> {
  try {
    const key = apiKey ? apiKey.trim().replace(/^["']|["']$/g, "") : getActiveGroqApiKey();
    if (!key) {
      return {
        valid: false,
        message:
          "GROQ_API_KEY is missing. Please set GROQ_API_KEY in your deployment environment variables.",
      };
    }

    const client = new Groq({ apiKey: key });
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
 * If the requested model is deprecated or not found, it automatically
 * maps to a supported chat model to prevent 404/400 errors.
 */
export async function resolveActiveModel(
  client: Groq,
  requestedModel?: string
): Promise<string> {
  const target = (requestedModel || "").trim();
  const isDeprecated = (m: string) => {
    const lower = m.toLowerCase();
    return lower.includes("llama") || lower.includes("compound");
  };

  // Known active models that we know work directly
  const knownActive = AVAILABLE_GROQ_MODELS.map((m) => m.id);
  if (target && knownActive.includes(target) && !isDeprecated(target)) {
    return target;
  }

  try {
    const modelList = await client.models.list();
    const availableIds = modelList.data.map((m) => m.id);

    // If requested model exists verbatim and is not deprecated, use it
    if (target && availableIds.includes(target) && !isDeprecated(target)) {
      return target;
    }

    // Default to first known active model that exists in Groq's catalog
    for (const model of AVAILABLE_GROQ_MODELS) {
      if (availableIds.includes(model.id)) {
        return model.id;
      }
    }

    // Fallback to any non-whisper, non-guard, non-orpheus, non-deprecated chat model
    const genericChatModel = availableIds.find(
      (id) =>
        !id.includes("whisper") &&
        !id.includes("guard") &&
        !id.includes("orpheus") &&
        !isDeprecated(id)
    );
    if (genericChatModel) {
      return genericChatModel;
    }
  } catch (err) {
    console.warn("[Groq] Could not list models for auto-resolution:", err);
  }

  return DEFAULT_GROQ_MODEL;
}
