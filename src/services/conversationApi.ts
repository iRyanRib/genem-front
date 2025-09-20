import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  ConversationOpenRequest,
  ConversationOpenResponse,
  ConversationMessageRequest,
  ConversationMessageResponse,
  ConversationSession,
  ChatMessage
} from '../types/Conversation';
import { config } from '../config/app';

const API_BASE_URL = config.aiApiUrl;

class ConversationApiService {
  private activeSessions: Map<string, ConversationSession> = new Map();
  private currentUserId: string;

  constructor() {
    // Generate a user ID for this session (in a real app, this would come from auth)
    this.currentUserId = uuidv4();
  }

  async openConversation(questionId: string): Promise<ConversationSession> {
    try {
      const request: ConversationOpenRequest = {
        question_id: questionId,
        user_id: this.currentUserId,
        structured_output: false
      };

      const response = await axios.post<ConversationOpenResponse>(
        `${API_BASE_URL}/conversation/open`,
        request
      );

      const data = response.data;

      // Create initial message from assistant
      const initialMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: data.agent_response,
        timestamp: new Date(data.created_at)
      };

      const session: ConversationSession = {
        sessionId: data.session_id,
        conversationId: data.conversation_id,
        questionId: questionId,
        userId: this.currentUserId,
        messages: [initialMessage],
        isActive: true
      };

      this.activeSessions.set(session.sessionId, session);
      return session;
    } catch (error) {
      console.error('Error opening conversation:', error);
      throw new Error('Failed to start conversation with AI assistant');
    }
  }

  async sendMessage(sessionId: string, message: string): Promise<ChatMessage> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Add user message to session
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      session.messages.push(userMessage);

      const request: ConversationMessageRequest = {
        session_id: sessionId,
        user_id: this.currentUserId,
        message: message,
        structured_output: false
      };

      const response = await axios.post<ConversationMessageResponse>(
        `${API_BASE_URL}/conversation/message`,
        request
      );

      const data = response.data;

      // Add assistant response to session
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: data.agent_response,
        timestamp: new Date(data.timestamp)
      };
      session.messages.push(assistantMessage);

      this.activeSessions.set(sessionId, session);
      return assistantMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message to AI assistant');
    }
  }

  getSession(sessionId: string): ConversationSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  getAllSessions(): ConversationSession[] {
    return Array.from(this.activeSessions.values());
  }

  getSessionsByQuestion(questionId: string): ConversationSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.questionId === questionId);
  }

  closeSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.activeSessions.set(sessionId, session);
    }
  }

  deleteSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
  }

  getCurrentUserId(): string {
    return this.currentUserId;
  }
}

// Singleton instance
export const conversationApiService = new ConversationApiService();
