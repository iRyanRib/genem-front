import axios from 'axios';
import { MongoQuestion } from '../types/Question';
import { config } from '../config/app';

const API_BASE_URL = config.apiUrl;

class QuestionsApiService {
  async getQuestions(filters?: {
    discipline?: string;
    year?: number;
    limit?: number;
    offset?: number;
  }): Promise<MongoQuestion[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.discipline) {
        params.append('discipline', filters.discipline);
      }
      if (filters?.year) {
        params.append('year', filters.year.toString());
      }
      if (filters?.limit) {
        params.append('limit', filters.limit.toString());
      }
      if (filters?.offset) {
        params.append('offset', filters.offset.toString());
      }

      const response = await axios.get<MongoQuestion[]>(`${API_BASE_URL}/questions?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching questions from API:', error);
      throw new Error('Failed to fetch questions from server');
    }
  }

  async getRandomQuestions(count: number, filters?: {
    discipline?: string;
    year?: number;
  }): Promise<MongoQuestion[]> {
    try {
      const params = new URLSearchParams();
      params.append('count', count.toString());
      
      if (filters?.discipline) {
        params.append('discipline', filters.discipline);
      }
      if (filters?.year) {
        params.append('year', filters.year.toString());
      }

      const response = await axios.get<MongoQuestion[]>(`${API_BASE_URL}/questions/random?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching random questions from API:', error);
      throw new Error('Failed to fetch random questions from server');
    }
  }

  async getAvailableDisciplines(): Promise<string[]> {
    try {
      const response = await axios.get<string[]>(`${API_BASE_URL}/questions/disciplines`);
      return response.data;
    } catch (error) {
      console.error('Error fetching disciplines from API:', error);
      throw new Error('Failed to fetch disciplines from server');
    }
  }

  async getAvailableYears(): Promise<number[]> {
    try {
      const response = await axios.get<number[]>(`${API_BASE_URL}/questions/years`);
      return response.data.sort((a, b) => b - a); // Sort descending
    } catch (error) {
      console.error('Error fetching years from API:', error);
      throw new Error('Failed to fetch years from server');
    }
  }

  async getQuestionById(id: string): Promise<MongoQuestion | null> {
    try {
      const response = await axios.get<MongoQuestion>(`${API_BASE_URL}/questions/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching question by ID from API:', error);
      throw new Error('Failed to fetch question from server');
    }
  }
}

export const questionsApiService = new QuestionsApiService();
