// Shared types for the chat + voice agents.

export type AgentType = "chat" | "voice";

export type VoiceName =
  | "Puck"
  | "Charon"
  | "Kore"
  | "Fenrir"
  | "Aoede"
  | "Leda"
  | "Orus"
  | "Zephyr";

export const VOICE_OPTIONS: VoiceName[] = [
  "Puck",
  "Charon",
  "Kore",
  "Fenrir",
  "Aoede",
  "Leda",
  "Orus",
  "Zephyr",
];

export interface AgentConfig {
  id: string;
  agent_type: AgentType;
  opening_spiel: string;
  system_prompt_extra: string | null;
  model: string;
  voice_name: VoiceName | null;
  temperature: number;
  max_output_tokens: number | null;
  is_active: boolean;
  updated_at: string;
  /** Voice agent only — display name shown in the voice modal. */
  assistant_name: string | null;
  /** Voice agent only — bobblehead avatar shown in the voice modal. */
  avatar_url: string | null;
}

export type KBStatus = "pending" | "processing" | "ready" | "failed";

export interface KBDocument {
  id: string;
  title: string;
  filename: string;
  storage_path: string;
  mime_type: string | null;
  file_size_bytes: number | null;
  status: KBStatus;
  error_message: string | null;
  page_count: number | null;
  chunk_count: number;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Citation {
  document_id: string;
  document_title: string;
  chunk_id: string;
  snippet: string;
  similarity: number;
}

export interface ChatbotSession {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  last_message_at: string;
}

export interface ChatbotMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations: Citation[];
  created_at: string;
}

// In-memory message format used by widgets and the /api/chat route.
export interface InMemoryMessage {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}
