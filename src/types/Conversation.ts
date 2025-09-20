// Tipos para a API de conversas da IA

export interface ConversationOpenRequest {
  question_id: string;
  user_id: string;
  structured_output: boolean;
}

export interface ConversationOpenResponse {
  session_id: string;
  conversation_id: string;
  question_details: any; // Pode ser mais específico se necessário
  agent_response: string;
  sources_count: number;
  created_at: string;
}

export interface ConversationMessageRequest {
  session_id: string;
  user_id: string;
  message: string;
  structured_output: boolean;
}

export interface ConversationMessageResponse {
  session_id: string;
  conversation_id: string;
  user_message: string;
  agent_response: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ConversationSession {
  sessionId: string;
  conversationId: string;
  questionId: string;
  userId: string;
  messages: ChatMessage[];
  isActive: boolean;
}


