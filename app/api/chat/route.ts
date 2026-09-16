import { NextRequest, NextResponse } from "next/server";
import {
  getGroqClient,
  DEFAULT_GROQ_MODEL,
  AVAILABLE_GROQ_MODELS,
  resolveActiveModel,
  getActiveGroqApiKey,
  getActiveGroqModel,
} from "@/lib/groq";
import {
  buildFinancialSystemPrompt,
  extractTransactionFromAiResponse,
} from "@/rag";
import {
  getDbCategories,
  insertDbTransaction,
  getDbAccounts,
  getDbBudgets,
  getDbTransactions,
  getDbInvoices,
  getDbSettings,
} from "@/lib/db";
import { ChatContextScope } from "@/types/chat";
import {
  FinancialAccount,
  Transaction,
  Invoice,
  BudgetEnvelope,
  FinancialMetrics,
  UserSettings,
} from "@/types/finance";

export const dynamic = "force-dynamic";

interface ChatRequestBody {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  contextScope?: ChatContextScope;
  financialContext?: {
    accounts?: FinancialAccount[];
    transactions?: Transaction[];
    invoices?: Invoice[];
    budgets?: BudgetEnvelope[];
    metrics?: FinancialMetrics;
    settings?: UserSettings;
  };
  model?: string;
  apiKey?: string;
  stream?: boolean;
}

/**
 * GET /api/chat
 * Status check endpoint to verify whether Groq API is configured
 * and return available models and categories.
 */
export async function GET() {
  const isConfigured = Boolean(getActiveGroqApiKey());
  const activeModel = getActiveGroqModel();
  const categories = getDbCategories();

  return NextResponse.json({
    status: "ok",
    isConfigured,
    defaultModel: activeModel,
    models: AVAILABLE_GROQ_MODELS,
    categoriesCount: categories.length,
    multiDeviceSync: true,
  });
}

/**
 * POST /api/chat
 * Generates an AI response using the Groq Chat Completion API with live financial context,
 * automatically categorizes user-chatted expenses, and persists them into the SQLite database.
 */
