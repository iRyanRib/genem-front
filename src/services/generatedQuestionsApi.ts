import axios from 'axios';
import { config } from '../config/app';
import { getAuthHeaders } from './authApi';

const API_BASE_URL = config.apiUrl;

export interface GenerateQuestionRequest {
  question_id: string;
}

export interface GeneratedQuestion {
  id: string;
  context: string;
  correctAlternative: string;
  alternatives: Array<{
    letter: string;
    text?: string;
    base64File?: string;
  }>;
  alternativesIntroduction?: string;
  discipline?: string;
  subject?: string;
  year?: number;
  sourceQuestionId?: string;
  source_question_id?: string;
  user: string;
  rationale?: string;
  created_at: string;
  updated_at?: string;
}

export interface GenerateQuestionResponse {
  success: boolean;
  data: GeneratedQuestion;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

class GeneratedQuestionsApiService {
  async generateQuestion(questionId: string): Promise<GeneratedQuestion> {
    try {
      const response = await axios.post<GenerateQuestionResponse>(
        `${API_BASE_URL}/generated-questions/generate`,
        { question_id: questionId },
        { headers: getAuthHeaders() }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Erro ao gerar questão');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.detail || error.response?.data?.message || error.message;
        throw new Error(message);
      }
      throw error;
    }
  }

  async getGeneratedQuestion(questionId: string): Promise<GeneratedQuestion | null> {
    try {
      const response = await axios.get<ApiResponse<GeneratedQuestion>>(
        `${API_BASE_URL}/generated-questions/${questionId}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching generated question:', error);
      throw new Error('Erro ao buscar questão gerada');
    }
  }

  async getMyGeneratedQuestions(page: number = 1, pageSize: number = 10): Promise<{
    data: GeneratedQuestion[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const response = await axios.get<{
        success: boolean;
        data: GeneratedQuestion[];
        total: number;
        page: number;
        pageSize: number;
      }>(
        `${API_BASE_URL}/generated-questions/user/my-questions?page=${page}&page_size=${pageSize}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Erro ao buscar questões geradas');
    } catch (error) {
      console.error('Error fetching my generated questions:', error);
      throw new Error('Erro ao buscar suas questões geradas');
    }
  }

  async getGeneratedQuestionsBySource(sourceQuestionId: string): Promise<GeneratedQuestion[]> {
    try {
      const response = await axios.get<{
        success: boolean;
        data: GeneratedQuestion[];
      }>(
        `${API_BASE_URL}/generated-questions/source/${sourceQuestionId}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching generated questions by source:', error);
      throw new Error('Erro ao buscar questões geradas por fonte');
    }
  }
}

export const generatedQuestionsApiService = new GeneratedQuestionsApiService();