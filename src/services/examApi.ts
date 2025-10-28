import axios from 'axios';
import { config } from '../config/app';
import { getAuthHeaders } from './authApi';

// Interfaces baseadas nos schemas do backend
export interface ExamCreateRequest {
  topics?: string[];
  examReplicId?: string; // alias for frontend convenience
  exam_replic_id?: string; // internal field name (backend)
  years?: number[];
  question_count?: number; // default: 25, max: 100
}

export interface ExamResponse {
  exam_id: string;
  status: string;
  message: string;
}

export interface ExamQuestion {
  question_id: string;
  user_answer?: string; // A, B, C, D, E
  correct_answer: string; // A, B, C, D, E
  is_correct?: boolean;
}

// Interface para questão no exame (sem gabarito)
export interface QuestionForExam {
  id: string;
  year: number;
  discipline: string;
  context: string;
  alternatives_introduction?: string;
  alternatives: any[]; // Inclui base64File de cada alternativa, mas sem isCorrect
}

// Interface para o exame sendo respondido (sem gabarito)
export interface ExamForUser {
  id: string;
  status: 'not_started' | 'in_progress' | 'finished';
  total_questions: number;
  answered_questions: number;
  questions: QuestionForExam[];
  created_at: string;
}

// Interface para detalhes completos do exame (com gabarito, após finalização)
export interface ExamDetails {
  id: string;
  user_id: string;
  total_questions: number;
  questions: ExamQuestion[];
  total_correct_answers: number;
  total_wrong_answers: number;
  status: 'not_started' | 'in_progress' | 'finished';
  created_at: string;
  updated_at: string;
  finished_at?: string;
}

export interface ExamSummary {
  id: string;
  user_id: string;
  total_questions: number;
  answered_questions: number; // Número de questões respondidas (para exames em progresso)
  total_correct_answers: number;
  total_wrong_answers: number;
  status: 'not_started' | 'in_progress' | 'finished';
  created_at: string;
  updated_at: string;
  finished_at?: string;
}

export interface ExamTotalizers {
  total_exams: number;
  finished_exams: number;
  in_progress_exams: number;
  not_started_exams: number;
  total_questions_answered: number;
  total_correct_answers: number;
  total_wrong_answers: number;
  average_score: number;
}

export interface ExamAnswerUpdate {
  question_id: string;
  user_answer: string; // A, B, C, D, E
}

class ExamApiService {
  private readonly baseUrl = `${config.aiApiUrl}/exams`;

  /**
   * Criar um novo exame
   */
  async createExam(examData: ExamCreateRequest): Promise<ExamResponse> {
    try {
      const response = await axios.post<ExamResponse>(`${this.baseUrl}/create`, examData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating exam:', error);
      throw new Error('Failed to create exam');
    }
  }

  /**
   * Obter exame para responder (sem gabarito)
   */
  async getExam(examId: string): Promise<ExamForUser> {
    try {
      const response = await axios.get<ExamForUser>(`${this.baseUrl}/${examId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching exam:', error);
      throw new Error('Failed to fetch exam');
    }
  }

  /**
   * Obter detalhes completos do exame (com gabarito, após finalização)
   */
  async getExamDetails(examId: string): Promise<ExamDetails> {
    try {
      const response = await axios.get<ExamDetails>(`${this.baseUrl}/${examId}/details`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching exam details:', error);
      throw new Error('Failed to fetch exam details');
    }
  }

  /**
   * Listar exames do usuário autenticado
   */
  async getUserExams(
    options: {
      skip?: number;
      limit?: number;
      status?: 'not_started' | 'in_progress' | 'finished';
      created_after?: string;
      created_before?: string;
    } = {}
  ): Promise<{
    exams: ExamSummary[];
    pagination: { skip: number; limit: number; total: number; returned: number };
    stats: {
      total_exams: number;
      finished_exams: number;
      total_questions_answered: number;
      total_correct_answers: number;
      average_score: number;
    };
  }> {
    try {
      const params = new URLSearchParams();
      if (options.skip !== undefined) params.append('skip', options.skip.toString());
      if (options.limit !== undefined) params.append('limit', options.limit.toString());
      if (options.status) params.append('status', options.status);
      if (options.created_after) params.append('created_after', options.created_after);
      if (options.created_before) params.append('created_before', options.created_before);

      const queryString = params.toString();
      const url = `${this.baseUrl}/user/me${queryString ? '?' + queryString : ''}`;
      
      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user exams:', error);
      throw new Error('Failed to fetch user exams');
    }
  }

  /**
   * Atualizar resposta de uma questão no exame
   */
  async updateAnswer(examId: string, answerData: ExamAnswerUpdate): Promise<ExamResponse> {
    try {
      const response = await axios.patch<ExamResponse>(`${this.baseUrl}/${examId}/answer`, answerData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating exam answer:', error);
      throw new Error('Failed to update exam answer');
    }
  }

  /**
   * Finalizar um exame (POST, não PATCH)
   */
  async finalizeExam(examId: string): Promise<ExamResponse> {
    try {
      const response = await axios.post<ExamResponse>(`${this.baseUrl}/${examId}/finalize`, {}, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error finalizing exam:', error);
      throw new Error('Failed to finalize exam');
    }
  }

  /**
   * Obter totalizadores completos do usuário autenticado (todas as estatísticas)
   */
  async getUserTotalizers(): Promise<ExamTotalizers> {
    try {
      const response = await axios.get<ExamTotalizers>(`${this.baseUrl}/totalizers/me`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user totalizers:', error);
      throw new Error('Failed to fetch user totalizers');
    }
  }

  /**
   * Deletar um exame
   */
  async deleteExam(examId: string): Promise<{ message: string; exam_id: string }> {
    try {
      const response = await axios.delete<{ message: string; exam_id: string }>(`${this.baseUrl}/${examId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw new Error('Failed to delete exam');
    }
  }
}

export const examApiService = new ExamApiService();