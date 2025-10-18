import { questionsApiService } from './questionsApi';
import { examApiService, ExamCreateRequest } from './examApi';
import { Question, convertMongoQuestionToQuestion, convertExamQuestionToQuestion } from '../types/Question';
import { SimuladoConfig } from '../components/SimuladoBuilder';
import { config } from '../config/app';

export class SimuladoService {
  async generateSimulado(simuladoConfig: SimuladoConfig): Promise<{ questions: Question[], examId: string }> {
    // Se configurado para usar dados mock, usar diretamente
    if (config.useMockData) {
      console.log('🔧 Usando dados MOCK - Configure VITE_USE_MOCK_DATA=false para usar dados reais');
      const questions = await this.generateMockSimulado(simuladoConfig);
      return { questions, examId: 'mock-exam-id' };
    }

    try {
      console.log('🌐 Tentando buscar questões reais da API usando sistema de exames...');
      
      // Para usar a API de exames, precisamos de um user_id
      // Por enquanto vamos usar um ID fictício - em um app real isso viria da autenticação
      const userId = '507f1f77bcf86cd799439011'; // ObjectId fictício

      // Criar o exame usando a API - COM ou SEM filtros de tópicos
      const examRequest: ExamCreateRequest = {
        user_id: userId,
        question_count: Math.min(simuladoConfig.totalQuestions, 100), // Máximo de 100 questões
        // Se há topicIds selecionados, enviar para a API
        ...(simuladoConfig.topicIds && simuladoConfig.topicIds.length > 0 && {
          topics: simuladoConfig.topicIds
        })
      };

      console.log('🎯 Criando exame com configuração:', examRequest);
      if (simuladoConfig.topicIds && simuladoConfig.topicIds.length > 0) {
        console.log(`📚 Usando ${simuladoConfig.topicIds.length} tópicos filtrados`);
      } else {
        console.log('🎲 Seleção aleatória de questões (sem filtros de tópicos)');
      }

      // Criar o exame
      const examResponse = await examApiService.createExam(examRequest);
      console.log('✅ Exame criado:', examResponse);

      // Buscar o exame para obter as questões (sem gabarito)
      const examForUser = await examApiService.getExam(examResponse.exam_id, userId);
      console.log('📋 Exame carregado:', examForUser);
      console.log('📊 Número de questões no exame:', examForUser.questions?.length || 0);

      // Converter as questões que já vêm no ExamForUser
      const questions: Question[] = [];
      
      if (!examForUser.questions || examForUser.questions.length === 0) {
        console.warn('⚠️ Exame não contém questões');
        throw new Error('Exame criado mas sem questões');
      }
      
      for (const examQuestion of examForUser.questions) {
        try {
          console.log('🔍 Processando questão:', examQuestion.id, examQuestion);
          // Converter questão do exame para o formato esperado pelo frontend
          const convertedQuestion = convertExamQuestionToQuestion(examQuestion, questions.length);
          questions.push(convertedQuestion);
          console.log('✅ Questão convertida:', convertedQuestion.title);
        } catch (error) {
          console.warn(`⚠️ Erro ao converter questão ${examQuestion.id}:`, error);
        }
      }

      // Log das questões carregadas para debug
      questions.forEach(q => {
        console.log(`📝 Questão carregada: ${q.title} - ID: ${q.id}`);
      });
      
      console.log(`✅ Carregadas ${questions.length} questões reais do banco de dados via sistema de exames`);
      
      // Verificar se temos questões válidas
      if (questions.length === 0) {
        console.warn('⚠️ Nenhuma questão foi carregada, usando dados mock como fallback');
        const mockQuestions = await this.generateMockSimulado(simuladoConfig);
        return { questions: mockQuestions, examId: 'mock-exam-id' };
      }
      
      return { questions, examId: examResponse.exam_id };
    } catch (error) {
      console.error('❌ Erro ao buscar questões da API de exames, usando dados mock:', error);
      // Fallback to mock data if API fails
      const mockQuestions = await this.generateMockSimulado(simuladoConfig);
      return { questions: mockQuestions, examId: 'mock-exam-id' };
    }
  }

  // Replicate an existing exam by creating a new exam with the same questions
  async replicateExam(existingExamId: string, questionCount: number): Promise<{ questions: Question[]; examId: string }> {
    // Implementation attached at module bottom for runtime; TypeScript needs declaration
    return { questions: [], examId: '' } as any;
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

  // Fallback mock data generation (simplified for random questions)
  private generateMockSimulado(config: SimuladoConfig): Question[] {
    const questions: Question[] = [];
    const mockSubjects = ['Matemática', 'Ciências da Natureza', 'Ciências Humanas', 'Linguagens'];
    
    for (let i = 0; i < config.totalQuestions; i++) {
      const questionId = i + 1;
      const subject = mockSubjects[Math.floor(Math.random() * mockSubjects.length)];
      
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
    }

    return questions;
  }
}

export const simuladoService = new SimuladoService();

// New method added dynamically for replication (keeps backward compatibility)
SimuladoService.prototype.replicateExam = async function(existingExamId: string, questionCount: number) {
  // userId same fake id used elsewhere
  const userId = '507f1f77bcf86cd799439011';

  const createPayload: ExamCreateRequest = {
    user_id: userId,
    examReplicId: existingExamId,
    question_count: questionCount
  } as any;

  // Create new exam replicating questions
  const resp = await examApiService.createExam(createPayload);
  // Fetch the newly created exam questions
  const examForUser = await examApiService.getExam(resp.exam_id, userId);

  // Convert questions
  const questions: Question[] = [];
  for (const examQuestion of examForUser.questions || []) {
    try {
      const converted = convertExamQuestionToQuestion(examQuestion, questions.length);
      questions.push(converted);
    } catch (e) {
      console.warn('Erro ao converter questão replicada:', e);
    }
  }

  return { questions, examId: resp.exam_id };
};
