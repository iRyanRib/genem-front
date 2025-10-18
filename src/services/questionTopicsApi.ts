import axios from 'axios';
import { config } from '../config/app';

// Interfaces
export interface QuestionTopic {
  id: string;
  field: string;
  field_code: string;
  area: string;
  area_code: string;
  general_topic: string;
  general_topic_code: string;
  specific_topic: string;
}

export interface DistinctResponse {
  success: boolean;
  data: string[];
  total: number;
}

export interface QuestionTopicListResponse {
  success: boolean;
  data: QuestionTopic[];
  total: number;
  page: number;
  pageSize: number;
}

class QuestionTopicsApiService {
  private readonly baseUrl = `${config.aiApiUrl}/question-topics`;

  /**
   * Obter campos distintos (ex: Ciências da Natureza, Matemática)
   */
  async getDistinctFields(): Promise<string[]> {
    try {
      const response = await axios.get<DistinctResponse>(`${this.baseUrl}/distinct/fields`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching distinct fields:', error);
      throw new Error('Failed to fetch distinct fields');
    }
  }

  /**
   * Obter áreas distintas (ex: Física, Química, Biologia)
   * @param fieldCode - Código do campo para filtrar (opcional)
   */
  async getDistinctAreas(fieldCode?: string): Promise<string[]> {
    try {
      const params = fieldCode ? { field_code: fieldCode } : {};
      const response = await axios.get<DistinctResponse>(`${this.baseUrl}/distinct/areas`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching distinct areas:', error);
      throw new Error('Failed to fetch distinct areas');
    }
  }

  /**
   * Obter códigos de campo distintos
   */
  async getDistinctFieldCodes(): Promise<string[]> {
    try {
      const response = await axios.get<DistinctResponse>(`${this.baseUrl}/distinct/field-codes`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching distinct field codes:', error);
      throw new Error('Failed to fetch distinct field codes');
    }
  }

  /**
   * Obter códigos de área distintos
   * @param fieldCode - Código do campo para filtrar (opcional)
   */
  async getDistinctAreaCodes(fieldCode?: string): Promise<string[]> {
    try {
      const params = fieldCode ? { field_code: fieldCode } : {};
      const response = await axios.get<DistinctResponse>(`${this.baseUrl}/distinct/area-codes`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching distinct area codes:', error);
      throw new Error('Failed to fetch distinct area codes');
    }
  }

  /**
   * Obter tópicos gerais distintos (ex: Energia, Trabalho e Potência)
   * @param fieldCode - Código do campo para filtrar (opcional)
   * @param areaCode - Código da área para filtrar (opcional)
   */
  async getDistinctGeneralTopics(fieldCode?: string, areaCode?: string): Promise<string[]> {
    try {
      const params: any = {};
      if (fieldCode) params.field_code = fieldCode;
      if (areaCode) params.area_code = areaCode;
      
      const response = await axios.get<DistinctResponse>(`${this.baseUrl}/distinct/general-topics`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching distinct general topics:', error);
      throw new Error('Failed to fetch distinct general topics');
    }
  }

  /**
   * Obter tópicos específicos distintos
   * @param fieldCode - Código do campo para filtrar (opcional)
   * @param areaCode - Código da área para filtrar (opcional)
   * @param generalTopicCode - Código do tópico geral para filtrar (opcional)
   */
  async getDistinctSpecificTopics(
    fieldCode?: string, 
    areaCode?: string,
    generalTopicCode?: string
  ): Promise<string[]> {
    try {
      const params: any = {};
      if (fieldCode) params.field_code = fieldCode;
      if (areaCode) params.area_code = areaCode;
      if (generalTopicCode) params.general_topic_code = generalTopicCode;
      
      const response = await axios.get<DistinctResponse>(`${this.baseUrl}/distinct/specific-topics`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching distinct specific topics:', error);
      throw new Error('Failed to fetch distinct specific topics');
    }
  }

  /**
   * Buscar question_topics com filtros para obter IDs
   * @param filters - Filtros para buscar topics específicos
   */
  async searchQuestionTopics(filters: {
    field_code?: string;
    area_code?: string;
    general_topic_code?: string;
    specific_topic?: string;
  }): Promise<QuestionTopic[]> {
    try {
      const params: any = {
        pageSize: -1, // Retornar todos
      };
      
      if (filters.field_code) params.field_code = filters.field_code;
      if (filters.area_code) params.area_code = filters.area_code;
      if (filters.general_topic_code) params.general_topic_code = filters.general_topic_code;
      if (filters.specific_topic) params.search = filters.specific_topic;
      
      const response = await axios.get<QuestionTopicListResponse>(`${this.baseUrl}/`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error searching question topics:', error);
      throw new Error('Failed to search question topics');
    }
  }
}

export const questionTopicsApi = new QuestionTopicsApiService();
