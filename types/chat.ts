export type ChatRole = "user" | "assistant" | "system";

export type ChatContextScope = "personal" | "business" | "all";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string; // Formatted or ISO string
  contextScope?: ChatContextScope;
  status?: "sending" | "sent" | "error";
  metadata?: {
    model?: string;
    tokens?: number;
    financialEntitiesReferenced?: string[];
    recordedTransaction?: import("./finance").Transaction;
  };
}
