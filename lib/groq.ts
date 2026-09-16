import Groq from "groq-sdk";
import {
  DEFAULT_GROQ_MODEL,
  AVAILABLE_GROQ_MODELS,
  type GroqModelOption,
} from "@/lib/groq-models";
import { getDbAppConfig, setDbAppConfig } from "@/lib/db";

export { DEFAULT_GROQ_MODEL, AVAILABLE_GROQ_MODELS, type GroqModelOption };

/**
 * Resolves the active Groq API key strictly from environment variables or database configuration.
 * Never hardcodes or falls back to any static key strings.
 */
export function getActiveGroqApiKey(explicitApiKey?: string): string {
  if (explicitApiKey && explicitApiKey.trim()) {
    return explicitApiKey.trim();
  }

  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()) {
    return process.env.GROQ_API_KEY.trim();
  }

  try {
    const dbKey = getDbAppConfig("groq_api_key");
    if (dbKey && dbKey.trim()) {
      return dbKey.trim();
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
 * Resolves the active Groq model across database preference, environment, and defaults.
 */
export function getActiveGroqModel(requestedModel?: string): string {
  if (
    requestedModel &&
    requestedModel.trim() &&
    !requestedModel.includes("llama")
  ) {
    return requestedModel.trim();
  }

  try {
    const dbModel = getDbAppConfig("groq_model");
    if (dbModel && dbModel.trim() && !dbModel.includes("llama")) {
      return dbModel.trim();
    }
  } catch {}

  if (
    process.env.GROQ_MODEL &&
    process.env.GROQ_MODEL.trim() &&
    !process.env.GROQ_MODEL.includes("llama")
  ) {
    return process.env.GROQ_MODEL.trim();
  }

  return DEFAULT_GROQ_MODEL;
}

/**
 * Saves the selected Groq model to SQLite so that all devices immediately share it.
 */
export function saveServerGroqModel(model: string): void {
  setDbAppConfig("groq_model", model.trim());
}

/**
 * Returns an initialized Groq SDK client instance using the active server key.
 */
export function getGroqClient(explicitApiKey?: string): Groq {
  const apiKey = getActiveGroqApiKey(explicitApiKey);
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not configured on the server. Please ensure GROQ_API_KEY is set in your .env.local file or server environment."
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
    const key = apiKey ? apiKey.trim() : getActiveGroqApiKey();
    if (!key) {
      return {
        valid: false,
        message:
          "GROQ_API_KEY is missing. Please set GROQ_API_KEY in your server's .env.local file.",
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
 * maps to a supported chat model to prevent 404 errors.
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

  return DEFAULT_GROQ_MODEL;
}
