import { useState } from "react";
import SimuladoBuilder, { SimuladoConfig } from "./components/SimuladoBuilder";
import SimuladoViewer from "./components/SimuladoViewer";
import SimuladoResults from "./components/SimuladoResults";
import { Question } from "./types/Question";
import { ExamDetails } from "./services/examApi";
import { simuladoService } from "./services/simuladoService";

type AppState = 'builder' | 'simulado' | 'results';

export default function App() {
  const [currentState, setCurrentState] = useState<AppState>('builder');
  const [currentSimulado, setCurrentSimulado] = useState<Question[]>([]);
  const [simuladoConfig, setSimuladoConfig] = useState<SimuladoConfig | null>(null);
  const [examDetails, setExamDetails] = useState<ExamDetails | null>(null);
  const [examId, setExamId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

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

  if (currentState === 'builder') {
    return (
      <SimuladoBuilder 
        onGenerateSimulado={handleGenerateSimulado}
        isGenerating={isGenerating}
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