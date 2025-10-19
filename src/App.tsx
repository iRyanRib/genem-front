import { useState, useCallback } from "react";
import SimuladoBuilder, { SimuladoConfig } from "./components/SimuladoBuilder";
import SimuladoViewer from "./components/SimuladoViewer";
import SimuladoResults from "./components/SimuladoResults";
import ExamHistory from "./components/ExamHistory";
import { Question } from "./types/Question";
import { ExamDetails, examApiService } from "./services/examApi";
import { simuladoService } from "./services/simuladoService";

type AppState = 'builder' | 'simulado' | 'results' | 'history' | 'viewHistoryExam';

export default function App() {
  const [currentState, setCurrentState] = useState<AppState>('builder');
  const [currentSimulado, setCurrentSimulado] = useState<Question[]>([]);
  const [simuladoConfig, setSimuladoConfig] = useState<SimuladoConfig | null>(null);
  const [examDetails, setExamDetails] = useState<ExamDetails | null>(null);
  const [examId, setExamId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleViewHistory = () => {
    setCurrentState('history');
  };

  const handleBackFromHistory = useCallback(() => {
    setCurrentState('builder');
  }, []);

  const handleViewHistoryExam = useCallback(async (examId: string) => {
    try {
      const FAKE_USER_ID = '507f1f77bcf86cd799439011';
      // Buscar o exame para saber o status
      const examForUser = await examApiService.getExam(examId, FAKE_USER_ID);
      if (examForUser.status === 'finished') {
        const examDetails = await examApiService.getExamDetails(examId, FAKE_USER_ID);
        // Importar função de conversão
        const { convertExamQuestionToQuestion } = await import('./types/Question');
        // Converter cada questão do examDetails para Question[]
        const questions: Question[] = [];
        for (const examQuestion of examDetails.questions || []) {
          // Para converter, precisamos dos dados completos da questão
          // Buscar no examForUser.questions (que tem os dados textuais)
          const questionData = examForUser.questions.find(q => q.id === examQuestion.question_id);
          if (questionData) {
            try {
              const converted = convertExamQuestionToQuestion(questionData, questions.length);
              questions.push(converted);
            } catch (error) {
              console.warn(`Erro ao converter questão ${questionData.id}:`, error);
            }
          }
        }
        setExamDetails(examDetails);
        setExamId(examId);
        setCurrentSimulado(questions);
        setCurrentState('viewHistoryExam');
      } else {
        // Se não está finalizado, carregar no modo simulado para continuar
        const { convertExamQuestionToQuestion } = await import('./types/Question');
        const questions: Question[] = [];
        for (const examQuestion of examForUser.questions || []) {
          try {
            const convertedQuestion = convertExamQuestionToQuestion(examQuestion, questions.length);
            questions.push(convertedQuestion);
          } catch (error) {
            console.warn(`Erro ao converter questão ${examQuestion.id}:`, error);
          }
        }
        setCurrentSimulado(questions);
        setExamId(examId);
        setSimuladoConfig({
          description: 'Continuando exame anterior',
          totalQuestions: questions.length,
          timeLimit: 60,
          topicIds: []
        });
        setCurrentState('simulado');
      }
    } catch (error) {
      console.error('Erro ao visualizar exame do histórico:', error);
      alert('Erro ao carregar o exame. Por favor, tente novamente.');
    }
  }, []);

  const handleBackFromHistoryExamView = () => {
    setCurrentState('history');
  };

  const handleGenerateSimulado = async (config: SimuladoConfig) => {
    setIsGenerating(true);
    try {
      // Use real data from database - now returns { questions, examId }
      const result = await simuladoService.generateSimulado(config);
      setCurrentSimulado(result.questions);
      setExamId(result.examId);
      setSimuladoConfig(config);
      setCurrentState('simulado');
    } catch (error) {
      console.error('Error generating simulado:', error);
      // Could show error message to user here
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinishSimulado = (examDetails: ExamDetails) => {
    setExamDetails(examDetails);
    setCurrentState('results');
  };

  const handleRestartSimulado = () => {
    setExamDetails(null);
    setCurrentState('simulado');
  };

  const handleNewSimulado = () => {
    setCurrentSimulado([]);
    setSimuladoConfig(null);
    setExamDetails(null);
    setExamId('');
    setCurrentState('builder');
  };

  const handleBackToBuilder = () => {
    setCurrentState('builder');
  };

  const handleReplicateSimulado = async (existingExamId: string) => {
    setIsGenerating(true);
    try {
      // Replicate exam and get new questions + examId
      const result = await simuladoService.replicateExam(existingExamId, examDetails?.total_questions || 25);
      setCurrentSimulado(result.questions);
      setExamId(result.examId);
      setCurrentState('simulado');
    } catch (e) {
      console.error('Erro ao replicar simulado:', e);
      throw e;
    } finally {
      setIsGenerating(false);
    }
  };

  if (currentState === 'history') {
    return (
      <ExamHistory
        onViewExam={handleViewHistoryExam}
        onBack={handleBackFromHistory}
      />
    );
  }

  if (currentState === 'viewHistoryExam' && examDetails) {
    return (
      <SimuladoResults
        examDetails={examDetails}
        questions={currentSimulado}
        onRestart={handleRestartSimulado}
        onNewSimulado={handleNewSimulado}
        onReplicate={handleReplicateSimulado}
        onBack={handleBackFromHistoryExamView}
      />
    );
  }

  if (currentState === 'builder') {
    return (
      <SimuladoBuilder 
        onGenerateSimulado={handleGenerateSimulado}
        isGenerating={isGenerating}
        onViewHistory={handleViewHistory}
      />
    );
  }

  if (currentState === 'simulado' && simuladoConfig && examId) {
    return (
      <SimuladoViewer
        questions={currentSimulado}
        timeLimit={simuladoConfig.timeLimit}
        examId={examId}
        onFinish={handleFinishSimulado}
        onBack={handleBackToBuilder}
      />
    );
  }

  if (currentState === 'results' && examDetails) {
    return (
      <SimuladoResults
        examDetails={examDetails}
        questions={currentSimulado}
        onRestart={handleRestartSimulado}
        onNewSimulado={handleNewSimulado}
        onReplicate={handleReplicateSimulado}
      />
    );
  }

  return null;
}