export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const {
      messages = [],
      contextScope = "personal",
      financialContext,
      model: requestedModel,
      stream = true,
    } = body;

    // Resolve unified Groq API key strictly from server environment (GROQ_API_KEY)
    const resolvedApiKey = getActiveGroqApiKey();
    if (!resolvedApiKey) {
      return NextResponse.json(
        {
          error:
            "GROQ_API_KEY is not configured on the server. Please ensure GROQ_API_KEY is set in your .env.local file or server environment.",
        },
        { status: 500 }
      );
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided in conversation history." },
        { status: 400 }
      );
    }

    const groq = getGroqClient(resolvedApiKey);

    // Resolve model to an active one on Groq (prevents 404 errors)
    const targetModel = getActiveGroqModel(requestedModel);
    const activeModel = await resolveActiveModel(groq, targetModel);

    // Pull canonical categories and fresh ledger snapshot from SQLite database
    const dbCategories = getDbCategories();
    const dbAccounts = financialContext?.accounts?.length ? financialContext.accounts : getDbAccounts();
    const dbTransactions = financialContext?.transactions?.length ? financialContext.transactions : getDbTransactions(50);
    const dbBudgets = financialContext?.budgets?.length ? financialContext.budgets : getDbBudgets();
    const dbInvoices = financialContext?.invoices?.length ? financialContext.invoices : getDbInvoices();
    const dbSettings = financialContext?.settings || getDbSettings();

    // Find latest user query to target semantic ledger retrieval
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const userQuery = lastUserMessage?.content || "";

    // Build financial intelligence system prompt with full category taxonomy
    const systemPrompt = buildFinancialSystemPrompt({
      scope: contextScope,
      accounts: dbAccounts,
      transactions: dbTransactions,
      invoices: dbInvoices,
      budgets: dbBudgets,
      metrics: financialContext?.metrics,
      settings: dbSettings,
      categories: dbCategories,
      userQuery,
    });

    // Format conversation history for Groq API
    const formattedMessages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [
      { role: "system", content: systemPrompt },
      ...messages
        .filter((m) => m.content && m.content.trim().length > 0)
        .slice(-12)
        .map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
    ];

    // If client requested streaming:
    if (stream) {
      let completionStream;
      try {
        completionStream = await groq.chat.completions.create({
          model: activeModel,
          messages: formattedMessages,
          temperature: 0.2,
          max_tokens: 1500,
          stream: true,
        });
      } catch (streamInitError: unknown) {
        const err = streamInitError as { status?: number; message?: string };
        if (err.status === 404 && activeModel !== DEFAULT_GROQ_MODEL) {
          console.warn(`[Groq] Model ${activeModel} failed with 404, retrying with ${DEFAULT_GROQ_MODEL}`);
          completionStream = await groq.chat.completions.create({
            model: DEFAULT_GROQ_MODEL,
            messages: formattedMessages,
            temperature: 0.2,
            max_tokens: 1500,
            stream: true,
          });
        } else {
          throw streamInitError;
        }
      }

      const textEncoder = new TextEncoder();

      const readableStream = new ReadableStream({
        async start(controller) {
          let accumulatedFullText = "";

          try {
            for await (const chunk of completionStream) {
              const textChunk = chunk.choices[0]?.delta?.content || "";
              if (textChunk) {
                accumulatedFullText += textChunk;
                // Send SSE formatted text event
                const payload = `data: ${JSON.stringify({ text: textChunk })}\n\n`;
                controller.enqueue(textEncoder.encode(payload));
              }
            }

            // Once generation completes, check if an expense transaction was created by the AI
            const { cleanContent, transaction } =
              extractTransactionFromAiResponse(accumulatedFullText, userQuery);

            if (transaction) {
              try {
                // Save directly to SQLite database
                const recordedTx = insertDbTransaction(transaction);
                // Send transaction event to client
                const txPayload = `data: ${JSON.stringify({
                  transaction: recordedTx,
                  cleanContent,
                })}\n\n`;
                controller.enqueue(textEncoder.encode(txPayload));
              } catch (dbError) {
                console.error("[Groq Chat] Failed to auto-insert transaction to SQLite:", dbError);
              }
            }

            // Signal completion
            controller.enqueue(textEncoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (streamError: unknown) {
            const err = streamError as { message?: string };
            const errorPayload = `data: ${JSON.stringify({
              error: err.message || "Streaming interrupted",
            })}\n\n`;
            controller.enqueue(textEncoder.encode(errorPayload));
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Groq-Model": activeModel,
        },
      });
    }

    // Non-streaming fallback
    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: activeModel,
        messages: formattedMessages,
        temperature: 0.2,
        max_tokens: 1500,
        stream: false,
      });
    } catch (err: unknown) {
      const error = err as { status?: number };
      if (error.status === 404 && activeModel !== DEFAULT_GROQ_MODEL) {
        completion = await groq.chat.completions.create({
          model: DEFAULT_GROQ_MODEL,
          messages: formattedMessages,
          temperature: 0.2,
          max_tokens: 1500,
          stream: false,
        });
      } else {
        throw err;
      }
    }

    const reply =
      completion.choices[0]?.message?.content ||
      "No response returned from the model.";

    const { cleanContent, transaction } = extractTransactionFromAiResponse(reply, userQuery);
    let recordedTx = null;
    if (transaction) {
      try {
        recordedTx = insertDbTransaction(transaction);
      } catch (dbError) {
        console.error("[Groq Chat] Failed to insert transaction to SQLite:", dbError);
      }
    }

    return NextResponse.json({
      content: cleanContent || reply,
      transaction: recordedTx,
      model: activeModel,
      usage: completion.usage,
    });
  } catch (error: unknown) {
    const err = error as {
      message?: string;
      status?: number;
      code?: string;
    };

    console.error("[Groq Chat Route Error]:", err);

    let status = 500;
    let message = err.message || "An unexpected error occurred while contacting Groq.";

    if (err.status === 401 || err.message?.includes("API key")) {
      status = 401;
      message = "Invalid Groq API key. Please check your credentials.";
    } else if (err.status === 404) {
      status = 404;
      message = "The requested Groq model was not found.";
    } else if (err.status === 429) {
      status = 429;
      message = "Groq rate limit reached. Please wait a moment before sending another prompt.";
    }

    return NextResponse.json(
      {
        error: message,
        code: err.code || "GROQ_REQUEST_FAILED",
      },
      { status }
    );
  }
}
