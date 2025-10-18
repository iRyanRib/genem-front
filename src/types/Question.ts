// Tipos baseados na estrutura do MongoDB
export interface Alternative {
  letter: string;
  text: string;
  file: string | null;
  isCorrect: boolean;
  _id: string;
}

export interface QuestionStatus {
  createdAt: string | Date;
  updatedAt: string | Date | null;
  deletedAt: string | Date | null;
}

export interface MongoQuestion {
  _id?: string;
  id: string;
  title: string;
  index: number;
  discipline: string;
  language: string | null;
  year: number;
  context: string;
  files: any[];
  correctAlternative: string;
  alternativesIntroduction: string;
  alternatives: Alternative[];
  status?: QuestionStatus;
  __v?: number;
  base64Files: any | null;
  keywords?: string[];
  summary?: string;
  questionTopics?: string[];
}

// Tipo adaptado para o frontend (compatível com o código existente)
export interface Question {
  id: string;
  subject: string;
  difficulty: string;
  statement: string;
  alternatives: string[];
  correctAnswer: number;
  // Campos adicionais do MongoDB
  title: string;
  index: number;
  discipline: string;
  year: number;
  context: string;
  correctAlternative: string;
  alternativesIntroduction: string;
  mongoAlternatives: Alternative[];
  keywords?: string[];
  summary?: string;
}

// Função utilitária para converter MongoQuestion para Question
export function convertMongoQuestionToQuestion(mongoQuestion: MongoQuestion): Question {
  const correctIndex = mongoQuestion.alternatives?.findIndex(alt => alt.isCorrect) ?? 0;
  
  return {
    id: mongoQuestion.id || mongoQuestion._id || '',
    subject: mapDisciplineToSubject(mongoQuestion.discipline),
    difficulty: determineDifficulty(mongoQuestion.year), // Lógica simples baseada no ano
    statement: `${mongoQuestion.context}\n\n${mongoQuestion.alternativesIntroduction || ''}`,
    alternatives: mongoQuestion.alternatives?.map(alt => alt.text) || [],
    correctAnswer: correctIndex,
    // Campos adicionais
    title: mongoQuestion.title,
    index: mongoQuestion.index,
    discipline: mongoQuestion.discipline,
    year: mongoQuestion.year,
    context: mongoQuestion.context,
    correctAlternative: mongoQuestion.correctAlternative,
    alternativesIntroduction: mongoQuestion.alternativesIntroduction || '',
    mongoAlternatives: mongoQuestion.alternatives || [],
    keywords: mongoQuestion.keywords,
    summary: mongoQuestion.summary
  };
}

// Função utilitária para converter QuestionForExam (do exame) para Question
export function convertExamQuestionToQuestion(examQuestion: any, index: number): Question {
  console.log('🔧 Convertendo questão do exame:', examQuestion);
  
  // Validar se temos os dados mínimos necessários
  if (!examQuestion || !examQuestion.id) {
    throw new Error('Questão inválida: ID não encontrado');
  }
  
  // As questões no exame vêm sem o gabarito correto (isCorrect está ausente)
  // Por isso usamos um valor padrão de 0 para correctAnswer
  let alternatives: string[] = [];
  
  if (examQuestion.alternatives && Array.isArray(examQuestion.alternatives)) {
    alternatives = examQuestion.alternatives.map((alt: any) => {
      if (typeof alt === 'string') return alt;
      if (alt && alt.text) return alt.text;
      return String(alt || '');
    });
  }
  
  // Garantir que temos pelo menos algumas alternativas
  if (alternatives.length === 0) {
    alternatives = ['A) Opção A', 'B) Opção B', 'C) Opção C', 'D) Opção D', 'E) Opção E'];
  }
  
  const context = examQuestion.context || 'Contexto da questão não disponível';
  const introduction = examQuestion.alternatives_introduction || 'Escolha a alternativa correta:';
  
  return {
    id: examQuestion.id,
    subject: mapDisciplineToSubject(examQuestion.discipline || 'geral'),
    difficulty: determineDifficulty(examQuestion.year || 2023),
    statement: `${context}\n\n${introduction}`,
    alternatives: alternatives,
    correctAnswer: 0, // Não temos gabarito durante o exame
    // Campos adicionais
    title: `Questão ${index + 1}`,
    index: index + 1,
    discipline: examQuestion.discipline || 'geral',
    year: examQuestion.year || 2023,
    context: context,
    correctAlternative: 'A', // Padrão, não sabemos a resposta correta ainda
    alternativesIntroduction: introduction,
    mongoAlternatives: examQuestion.alternatives || [],
    keywords: [],
    summary: ''
  };
}

function mapDisciplineToSubject(discipline: string): string {
  const mapping: Record<string, string> = {
    'ciencias-natureza': 'Ciências da Natureza',
    'ciencias-humanas': 'Ciências Humanas',
    'linguagens': 'Linguagens',
    'matematica': 'Matemática'
  };
  return mapping[discipline] || discipline;
}

function determineDifficulty(year: number): string {
  // Lógica simples: anos mais recentes = mais difícil
  if (year >= 2020) return 'Difícil';
  if (year >= 2015) return 'Médio';
  return 'Fácil';
}


