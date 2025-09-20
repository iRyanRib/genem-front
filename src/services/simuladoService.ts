import { questionsApiService } from './questionsApi';
import { Question, convertMongoQuestionToQuestion } from '../types/Question';
import { SimuladoConfig } from '../components/SimuladoBuilder';
import { config } from '../config/app';

export class SimuladoService {
  async generateSimulado(simuladoConfig: SimuladoConfig): Promise<Question[]> {
    // Se configurado para usar dados mock, usar diretamente
    if (config.useMockData) {
      console.log('🔧 Usando dados MOCK - Configure VITE_USE_MOCK_DATA=false para usar dados reais');
      return this.generateMockSimulado(simuladoConfig);
    }

    try {
      console.log('🌐 Tentando buscar questões reais da API...');
      const totalQuestions = simuladoConfig.questionsPerSubject * simuladoConfig.subjects.length;
      const questions: Question[] = [];

      for (const subject of simuladoConfig.subjects) {
        // Map frontend subjects to database disciplines
        const discipline = this.mapSubjectToDiscipline(subject);
        
        // Get random questions for this discipline
        const mongoQuestions = await questionsApiService.getRandomQuestions(
          simuladoConfig.questionsPerSubject,
          { 
            discipline: discipline,
            // Can add year filter if needed: year: simuladoConfig.year
          }
        );

        // Convert to frontend format
        const convertedQuestions = mongoQuestions.map(convertMongoQuestionToQuestion);
        questions.push(...convertedQuestions);
      }

      // If we don't have enough questions from specific subjects, fill with random ones
      if (questions.length < totalQuestions) {
        const remainingCount = totalQuestions - questions.length;
        const additionalQuestions = await questionsApiService.getRandomQuestions(remainingCount);
        const convertedAdditional = additionalQuestions.map(convertMongoQuestionToQuestion);
        questions.push(...convertedAdditional);
      }

      // Log das questões carregadas para debug
      questions.forEach(q => {
        console.log(`📝 Questão carregada: ${q.title} - ID: ${q.id}`);
      });
      
      console.log(`✅ Carregadas ${questions.length} questões reais do banco de dados`);
      // Shuffle questions to randomize order
      return this.shuffleArray(questions).slice(0, totalQuestions);
    } catch (error) {
      console.error('❌ Erro ao buscar questões da API, usando dados mock:', error);
      // Fallback to mock data if API fails
      return this.generateMockSimulado(simuladoConfig);
    }
  }

  async getAvailableSubjects(): Promise<string[]> {
    try {
      const disciplines = await questionsApiService.getAvailableDisciplines();
      return disciplines.map(this.mapDisciplineToSubject);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Fallback to default subjects
      return ['Matemática', 'Ciências da Natureza', 'Ciências Humanas', 'Linguagens'];
    }
  }

  async getAvailableYears(): Promise<number[]> {
    try {
      return await questionsApiService.getAvailableYears();
    } catch (error) {
      console.error('Error fetching years:', error);
      // Fallback to recent years
      return [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
    }
  }

  private mapSubjectToDiscipline(subject: string): string {
    const mapping: Record<string, string> = {
      'Matemática': 'matematica',
      'Ciências da Natureza': 'ciencias-natureza',
      'Ciências Humanas': 'ciencias-humanas',
      'Linguagens': 'linguagens'
    };
    return mapping[subject] || subject.toLowerCase().replace(' ', '-');
  }

  private mapDisciplineToSubject(discipline: string): string {
    const mapping: Record<string, string> = {
      'matematica': 'Matemática',
      'ciencias-natureza': 'Ciências da Natureza',
      'ciencias-humanas': 'Ciências Humanas',
      'linguagens': 'Linguagens'
    };
    return mapping[discipline] || discipline;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Fallback mock data generation (keeping existing functionality)
  private generateMockSimulado(config: SimuladoConfig): Question[] {
    const questions: Question[] = [];
    let questionId = 1;

    for (const subject of config.subjects) {
      for (let i = 0; i < config.questionsPerSubject; i++) {
        questions.push({
          id: `mock-${questionId}`,
          subject,
          difficulty: ['Fácil', 'Médio', 'Difícil'][Math.floor(Math.random() * 3)],
          statement: `Esta é uma questão de ${subject} número ${questionId}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
          alternatives: [
            'Alternativa A - Esta é uma opção possível',
            'Alternativa B - Esta é outra opção possível',
            'Alternativa C - Esta é mais uma opção',
            'Alternativa D - Esta é a quarta opção',
            'Alternativa E - Esta é a última opção'
          ],
          correctAnswer: Math.floor(Math.random() * 5),
          title: `Questão Mock ${questionId}`,
          index: questionId,
          discipline: this.mapSubjectToDiscipline(subject),
          year: 2023,
          context: `Contexto da questão ${questionId}`,
          correctAlternative: 'A',
          alternativesIntroduction: 'Escolha a alternativa correta:',
          mongoAlternatives: []
        });
        questionId++;
      }
    }

    return questions;
  }
}

export const simuladoService = new SimuladoService();
