import { generatedQuestionsApiService } from '../services/generatedQuestionsApi';

// Teste simples da API de questões geradas
async function testGenerateQuestion() {
  try {
    console.log('Testando geração de questão...');
    
    // ID de uma questão de exemplo - substitua por um ID válido do seu banco
    const questionId = '674b1c92ec9eee169ba71e58'; // Coloque um ID válido aqui
    
    const result = await generatedQuestionsApiService.generateQuestion(questionId);
    console.log('✅ Questão gerada com sucesso:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao gerar questão:', error);
    throw error;
  }
}

// Exportar para uso em console ou testes
(window as any).testGenerateQuestion = testGenerateQuestion;

console.log('Teste da API carregado. Execute testGenerateQuestion() no console para testar.');