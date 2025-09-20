import { SimuladoConfig } from "../components/SimuladoBuilder";

interface Question {
  id: number;
  subject: string;
  difficulty: string;
  statement: string;
  alternatives: string[];
  correctAnswer: number;
}

// Mock questions database
const mockQuestions: Question[] = [
  {
    id: 1,
    subject: "matematica",
    difficulty: "medio",
    statement: "Uma função quadrática f(x) = ax² + bx + c tem vértice no ponto (2, -1) e passa pelo ponto (0, 3). Qual é o valor de a + b + c?",
    alternatives: [
      "2",
      "3",
      "4",
      "5",
      "6"
    ],
    correctAnswer: 1
  },
  {
    id: 2,
    subject: "portugues",
    difficulty: "medio",
    statement: "Leia o trecho abaixo:\n\n\"O sertão vai virar mar, e o mar vai virar sertão.\"\n\nEssa frase, popularizada por Antônio Conselheiro, expressa uma visão:",
    alternatives: [
      "Materialista e científica da realidade",
      "Mítica e religiosa do mundo",
      "Racionalista e iluminista",
      "Positivista e evolucionista",
      "Pragmática e utilitarista"
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    subject: "biologia",
    difficulty: "facil",
    statement: "A fotossíntese é um processo fundamental para a vida na Terra. Qual das alternativas abaixo representa corretamente a equação simplificada da fotossíntese?",
    alternatives: [
      "6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂",
      "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP",
      "6O₂ + C₆H₁₂O₆ → 6CO₂ + 6H₂O + luz",
      "6CO₂ + luz → C₆H₁₂O₆ + 6O₂",
      "H₂O + CO₂ → C₆H₁₂O₆ + O₂"
    ],
    correctAnswer: 0
  },
  {
    id: 4,
    subject: "historia",
    difficulty: "dificil",
    statement: "A Revolução Constitucionalista de 1932 em São Paulo teve como principal motivação:",
    alternatives: [
      "A oposição ao Estado Novo de Getúlio Vargas",
      "A defesa da autonomia estadual e da constitucionalização do país",
      "A luta pela abolição da escravidão",
      "A resistência à Proclamação da República",
      "O movimento de independência do Brasil"
    ],
    correctAnswer: 1
  },
  {
    id: 5,
    subject: "quimica",
    difficulty: "medio",
    statement: "Considere a reação de combustão completa do metano (CH₄). Se 16g de metano reagirem completamente com oxigênio, qual será a massa de CO₂ produzida? (Massas atômicas: C = 12, H = 1, O = 16)",
    alternatives: [
      "22g",
      "32g",
      "44g",
      "48g",
      "64g"
    ],
    correctAnswer: 2
  },
  {
    id: 6,
    subject: "fisica",
    difficulty: "medio",
    statement: "Um objeto é lançado verticalmente para cima com velocidade inicial de 20 m/s. Considerando g = 10 m/s² e desprezando a resistência do ar, qual será a altura máxima atingida pelo objeto?",
    alternatives: [
      "10 m",
      "15 m",
      "20 m",
      "25 m",
      "30 m"
    ],
    correctAnswer: 2
  },
  {
    id: 7,
    subject: "geografia",
    difficulty: "facil",
    statement: "O clima predominante na região Amazônica é:",
    alternatives: [
      "Tropical semiárido",
      "Subtropical úmido",
      "Equatorial úmido",
      "Tropical de altitude",
      "Temperado oceânico"
    ],
    correctAnswer: 2
  },
  {
    id: 8,
    subject: "filosofia",
    difficulty: "dificil",
    statement: "Para Kant, o 'imperativo categórico' representa:",
    alternatives: [
      "Uma ação realizada por interesse ou vantagem pessoal",
      "Um princípio moral universal e incondicional",
      "Uma regra prática dependente das circunstâncias",
      "Uma lei natural descoberta pela ciência",
      "Um costume social estabelecido pela tradição"
    ],
    correctAnswer: 1
  },
  {
    id: 9,
    subject: "ingles",
    difficulty: "medio",
    statement: "Choose the correct alternative to complete the sentence:\n\n\"If I _____ more time, I _____ visit my grandparents more often.\"",
    alternatives: [
      "have / will",
      "had / would",
      "will have / can",
      "would have / will",
      "have had / could"
    ],
    correctAnswer: 1
  },
  {
    id: 10,
    subject: "sociologia",
    difficulty: "medio",
    statement: "Segundo Max Weber, a ação social é caracterizada por:",
    alternatives: [
      "Ser sempre racional e orientada por interesses econômicos",
      "Ter um sentido subjetivo atribuído pelo indivíduo que age",
      "Ser determinada exclusivamente pelas estruturas sociais",
      "Ocorrer sempre em grupos organizados",
      "Ser produto apenas do inconsciente coletivo"
    ],
    correctAnswer: 1
  },
  {
    id: 11,
    subject: "matematica",
    difficulty: "facil",
    statement: "Qual é o resultado da expressão: 2³ + 3² - 4¹?",
    alternatives: [
      "11",
      "13",
      "15",
      "17",
      "19"
    ],
    correctAnswer: 1
  },
  {
    id: 12,
    subject: "portugues",
    difficulty: "facil",
    statement: "Assinale a alternativa em que todas as palavras estão grafadas corretamente:",
    alternatives: [
      "Exceção, análise, privilégio",
      "Excessão, análize, previlégio",
      "Exceção, analise, privilégio",
      "Excessão, análise, privilégio",
      "Exceção, análise, previlégio"
    ],
    correctAnswer: 0
  },
  {
    id: 13,
    subject: "biologia",
    difficulty: "dificil",
    statement: "A síntese de proteínas ocorre nos ribossomos e envolve a participação de diferentes tipos de RNA. Qual é a função específica do RNA transportador (tRNA)?",
    alternatives: [
      "Carregar a informação genética do núcleo para o citoplasma",
      "Formar a estrutura dos ribossomos",
      "Transportar aminoácidos específicos para o local de síntese",
      "Regular a expressão gênica",
      "Duplicar o DNA durante a divisão celular"
    ],
    correctAnswer: 2
  },
  {
    id: 14,
    subject: "historia",
    difficulty: "medio",
    statement: "O período conhecido como 'República Velha' no Brasil (1889-1930) foi caracterizado por:",
    alternatives: [
      "Alternância democrática entre diferentes partidos políticos",
      "Domínio político das oligarquias rurais e coronelismo",
      "Forte centralização política e intervencionismo estatal",
      "Participação política ampla de todas as classes sociais",
      "Predomínio dos militares no governo"
    ],
    correctAnswer: 1
  },
  {
    id: 15,
    subject: "quimica",
    difficulty: "facil",
    statement: "O número de prótons no núcleo de um átomo determina:",
    alternatives: [
      "Sua massa atômica",
      "Seu número atômico",
      "Seu número de nêutrons",
      "Sua configuração eletrônica",
      "Sua carga elétrica total"
    ],
    correctAnswer: 1
  }
];

export function generateMockSimulado(config: SimuladoConfig): Question[] {
  let availableQuestions = mockQuestions;

  // Filter by subjects if specified
  if (config.subjects.length > 0) {
    availableQuestions = mockQuestions.filter(q => 
      config.subjects.includes(q.subject)
    );
  }

  // Filter by difficulty if not "misto"
  if (config.difficulty !== "misto") {
    availableQuestions = availableQuestions.filter(q => 
      q.difficulty === config.difficulty
    );
  }

  // Shuffle and select the requested number of questions
  const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(config.numQuestions, shuffled.length));

  // If we don't have enough questions, fill with random ones
  if (selected.length < config.numQuestions) {
    const remaining = config.numQuestions - selected.length;
    const allOtherQuestions = mockQuestions.filter(q => 
      !selected.some(s => s.id === q.id)
    );
    const additionalQuestions = allOtherQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, remaining);
    
    selected.push(...additionalQuestions);
  }

  return selected;
}