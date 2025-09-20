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
  _id: string;
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
  status: QuestionStatus;
  __v: number;
  base64Files: any | null;
  keywords?: string[];
  summary?: string;
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
  const correctIndex = mongoQuestion.alternatives.findIndex(alt => alt.isCorrect);
  
  return {
    id: mongoQuestion._id,
    subject: mapDisciplineToSubject(mongoQuestion.discipline),
    difficulty: determineDifficulty(mongoQuestion.year), // Lógica simples baseada no ano
    statement: `${mongoQuestion.context}\n\n${mongoQuestion.alternativesIntroduction}`,
    alternatives: mongoQuestion.alternatives.map(alt => alt.text),
    correctAnswer: correctIndex,
    // Campos adicionais
    title: mongoQuestion.title,
    index: mongoQuestion.index,
    discipline: mongoQuestion.discipline,
    year: mongoQuestion.year,
    context: mongoQuestion.context,
    correctAlternative: mongoQuestion.correctAlternative,
    alternativesIntroduction: mongoQuestion.alternativesIntroduction,
    mongoAlternatives: mongoQuestion.alternatives,
    keywords: mongoQuestion.keywords,
    summary: mongoQuestion.summary
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


